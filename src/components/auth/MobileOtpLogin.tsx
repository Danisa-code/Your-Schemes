import React, { useState, useEffect, useRef } from "react";
import { authService, formatIndianPhoneNumber, FarmerProfile } from "../../services/authService";
import { Phone, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, User, Globe, Check, Smartphone, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MobileOtpLoginProps {
  onLoginSuccess: (userProfile: FarmerProfile | null, isNewUser?: boolean) => void;
  onNavigateHome?: () => void;
  onNavigateToCompleteProfile?: (authUserId: string, phone: string) => void;
}

export const MobileOtpLogin: React.FC<MobileOtpLoginProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateToCompleteProfile,
}) => {
  // i18n language toggle: "ta" (Tamil) | "en" (English)
  const [lang, setLang] = useState<"ta" | "en">("ta");

  // Step state: 'input' | 'otp' | 'profile'
  const [step, setStep] = useState<"input" | "otp" | "profile">("input");

  // Phone state
  const [mobileNumber, setMobileNumber] = useState("");

  // 6-digit OTP input boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Authenticated user ID ref for complete profile phase
  const [authUserId, setAuthUserId] = useState<string>("");

  // Countdown & Resend timer state
  const [cooldownSeconds, setCooldownSeconds] = useState(45);
  const [canResend, setCanResend] = useState(false);

  // Profile completion fields
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("Coimbatore");
  const [taluk, setTaluk] = useState("");
  const [village, setVillage] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<
    "Tamil" | "English" | "Telugu" | "Kannada" | "Hindi"
  >("Tamil");

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // WebOTP AbortController ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // Dictionary for farmer-friendly messages
  const dictionary = {
    ta: {
      title: "யுவர் ஸ்கீம்ஸ் (Your Schemes)",
      subtitle: "விவசாயிகள் உதவி & நில தகவல் போர்ட்டல்",
      enterMobile: "உங்கள் கைபேசி எண்ணை உள்ளிடவும்",
      enterMobileDesc: "சரிபார்ப்பு OTP-ஐப் பெற உங்கள் 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்",
      mobileLabel: "கைபேசி எண்",
      sendOtpBtn: "OTP அனுப்பவும்",
      enterOtp: "OTP-ஐ உள்ளிடவும்",
      enterOtpDesc: "உங்கள் கைபேசி எண்ணிற்கு அனுப்பப்பட்ட 6 இலக்க OTP-ஐ உள்ளிடவும்",
      sentTo: "அனுப்பப்பட்ட எண்",
      verifyOtpBtn: "சரிபார்க்கவும்",
      verifying: "OTP சரிபார்க்கப்படுகிறது...",
      resendCooldown: "விநாடிகளில் மீண்டும் OTP அனுப்பப்படும்",
      resendBtn: "மீண்டும் OTP பெறவும்",
      changeNumberBtn: "கைபேசி எண் மாற்றவும்",
      registerTitle: "விவசாயி சுயவிவரப் பதிவு",
      registerSubtitle: "உங்கள் விவரங்களை பூர்த்தி செய்யவும்",
      nameLabel: "விவசாயி பெயர் *",
      districtLabel: "மாவட்டம் *",
      talukLabel: "வட்டம் *",
      villageLabel: "கிராமம் *",
      languageLabel: "விருப்பமான மொழி *",
      completeProfileBtn: "சுயவிவரத்தை சேமி",
      invalidMobileError: "செல்லுபடியாகும் 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்.",
      sendOtpError: "OTP அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
      wrongOtpError: "OTP தவறாக உள்ளது.",
      expiredOtpError: "OTP காலாவதியாகிவிட்டது.",
      otpRequiredError: "6 இலக்க OTP குறியீட்டை உள்ளிடவும்.",
      otpSentSuccess: "உங்கள் கைபேசி எண்ணிற்கு OTP அனுப்பப்பட்டுள்ளது",
      autofilledSuccess: "OTP தானாக நிரப்பப்பட்டது.",
      testNumberHint: "சோதனை எண்: +91 99999 99999 (OTP: 123456)",
    },
    en: {
      title: "Your Schemes",
      subtitle: "Farmer Assistance & Land Portal",
      enterMobile: "Enter your mobile number",
      enterMobileDesc: "Enter your 10-digit mobile number to receive verification OTP",
      mobileLabel: "Mobile Number",
      sendOtpBtn: "Send OTP",
      enterOtp: "Enter OTP",
      enterOtpDesc: "Enter the 6-digit OTP sent to your mobile number",
      sentTo: "Sent to",
      verifyOtpBtn: "Verify OTP",
      verifying: "Verifying OTP...",
      resendCooldown: "Resend OTP in seconds",
      resendBtn: "Resend OTP",
      changeNumberBtn: "Change Mobile Number",
      registerTitle: "Farmer Registration",
      registerSubtitle: "Please fill out your profile details",
      nameLabel: "Farmer Name *",
      districtLabel: "District *",
      talukLabel: "Taluk *",
      villageLabel: "Village *",
      languageLabel: "Preferred Language *",
      completeProfileBtn: "Save Profile",
      invalidMobileError: "Please enter a valid 10-digit mobile number.",
      sendOtpError: "Could not send OTP. Please try again.",
      wrongOtpError: "Incorrect OTP.",
      expiredOtpError: "OTP has expired.",
      otpRequiredError: "Enter complete 6-digit OTP.",
      otpSentSuccess: "OTP has been sent to your mobile number.",
      autofilledSuccess: "OTP automatically filled.",
      testNumberHint: "Test Number: +91 99999 99999 (OTP: 123456)",
    },
  };

  const activeDict = dictionary[lang];

  // Focus box 0 on step 'otp'
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && cooldownSeconds > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldownSeconds]);

  // WebOTP API Detection
  useEffect(() => {
    if (step === "otp" && "OTPCredential" in window) {
      const ac = new AbortController();
      abortControllerRef.current = ac;

      (navigator.credentials as any)
        .get({
          otp: { transport: ["sms"] },
          signal: ac.signal,
        })
        .then((otp: any) => {
          if (otp && otp.code) {
            const digits = otp.code.split("").slice(0, 6);
            setOtpDigits(digits);
            setSuccessMessage(activeDict.autofilledSuccess);
            autoSubmitOtp(digits.join(""));
          }
        })
        .catch((err: any) => {
          console.log("WebOTP auto-detection skipped or unsupported:", err?.message || err);
        });

      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }
  }, [step]);

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formatted = formatIndianPhoneNumber(mobileNumber);
    const cleanedDigits = mobileNumber.replace(/\D/g, "");

    if (cleanedDigits.length < 10) {
      setErrorMessage(activeDict.invalidMobileError);
      return;
    }

    setLoading(true);
    try {
      const { error } = await authService.sendPhoneOtp(formatted);
      if (error) {
        setErrorMessage(activeDict.sendOtpError);
      } else {
        setStep("otp");
        setCooldownSeconds(45);
        setCanResend(false);
        setSuccessMessage(activeDict.otpSentSuccess);
      }
    } catch (err: any) {
      setErrorMessage(activeDict.sendOtpError);
    } finally {
      setLoading(false);
    }
  };

  // Handle 6-digit OTP Box Input
  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance to next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
      autoSubmitOtp(pasted);
    }
  };

  // Verify OTP handler
  const autoSubmitOtp = async (code: string) => {
    const formatted = formatIndianPhoneNumber(mobileNumber);
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await authService.verifyPhoneOtp(formatted, code);

      if (error || !data?.session) {
        setOtpDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        if (error?.message?.toLowerCase().includes("expired")) {
          setErrorMessage(activeDict.expiredOtpError);
        } else {
          setErrorMessage(activeDict.wrongOtpError);
        }
        return;
      }

      const user = data.session.user;
      setAuthUserId(user.id);

      // Check if farmer profile exists in Supabase DB
      const profile = await authService.getFarmerProfile(user.id);
      if (profile && profile.name) {
        // Profile exists -> navigate directly to Farmer Dashboard
        onLoginSuccess(profile, false);
      } else {
        // No profile -> route to complete profile
        if (onNavigateToCompleteProfile) {
          onNavigateToCompleteProfile(user.id, formatted);
        } else {
          setStep("profile");
        }
      }
    } catch (err: any) {
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setErrorMessage(activeDict.wrongOtpError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage(activeDict.otpRequiredError);
      return;
    }

    await autoSubmitOtp(fullOtp);
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    const formatted = formatIndianPhoneNumber(mobileNumber);

    setLoading(true);
    try {
      const { error } = await authService.sendPhoneOtp(formatted);
      if (error) {
        setErrorMessage(activeDict.sendOtpError);
      } else {
        setCooldownSeconds(45);
        setCanResend(false);
        setOtpDigits(["", "", "", "", "", ""]);
        setSuccessMessage(activeDict.otpSentSuccess);
        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      }
    } catch (err: any) {
      setErrorMessage(activeDict.sendOtpError);
    } finally {
      setLoading(false);
    }
  };

  // Save Farmer Profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(lang === "ta" ? "உங்கள் பெயரை உள்ளிடவும்." : "Please enter your name.");
      return;
    }
    if (!district.trim()) {
      setErrorMessage(lang === "ta" ? "மாவட்டத்தை உள்ளிடவும்." : "Please select a district.");
      return;
    }
    if (!taluk.trim()) {
      setErrorMessage(lang === "ta" ? "வட்டத்தை உள்ளிடவும்." : "Please enter a taluk.");
      return;
    }
    if (!village.trim()) {
      setErrorMessage(lang === "ta" ? "கிராமத்தை உள்ளிடவும்." : "Please enter a village.");
      return;
    }

    setLoading(true);
    try {
      const formatted = formatIndianPhoneNumber(mobileNumber);
      const { data, error } = await authService.saveFarmerProfile({
        auth_user_id: authUserId,
        name: name.trim(),
        phone: formatted,
        district: district.trim(),
        taluk: taluk.trim(),
        village: village.trim(),
        preferred_language: preferredLanguage,
      });

      if (error) {
        throw new Error(error.message);
      }

      onLoginSuccess(data, true);
    } catch (err: any) {
      setErrorMessage(err.message || (lang === "ta" ? "சுயவிவரத்தை சேமிக்க முடியவில்லை." : "Could not save profile."));
    } finally {
      setLoading(false);
    }
  };

  // Use test phone number helper
  const useTestNumber = () => {
    setMobileNumber("9999999999");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header & Language Toggle */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-center relative">
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-950/40 border border-white/10 rounded-full p-0.5">
            <button
              onClick={() => setLang("ta")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                lang === "ta" ? "bg-emerald-500 text-white shadow-sm" : "text-emerald-300 hover:text-white"
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                lang === "en" ? "bg-emerald-500 text-white shadow-sm" : "text-emerald-300 hover:text-white"
              }`}
            >
              English
            </button>
          </div>

          <div className="w-16 h-16 mx-auto mb-3 bg-slate-950/40 rounded-full flex items-center justify-center border border-emerald-400/30 shadow-inner">
            <Smartphone className="w-9 h-9 text-emerald-300 animate-pulse" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide leading-snug">
            {activeDict.title}
          </h1>
          <p className="text-emerald-200/80 text-[10px] mt-1 font-medium tracking-wider uppercase">
            {activeDict.subtitle}
          </p>
        </div>

        <div className="p-6 md:p-8">
          {/* Notification Alerts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-rose-950/80 border border-rose-600/50 rounded-2xl text-rose-200 text-xs md:text-sm flex items-start gap-3 shadow-lg"
              >
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </motion.div>
            )}

            {successMessage && !errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-emerald-950/80 border border-emerald-600/50 rounded-2xl text-emerald-200 text-xs md:text-sm flex items-center gap-3 shadow-lg"
              >
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="flex-1">{successMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: MOBILE NUMBER INPUT */}
          {step === "input" && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">{activeDict.enterMobile}</h2>
                <p className="text-slate-400 text-xs leading-relaxed">{activeDict.enterMobileDesc}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {activeDict.mobileLabel}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-400 text-sm flex items-center gap-1.5 border-r border-slate-700 pr-3">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10 digit mobile number"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-24 pr-4 py-3.5 text-base font-medium text-white tracking-wider placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition shadow-inner"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Dev Test Number Badge */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeDict.testNumberHint}
                </span>
                <button
                  type="button"
                  onClick={useTestNumber}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg font-semibold transition cursor-pointer"
                >
                  Use Test
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{activeDict.sendOtpBtn}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-DIGIT OTP INPUT */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">{activeDict.enterOtp}</h2>
                <p className="text-slate-400 text-xs">
                  {activeDict.enterOtpDesc}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-700/50 rounded-full text-xs font-semibold text-emerald-300">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{formatIndianPhoneNumber(mobileNumber)}</span>
                </div>
              </div>

              {/* 6 OTP Input Boxes */}
              <div className="flex justify-between gap-2 my-4">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-11 h-13 md:w-12 md:h-14 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>{activeDict.verifyOtpBtn}</span>
                  </>
                )}
              </button>

              {/* Countdown & Resend Section */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("input");
                    setOtpDigits(["", "", "", "", "", ""]);
                    setErrorMessage(null);
                  }}
                  className="text-slate-400 hover:text-slate-200 transition font-medium cursor-pointer"
                >
                  {activeDict.changeNumberBtn}
                </button>

                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{activeDict.resendBtn}</span>
                  </button>
                ) : (
                  <span className="text-slate-500 font-medium">
                    {cooldownSeconds}s {activeDict.resendCooldown}
                  </span>
                )}
              </div>
            </form>
          )}

          {/* STEP 3: COMPLETE PROFILE IN-COMPONENT */}
          {step === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">{activeDict.registerTitle}</h2>
                <p className="text-slate-400 text-xs">{activeDict.registerSubtitle}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {activeDict.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Murugan"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {activeDict.districtLabel}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {activeDict.talukLabel}
                  </label>
                  <input
                    type="text"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    placeholder="Pollachi"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {activeDict.villageLabel}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Sulur"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {activeDict.languageLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Tamil", "English", "Telugu", "Kannada", "Hindi"] as const).map((l) => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setPreferredLanguage(l)}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold border transition ${
                        preferredLanguage === l
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      {l === "Tamil" ? "தமிழ்" : l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{activeDict.completeProfileBtn}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
