import React, { useState, useEffect, useRef } from "react";
import { TRANSLATIONS } from "./translations";
import { SCHEMES, LAND_ASSETS } from "./data";
import { AppScreen, LanguageCode, Scheme, LandAsset, VoiceCommandResponse } from "./types";
import { CalendarWidget } from "./components/CalendarWidget";
import { Calculators } from "./components/Calculators";
import { Community } from "./components/Community";
import { DashboardExtensions } from "./components/DashboardExtensions";
import { UpcomingSchemesBanner } from "./components/UpcomingSchemesBanner";
import { AIChatbot } from "./components/AIChatbot";
import { VoiceAssistant, VoiceLang } from "./components/VoiceAssistant";
import { CropDiseaseDetection } from "./components/CropDiseaseDetection";
import { LiveMandiPrices } from "./pages/LiveMandiPrices";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AgriVisionEvaluator } from "./components/AgriVisionEvaluator";
import { motion, AnimatePresence } from "motion/react";
import { weatherApi, WeatherResponse } from "./services/weatherApi";
import { useGoogleAuth } from "./context/GoogleAuthContext";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { SchemeDetailModal } from "./components/SchemeDetailModal";
import { ExternalRedirectWarning } from "./components/ExternalRedirectWarning";

const getWeatherIcon = (code: number) => {
  if (code === 0) return "wb_sunny";
  if (code >= 1 && code <= 3) return "partly_cloudy_day";
  if (code === 45 || code === 48) return "foggy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 80 && code <= 82) return "rainy";
  if (code >= 95 && code <= 99) return "thunderstorm";
  return "cloud";
};

const getWeatherCondition = (code: number) => {
  if (code === 0) return "Sunny & Clear Sky";
  if (code >= 1 && code <= 3) return "Partly Cloudy";
  if (code === 45 || code === 48) return "Foggy Weather";
  if (code >= 51 && code <= 55) return "Light Drizzle";
  if (code >= 61 && code <= 65) return "Continuous Rain";
  if (code >= 80 && code <= 82) return "Heavy Showers";
  if (code >= 95 && code <= 99) return "Thunderstorms Expected";
  return "Scattered Clouds";
};

export default function App() {
  // Standalone path routing
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return "/";
  });

  // Google Auth
  const { user: googleUser, isSignedIn, isLoaded: googleLoaded, signIn: googleSignIn, signInWithUser, signOut: googleSignOut, rememberMe, setRememberMe } = useGoogleAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  interface UserApplication {
    id: string;
    schemeId: string;
    schemeTitle: string;
    date: string;
    status: "Submitted" | "In Review" | "Approved";
    farmerName: string;
  }

  const [userApplications, setUserApplications] = useState<UserApplication[]>(() => {
    try {
      const stored = localStorage.getItem("user_applications_list");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveApplication = (app: UserApplication) => {
    setUserApplications((prev) => {
      const updated = [app, ...prev];
      try {
        localStorage.setItem("user_applications_list", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSigningIn(true);
      setAuthError(null);
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch Google profile");
        const profile = await res.json();
        signInWithUser({
          sub: profile.sub,
          name: profile.name || profile.given_name || "Google User",
          given_name: profile.given_name || profile.name || "Google User",
          family_name: profile.family_name || "",
          email: profile.email,
          picture: profile.picture || "https://lh3.googleusercontent.com/a/default-user=s96-c",
          email_verified: profile.email_verified ?? true,
        });
        setShowSignInModal(false);
      } catch (err) {
        console.error("Google profile fetch error:", err);
        setAuthError("Failed to retrieve your Google account details. Please try again.");
      } finally {
        setIsSigningIn(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google Sign-In failed or cancelled:", errorResponse);
      setIsSigningIn(false);
      setAuthError("Google Sign-In was cancelled or failed. Please try again.");
    },
  });

  const isLoggedIn = isSignedIn;
  const usernameState = googleUser?.name || googleUser?.given_name || "Farmer";
  const emailState = googleUser?.email || "";

  const handleLogout = async () => {
    googleSignOut();
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToPath = (path: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
    }
  };

  // Localization & Screen States
  const [lang, setLang] = useState<LanguageCode>("en");
  const [screen, setScreen] = useState<AppScreen>("home");
  const [prevScreen, setPrevScreen] = useState<AppScreen>("home");
  
  // Screen Mode / Dark Mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  
  // Scheme Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Voice Interaction States
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "listening" | "processing">("idle");
  const [transcriptText, setTranscriptText] = useState("");
  const [aiSpeechResponse, setAiSpeechResponse] = useState("");
  const [typedCommand, setTypedCommand] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showVoiceGuide, setShowVoiceGuide] = useState(true);
  const [micError, setMicError] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  // Logo State (uses official logo asset at /logo.jpeg or custom uploaded JPEG logo)
  const [appLogo, setAppLogo] = useState<string>("/logo.jpeg");
  const [logoLoadError, setLogoLoadError] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid JPEG or image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAppLogo(dataUrl);
        setLogoLoadError(false);
        localStorage.setItem("your_schemes_app_logo", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Land Evaluation Form States
  const [evalCrop, setEvalCrop] = useState("wheat");
  const [evalSize, setEvalSize] = useState("");
  const [evalSoilType, setEvalSoilType] = useState("alluvial");
  const [evalWaterAccess, setEvalWaterAccess] = useState("highly_irrigated");
  const [evalLocationDistrict, setEvalLocationDistrict] = useState("premium_highway");
  const [evalRoadFacing, setEvalRoadFacing] = useState(true);
  const [evalDocUploaded, setEvalDocUploaded] = useState(false);
  const [evalDocFileName, setEvalDocFileName] = useState<string | null>(null);
  const [evalPhoto, setEvalPhoto] = useState<string | null>(null);
  const evalDocInputRef = useRef<HTMLInputElement>(null);
  const evalPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleEvalDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvalDocUploaded(true);
      setEvalDocFileName(file.name);
      speakConfirmation("Document uploaded successfully.");
    }
  };

  const handleEvalPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvalPhoto(reader.result as string);
        speakConfirmation("Photo uploaded successfully.");
      };
      reader.readAsDataURL(file);
    }
  };

  const [evalSuccessMsg, setEvalSuccessMsg] = useState("");
  const [evalIsSubmitting, setEvalIsSubmitting] = useState(false);
  const [evaluatedLandValue, setEvaluatedLandValue] = useState<{ perAcre: number; total: number } | null>(null);
  const [showEvalReport, setShowEvalReport] = useState(false);

  // Scheme Application Form States
  const [appStep, setAppStep] = useState<1 | 2 | 3>(1);
  const [appFarmerName, setAppFarmerName] = useState("");
  const [appPhone, setAppPhoneNumber] = useState("");
  const [appAddress, setAppAddress] = useState("");
  const [appIdType, setAppIdType] = useState("Aadhaar Card");
  const [appIdNumber, setAppIdNumber] = useState("");
  const [appDocUploaded, setAppDocUploaded] = useState(false);
  const [appBankName, setAppBankName] = useState("");
  const [appBankAccount, setAppBankAccount] = useState("");
  const [appIfsc, setAppIfsc] = useState("");
  const [appBranch, setAppBranch] = useState("");
  const [appTerms, setAppTerms] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme>(SCHEMES[0]);

  // Scheme Redirection & Detail Modal States
  const [selectedDetailScheme, setSelectedDetailScheme] = useState<Scheme | null>(null);
  const [redirectWarningScheme, setRedirectWarningScheme] = useState<Scheme | null>(null);

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Special Drought Relief Subsidy announced!", unread: true },
    { id: 2, text: "Verify your land details to unlock custom credit cards.", unread: true }
  ]);

  const activeTranslations = TRANSLATIONS[lang];

  // Geolocation Permission & Details
  const [locationStatus, setLocationStatus] = useState<"prompt" | "granted" | "denied" | "dismissed">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("location_permission_status");
      if (saved) return saved as any;
    }
    return "prompt";
  });
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Weather States
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  useEffect(() => {
    const lat = userCoords?.latitude ?? 11.1271;
    const lon = userCoords?.longitude ?? 78.6569;

    setWeatherLoading(true);
    setWeatherError(null);
    weatherApi.getWeather(lat, lon)
      .then((data) => {
        setWeatherData(data);
        setWeatherLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load weather report: ", err);
        setWeatherError(err.message || "Failed to load weather report.");
        setWeatherLoading(false);
      });

    // Resolve location address dynamically via reverse geocoding
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.address) {
          const addr = data.address;
          const cityOrTown = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county;
          const state = addr.state;
          if (cityOrTown && state) {
            setResolvedAddress(`${cityOrTown}, ${state}`);
          } else if (cityOrTown) {
            setResolvedAddress(cityOrTown);
          } else if (data.display_name) {
            setResolvedAddress(data.display_name.split(',')[0]);
          }
        } else {
          setResolvedAddress(null);
        }
      })
      .catch((err) => {
        console.error("Failed to reverse geocode coordinates: ", err);
        setResolvedAddress(null);
      });
  }, [userCoords, lang]);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ latitude, longitude });
        setLocationStatus("granted");
        localStorage.setItem("location_permission_status", "granted");
        
        // Add a notification dynamically
        setNotifications((prev) => [
          {
            id: Date.now(),
            text: `GPS Connected: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
            unread: true
          },
          ...prev
        ]);
      },
      (error) => {
        console.error("Error obtaining location", error);
        setLocationStatus("denied");
        localStorage.setItem("location_permission_status", "denied");
      }
    );
  };

  const dismissLocationPrompt = () => {
    setLocationStatus("dismissed");
    localStorage.setItem("location_permission_status", "dismissed");
  };

  // Translate Location Status Messages dynamically on language change
  useEffect(() => {
    if (locationStatus === "granted") {
      setLocationMessage(activeTranslations.locationGranted || "GPS Location Connected Successfully");
    } else if (locationStatus === "denied") {
      setLocationMessage(activeTranslations.locationError || "Location Access Denied. Showing default region.");
    } else {
      setLocationMessage(null);
    }
  }, [lang, locationStatus, activeTranslations]);

  // Auto-fetch location on mount if permission was previously granted
  useEffect(() => {
    if (locationStatus === "granted") {
      requestLocationPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mandi Filter States (for Voice Commands & Deep-linking)
  const [mandiFilterCommodity, setMandiFilterCommodity] = useState("");
  const [mandiFilterDistrict, setMandiFilterDistrict] = useState("");
  const [mandiFilterSearchQuery, setMandiFilterSearchQuery] = useState("");

  const speakConfirmation = (message: string, speechLang?: LanguageCode) => {
    const activeLang = speechLang || lang;
    if (!("speechSynthesis" in window)) return;

    const doSpeak = (retries = 0) => {
      // Resume if suspended (required after a user gesture on some browsers)
      if (window.speechSynthesis.paused || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if ((window.speechSynthesis as any).state === "suspended") {
        window.speechSynthesis.resume();
      }

      const voiceList = window.speechSynthesis.getVoices();

      // If voices aren't loaded yet, retry up to 5 times
      if (voiceList.length === 0 && retries < 5) {
        setTimeout(() => doSpeak(retries + 1), 200);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(message);

      const langTags: Record<LanguageCode, string> = {
        en: "en-IN",
        ta: "ta-IN",
      };
      utterance.lang = langTags[activeLang] || "en-IN";

      // Pick a matching voice
      let matchVoice: SpeechSynthesisVoice | undefined;
      if (activeLang === "ta") {
        matchVoice = voiceList.find(v => v.lang.startsWith("ta"));
      }
      if (!matchVoice) {
        matchVoice =
          voiceList.find(v => v.lang === utterance.lang) ||
          voiceList.find(v => v.lang.startsWith("en-IN") || v.name.includes("India")) ||
          voiceList.find(v => v.lang.startsWith("en"));
      }
      if (matchVoice) utterance.voice = matchVoice;

      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    };

    doSpeak();
  };

  // Submit voice transcript to backend endpoint (or client-side parser fallback)
  const handleVoiceCommand = async (inputText: string, voiceLang?: LanguageCode) => {
    setVoiceStatus("processing");
    const activeLang = voiceLang || lang;
    const textLower = inputText.toLowerCase();

    // Direct voice commands for switching dark/light themes
    if (textLower.includes("dark mode") || textLower.includes("night mode") || textLower.includes("डार्क मोड") || textLower.includes("डार्क") || textLower.includes("ਨਾਈਟ ਮੋਡ") || textLower.includes("ਡਾਰਕ") || textLower.includes("काळी") || textLower.includes("నలుపు") || textLower.includes("இருண்ட") || textLower.includes("இருட்டு") || textLower.includes("டார்க்")) {
      setDarkMode(true);
      const msg = activeLang === "ta" ? "இருண்ட பயன்முறை செயல்படுத்தப்பட்டது." : "Dark Mode is now active.";
      setAiSpeechResponse(msg);
      speakConfirmation(msg, activeLang);
      setVoiceStatus("idle");
      return;
    } else if (textLower.includes("light mode") || textLower.includes("day mode") || textLower.includes("लाइट मोड") || textLower.includes("लाइट") || textLower.includes("ਲਾਈਟ") || textLower.includes("తెలుపు") || textLower.includes("पांढरा") || textLower.includes("ஒளி") || textLower.includes("லைட்")) {
      setDarkMode(false);
      const msg = activeLang === "ta" ? "ஒளி பயன்முறை செயல்படுத்தப்பட்டது." : "Light Mode is now active.";
      setAiSpeechResponse(msg);
      speakConfirmation(msg, activeLang);
      setVoiceStatus("idle");
      return;
    }

    try {
      const response = await fetch("/api/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          currentLanguage: activeLang,
          currentScreen: screen,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend parser returned error status");
      }

      const directive: VoiceCommandResponse = await response.json();
      if (directive.isFallback) {
        throw new Error("Backend is in fallback mode");
      }
      
      let targetLang = activeLang;
      if (directive.action === "CHANGE_LANGUAGE" && directive.data?.languageCode) {
        const newLang = directive.data.languageCode as LanguageCode;
        if (["en", "hi", "mr", "te", "pa", "ta"].includes(newLang)) {
          targetLang = newLang;
          setLang(newLang);
        }
      }

      setAiSpeechResponse(directive.voiceResponse);
      speakConfirmation(directive.voiceResponse, targetLang);

      // Execute Redirection Directives
      if (directive.action === "NAVIGATE" && directive.target) {
        const trg = directive.target.toLowerCase();
        let targetScreen = trg;
        if (trg === "mandi") targetScreen = "mandi_prices";
        if (["home", "schemes", "land", "profile", "apply_scheme", "calculators", "community", "mandi_prices"].includes(targetScreen)) {
          setScreen(targetScreen as AppScreen);
          if (targetScreen === "apply_scheme") {
            setAppStep(1);
          }
        }
      } else if (directive.action === "CHANGE_LANGUAGE" && directive.data?.languageCode) {
        const newLang = directive.data.languageCode as LanguageCode;
        if (["en", "hi", "mr", "te", "pa", "ta"].includes(newLang)) {
          setLang(newLang);
        }
      } else if (directive.action === "SEARCH" && directive.data?.searchQuery) {
        setScreen("schemes");
        setSearchQuery(directive.data.searchQuery);
      } else if (directive.action === "FILL_FORM" && directive.data) {
        const info = directive.data;
        if (screen === "apply_scheme" || directive.target === "apply_scheme" || directive.target === "form") {
          setScreen("apply_scheme");
          if (info.farmerName) setAppFarmerName(info.farmerName);
          if (info.phoneNumber) setAppPhoneNumber(info.phoneNumber);
          if (info.address) setAppAddress(info.address);
          if (info.idType) setAppIdType(info.idType);
          if (info.idNumber) setAppIdNumber(info.idNumber);
          if (info.bankName) setAppBankName(info.bankName);
          if (info.bankAccount) setAppBankAccount(info.bankAccount);
          if (info.ifscCode) setAppIfsc(info.ifscCode);
          if (info.branchName) setAppBranch(info.branchName);
        }

        if (screen === "land" || directive.target === "land" || directive.target === "land_evaluation") {
          setScreen("land");
          if (info.cropType) setEvalCrop(info.cropType.toLowerCase());
          if (info.landSize) setEvalSize(info.landSize.toString());
        }
      } else if (directive.action === "SUBMIT_FORM") {
        if (screen === "apply_scheme") {
          if (appStep < 3) {
            setAppStep((prev) => (prev + 1) as any);
          } else {
            setScreen("success");
          }
        } else if (screen === "land" || screenLandSubmitCheck()) {
          triggerLandSubmit();
        }
      }

    } catch (err) {
      console.warn("Using smart client-side voice interpreter:", err);
      const lowercase = inputText.toLowerCase();
      let responseText = "Understood. Performing action.";
      let targetLang = activeLang;

      // Commodities dictionary (English & Tamil)
      const COMMODITIES_DICT = [
        { name: "Tomato", terms: ["tomato", "tomatoes", "தக்காளி"] },
        { name: "Onion", terms: ["onion", "onions", "shallot", "shallots", "வெங்காயம்", "சின்ன வெங்காயம்", "பல்லாரி"] },
        { name: "Potato", terms: ["potato", "potatoes", "உருளைக்கிழங்கு", "உருளை"] },
        { name: "Paddy (Dhan)", terms: ["paddy", "rice", "dhan", "நெல்", "அரிசி"] },
        { name: "Cotton", terms: ["cotton", "பருத்தி", "காட்டன்"] },
        { name: "Turmeric", terms: ["turmeric", "மஞ்சள்"] },
        { name: "Coconut", terms: ["coconut", "copra", "தேங்காய்", "கொப்பரை"] },
        { name: "Sugarcane", terms: ["sugarcane", "கரும்பு"] },
        { name: "Banana", terms: ["banana", "வாழை", "வாழைப்பழம்"] },
        { name: "Chilli", terms: ["chilli", "chili", "chillies", "mirchi", "மிளகாய்", "பச்சை மிளகாய்", "வத்தல்"] },
        { name: "Maize", terms: ["maize", "corn", "மக்காச்சோளம்", "சோளம்"] },
        { name: "Groundnut", terms: ["groundnut", "peanut", "நிலக்கடலை", "வேர்க்கடலை", "கடலை"] },
        { name: "Wheat", terms: ["wheat", "கோதுமை"] },
        { name: "Ginger", terms: ["ginger", "இஞ்சி"] },
        { name: "Garlic", terms: ["garlic", "பூண்டு"] },
        { name: "Brinjal", terms: ["brinjal", "eggplant", "aubergine", "கத்திரிக்காய்", "கத்தரி"] },
        { name: "Ladies Finger", terms: ["ladies finger", "okra", "bhindi", "வெண்டைக்காய்", "வெண்டை"] },
        { name: "Cabbage", terms: ["cabbage", "முட்டைக்கோஸ்", "கோஸ்"] },
        { name: "Carrot", terms: ["carrot", "கேரட்"] },
      ];

      // Districts dictionary (Tamil Nadu)
      const DISTRICTS_DICT = [
        { name: "Salem", terms: ["salem", "சேலம்", "சேலத்து"] },
        { name: "Coimbatore", terms: ["coimbatore", "kovai", "கோயம்புத்தூர்", "கோவை"] },
        { name: "Madurai", terms: ["madurai", "மதுரை"] },
        { name: "Tiruchirappalli", terms: ["trichy", "tiruchirappalli", "tiruchy", "திருச்சி", "திருச்சிராப்பள்ளி"] },
        { name: "Chennai", terms: ["chennai", "madras", "சென்னை"] },
        { name: "Erode", terms: ["erode", "ஈரோடு"] },
        { name: "Tiruppur", terms: ["tiruppur", "tirupur", "திருப்பூர்"] },
        { name: "Thanjavur", terms: ["thanjavur", "tanjore", "தஞ்சாவூர்", "தஞ்சை"] },
        { name: "Dindigul", terms: ["dindigul", "திண்டுக்கல்"] },
        { name: "Vellore", terms: ["vellore", "வேலூர்"] },
        { name: "Tirunelveli", terms: ["tirunelveli", "nellai", "திருநெல்வேலி", "நெல்லை"] },
        { name: "Dharmapuri", terms: ["dharmapuri", "தருமபுரி", "தர்மபுரி"] },
        { name: "Krishnagiri", terms: ["krishnagiri", "கிருஷ்ணகிரி"] },
        { name: "Namakkal", terms: ["namakkal", "நாமக்கல்"] },
        { name: "Theni", terms: ["theni", "தேனி"] },
        { name: "Karur", terms: ["karur", "கரூர்"] },
        { name: "Cuddalore", terms: ["cuddalore", "கடலூர்"] },
        { name: "Villupuram", terms: ["villupuram", "விழுப்புரம்"] },
        { name: "Kanchipuram", terms: ["kanchipuram", "காஞ்சிபுரம்"] },
        { name: "Thiruvallur", terms: ["thiruvallur", "திருவள்ளூர்"] },
        { name: "Pudukkottai", terms: ["pudukkottai", "புதுக்கோட்டை"] },
        { name: "Ramanathapuram", terms: ["ramanathapuram", "ராமநாதபுரம்"] },
        { name: "Sivaganga", terms: ["sivaganga", "சிவகங்கை"] },
        { name: "Nagapattinam", terms: ["nagapattinam", "நாகப்பட்டினம்"] },
        { name: "Tiruvarur", terms: ["tiruvarur", "திருவாரூர்"] },
        { name: "Nilgiris", terms: ["nilgiris", "ooty", "நீலகிரி", "ஊட்டி"] },
        { name: "Tenkasi", terms: ["tenkasi", "தென்காசி"] },
        { name: "Tirupathur", terms: ["tirupathur", "திருப்பத்தூர்"] },
        { name: "Ranipet", terms: ["ranipet", "ராணிப்பேட்டை"] },
        { name: "Kallakurichi", terms: ["kallakurichi", "கள்ளக்குறிச்சி"] },
        { name: "Chengalpattu", terms: ["chengalpattu", "செங்கல்பட்டு"] },
        { name: "Mayiladuthurai", terms: ["mayiladuthurai", "மயிலாடுதுறை"] },
        { name: "Perambalur", terms: ["perambalur", "பெரம்பலூர்"] },
        { name: "Ariyalur", terms: ["ariyalur", "அரியலூர்"] },
        { name: "Virudhunagar", terms: ["virudhunagar", "விருதுநகர்"] },
        { name: "Thoothukudi", terms: ["thoothukudi", "tuticorin", "தூத்துக்குடி"] },
      ];

      const matchedCommodity = COMMODITIES_DICT.find(c => c.terms.some(term => lowercase.includes(term)));
      const matchedDistrict = DISTRICTS_DICT.find(d => d.terms.some(term => lowercase.includes(term)));
      const isMandiIntent =
        lowercase.includes("mandi") ||
        lowercase.includes("market") ||
        lowercase.includes("price") ||
        lowercase.includes("rate") ||
        lowercase.includes("cost") ||
        lowercase.includes("மண்டி") ||
        lowercase.includes("சந்தை") ||
        lowercase.includes("விலை") ||
        lowercase.includes("ரேட்") ||
        Boolean(matchedCommodity && matchedDistrict);

      if (isMandiIntent || matchedCommodity || matchedDistrict) {
        setScreen("mandi_prices");
        if (matchedCommodity) setMandiFilterCommodity(matchedCommodity.name);
        if (matchedDistrict) setMandiFilterDistrict(matchedDistrict.name);
        if (matchedCommodity && !matchedDistrict) setMandiFilterSearchQuery(matchedCommodity.name);

        if (matchedCommodity && matchedDistrict) {
          responseText = activeLang === "ta"
            ? `${matchedDistrict.name} மாவட்டத்தில் ${matchedCommodity.terms[matchedCommodity.terms.length - 1]} மண்டி விலையைக் காட்டுகிறேன்.`
            : `Showing live Mandi price for ${matchedCommodity.name} in ${matchedDistrict.name}.`;
        } else if (matchedCommodity) {
          responseText = activeLang === "ta"
            ? `${matchedCommodity.terms[matchedCommodity.terms.length - 1]} மண்டி விலையைக் காட்டுகிறேன்.`
            : `Showing live Mandi prices for ${matchedCommodity.name}.`;
        } else if (matchedDistrict) {
          responseText = activeLang === "ta"
            ? `${matchedDistrict.name} மாவட்ட மண்டி விலைகளைத் திறக்கிறது.`
            : `Opening Mandi prices for ${matchedDistrict.name}.`;
        } else {
          responseText = activeLang === "ta" ? "மண்டி விலை பக்கத்தைத் திறக்கிறது." : "Opening Live Mandi prices page.";
        }
      } else if (lowercase.includes("drought") || lowercase.includes("வறட்சி") || lowercase.includes("நிவாரணம்") || lowercase.includes("relief")) {
        const droughtSch = SCHEMES.find(s => s.id === "special_drought_relief") || SCHEMES[0];
        setScreen("schemes");
        setSelectedDetailScheme(droughtSch);
        responseText = activeLang === "ta"
          ? "சிறப்பு வறட்சி நிவாரணத் திட்ட விவரங்களைத் திறக்கிறது."
          : "Opening Special Drought Relief scheme details.";
      } else if (lowercase.includes("kisan credit") || lowercase.includes("kcc") || lowercase.includes("கிரெடிட் கார்டு") || lowercase.includes("விவசாய கடன்")) {
        const kccScheme = SCHEMES.find(s => s.id === "kisan_credit_card") || SCHEMES[0];
        setScreen("schemes");
        setSelectedDetailScheme(kccScheme);
        responseText = activeLang === "ta"
          ? "கிசான் கிரெடிட் கார்டு திட்ட விவரங்களைத் திறக்கிறது."
          : "Opening Kisan Credit Card scheme details.";
      } else if (lowercase.includes("tractor") || lowercase.includes("டிராக்டர்") || lowercase.includes("இயந்திரம்") || lowercase.includes("machinery")) {
        const tractorSch = SCHEMES.find(s => s.id === "tractor_loan") || SCHEMES[0];
        setScreen("schemes");
        setSelectedDetailScheme(tractorSch);
        responseText = activeLang === "ta"
          ? "டிராக்டர் மற்றும் வேளாண் இயந்திர மானியத் திட்டத்தைத் திறக்கிறது."
          : "Opening Tractor & Agricultural Machinery subsidy scheme.";
      } else if (lowercase.includes("solar") || lowercase.includes("kusum") || lowercase.includes("சோலார்") || lowercase.includes("பம்ப்") || lowercase.includes("pump")) {
        const kusumSch = SCHEMES.find(s => s.id === "pm_kusum") || SCHEMES[0];
        setScreen("schemes");
        setSelectedDetailScheme(kusumSch);
        responseText = activeLang === "ta"
          ? "பிஎம்-குசும் சோலார் பம்ப் திட்ட விவரங்களைத் திறக்கிறது."
          : "Opening PM-KUSUM Solar Pump subsidy scheme.";
      } else if (lowercase.includes("insurance") || lowercase.includes("fasal bima") || lowercase.includes("காப்பீடு") || lowercase.includes("பயிர் காப்பீடு")) {
        const insSch = SCHEMES.find(s => s.id === "pm_fasal_bima") || SCHEMES[0];
        setScreen("schemes");
        setSelectedDetailScheme(insSch);
        responseText = activeLang === "ta"
          ? "பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டத்தைத் திறக்கிறது."
          : "Opening PM Fasal Bima Crop Insurance scheme.";
      } else if (lowercase.includes("organic") || lowercase.includes("pkvy") || lowercase.includes("இயற்கை") || lowercase.includes("உரம்")) {
        const orgSch = SCHEMES.find(s => s.id === "pkvy_organic") || SCHEMES[0];
        setScreen("schemes");
        setSelectedDetailScheme(orgSch);
        responseText = activeLang === "ta"
          ? "இயற்கை வேளாண்மை திட்டத்தைத் திறக்கிறது."
          : "Opening PKVY Organic Farming subsidy scheme.";
      } else if (lowercase.includes("gold") || lowercase.includes("தங்கம்") || lowercase.includes("தங்க கடன்")) {
        const goldSch = SCHEMES.find(s => s.id === "agri_gold_loan") || SCHEMES[0];
        setScreen("schemes");
        setSelectedDetailScheme(goldSch);
        responseText = activeLang === "ta"
          ? "விவசாய தங்கக் கடன் திட்ட விவரங்களைத் திறக்கிறது."
          : "Opening Agri Gold Loan details.";
      } else if (lowercase.includes("disease") || lowercase.includes("pest") || lowercase.includes("scanner") || lowercase.includes("நோய்") || lowercase.includes("கண்டறி") || lowercase.includes("ஸ்கேனர்")) {
        setScreen("disease_detection");
        responseText = activeLang === "ta" ? "பயிர் நோய் கண்டறிதல் ஸ்கேனரைத் திறக்கிறது." : "Opening Crop Disease Diagnostics scanner.";
      } else if (lowercase.includes("weather") || lowercase.includes("rain") || lowercase.includes("forecast") || lowercase.includes("climate") || lowercase.includes("வானிலை") || lowercase.includes("மழை") || lowercase.includes("காற்று")) {
        setScreen("home");
        responseText = activeLang === "ta"
          ? "இன்றைய விவசாய வானிலை மற்றும் மழை முன்னறிவிப்பு முகப்பில் காட்டப்படுகிறது."
          : "Displaying your real-time local weather and rain advisory on the dashboard.";
      } else if (lowercase.includes("calculator") || lowercase.includes("profit") || lowercase.includes("subsidy") || lowercase.includes("கணக்கீடு") || lowercase.includes("கணக்கீடுகள்") || lowercase.includes("லாபம்") || lowercase.includes("மானியம்")) {
        setScreen("calculators");
        responseText = activeLang === "ta" ? "விவசாய கணக்கீடுகளைத் திறக்கிறது." : "Opening agricultural calculators and scheme recommendations.";
      } else if (lowercase.includes("community") || lowercase.includes("forum") || lowercase.includes("சமூகம்") || lowercase.includes("விவாதம்")) {
        setScreen("community");
        responseText = activeLang === "ta" ? "விவசாயி சமூகப் பக்கத்தைத் திறக்கிறது." : "Opening the farmer community hub.";
      } else if (lowercase.includes("land") || lowercase.includes("evaluation") || lowercase.includes("soil") || lowercase.includes("நிலம்") || lowercase.includes("மதிப்பீடு") || lowercase.includes("மண்")) {
        setScreen("land");
        responseText = activeLang === "ta" ? "நில மதிப்பீடு பக்கத்திற்குச் செல்கிறது." : "Navigating to Land Evaluation and soil health checks.";
      } else if (lowercase.includes("profile") || lowercase.includes("சுயவிவரம்") || lowercase.includes("சுயவிவர")) {
        setScreen("profile");
        responseText = activeLang === "ta" ? "சுயவிவரப் பக்கத்தைத் திறக்கிறது." : "Opening your profile page.";
      } else if (lowercase.includes("tamil") || lowercase.includes("தமிழ்")) {
        targetLang = "ta";
        setLang("ta");
        responseText = "மொழி தமிழுக்கு வெற்றிகரமாக மாற்றப்பட்டது.";
      } else if (lowercase.includes("english") || lowercase.includes("ஆங்கிலம்")) {
        targetLang = "en";
        setLang("en");
        responseText = "Switched to English language.";
      } else if (lowercase.includes("home") || lowercase.includes("dashboard") || lowercase.includes("முகப்பு") || lowercase.includes("டேஷ்போர்டு")) {
        setScreen("home");
        responseText = activeLang === "ta" ? "முகப்புப் பக்கத்திற்கு உங்களை அழைத்துச் செல்கிறோம்." : "Redirecting you to the Home Dashboard.";
      } else if (lowercase.includes("scheme") || lowercase.includes("yojana") || lowercase.includes("திட்டம்") || lowercase.includes("திட்டங்கள்")) {
        setScreen("schemes");
        responseText = activeLang === "ta" ? "விவசாயத் திட்டங்களைத் திறக்கிறது." : "Opening the Schemes page.";
      } else if (lowercase.includes("apply") || lowercase.includes("விண்ணப்பி") || lowercase.includes("விண்ணப்பம்") || lowercase.includes("படிவம்")) {
        setSelectedScheme(SCHEMES[0]);
        setScreen("apply_scheme");
        setAppStep(1);
        responseText = activeLang === "ta" ? "விண்ணப்பப் படிவத்தைத் திறக்கிறது." : "Opening scheme application form.";
      } else if (lowercase.includes("search") || lowercase.includes("தேடு") || lowercase.includes("கண்டறி")) {
        const query = lowercase.replace("search", "").replace("for", "").replace("தேடு", "").replace("தேடுக", "").trim();
        setScreen("schemes");
        setSearchQuery(query);
        responseText = activeLang === "ta" ? "திட்டங்களைத் தேடுகிறது." : `Searching for ${query}.`;
      } else if (lowercase.includes("submit") || lowercase.includes("send") || lowercase.includes("சமர்ப்பி") || lowercase.includes("அனுப்பு")) {
        if (screen === "apply_scheme") {
          setScreen("success");
          responseText = activeLang === "ta" ? "விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது." : "Submitting your application successfully.";
        } else if (screen === "land") {
          triggerLandSubmit();
          responseText = activeLang === "ta" ? "நில மதிப்பீட்டு அறிக்கை சமர்ப்பிக்கப்படுகிறது." : "Submitting your land evaluation report.";
        }
      }

      setAiSpeechResponse(responseText);
      speakConfirmation(responseText, targetLang);
    } finally {
      setVoiceStatus("idle");
    }
  };

  const screenLandSubmitCheck = () => {
    return screen === "land";
  };

  const calculateLandValueForEvaluation = () => {
    const size = parseFloat(evalSize) || 0;
    if (size <= 0) return { perAcre: 0, total: 0 };

    let baseValuePerAcre = 800000;

    // Soil type multipliers
    if (evalSoilType === "alluvial") baseValuePerAcre *= 1.4;
    else if (evalSoilType === "black") baseValuePerAcre *= 1.35;
    else if (evalSoilType === "red") baseValuePerAcre *= 1.1;
    else if (evalSoilType === "sandy") baseValuePerAcre *= 0.7;

    // Water multipliers
    if (evalWaterAccess === "highly_irrigated") baseValuePerAcre *= 1.3;
    else if (evalWaterAccess === "partially") baseValuePerAcre *= 1.1;
    else if (evalWaterAccess === "rainfed") baseValuePerAcre *= 0.8;

    // Location multipliers
    if (evalLocationDistrict === "premium_highway") baseValuePerAcre *= 1.5;
    else if (evalLocationDistrict === "mid_town") baseValuePerAcre *= 1.15;
    else if (evalLocationDistrict === "remote") baseValuePerAcre *= 0.75;

    // Road facing bonus
    if (evalRoadFacing) baseValuePerAcre *= 1.15;

    // Crop premium multiplier
    if (evalCrop === "wheat") baseValuePerAcre *= 1.1;
    else if (evalCrop === "cotton") baseValuePerAcre *= 1.15;
    else if (evalCrop === "sugarcane") baseValuePerAcre *= 1.05;
    else if (evalCrop === "rice") baseValuePerAcre *= 1.08;

    const totalValue = baseValuePerAcre * size;
    return {
      perAcre: Math.round(baseValuePerAcre),
      total: Math.round(totalValue)
    };
  };

  const triggerLandSubmit = () => {
    setEvalIsSubmitting(true);
    setTimeout(() => {
      setEvalIsSubmitting(false);
      const est = calculateLandValueForEvaluation();
      setEvaluatedLandValue(est);
      setShowEvalReport(true);
      setEvalSuccessMsg("Land Evaluation Report Submitted Successfully!");
      setTimeout(() => setEvalSuccessMsg(""), 4000);
    }, 1500);
  };

  // Helper trigger for voice assistant
  const toggleMicrophone = () => {
    // Voice Assistant floating widget manages mic state directly
  };

  const submitTypedCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    setTranscriptText(typedCommand);
    handleVoiceCommand(typedCommand);
    setTypedCommand("");
  };

  // Switch screen transition logger
  const navigateTo = (scr: AppScreen) => {
    setPrevScreen(screen);
    setScreen(scr);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSchemeSelectAndApply = (scheme: Scheme) => {
    if (
      (scheme.verification_status === "VERIFIED" || scheme.verification_status === undefined) &&
      scheme.official_application_url
    ) {
      setRedirectWarningScheme(scheme);
      return;
    }

    if (scheme.application_type === "OFFLINE" || scheme.verification_status === "OFFLINE" || !scheme.official_application_url) {
      if (scheme.official_info_url) {
        window.open(scheme.official_info_url, "_blank", "noopener,noreferrer");
        return;
      }
      alert(
        lang === "ta"
          ? "இந்த திட்டத்திற்கு ஆன்லைன் விண்ணப்ப வசதி இல்லை.\nவிண்ணப்பிக்க அருகிலுள்ள வேளாண்மை அலுவலகத்தை அணுகவும்."
          : "Online application is not available for this scheme.\nPlease contact your nearest Agriculture Department office."
      );
      return;
    }

    alert(
      lang === "ta"
        ? "அதிகாரப்பூர்வ விண்ணப்ப இணைப்பு தற்போது கிடைக்கவில்லை."
        : "Official application link is currently unavailable."
    );
  };

  const handleConfirmRedirect = () => {
    if (redirectWarningScheme?.official_application_url) {
      window.open(redirectWarningScheme.official_application_url, "_blank", "noopener,noreferrer");
    }
    setRedirectWarningScheme(null);
  };

  const handleLandSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    triggerLandSubmit();
  };

  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appStep < 3) {
      setAppStep((prev) => (prev + 1) as any);
    } else {
      const newApp: UserApplication = {
        id: `KS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        schemeId: selectedScheme.id,
        schemeTitle: selectedScheme.title,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        status: "In Review",
        farmerName: appFarmerName || googleUser?.name || "Farmer",
      };
      saveApplication(newApp);
      navigateTo("success");
    }
  };

  // Show a loading spinner while Google Auth initialises
  if (!googleLoaded) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-[#151C22] dark:text-[#f1f5f9] selection:bg-[#beead1] selection:text-[#0F5238] flex flex-col antialiased transition-colors duration-300">
      
      {/* GLOBAL NOTIFICATION DROPDOWN */}
      {showNotifications && (
        <div className="fixed inset-x-0 top-[72px] mx-auto max-w-lg z-[100] px-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 relative animate-scale-in">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-display font-semibold text-primary">{activeTranslations.voiceAssistant} Notifications</h4>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm border-l-4 border-primary">
                  {n.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-[80] bg-white dark:bg-black border-b border-[#E9ECEF] dark:border-zinc-800 px-4 md:px-12 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          {screen !== "home" && screen !== "success" ? (
            <button 
              onClick={() => navigateTo(prevScreen === "success" ? "home" : prevScreen)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 active:scale-95 transition"
            >
              <span className="material-symbols-outlined text-[#0F5238] font-bold">arrow_back</span>
            </button>
          ) : null}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={logoFileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <div 
              className="relative group cursor-pointer"
              title="Click to upload or change JPEG Logo"
              onClick={() => logoFileInputRef.current?.click()}
            >
              {!logoLoadError && appLogo ? (
                <img
                  src={appLogo}
                  alt="Your Schemes Logo"
                  onError={() => setLogoLoadError(true)}
                  className="w-11 h-11 object-contain rounded-full border border-emerald-800/30 bg-slate-950 p-0.5 shadow-md transition transform group-hover:scale-105"
                />
              ) : (
                <img
                  src="/favicon.svg"
                  alt="Your Schemes SVG Logo"
                  className="w-11 h-11 object-contain rounded-full border border-emerald-800/30 bg-slate-950 p-0.5 shadow-md transition transform group-hover:scale-105"
                />
              )}
              <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] shadow">
                <span className="material-symbols-outlined text-[10px]">upload</span>
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F5238] font-display">
                {activeTranslations.krishiSahay}
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold hidden md:block">
                Smart Voice Assistant App
              </p>
            </div>
          </div>
        </div>

        {/* MULTILINGUAL SELECTOR & PROFILE PIC */}
        <div className="flex items-center gap-3">
          
          {/* Quick Lang Dropdown */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2 text-primary pointer-events-none text-sm">language</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className="pl-7 pr-8 py-1.5 text-xs font-semibold bg-[#EEF4FD] hover:bg-slate-200 border-none rounded-full text-slate-800 focus:ring-2 focus:ring-primary outline-none transition cursor-pointer appearance-none"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 text-slate-500 text-xs pointer-events-none">expand_more</span>
          </div>

          {/* Theme Mode Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer shadow-sm ${
              darkMode
                ? "bg-amber-400/15 text-amber-300 border border-amber-400/30 hover:bg-amber-400/25 hover:scale-110 hover:shadow-amber-400/10"
                : "bg-[#EEF4FD] text-[#0F5238] border border-emerald-100 hover:bg-emerald-100 hover:scale-110 hover:shadow-md"
            }`}
            title={darkMode ? activeTranslations.lightMode : activeTranslations.darkMode}
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-300 transform hover:rotate-12">
              {darkMode ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Notifications Trigger */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition relative"
          >
            <span className="material-symbols-outlined text-slate-700">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Google Auth Controls */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-zinc-700 pl-3">
            {isLoggedIn && googleUser ? (
              <div className="flex items-center gap-2">
                <img
                  src={googleUser.picture}
                  alt={googleUser.name}
                  className="w-8 h-8 rounded-full border-2 border-emerald-300 shadow-sm cursor-pointer"
                  title={googleUser.name}
                  onClick={() => setShowSignInModal(true)}
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{googleUser.given_name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{googleUser.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-8 px-3 items-center gap-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition cursor-pointer active:scale-95 border-none"
                  title="Sign out"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError(null);
                  loginWithGoogle();
                }}
                disabled={isSigningIn}
                className="flex h-9 px-4 items-center gap-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-95 border border-slate-200 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{isSigningIn ? "Signing In..." : "Sign in with Google"}</span>
              </button>
            )}
          </div>

          {/* Google Sign-In Modal */}
          {showSignInModal && !isLoggedIn && (
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={(e) => { if (e.target === e.currentTarget) setShowSignInModal(false); }}
            >
              <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5 w-[340px] border border-slate-200 dark:border-zinc-700">
                {/* Close button */}
                <button
                  onClick={() => setShowSignInModal(false)}
                  className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer transition"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>

                {/* Branding */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-1 shadow-lg">
                    <span className="material-symbols-outlined text-white text-2xl">grass</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">Welcome to Your Schemes</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Sign in to access personalised schemes, mandi prices and more</p>
                </div>

                {/* Remember Me toggle */}
                <label className="w-full flex items-center gap-3 cursor-pointer select-none group px-1">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                      rememberMe ? "bg-emerald-500" : "bg-slate-200 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                        rememberMe ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Remember me
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {rememberMe ? "Stay signed in across browser restarts" : "Sign out when browser closes"}
                    </span>
                  </div>
                </label>

                {/* Google Sign-In Action Button */}
                <div className="w-full space-y-3">
                  <button
                    onClick={() => {
                      setAuthError(null);
                      loginWithGoogle();
                    }}
                    disabled={isSigningIn}
                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-white border border-slate-200 dark:border-zinc-700 font-bold text-xs flex items-center justify-center gap-3 transition shadow-sm cursor-pointer active:scale-98"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>{isSigningIn ? "Connecting to Google..." : "Continue with Google"}</span>
                  </button>

                  {authError && (
                    <p className="text-xs text-red-500 text-center font-medium bg-red-50 dark:bg-red-950/40 p-2 rounded-lg">{authError}</p>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 text-center">By signing in you agree to our terms. Your data stays private.</p>
              </div>
            </div>
          )}

        </div>
      </header>

      {/* CORE CANVAS WORKSPACE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-12 py-8 pb-32">
        

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {/* Clerk handles auth routing — no custom OTP routes needed */}
            {null}

            {/* ==================== 1. HOME DASHBOARD ==================== */}
            {screen === "home" && (
          <div className="space-y-8 animate-scale-in">
            
            {/* BRAND GREETING BAR */}
            <div className="text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-[#0F5238] tracking-tight font-display">
                  {activeTranslations.krishiSahay}
                </h2>
                <p className="text-slate-600 text-sm mt-1 font-sans">
                  {activeTranslations.empoweringGrowth}
                </p>
              </div>
              <div className="bg-[#EEF4FD] rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 flex items-center gap-2 border border-slate-200 self-start md:self-auto">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Voice System Online</span>
              </div>
            </div>

            {/* LOCATION PERMISSION PROMPT CARD */}
            {locationStatus === "prompt" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-start gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                    <span className="material-symbols-outlined text-2xl">location_on</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {activeTranslations.locationRequestTitle || "Enable Geolocation for Smart Weather & Mandi"}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {activeTranslations.locationRequestDesc || "We need your device location permission to display real-time micro-weather updates, regional soil health recommendations, and commodity prices in your nearest grain market (Mandi)."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0 justify-end">
                  <button
                    onClick={dismissLocationPrompt}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors rounded-lg cursor-pointer"
                  >
                    {activeTranslations.locationDeny || "Maybe Later"}
                  </button>
                  <button
                    onClick={requestLocationPermission}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">my_location</span>
                    <span>{activeTranslations.locationAllow || "Allow Location Access"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* LOCATION STATUS MESSAGE INDICATOR */}
            {locationStatus === "granted" && locationMessage && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200/60 rounded-xl px-4 py-2.5 text-xs font-medium text-[#0F5238] flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>{locationMessage}</span>
                {userCoords && (
                  <span className="text-slate-500 font-mono ml-auto">
                    [{userCoords.latitude.toFixed(4)}°N, {userCoords.longitude.toFixed(4)}°E]
                  </span>
                )}
              </motion.div>
            )}

            {/* UPCOMING SCHEMES PROMOTIONAL BANNERS */}
            <UpcomingSchemesBanner lang={lang} />

            {/* SPACIOUS WEATHER WIDGET CONTAINER */}
            <section className="bg-white border border-[#E9ECEF] rounded-2xl shadow-sm p-6 overflow-hidden relative group text-left">
              <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#0056d2]/5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
              
              {weatherLoading && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-100 text-slate-500 rounded-full px-2.5 py-1 text-[10px] font-bold z-10">
                  <span className="material-symbols-outlined text-[10px] animate-spin">progress_activity</span>
                  Updating...
                </div>
              )}

              {weatherError && (
                <div className="absolute top-3 right-3 text-red-500 text-[10px] font-bold flex items-center gap-1 z-10">
                  <span className="material-symbols-outlined text-[12px]">error</span>
                  Offline
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-[#0056d2]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    <span className="font-semibold text-sm tracking-wide uppercase">
                      {resolvedAddress ? `${resolvedAddress} ${userCoords ? "(Live GPS)" : "(Default)"}` : activeTranslations.weatherTitle}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-extrabold text-slate-900 font-display">
                      {weatherData?.current ? Math.round(weatherData.current.temperature) : (weatherData ? Math.round(weatherData.temperature) : "28")}°
                    </span>
                    <span className="text-2xl font-bold text-slate-500">C</span>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {weatherData?.current ? getWeatherCondition(weatherData.current.weatherCode) : (weatherData?.forecast?.[0]?.condition || activeTranslations.sunnyClear)}
                  </p>
                </div>
                
                {/* Sun/Weather Large Icon */}
                <div className="flex items-center gap-4 relative z-10">
                  <span 
                    className="material-symbols-outlined text-7xl" 
                    style={{ 
                      fontVariationSettings: "'wght' 200",
                      color: (weatherData?.current ? getWeatherIcon(weatherData.current.weatherCode) : (weatherData?.forecast?.[0]?.icon || "wb_sunny")) === "wb_sunny" ? "#FFB000" : 
                             (weatherData?.current ? getWeatherIcon(weatherData.current.weatherCode) : (weatherData?.forecast?.[0]?.icon || "wb_sunny")) === "rainy" || 
                             (weatherData?.current ? getWeatherIcon(weatherData.current.weatherCode) : (weatherData?.forecast?.[0]?.icon || "wb_sunny")) === "thunderstorm" ? "#3B82F6" : "#64748B"
                    }}
                  >
                    {weatherData?.current ? getWeatherIcon(weatherData.current.weatherCode) : (weatherData?.forecast?.[0]?.icon || "wb_sunny")}
                  </span>
                </div>
              </div>

              {/* Weather Metas Grid (Enhanced with 8 parameters for complete current metrics) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-left relative z-10">
                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition">
                  <span className="material-symbols-outlined text-slate-500 text-lg">humidity_mid</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{activeTranslations.humidity}</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {weatherData?.current ? `${Math.round(weatherData.current.relativeHumidity)}%` : (weatherData ? `${Math.round(weatherData.humidity)}%` : "42%")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition border-l border-slate-100/40">
                  <span className="material-symbols-outlined text-slate-500 text-lg">air</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{activeTranslations.wind}</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {weatherData?.current ? `${Math.round(weatherData.current.windSpeed)} km/h` : (weatherData ? `${Math.round(weatherData.windSpeed)} km/h` : "12 km/h")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition border-l border-slate-100/40">
                  <span className="material-symbols-outlined text-slate-500 text-lg">water_drop</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{activeTranslations.rain}</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {weatherData?.current ? `${weatherData.current.rain} mm` : (weatherData ? `${Math.round(weatherData.rainProbability)}%` : "0%")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition border-l border-slate-100/40">
                  <span className="material-symbols-outlined text-slate-500 text-lg">thermostat</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Feels Like</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {weatherData?.current ? `${Math.round(weatherData.current.feelsLikeTemperature)}°C` : "30°C"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition border-t border-slate-100/60 pt-4">
                  <span className="material-symbols-outlined text-slate-500 text-lg">cloud</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cloud Cover</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {weatherData?.current ? `${Math.round(weatherData.current.cloudCover)}%` : "20%"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition border-t border-slate-100/60 sm:border-l border-slate-100/40 pt-4">
                  <span className="material-symbols-outlined text-slate-500 text-lg">compass_calibration</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wind Dir</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {weatherData?.current ? `${Math.round(weatherData.current.windDirection)}°` : "90°"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition border-t border-slate-100/60 sm:border-l border-slate-100/40 pt-4">
                  <span className="material-symbols-outlined text-slate-500 text-lg">rainy</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Precipitation</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {weatherData?.current ? `${weatherData.current.precipitation} mm` : "0.0 mm"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition border-t border-slate-100/60 sm:border-l border-slate-100/40 pt-4">
                  <span className="material-symbols-outlined text-slate-500 text-lg">
                    {weatherData?.current?.isDay === 1 ? "light_mode" : "dark_mode"}
                  </span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Day / Night</span>
                    <span className="font-bold text-slate-800 text-xs">
                      {weatherData?.current ? (weatherData.current.isDay === 1 ? "Day" : "Night") : "Day"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 24-Hour Forecast (Hourly) Section */}
              {weatherData?.hourly && weatherData.hourly.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 text-left relative z-10">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-display">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    24-Hour Forecast
                  </h4>
                  <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-200">
                    {weatherData.hourly.map((h, idx) => {
                      const hourStr = new Date(h.time).toLocaleTimeString(lang === "en" ? "en-US" : "en-IN", { hour: "numeric", minute: "numeric", hour12: true });
                      return (
                        <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center min-w-[110px] flex flex-col items-center justify-between gap-1 hover:border-[#0056d2]/30 transition shrink-0">
                          <p className="text-[10px] font-bold text-slate-500">{hourStr}</p>
                          <span className="material-symbols-outlined text-slate-600 text-2xl my-1">
                            {getWeatherIcon(h.weatherCode)}
                          </span>
                          <p className="text-sm font-extrabold text-slate-800">{Math.round(h.temperature)}°C</p>
                          <p className="text-[9px] text-blue-600 font-extrabold uppercase mt-1">🌧️ {Math.round(h.precipitationProbability)}%</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">UV: {h.uvIndex}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7-Day Daily Forecast Section */}
              {weatherData?.daily && weatherData.daily.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 text-left relative z-10">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-display">
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    7-Day Daily Forecast
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {weatherData.daily.map((d, idx) => {
                      const dateObj = new Date(d.date);
                      const dayName = dateObj.getDay() === new Date().getDay() ? "Today" : dateObj.toLocaleDateString("en-IN", { weekday: "short" });
                      const dateStr = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                      
                      const sunriseTime = d.sunrise ? new Date(d.sunrise).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
                      const sunsetTime = d.sunset ? new Date(d.sunset).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";
                      
                      return (
                        <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2 hover:border-[#0F5238]/30 transition text-left relative overflow-hidden group/daily">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-none">{dayName}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1.5">{dateStr}</p>
                            </div>
                            <span className="material-symbols-outlined text-[#0F5238] text-2xl group-hover/daily:scale-110 transition-transform">
                              {getWeatherIcon(d.weatherCode)}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-xs font-semibold text-slate-600">
                            <div className="flex justify-between">
                              <span>Max / Min</span>
                              <span className="font-extrabold text-slate-800">{Math.round(d.maxTemperature)}° / {Math.round(d.minTemperature)}°C</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Feels Like</span>
                              <span>{Math.round(d.apparentMaxTemperature)}° / {Math.round(d.apparentMinTemperature)}°</span>
                            </div>
                            <div className="flex justify-between text-[11px] border-t border-slate-200/60 pt-1 mt-1">
                              <span>Rain Prob.</span>
                              <span className="text-blue-600 font-extrabold">🌧️ {Math.round(d.maxRainProbability)}%</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span>Total Rain</span>
                              <span>{d.totalRain} mm</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span>UV Index</span>
                              <span className="font-bold">☀️ {d.maxUvIndex}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span>Daylight</span>
                              <span>{Math.round(d.daylightDuration / 3600)}h</span>
                            </div>
                            <div className="flex justify-between text-[11px] border-t border-slate-200/60 pt-1 mt-1 text-slate-400 font-bold">
                              <span className="flex items-center gap-0.5">🌅 {sunriseTime}</span>
                              <span className="flex items-center gap-0.5">🌇 {sunsetTime}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* BENTO REDIRECT BOXES */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Explore Schemes (Green Theme Container) */}
              <button 
                onClick={() => navigateTo("schemes")}
                className="bg-[#beead1]/30 hover:bg-[#beead1]/50 border border-emerald-200/60 rounded-2xl p-6 flex flex-col items-center text-center justify-center gap-4 transition-all duration-300 hover:shadow-md h-52 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-[#0F5238] text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">description</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F5238] block leading-tight font-display">
                    {activeTranslations.exploreSchemes}
                  </h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-white text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                    {activeTranslations.schemesAvailable}
                  </span>
                </div>
              </button>

              {/* Land Evaluation (Blue Theme Container) */}
              <button 
                onClick={() => navigateTo("land")}
                className="bg-[#EEF4FD] hover:bg-slate-200 border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center justify-center gap-4 transition-all duration-300 hover:shadow-md h-52 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-[#0056D2] text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">map</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0056D2] block leading-tight font-display">
                    {activeTranslations.landEvaluation}
                  </h3>
                  <span className="inline-block mt-2 px-3 py-1 bg-white text-slate-800 text-xs font-bold rounded-full border border-slate-200">
                    {activeTranslations.checkSoil}
                  </span>
                </div>
              </button>

            </section>

            {/* DYNAMIC INSIGHTS - LAND ASSETS LIST */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 font-display">
                  {activeTranslations.yourLandAssets}
                </h3>
                <button onClick={() => navigateTo("land")} className="text-sm font-semibold text-primary hover:underline">
                  {activeTranslations.viewAll}
                </button>
              </div>

              {/* Land Item Asset Box */}
              <div 
                onClick={() => navigateTo("land")}
                className="bg-white border border-[#E9ECEF] rounded-2xl shadow-sm p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-primary transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    <img 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdendN2O32ekujtWVnMjJly_U6Jo2ahpTAfnDW8pbT7aWt5GdmLJT0mTpZ1mw7htEaEQBrv0GYAZhBWnJrycb8Gj4U1g8m-kwBmZkiB6X5gE3qXdSUC-cl1OuHeBM-Hpq_EQsDGtBhfv9HBX2UEj7KNZggh53HQdendMqYYkbCSToZdYKDth_2KFxodbsgJMIQv-ApNbQ-5i-VXFy_6wUcWKwYXwXvQHgEaUeFdnAVGm-11AR6gvvK_u65fRsGYvt2W-yZIxmQ00g8"
                      alt="Farmland Satellite Map" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-base">{activeTranslations.northernField}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{activeTranslations.wheatCrop}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span>{activeTranslations.healthy}</span>
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </div>
            </section>

            {/* EXPERT TIP BANNER */}
            <section className="bg-emerald-50 border border-emerald-100 text-[#0F5238] p-5 rounded-2xl flex gap-4 items-start text-left shadow-inner">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <div className="space-y-1">
                <h4 className="font-bold text-sm tracking-wider uppercase text-[#0F5238]">{activeTranslations.expertTipTitle}</h4>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {activeTranslations.expertTipText}
                </p>
              </div>
            </section>

            {/* VILLAGE METRICS & ALERTS DASHBOARD */}
            <DashboardExtensions lang={lang} weatherData={weatherData} />

          </div>
        )}

        {/* ==================== 2. SCHEMES DIRECTORY ==================== */}
        {screen === "schemes" && (
          <div className="space-y-8 animate-scale-in">
            <div className="text-left">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight font-display">
                Available Schemes
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Apply for highly subsidized crop loans, gold loans, and financial aid systems out loud.
              </p>
            </div>

            {/* Search and Category Quick-Chips */}
            <div className="space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                  type="text"
                  placeholder={activeTranslations.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-white border border-[#E9ECEF] rounded-xl font-medium focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none shadow-sm transition"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Tabs selector */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {["All", "Government", "Banking", "Insurance", "Machinery"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition ${
                      categoryFilter === cat 
                        ? "bg-[#0F5238] text-white shadow-sm" 
                        : "bg-white border border-[#E9ECEF] text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat === "All" ? activeTranslations.allSchemes : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* SCHEMES CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SCHEMES.filter(s => {
                const matchesCat = categoryFilter === "All" || s.category === categoryFilter;
                const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      s.description.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCat && matchesSearch;
              }).map((scheme) => (
                <article 
                  key={scheme.id}
                  className="bg-white border border-[#E9ECEF] rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary text-left"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-[#EEF4FD] rounded-xl text-primary">
                        <span className="material-symbols-outlined text-2xl">
                          {scheme.icon === "CreditCard" ? "credit_card" :
                           scheme.icon === "ShieldAlert" ? "security" :
                           scheme.icon === "Coins" ? "monetization_on" :
                           scheme.icon === "Sun" ? "sunny" :
                           scheme.icon === "Truck" ? "local_shipping" : "leaf"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full ${
                          scheme.badgeType === "active" ? "bg-emerald-100 text-emerald-800" :
                          scheme.badgeType === "open" ? "bg-blue-100 text-blue-800" :
                          scheme.badgeType === "banking" ? "bg-amber-100 text-amber-800" : "bg-purple-100 text-purple-800"
                        }`}>
                          {scheme.badge}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {scheme.government_level === "TAMIL_NADU" ? (lang === "ta" ? "தமிழ்நாடு அரசு" : "TN Govt") : (lang === "ta" ? "மத்திய அரசு" : "Central Govt")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-display">{scheme.title}</h3>
                      {scheme.name_ta && (
                        <p className="text-xs font-bold text-emerald-700 mt-0.5">{scheme.name_ta}</p>
                      )}
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
                        {lang === "ta" && scheme.description_ta ? scheme.description_ta : scheme.description}
                      </p>
                    </div>

                    <div className="py-2.5 border-t border-b border-slate-50 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="material-symbols-outlined text-slate-400 text-sm">groups</span>
                        <span className="font-semibold">{scheme.criteria}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#0F5238]">
                        <span className="material-symbols-outlined text-sm font-semibold">payments</span>
                        <span className="font-bold">{scheme.benefit}</span>
                      </div>
                    </div>

                    {/* Verification Status Badge */}
                    {scheme.verification_status === "VERIFIED" && (
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 pt-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{lang === "ta" ? "🟢 அதிகாரப்பூர்வ அரசு இணையதளம்" : "🟢 Official Government Website"}</span>
                        </span>
                      </div>
                    )}
                    {scheme.verification_status === "OFFLINE" && (
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 pt-1">
                        <span>{lang === "ta" ? "🟡 ஆன்லைன் விண்ணப்பம் இல்லை" : "🟡 In-Person Application"}</span>
                      </div>
                    )}
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button 
                      onClick={() => setSelectedDetailScheme(scheme)}
                      className="h-11 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      {activeTranslations.viewDetails}
                    </button>
                    <button 
                      onClick={() => handleSchemeSelectAndApply(scheme)}
                      className={`h-11 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                        scheme.application_type === "OFFLINE" || scheme.verification_status === "OFFLINE"
                          ? "bg-amber-700 hover:bg-amber-800 text-white"
                          : "bg-primary hover:bg-emerald-800 text-white"
                      }`}
                    >
                      <span>
                        {scheme.application_type === "OFFLINE" || scheme.verification_status === "OFFLINE"
                          ? (lang === "ta" ? "அலுவலகம் ↗" : "Find Office ↗")
                          : (lang === "ta" ? "விண்ணப்பிக்க ↗" : "Apply ↗")}
                      </span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* FEATURED DROUGHT RELIEF HERO SECTION */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F5238] to-[#1B4332] p-8 text-white text-left flex flex-col justify-center h-48 shadow-lg">
              <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[180px]">water_damage</span>
              </div>
              <div className="relative z-10 space-y-2">
                <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Urgent Notification</span>
                <h2 className="text-2xl font-bold font-display">{activeTranslations.droughtTitle}</h2>
                <p className="text-emerald-100 text-sm max-w-md">{activeTranslations.droughtDesc}</p>
                <button 
                  onClick={() => {
                    const droughtScheme = SCHEMES.find(s => s.id === "special_drought_relief") || SCHEMES[0];
                    setSelectedDetailScheme(droughtScheme);
                  }}
                  className="mt-2 text-white font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>{activeTranslations.viewDetails}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </section>

            {/* INTERACTIVE DEADLINES CALENDAR & CHECKS */}
            <CalendarWidget onSelectScheme={handleSchemeSelectAndApply} lang={lang} />

          </div>
        )}

        {/* ==================== 3. LAND EVALUATION ==================== */}
        {screen === "land" && (
          <AgriVisionEvaluator onSelectScheme={handleSchemeSelectAndApply} lang={lang} />
        )}

        {/* ==================== 4. SCHEME APPLICATION MULTI-STEP WIZARD ==================== */}
        {screen === "apply_scheme" && (
          <div className="space-y-8 max-w-xl mx-auto animate-scale-in">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight font-display">
                {activeTranslations.schemeAppTitle}
              </h2>
              <span className="inline-block mt-2 px-4 py-1.5 bg-[#beead1] text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                Applying for: {selectedScheme.title}
              </span>
              <p className="text-slate-500 text-xs mt-3">
                {activeTranslations.fertilizerSubDesc}
              </p>
            </div>

            {/* Stepper Progress indicator */}
            <div className="flex items-center justify-between relative px-2 py-4">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: appStep === 1 ? "0%" : appStep === 2 ? "50%" : "100%" }}
              ></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 ${
                  appStep >= 1 ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  1
                </div>
                <span className={`text-[10px] font-bold mt-1 uppercase ${appStep >= 1 ? "text-primary" : "text-slate-400"}`}>
                  {activeTranslations.stepPersonal}
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 ${
                  appStep >= 2 ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  2
                </div>
                <span className={`text-[10px] font-bold mt-1 uppercase ${appStep >= 2 ? "text-primary" : "text-slate-400"}`}>
                  {activeTranslations.stepIdentity}
                </span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 ${
                  appStep >= 3 ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  3
                </div>
                <span className={`text-[10px] font-bold mt-1 uppercase ${appStep >= 3 ? "text-primary" : "text-slate-400"}`}>
                  {activeTranslations.stepBanking}
                </span>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleWizardSubmit} className="space-y-6 text-left">
              
              {/* STEP 1: PERSONAL DETAILS */}
              {appStep === 1 && (
                <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm space-y-4 animate-scale-in">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {activeTranslations.farmerFullName}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={activeTranslations.farmerFullNamePlace}
                      value={appFarmerName}
                      onChange={(e) => setAppFarmerName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {activeTranslations.phoneNumber}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-500">+91</span>
                      <input 
                        type="tel"
                        required
                        placeholder={activeTranslations.phoneNumberPlace}
                        value={appPhone}
                        onChange={(e) => setAppPhoneNumber(e.target.value)}
                        className="w-full h-12 pl-14 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {activeTranslations.address}
                    </label>
                    <textarea 
                      required
                      rows={3}
                      placeholder={activeTranslations.addressPlace}
                      value={appAddress}
                      onChange={(e) => setAppAddress(e.target.value)}
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <span>{activeTranslations.nextStep}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              )}

              {/* STEP 2: IDENTITY PROOF */}
              {appStep === 2 && (
                <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm space-y-4 animate-scale-in">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {activeTranslations.selectIdProof}
                    </label>
                    <div className="relative">
                      <select 
                        value={appIdType}
                        onChange={(e) => setAppIdType(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold appearance-none focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Kisan Credit Card">Kisan Credit Card</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {activeTranslations.idNumber}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder={activeTranslations.idNumberPlace}
                      value={appIdNumber}
                      onChange={(e) => setAppIdNumber(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                      {activeTranslations.uploadId}
                    </label>
                    <div 
                      onClick={() => {
                        setAppDocUploaded(true);
                        speakConfirmation("Identity document uploaded.");
                      }}
                      className={`p-6 rounded-xl border-2 border-dashed text-center flex flex-col items-center justify-center gap-2 ${
                        appDocUploaded ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50 hover:border-primary"
                      } cursor-pointer transition`}
                    >
                      <span className="material-symbols-outlined text-[#0F5238] text-4xl mb-1">cloud_upload</span>
                      <p className="text-xs font-bold text-slate-800">
                        {appDocUploaded ? "Document Locked & Encrypted" : activeTranslations.uploadId}
                      </p>
                      <p className="text-[10px] text-slate-400">{activeTranslations.uploadDesc}</p>
                      <button 
                        type="button"
                        className="mt-2 px-4 py-1.5 bg-[#EEF4FD] hover:bg-slate-200 text-[#0F5238] rounded-full text-xs font-bold transition border-none"
                      >
                        {activeTranslations.chooseFiles}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      type="button"
                      onClick={() => setAppStep(1)}
                      className="flex-1 h-12 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                    >
                      {activeTranslations.back}
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] h-12 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{activeTranslations.nextStep}</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 3: BANKING DETAILS */}
              {appStep === 3 && (
                <div className="bg-white p-6 rounded-2xl border border-[#E9ECEF] shadow-sm space-y-4 animate-scale-in">
                  
                  <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-100">
                    <span className="material-symbols-outlined text-[#0056D2]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    <span className="text-xs font-bold text-slate-700">{activeTranslations.secureBank}</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{activeTranslations.bankName}</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. State Bank of India"
                        value={appBankName}
                        onChange={(e) => setAppBankName(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{activeTranslations.bankAccount}</label>
                      <input 
                        type="password"
                        required
                        placeholder="Enter 12-16 digit account number"
                        value={appBankAccount}
                        onChange={(e) => setAppBankAccount(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold tracking-widest focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{activeTranslations.ifscCode}</label>
                        <input 
                          type="text"
                          required
                          placeholder="SBIN0001234"
                          value={appIfsc}
                          onChange={(e) => setAppIfsc(e.target.value.toUpperCase())}
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold uppercase focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{activeTranslations.branchName}</label>
                        <input 
                          type="text"
                          required
                          placeholder="Branch location"
                          value={appBranch}
                          onChange={(e) => setAppBranch(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms check box */}
                  <div className="flex items-start gap-2.5 pt-2">
                    <input 
                      type="checkbox"
                      id="terms"
                      required
                      checked={appTerms}
                      onChange={(e) => setAppTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                      {activeTranslations.termsAgreement}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-semibold">
                        {activeTranslations.termsLink}
                      </a>.
                    </label>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      type="button"
                      onClick={() => setAppStep(2)}
                      className="flex-1 h-12 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                    >
                      {activeTranslations.back}
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] h-12 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{activeTranslations.submitApplication}</span>
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>

                </div>
              )}

            </form>
          </div>
        )}

        {/* ==================== 5. CONFIRMED APPLICATION SUCCESS SCREEN ==================== */}
        {screen === "success" && (
          <div className="max-w-xl mx-auto space-y-6 py-6 animate-scale-in relative">
            
            {/* FLOATING SUCCESS CONFETTI EFFECT */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              <div className="absolute top-20 right-10 w-3.5 h-3.5 bg-emerald-300 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 left-1/4 w-3 h-3 bg-amber-400 rounded-full animate-bounce"></div>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-3xl shadow-xl p-8 text-center relative z-10 overflow-hidden space-y-6">
              
              {/* Pulsating Green Shield Icon */}
              <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-outlined text-[#0F5238] !text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-[#0F5238] tracking-tight font-display">
                  {activeTranslations.appSubmitted}
                </h2>
                <p className="text-slate-600 text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-slate-800">{appFarmerName || activeTranslations.rajesh}</span>! {activeTranslations.thankYouMessage}
                </p>
              </div>

              {/* Secure summary card */}
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 text-left border border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">{activeTranslations.appIdLabel}</span>
                  <span className="font-mono font-bold text-primary text-sm select-all">KS-2026-88421</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-3">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">{activeTranslations.subDateLabel}</span>
                  <span className="font-bold text-slate-700">June 30, 2026</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-3">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">{activeTranslations.estStatusLabel}</span>
                  <span className="font-bold text-emerald-800 px-2.5 py-0.5 bg-[#beead1] rounded-full border border-emerald-300">
                    {activeTranslations.estStatusVal}
                  </span>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={() => {
                    setAppFarmerName("");
                    setAppPhoneNumber("");
                    setAppAddress("");
                    setAppBankAccount("");
                    setAppIdNumber("");
                    setAppTerms(false);
                    navigateTo("home");
                  }}
                  className="w-full h-12 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">home</span>
                  <span>{activeTranslations.returnHome}</span>
                </button>
                <button 
                  onClick={() => alert("Downloading receipt pdf...")}
                  className="w-full h-11 border border-[#0056D2] text-[#0056D2] hover:bg-[#EEF4FD] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  <span>{activeTranslations.downloadReceipt}</span>
                </button>
              </div>

              {/* Grounding encryption tag */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>{activeTranslations.securedEncryption}</span>
              </div>

            </div>
          </div>
        )}

        {/* ==================== 5b. CALCULATORS SCREEN ==================== */}
        {screen === "calculators" && (
          <div className="space-y-8 animate-scale-in">
            <Calculators onSelectScheme={handleSchemeSelectAndApply} lang={lang} />
          </div>
        )}

        {/* ==================== 5c. COMMUNITY SCREEN ==================== */}
        {screen === "community" && (
          <div className="space-y-8 animate-scale-in">
            <Community lang={lang} />
          </div>
        )}

        {/* ==================== 6. FARMER PROFILE SCREEN ==================== */}
        {screen === "profile" && (
          <div className="max-w-xl mx-auto space-y-6 animate-scale-in text-left">
            <div className="bg-white border border-[#E9ECEF] rounded-3xl shadow-md p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F5238]/5 rounded-bl-full pointer-events-none"></div>
              
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-zinc-800">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#beead1] shadow-md relative bg-emerald-50 flex items-center justify-center">
                  {googleUser?.picture ? (
                    <img 
                      className="w-full h-full object-cover" 
                      src={googleUser.picture}
                      alt={googleUser.name || "Profile"} 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-700 text-white font-bold text-3xl flex items-center justify-center">
                      {(googleUser?.name || "F")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-4 font-display">
                  {googleUser?.name || activeTranslations.farmerProfile}
                </h3>
                {googleUser?.email ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {googleUser.email}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Tamil Nadu Agriculture Portal
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{isLoggedIn ? "Google Verified" : "Guest Mode"}</span>
                  </span>
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="text-xs font-bold px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-full border border-red-200 transition cursor-pointer"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => loginWithGoogle()}
                      className="text-xs font-bold px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition cursor-pointer"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-6 text-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs font-display">
                    {activeTranslations.assetSummary}
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Live Status
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-700/60">
                    <span className="text-slate-400 text-xs font-semibold">Total Land Size</span>
                    <p className="text-lg font-bold text-primary mt-1">
                      {evalSize && parseFloat(evalSize) > 0 ? `${evalSize} Acres` : "0.0 Acres"}
                    </p>
                    {(!evalSize || parseFloat(evalSize) <= 0) && (
                      <button
                        onClick={() => setScreen("land")}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1 block"
                      >
                        + Evaluate Land
                      </button>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-700/60">
                    <span className="text-slate-400 text-xs font-semibold">Active Subsidies</span>
                    <p className="text-lg font-bold text-[#0056D2] mt-1">
                      {userApplications.length === 0 ? "0 Applied" : `${userApplications.length} ${userApplications.length === 1 ? "Scheme" : "Schemes"}`}
                    </p>
                    {userApplications.length === 0 && (
                      <button
                        onClick={() => setScreen("schemes")}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline mt-1 block"
                      >
                        + Browse Schemes
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs">District Location</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs">{resolvedAddress || "Tamil Nadu, India"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs">Account Status</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      <span>{isLoggedIn ? "Google Authenticated" : "Guest Mode"}</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs">Soil Health Rating</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400 text-xs uppercase">
                      {evaluatedLandValue ? "Evaluated (8.5/10)" : "Pending Evaluation"}
                    </span>
                  </div>
                </div>

                {/* My Applied Schemes Section */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs font-display">
                      My Applied Schemes ({userApplications.length})
                    </h4>
                    {userApplications.length > 0 && (
                      <button
                        onClick={() => setScreen("schemes")}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        + Apply More
                      </button>
                    )}
                  </div>

                  {userApplications.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-700 text-center space-y-3">
                      <span className="material-symbols-outlined text-3xl text-slate-400">assignment</span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        No scheme applications submitted yet.
                      </p>
                      <button
                        onClick={() => setScreen("schemes")}
                        className="px-4 py-2 bg-[#0F5238] hover:bg-[#1a7a52] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        Explore & Apply for Schemes
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {userApplications.map((app) => (
                        <div
                          key={app.id}
                          className="p-3.5 bg-slate-50 dark:bg-zinc-800/70 rounded-xl border border-slate-200 dark:border-zinc-700 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                              {app.schemeTitle}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              ID: {app.id} • {app.date}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Access Panel */}
                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs font-display">System Administration</h4>
                  <button
                    onClick={() => setScreen("admin")}
                    className="w-full flex items-center justify-center gap-2 bg-[#0F5238] hover:bg-[#1B4332] text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                    <span>Access Admin Dashboard</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>

        {screen === "disease_detection" && (
          <CropDiseaseDetection translations={activeTranslations} lang={lang} />
        )}
        {screen === "mandi_prices" && (
          <LiveMandiPrices
            initialCommodity={mandiFilterCommodity}
            initialDistrict={mandiFilterDistrict}
            initialSearchQuery={mandiFilterSearchQuery}
          />
        )}
        {screen === "admin" && (
          <AdminDashboard onBack={() => setScreen("profile")} />
        )}
      </main>

      {/* ==================== FLOATING VOICE ASSISTANT WIDGET ==================== */}
      <VoiceAssistant
        onCommand={(text: string, voiceLang: VoiceLang) => {
          setTranscriptText(text);
          handleVoiceCommand(text, voiceLang);
        }}
        onLangChange={(newLang: VoiceLang) => setLang(newLang)}
        aiResponse={aiSpeechResponse}
        voiceStatus={voiceStatus}
        lang={lang}
      />

      {/* Legacy hidden voice panel placeholder — keep for state compatibility */}
      <div className="hidden">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 overflow-hidden text-left flex flex-col transition-all duration-300">
          
          {/* Panel Top Header Bar */}
          <div className="bg-gradient-to-r from-[#0F5238] to-[#1B4332] p-2.5 py-2 text-white flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base animate-bounce">graphic_eq</span>
              <span className="font-bold text-xs tracking-wide font-display">AI Voice Controller</span>
            </div>
            
            {/* Guide Help toggle */}
            <button 
              onClick={() => setShowVoiceGuide(!showVoiceGuide)}
              className="text-[9px] px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded-full font-bold border-none transition cursor-pointer"
            >
              {showVoiceGuide ? "Hide" : "Commands"}
            </button>
          </div>

          {/* Panel Body */}
          <div className="p-3 space-y-3">
            
            {/* Listening Glowing Wave & Microphone Toggle */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
              
              <div className="text-left flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                <p className={`text-[11px] font-bold leading-tight ${
                  voiceStatus === "listening" ? "text-emerald-600 animate-pulse" :
                  voiceStatus === "processing" ? "text-amber-600" : "text-slate-500"
                }`}>
                  {voiceStatus === "listening" ? activeTranslations.voiceStatusListening :
                   voiceStatus === "processing" ? activeTranslations.voiceStatusProcessing :
                   activeTranslations.voiceStatusIdle}
                </p>
              </div>

              {/* Floating Glowing Mic trigger */}
              <button 
                onClick={toggleMicrophone}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  voiceStatus === "listening" 
                    ? "bg-red-500 text-white animate-pulse ring-2 ring-red-100" 
                    : "bg-[#0F5238] hover:bg-emerald-800 text-white shadow-md active:scale-90"
                }`}
              >
                <span className="material-symbols-outlined !text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {voiceStatus === "listening" ? "mic_off" : "mic"}
                </span>
              </button>

            </div>

            {/* ERROR MIC / IFRAME MIC ACCESS ADVICE */}
            {micError && (
              <div className="p-2 bg-amber-50 text-amber-800 text-[9px] leading-relaxed rounded-lg border border-amber-200">
                <span className="font-bold block mb-0.5">Microphone Blocked!</span>
                {activeTranslations.voiceErrorMic}
              </div>
            )}

            {/* MANUAL TYPE INPUT (Redirection Fallback) */}
            <form onSubmit={submitTypedCommand} className="flex gap-1.5">
              <input 
                type="text"
                placeholder={activeTranslations.voiceSpeakPrompt}
                value={typedCommand}
                onChange={(e) => setTypedCommand(e.target.value)}
                className="flex-1 h-8 px-2.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <button 
                type="submit"
                className="h-8 px-2.5 bg-primary text-white hover:bg-emerald-800 text-[11px] font-bold rounded-lg transition shrink-0"
              >
                Send
              </button>
            </form>

            {/* MULTI-LANGUAGE VOICE COMMANDS CHEATSHEET / SHORTCUTS */}
            {showVoiceGuide && (
              <div className="pt-2 border-t border-slate-100 max-h-44 overflow-y-auto scrollbar-hide text-xs space-y-2">
                <p className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">{activeTranslations.voiceGuideTitle}</p>
                <div className="flex flex-wrap gap-1">
                  
                  {/* Predefined Clickable Command shortcuts */}
                  {[
                    { label: "Go to Schemes", cmd: "go to schemes" },
                    { label: "soil evaluation", cmd: "show land evaluation" },
                    { label: "Switch to Hindi", cmd: "switch language to Hindi" },
                    { label: "Marathi language", cmd: "switch to Marathi" },
                    { label: "Wheat crop plots", cmd: "set crop to wheat and show land" },
                    { label: "Name: Rajesh", cmd: "my name is Rajesh Patel" },
                    { label: "Apply scheme", cmd: "apply now kisan credit card" },
                    { label: "Submit application", cmd: "submit scheme application" }
                  ].map((guide, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTranscriptText(guide.cmd);
                        handleVoiceCommand(guide.cmd);
                      }}
                      className="px-2 py-1 bg-[#EEF4FD] hover:bg-slate-200 text-[#0F5238] rounded-md text-[10px] font-semibold border-none cursor-pointer transition select-none"
                    >
                      "{guide.label}"
                    </button>
                  ))}
                  
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ==================== BOTTOM TAB NAVIGATION BAR ==================== */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-black border-t border-[#E9ECEF] dark:border-zinc-800 h-16 flex items-center justify-around px-2 md:px-16 z-[75] shadow-lg">
        
        {/* Navigation Action Buttons */}
        <button 
          onClick={() => navigateTo("home")}
          className={`flex flex-col items-center justify-center flex-1 h-full max-w-[80px] transition-all relative ${
            screen === "home" ? "text-primary scale-105 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: screen === "home" ? "'FILL' 1" : "" }}>
            home
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">
            {activeTranslations.homeNav}
          </span>
          {screen === "home" && (
            <span className="absolute bottom-0 w-8 h-1 bg-[#0F5238] rounded-t-full"></span>
          )}
        </button>

        <button 
          onClick={() => navigateTo("schemes")}
          className={`flex flex-col items-center justify-center flex-1 h-full max-w-[80px] transition-all relative ${
            screen === "schemes" || screen === "apply_scheme" ? "text-primary scale-105 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: screen === "schemes" ? "'FILL' 1" : "" }}>
            description
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">
            {activeTranslations.schemesNav}
          </span>
          {(screen === "schemes" || screen === "apply_scheme") && (
            <span className="absolute bottom-0 w-8 h-1 bg-[#0F5238] rounded-t-full"></span>
          )}
        </button>

        <button 
          onClick={() => navigateTo("calculators")}
          className={`flex flex-col items-center justify-center flex-1 h-full max-w-[80px] transition-all relative ${
            screen === "calculators" ? "text-primary scale-105 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: screen === "calculators" ? "'FILL' 1" : "" }}>
            calculate
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">
            {activeTranslations.calculatorsNav || "Calculators"}
          </span>
          {screen === "calculators" && (
            <span className="absolute bottom-0 w-8 h-1 bg-[#0F5238] rounded-t-full"></span>
          )}
        </button>

        <button 
          onClick={() => navigateTo("community")}
          className={`flex flex-col items-center justify-center flex-1 h-full max-w-[80px] transition-all relative ${
            screen === "community" ? "text-primary scale-105 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: screen === "community" ? "'FILL' 1" : "" }}>
            groups
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">
            {activeTranslations.communityNav || "Community"}
          </span>
          {screen === "community" && (
            <span className="absolute bottom-0 w-8 h-1 bg-[#0F5238] rounded-t-full"></span>
          )}
        </button>

        <button 
          onClick={() => navigateTo("mandi_prices")}
          className={`flex flex-col items-center justify-center flex-1 h-full max-w-[80px] transition-all relative ${
            screen === "mandi_prices" ? "text-primary scale-105 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: screen === "mandi_prices" ? "'FILL' 1" : "" }}>
            storefront
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">
            {activeTranslations.mandiNav || "Mandi"}
          </span>
          {screen === "mandi_prices" && (
            <span className="absolute bottom-0 w-8 h-1 bg-[#0F5238] rounded-t-full"></span>
          )}
        </button>

        <button 
          onClick={() => navigateTo("disease_detection")}
          className={`flex flex-col items-center justify-center flex-1 h-full max-w-[80px] transition-all relative ${
            screen === "disease_detection" ? "text-primary scale-105 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: screen === "disease_detection" ? "'FILL' 1" : "" }}>
            pest_control
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">
            {activeTranslations.diseaseNav || "Disease"}
          </span>
          {screen === "disease_detection" && (
            <span className="absolute bottom-0 w-8 h-1 bg-[#0F5238] rounded-t-full"></span>
          )}
        </button>

        <button 
          onClick={() => navigateTo("profile")}
          className={`flex flex-col items-center justify-center flex-1 h-full max-w-[80px] transition-all relative ${
            screen === "profile" ? "text-primary scale-105 font-bold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: screen === "profile" ? "'FILL' 1" : "" }}>
            person
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">
            {activeTranslations.profileNav}
          </span>
          {screen === "profile" && (
            <span className="absolute bottom-0 w-8 h-1 bg-[#0F5238] rounded-t-full"></span>
          )}
        </button>

      </nav>

      <AIChatbot />

      {/* Scheme Detail Modal Popup */}
      {selectedDetailScheme && (
        <SchemeDetailModal
          scheme={selectedDetailScheme}
          lang={lang}
          onClose={() => setSelectedDetailScheme(null)}
          onApply={(sch) => {
            setSelectedDetailScheme(null);
            handleSchemeSelectAndApply(sch);
          }}
        />
      )}

      {/* External Redirect Warning Confirmation Dialog */}
      {redirectWarningScheme && (
        <ExternalRedirectWarning
          url={redirectWarningScheme.official_application_url!}
          schemeTitle={redirectWarningScheme.title}
          schemeTitleTa={redirectWarningScheme.name_ta}
          lang={lang}
          onConfirm={handleConfirmRedirect}
          onCancel={() => setRedirectWarningScheme(null)}
        />
      )}

    </div>
  );
}
