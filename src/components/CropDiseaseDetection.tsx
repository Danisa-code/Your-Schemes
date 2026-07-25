import React, { useState, useRef, useEffect, useCallback } from "react";
import { DiseaseReport, TranslationSet } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CropDiseaseDetectionProps {
  translations: TranslationSet;
  lang?: string;
}

// Enhanced DiseaseReport with full fields
interface FullDiseaseReport extends DiseaseReport {
  confidence: number;
  cause: string;
  organicTreatment: string[];
  chemicalTreatment: string[];
  isTamilNadu?: boolean;
}

// Comprehensive disease database
const DISEASE_DATABASE: FullDiseaseReport[] = [
  {
    crop: "Tomato",
    disease: "Early Blight",
    confidence: 92,
    description: "A common fungal disease caused by Alternaria solani. It creates brown circular spots with concentric rings on older leaves first.",
    cause: "Fungus Alternaria solani; favoured by warm temperatures (24–29°C), high humidity, and wet leaf surfaces.",
    symptoms: [
      "Dark brown circular spots with concentric rings (target pattern)",
      "Yellowing around the spots (chlorosis)",
      "Spots first appear on older/lower leaves",
      "Premature leaf drop reducing yield",
    ],
    organicTreatment: [
      "Spray 5% Neem Seed Kernel Extract (NSKE) at 10-day intervals",
      "Apply Trichoderma viride @ 4g/liter as soil drench",
      "Bordeaux mixture (1%) foliar spray every 10 days",
      "Remove and burn infected leaves immediately",
    ],
    chemicalTreatment: [
      "Mancozeb 75% WP @ 2g/liter water, spray every 7 days",
      "Azoxystrobin 23% SC @ 1 ml/liter, apply when symptoms first appear",
      "Chlorothalonil 75% WP @ 2g/liter as preventive spray",
    ],
    treatment: [
      "Remove infected leaves and burn them",
      "Apply Mancozeb 75% WP @ 2g/liter",
      "Spray Trichoderma viride as soil drench",
    ],
    prevention: [
      "Use certified disease-free seeds",
      "Avoid overhead/sprinkler irrigation — use drip irrigation",
      "Maintain wide plant spacing for air circulation",
      "Practice 3-year crop rotation",
      "Apply mulch to prevent soil splash onto leaves",
    ],
  },
  {
    crop: "Rice (Paddy)",
    disease: "Blast Disease",
    confidence: 88,
    description: "A devastating fungal disease caused by Magnaporthe oryzae that can destroy entire rice fields. Known locally as 'படை நோய்' in Tamil Nadu.",
    cause: "Fungus Magnaporthe oryzae; spreads through infected seeds, wind-blown spores; thrives in high humidity and temperature fluctuations.",
    symptoms: [
      "Diamond/eye-shaped lesions with grey-white centres and dark borders on leaves",
      "Node blast — dark brown to black lesions at nodes causing stalk breakage",
      "Neck blast — rotting at panicle neck causing 'white ear' or empty grains",
      "Spindle-shaped spots on leaf sheaths",
    ],
    organicTreatment: [
      "Seed treatment with Pseudomonas fluorescens @ 10g/kg seed",
      "Spray Trichoderma asperellum @ 5g/liter at 30 and 45 days",
      "Use silicon-rich organic fertiliser (silica gel) to strengthen cell walls",
      "Apply fermented cowdung liquid (panchagavya) spray",
    ],
    chemicalTreatment: [
      "Tricyclazole 75% WP @ 0.6g/liter — most effective systemic fungicide",
      "Isoprothiolane 40% EC @ 1.5 ml/liter spray when symptoms appear",
      "Carbendazim 50% WP @ 1g/liter for leaf blast",
    ],
    treatment: [
      "Apply Tricyclazole 75% WP @ 0.6g/liter",
      "Spray Pseudomonas fluorescens solution",
      "Remove severely infected plants",
    ],
    prevention: [
      "Use resistant varieties: ADT 43, TRY 3, CO 51 (popular in Tamil Nadu)",
      "Balanced nitrogen application — avoid excess nitrogen",
      "Drain and dry fields periodically",
      "Treat seeds with Tricyclazole before sowing",
    ],
  },
  {
    crop: "Sugarcane",
    disease: "Red Rot",
    confidence: 85,
    description: "One of the most destructive diseases of sugarcane in Tamil Nadu, caused by Colletotrichum falcatum. Critical fields in Thanjavur and Vellore districts are frequently affected.",
    cause: "Fungus Colletotrichum falcatum; enters through cracks, wounds, and insect damage; spreads via infected setts and waterlogged soils.",
    symptoms: [
      "Reddish internal discolouration of the stalk when split open",
      "White patches alternating with red areas inside the stalk",
      "Sour alcoholic smell when infected stalk is cut",
      "Drying of top leaves with yellowing from base",
      "Wilting and death of entire clumps",
    ],
    organicTreatment: [
      "Immediately uproot and burn all infected stalks — no organic cure once infected",
      "Treat seed setts with Trichoderma viride @ 4g/liter for 30 minutes",
      "Apply neem cake @ 250 kg/ha as soil amendment to suppress pathogen",
    ],
    chemicalTreatment: [
      "Seed sett treatment: soak in Carbendazim 50% WP @ 1g/liter for 30 minutes",
      "Soil application of Captan 50% WP @ 2.5g/liter around root zone",
      "Propiconazole 25% EC @ 0.1% spray on affected clumps",
    ],
    treatment: [
      "Uproot and burn infected clumps immediately",
      "Treat seed setts with Carbendazim before next planting",
      "Drain waterlogged fields",
    ],
    prevention: [
      "Use disease-free certified setts from cooperative nurseries",
      "Avoid waterlogging — ensure field drainage",
      "Practice 3-year crop rotation",
      "Use resistant varieties: Co 86032, Co 94012",
    ],
  },
  {
    crop: "Banana",
    disease: "Panama Wilt (Fusarium Wilt)",
    confidence: 90,
    description: "A soil-borne fungal disease common in Tamil Nadu banana plantations, especially in Theni and Dindigul districts. Called 'பனாமா நோய்' locally. Can devastate entire plantations.",
    cause: "Soil-borne fungus Fusarium oxysporum f.sp. cubense persists in soil for decades; enters through roots, especially when waterlogged.",
    symptoms: [
      "Yellowing of lower leaves starting from leaf margins",
      "Leaves wilt, collapse and hang down around the pseudostem",
      "Brown-red internal discolouration of pseudostem when cut",
      "Sudden toppling of the entire plant",
      "No viable bunch production",
    ],
    organicTreatment: [
      "Soil application of Trichoderma harzianum @ 25g/plant at planting",
      "Drench soil with Pseudomonas fluorescens @ 10g/liter (1 liter per plant)",
      "Apply neem cake @ 2 kg/plant",
      "Grow resistant cover crops like marigold as intercrop",
    ],
    chemicalTreatment: [
      "Carbendazim 50% WP @ 2g/liter — soil drench 2 liters per plant",
      "Propiconazole 25% EC @ 2ml/liter as prophylactic drench",
      "No curative chemical treatment once infected — remove and burn the plant",
    ],
    treatment: [
      "Remove and burn infected plants",
      "Soil drench with Carbendazim 50% WP @ 2g/liter",
      "Trichoderma harzianum application to neighbouring plants",
    ],
    prevention: [
      "Use tissue culture (TC) banana plants certified disease-free",
      "Avoid introducing soil from infected fields",
      "Maintain field drainage — avoid waterlogging",
      "Use resistant varieties: Grand Naine TC",
    ],
  },
  {
    crop: "Chilli",
    disease: "Anthracnose / Fruit Rot",
    confidence: 87,
    description: "A destructive post-harvest and field disease affecting chilli fruits. Common during Kharif season in Salem and Namakkal districts of Tamil Nadu.",
    cause: "Fungus Colletotrichum capsici; warm humid conditions (>90% humidity) and rain during fruiting stage trigger outbreaks.",
    symptoms: [
      "Circular, sunken water-soaked spots on fruits",
      "Spots enlarge and turn dark brown/black with orange-pink spore masses",
      "Infected fruits shrivel and mummify",
      "Leaf spots with concentric rings",
    ],
    organicTreatment: [
      "Spray Bordeaux mixture (1%) every 10–14 days during fruiting",
      "Apply neem oil @ 5ml/liter with emulsifier",
      "Trichoderma viride @ 4g/liter drench",
    ],
    chemicalTreatment: [
      "Mancozeb 75% WP @ 2g/liter — preventive spray at 10-day intervals",
      "Carbendazim 50% WP @ 1g/liter at fruit development stage",
      "Hexaconazole 5% EC @ 2ml/liter when disease appears",
    ],
    treatment: [
      "Spray Mancozeb 75% WP @ 2g/liter",
      "Remove infected fruits immediately",
      "Improve field drainage",
    ],
    prevention: [
      "Use resistant varieties: K1, K2, CO5",
      "Avoid high nitrogen — use balanced fertilisation",
      "Avoid overhead irrigation during fruiting",
      "Practice 2-year crop rotation",
    ],
  },
];

// Tamil labels
const TAMIL_LABELS: Record<string, string> = {
  confidence: "நம்பகத்தன்மை",
  cause: "காரணம்",
  symptoms: "அறிகுறிகள்",
  organicTreatment: "இயற்கை சிகிச்சை",
  chemicalTreatment: "வேதியியல் சிகிச்சை",
  prevention: "தடுப்பு நடவடிக்கைகள்",
  description: "விவரம்",
  scanAnother: "மற்றொரு படம் ஸ்கேன் செய்",
  lowConfidence: "தெளிவான படம் இல்லை. மேலும் தெளிவான படத்தை பதிவேற்றவும்.",
  analyzeBtn: "நோயை கண்டறி",
  analyzing: "பகுப்பாய்வு செய்கிறது...",
};

function compressImage(dataUrl: string, maxWidth = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const CONFIDENCE_THRESHOLD = 70;

export const CropDiseaseDetection: React.FC<CropDiseaseDetectionProps> = ({ translations, lang = "en" }) => {
  const isTamil = lang === "ta";
  const [image, setImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<FullDiseaseReport | null>(null);
  const [activeTab, setActiveTab] = useState<"organic" | "chemical" | "prevention">("organic");
  const [lowConfidence, setLowConfidence] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const openCamera = async () => {
    setCameraError(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError(
          isTamil
            ? "கேமரா அணுகல் மறுக்கப்பட்டது. உலாவி அமைப்புகளில் கேமரா அணுகலை இயக்கவும்: Settings → Privacy → Camera → Allow."
            : "Camera access denied. To enable: Browser Settings → Privacy → Camera → Allow this site."
        );
      } else {
        setCameraError(
          isTamil
            ? "கேமரா கிடைக்கவில்லை. பதிவேற்றும் விருப்பத்தைப் பயன்படுத்தவும்."
            : "Camera unavailable. Please use the upload option instead."
        );
      }
    }
  };

  const captureImage = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const compressed = await compressImage(dataUrl);
        setImage(compressed);
        stopCamera();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setLowConfidence(false);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError(
        isTamil
          ? "தவறான வடிவம். JPG, JPEG அல்லது PNG மட்டுமே ஏற்றுக்கொள்ளப்படும்."
          : "Invalid format. Only JPG, JPEG, and PNG are accepted."
      );
      return;
    }

    // Validate size (<15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError(
        isTamil
          ? "கோப்பு மிகவும் பெரியது. அதிகபட்சம் 15MB."
          : "File is too large. Maximum size is 15MB."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;

      // Validate resolution
      const img = new Image();
      img.onload = async () => {
        if (img.naturalWidth < 200 || img.naturalHeight < 200) {
          setError(
            isTamil
              ? "படத்தின் தெளிவு மிகவும் குறைவாக உள்ளது. குறைந்தது 200x200 pixels தேவை."
              : "Image resolution too low. Minimum 200×200 pixels required."
          );
          return;
        }
        // Compress if large
        const compressed = img.naturalWidth > 1024 ? await compressImage(dataUrl) : dataUrl;
        setImage(compressed);
      };
      img.onerror = () => setError(isTamil ? "படத்தை செயலாக்க முடியவில்லை." : "Failed to process the image.");
      img.src = dataUrl;
    };
    reader.onerror = () => setError(isTamil ? "கோப்பை படிக்க முடியவில்லை." : "Failed to read the file.");
    reader.readAsDataURL(file);
  };

  const analyzeImage = () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);
    setLowConfidence(false);

    // Simulate AI analysis with random result from database
    setTimeout(() => {
      setIsAnalyzing(false);
      const randomReport = DISEASE_DATABASE[Math.floor(Math.random() * DISEASE_DATABASE.length)];

      if (randomReport.confidence < CONFIDENCE_THRESHOLD) {
        setLowConfidence(true);
        setReport(null);
      } else {
        setReport(randomReport);
        setActiveTab("organic");
      }
    }, 2800);
  };

  const reset = () => {
    setImage(null);
    setReport(null);
    setError(null);
    setCameraError(null);
    setLowConfidence(false);
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const t = (en: string, ta: string) => (isTamil ? ta : en);

  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30";
    if (conf >= 75) return "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30";
    return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30";
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1f2e] rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <span className="material-symbols-outlined text-2xl">pest_control</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {t("Crop Disease Detection", "பயிர் நோய் கண்டறிதல்")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t(
                "Upload a photo of your crop to identify diseases, causes, and treatments.",
                "உங்கள் பயிரின் புகைப்படத்தை பதிவேற்றி நோய்கள், காரணங்கள் மற்றும் சிகிச்சைகளை அறியவும்."
              )}
            </p>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-start gap-3"
            >
              <span className="material-symbols-outlined shrink-0">error</span>
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Low Confidence */}
        <AnimatePresence>
          {lowConfidence && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 flex flex-col items-center gap-3 text-center"
            >
              <span className="material-symbols-outlined text-4xl text-amber-500">help_outline</span>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {t(
                  "Unable to identify confidently. Please upload a clearer, well-lit image of the affected leaf or fruit.",
                  "தெளிவாக அடையாளம் காண முடியவில்லை. பாதிக்கப்பட்ட இலை அல்லது கனியின் தெளிவான, நல்ல வெளிச்சத்தில் எடுக்கப்பட்ட படத்தை பதிவேற்றவும்."
                )}
              </p>
              <button
                onClick={reset}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition"
              >
                {t("Try Again", "மீண்டும் முயற்சி")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Report */}
        {report ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Image + Header */}
            <div className="relative h-52 w-full rounded-2xl overflow-hidden shadow-inner">
              <img src={image!} alt="Analyzed crop" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{report.crop}</p>
                    <h3 className="text-white text-xl font-bold">{report.disease}</h3>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ${getConfidenceColor(report.confidence)}`}>
                    {report.confidence}% {t("Match", "பொருத்தம்")}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-slate-500">info</span>
                {t("Description", isTamil ? TAMIL_LABELS.description : "Description")}
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{report.description}</p>
            </div>

            {/* Cause */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-800/30">
              <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">coronavirus</span>
                {t("Cause", "காரணம்")}
              </h4>
              <p className="text-red-800/80 dark:text-red-200/80 text-sm leading-relaxed">{report.cause}</p>
            </div>

            {/* Symptoms */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800/30">
              <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                {t("Symptoms", "அறிகுறிகள்")}
              </h4>
              <ul className="space-y-1.5">
                {report.symptoms.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-800/80 dark:text-orange-200/80">
                    <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">circle</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatment Tabs */}
            <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
              <div className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                {(["organic", "chemical", "prevention"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-bold transition flex items-center justify-center gap-1 ${
                      activeTab === tab
                        ? "bg-teal-600 text-white"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {tab === "organic" ? "eco" : tab === "chemical" ? "science" : "security"}
                    </span>
                    <span className="hidden sm:inline">
                      {tab === "organic"
                        ? t("Organic", "இயற்கை")
                        : tab === "chemical"
                        ? t("Chemical", "வேதியியல்")
                        : t("Prevention", "தடுப்பு")}
                    </span>
                  </button>
                ))}
              </div>
              <div className="p-4 bg-white dark:bg-[#1a1f2e]">
                <AnimatePresence mode="wait">
                  <motion.ul
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {(activeTab === "organic"
                      ? report.organicTreatment
                      : activeTab === "chemical"
                      ? report.chemicalTreatment
                      : report.prevention
                    ).map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                        <span className="material-symbols-outlined text-teal-500 text-sm mt-0.5 shrink-0">check_circle</span>
                        {item}
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-sm">info</span>
              {t(
                "For severe infections, consult your local Agricultural Officer (AO) or Krishi Vigyan Kendra.",
                "கடுமையான தொற்றுகளுக்கு, உங்கள் உள்ளூர் வேளாண்மை அதிகாரியை (AO) அல்லது கிருஷி விஞ்ஞான கேந்திரத்தை அணுகவும்."
              )}
            </p>

            <button
              onClick={reset}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              {t("Scan Another Image", "மற்றொரு படம் ஸ்கேன் செய்")}
            </button>
          </motion.div>
        ) : isCameraOpen ? (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] sm:aspect-video shadow-inner">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline />
              <div className="absolute inset-x-0 bottom-0 p-6 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
                <button
                  onClick={captureImage}
                  className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-black text-3xl">photo_camera</span>
                </button>
              </div>
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-center text-sm text-slate-500 font-medium">
              {t("Position the affected plant part clearly in the frame.", "பாதிக்கப்பட்ட பயிர் பகுதியை தெளிவாக நிலைப்படுத்தவும்.")}
            </p>
          </div>
        ) : image ? (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <img src={image} alt="Preview" className="w-full aspect-[4/3] object-cover" />
              <button
                onClick={reset}
                className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur text-slate-700 dark:text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                {t("Remove", "நீக்கு")}
              </button>
            </div>

            <button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 ${
                isAnalyzing
                  ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 text-white active:scale-[0.98]"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  {t("Analyzing image...", "பகுப்பாய்வு செய்கிறது...")}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">troubleshoot</span>
                  {t("Detect Disease", "நோயை கண்டறி")}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tips */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">tips_and_updates</span>
                {t("Image Quality Tips", "படத்தின் தரம் குறிப்புகள்")}
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-teal-500">check_circle</span>
                  {t("Capture the affected leaf, fruit, or stem clearly.", "பாதிக்கப்பட்ட இலை, கனி அல்லது தண்டை தெளிவாக படம் எடுக்கவும்.")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-teal-500">check_circle</span>
                  {t("Use natural light. Avoid blurry or dark images.", "இயற்கை வெளிச்சம் பயன்படுத்தவும். மங்கலான அல்லது இருண்ட படங்களை தவிர்க்கவும்.")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-teal-500">check_circle</span>
                  {t("JPG, JPEG, PNG formats accepted.", "JPG, JPEG, PNG வடிவங்கள் ஏற்றுக்கொள்ளப்படும்.")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-base text-teal-500">check_circle</span>
                  {t("Maximum file size: 15MB.", "அதிகபட்ச கோப்பு அளவு: 15MB.")}
                </li>
              </ul>
            </div>

            {cameraError && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 flex items-start gap-3 border border-amber-100 dark:border-amber-800/30">
                <span className="material-symbols-outlined shrink-0">warning</span>
                <p className="text-sm font-medium">{cameraError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={openCamera}
                className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-teal-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 rounded-2xl border-2 border-transparent hover:border-teal-100 dark:hover:border-slate-600 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-slate-700 dark:text-slate-300">photo_camera</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  {t("Open Camera", "கேமரா திற")}
                </span>
              </button>

              <label className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-teal-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 rounded-2xl border-2 border-transparent hover:border-teal-100 dark:hover:border-slate-600 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-slate-700 dark:text-slate-300">upload_file</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  {t("Upload Image", "படம் பதிவேற்று")}
                </span>
              </label>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-sm">lock</span>
              {t(
                "Your image is used only for disease analysis and is not stored.",
                "உங்கள் படம் நோய் பகுப்பாய்வுக்கு மட்டுமே பயன்படுத்தப்படுகிறது."
              )}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
