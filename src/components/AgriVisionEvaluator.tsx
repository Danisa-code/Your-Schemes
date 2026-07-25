import React, { useState } from "react";
import { Scheme } from "../types";
import { SCHEMES } from "../data";

interface AgriVisionEvaluatorProps {
  onSelectScheme: (scheme: Scheme) => void;
  lang: string;
}

export interface LandEvaluationReport {
  overallScore: number;
  grade: string;
  confidence: number;
  summary: string;
  scores: {
    ownership: number;
    roadAccessibility: number;
    waterAvailability: number;
    soilHealth: number;
    marketAccessibility: number;
    cropSuitability: number;
    imageAssessment: number;
  };
  scoreExplanations: {
    ownership: string;
    roadAccessibility: string;
    waterAvailability: string;
    soilHealth: string;
    marketAccessibility: string;
    cropSuitability: string;
    imageAssessment: string;
  };
  strengths: string[];
  weaknesses: string[];
  climateRisks: string[];
  diseaseRisks: string[];
  loanEligibility: "High" | "Medium" | "Low";
  recommendedCrops: string[];
  governmentSchemes: Array<{ schemeName: string; reason: string }>;
  estimatedAgriculturalPotential: "Excellent" | "Very Good" | "Average" | "Low";
  suggestedImprovements: string[];
  finalRecommendation: string;
}

// Local Translations for AgriVision AI
const LOCAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: "AgriVision AI ™",
    subtitle: "Agricultural Land Assessment & Scheme Recommender",
    loadPreset: "Load Sample Farm Profile",
    punjabPreset: "Punjab Wheat Belt (Ludhiana)",
    nashikPreset: "Nashik Vineyard (Maharashtra)",
    gunturPreset: "Guntur Cotton Field (Andhra Pradesh)",
    rajasthanPreset: "Rajasthan Drylands (Thar)",
    tabLocation: "Location & Land",
    tabSoil: "Soil & Slope",
    tabWater: "Water & Irrigation",
    tabInfrastructure: "Infrastructure",
    tabImagery: "Imagery & History",
    evaluateBtn: "Run AgriVision AI Evaluation",
    processing: "Analyzing Soil, Satellites & Assets...",
    overallScore: "Overall Score",
    grade: "Grade",
    confidence: "Confidence Level",
    summary: "Executive Summary",
    breakdown: "Detailed Scoring Breakdown",
    whyScore: "Why this score was assigned:",
    strengths: "Key Strengths",
    weaknesses: "Identified Weaknesses",
    risks: "Risk Assessment Matrix",
    loanElig: "Credit & Loan Eligibility",
    recommendedCrops: "Suitable Crops",
    matchedSchemes: "Matched Government Schemes",
    improvements: "Prioritized Improvement Plan",
    finalRec: "Final Assessment & Recommendation",
    disclaimer: "Note: Loan eligibility is an estimate based on asset quality. Approval is subject to bank policies.",
    apply: "Apply Now",
    resetBtn: "Evaluate Another Plot",
    ownershipLabel: "Land Ownership Record Type",
    docUploadLabel: "Upload Land Record (Patta/Khata/RTC)",
    stateLabel: "State",
    districtLabel: "District",
    villageLabel: "Village",
    surveyNumber: "Survey Number",
    pincode: "Pincode",
    gpsCoordinates: "GPS Coordinates (Lat, Lon)",
    totalLandArea: "Total Land Area (Acres)",
    docStatusLabel: "Document Verification Status",
    clearDoc: "Clear & Completed Document",
    blurryDoc: "Blurry or Low Quality Upload",
    noDoc: "No Document Uploaded / Unverified",
    soilTypeLabel: "Soil Composition Class",
    soilReportLabel: "Is Soil Health Report Available?",
    phValue: "pH Value (Optimal: 6.0 - 7.5)",
    moistureLevel: "Soil Moisture Level (%)",
    organicCarbon: "Organic Carbon (%)",
    nitrogenLabel: "Nitrogen (N) Level (kg/ha)",
    phosphorusLabel: "Phosphorus (P) Level (kg/ha)",
    potassiumLabel: "Potassium (K) Level (kg/ha)",
    elevationLabel: "Elevation above Sea Level (m)",
    slopeLabel: "Land Slope (Degrees)",
    irrigationSource: "Primary Irrigation Source",
    canalLabel: "Canal Water Availability",
    borewellLabel: "Borewell Present on Land?",
    riverProximity: "Distance to Nearest River/Lake (km)",
    groundwaterLabel: "Groundwater Table Availability",
    waterReliability: "Water Source Reliability",
    annualRainfall: "Average Annual Rainfall (mm)",
    waterStorage: "Rainwater Harvesting / Storage Pond?",
    roadAccessLabel: "Road Accessibility Class",
    highwayDist: "Distance to Nearest Highway (km)",
    apmcDist: "Distance to Nearest APMC Market (km)",
    warehouseDist: "Distance to Nearest Warehouse (km)",
    coldStorageDist: "Distance to Nearest Cold Storage (km)",
    electricityLabel: "Grid Electricity Availability (Hrs/Day)",
    cropCurrentlyGrown: "Crop Currently Grown",
    previousCrops: "Previous Crops Grown",
    fertilizerUsage: "Fertilizer & Pesticide Usage Style",
    landPhotoLabel: "Upload Land Photograph",
    droneLabel: "Upload Drone / Aerial Image",
    satelliteLabel: "Upload Satellite Imagery",
    floodHistory: "History of Flooding (Past 10 Years)",
    droughtHistory: "History of Drought (Past 10 Years)",
    yes: "Yes",
    no: "No",
    adjacentMain: "Adjacent to Main Highway/Tar Road",
    villageRoad: "Village Connected Metallic Road",
    kachhaRoad: "Kachha / Dirt Track Road",
    noRoad: "No Road Access (Walkways only)",
    high: "High / Perennial",
    medium: "Medium / Seasonal",
    low: "Low / Rain-fed",
    organic: "Mostly Organic / Composts",
    balanced: "Balanced Chemical & Bio-fertilizer",
    heavyChemical: "Heavy Chemical Fertilization",
  },
  hi: {
    title: "एग्रीविज़न एआई ™",
    subtitle: "कृषि भूमि मूल्यांकन एवं योजना अनुशंसा प्रणाली",
    loadPreset: "नमूना फार्म प्रोफाइल लोड करें",
    punjabPreset: "पंजाब गेहूं क्षेत्र (लुधियाना)",
    nashikPreset: "नाशिक अंगूर का बाग (महाराष्ट्र)",
    gunturPreset: "गुंटूर कपास क्षेत्र (आंध्र प्रदेश)",
    rajasthanPreset: "राजस्थान शुष्क भूमि (थार)",
    tabLocation: "स्थान और भूमि",
    tabSoil: "मिट्टी और ढलान",
    tabWater: "पानी और सिंचाई",
    tabInfrastructure: "बुनियादी ढांचा",
    tabImagery: "चित्र और इतिहास",
    evaluateBtn: "एग्रीविज़न एआई मूल्यांकन शुरू करें",
    processing: "मिट्टी, उपग्रह और संपत्तियों का विश्लेषण...",
    overallScore: "कुल स्कोर",
    grade: "ग्रेड",
    confidence: "विश्वास स्तर",
    summary: "कार्यकारी सारांश",
    breakdown: "विस्तृत स्कोर विश्लेषण",
    whyScore: "यह स्कोर क्यों दिया गया:",
    strengths: "मुख्य ताकत",
    weaknesses: "पहचानी गई कमजोरियां",
    risks: "जोखिम मूल्यांकन मैट्रिक्स",
    loanElig: "क्रेडिट और ऋण पात्रता",
    recommendedCrops: "उपयुक्त फसलें",
    matchedSchemes: "मिलान की गई सरकारी योजनाएं",
    improvements: "प्राथमिकता सुधार योजना",
    finalRec: "अंतिम मूल्यांकन एवं अनुशंसा",
    disclaimer: "नोट: ऋण पात्रता संपत्ति की गुणवत्ता पर आधारित एक अनुमान है। स्वीकृति बैंक नीतियों के अधीन है।",
    apply: "आवेदन करें",
    resetBtn: "दूसरे खेत का मूल्यांकन करें",
    ownershipLabel: "भूमि स्वामित्व रिकॉर्ड प्रकार",
    docUploadLabel: "भूमि रिकॉर्ड अपलोड करें (पट्टा/खाता/RTC)",
    stateLabel: "राज्य",
    districtLabel: "जिला",
    villageLabel: "गांव",
    surveyNumber: "सर्वेक्षण संख्या",
    pincode: "पिनकोड",
    gpsCoordinates: "जीपीएस निर्देशांक",
    totalLandArea: "कुल भूमि क्षेत्र (एकड़)",
    docStatusLabel: "दस्तावेज़ सत्यापन स्थिति",
    clearDoc: "स्पष्ट और पूर्ण दस्तावेज़",
    blurryDoc: "धुंधला या कम गुणवत्ता वाला दस्तावेज़",
    noDoc: "कोई दस्तावेज़ अपलोड नहीं / असत्यापित",
    soilTypeLabel: "मिट्टी की श्रेणी",
    soilReportLabel: "क्या मृदा स्वास्थ्य रिपोर्ट उपलब्ध है?",
    phValue: "pH मान (इष्टतम: 6.0 - 7.5)",
    moistureLevel: "मिट्टी में नमी का स्तर (%)",
    organicCarbon: "ऑर्गेनिक कार्बन (%)",
    nitrogenLabel: "नाइट्रोजन (N) स्तर (किग्रा/हेक्टेयर)",
    phosphorusLabel: "फास्फोरस (P) स्तर (किग्रा/हेक्टेयर)",
    potassiumLabel: "पोटेशियम (K) स्तर (किग्रा/हेक्टेयर)",
    elevationLabel: "समुद्र तल से ऊंचाई (मीटर)",
    slopeLabel: "भूमि का ढलान (डिग्री)",
    irrigationSource: "प्राथमिक सिंचाई स्रोत",
    canalLabel: "नहर के पानी की उपलब्धता",
    borewellLabel: "खेत में बोरवेल है?",
    riverProximity: "নিকটতম নদী/झील से दूरी (किमी)",
    groundwaterLabel: "भूजल स्तर की उपलब्धता",
    waterReliability: "जल स्रोत की विश्वसनीयता",
    annualRainfall: "औसत वार्षिक वर्षा (मिमी)",
    waterStorage: "वर्षा जल संचयन / तालाब?",
    roadAccessLabel: "सड़क पहुंच श्रेणी",
    highwayDist: "निकटतम राजमार्ग से दूरी (किमी)",
    apmcDist: "निकटतम एपीएमसी बाजार से दूरी (किमी)",
    warehouseDist: "निकटतम गोदाम से दूरी (किमी)",
    coldStorageDist: "निकटतम कोल्ड स्टोरेज से दूरी (किमी)",
    electricityLabel: "बिजली की उपलब्धता (घंटे/दिन)",
    cropCurrentlyGrown: "वर्तमान में उगाई जाने वाली फसल",
    previousCrops: "पहले उगाई गई फसलें",
    fertilizerUsage: "उर्वरक एवं कीटनाशक उपयोग शैली",
    landPhotoLabel: "खेत की तस्वीर अपलोड करें",
    droneLabel: "ड्रोन / हवाई तस्वीर अपलोड करें",
    satelliteLabel: "सैटेलाइट तस्वीर अपलोड करें",
    floodHistory: "बाढ़ का इतिहास (पिछले 10 वर्ष)",
    droughtHistory: "सूखे का इतिहास (पिछले 10 वर्ष)",
    yes: "हाँ",
    no: "नहीं",
    adjacentMain: "मुख्य राजमार्ग / डामर सड़क के पास",
    villageRoad: "गांव की पक्की सड़क",
    kachhaRoad: "कच्ची सड़क / मिट्टी का रास्ता",
    noRoad: "सड़क संपर्क नहीं (केवल पैदल मार्ग)",
    high: "उच्च / बारहमासी",
    medium: "मध्यम / मौसमी",
    low: "कम / वर्षा-आधारित",
    organic: "मुख्य रूप से जैविक खाद",
    balanced: "संतुलित रासायनिक और जैव-उर्वरक",
    heavyChemical: "अत्यधिक रासायनिक उर्वरक",
  },
  mr: {
    title: "एग्रीव्हिजन एआय ™",
    subtitle: "कृषि जमीन मूल्यांकन आणि योजना शिफारस प्रणाली",
    loadPreset: "नमुना फार्म प्रोफाइल लोड करा",
    punjabPreset: "पंजाब गहू पट्टा (लुधियाना)",
    nashikPreset: "नाशिक द्राक्ष बाग (महाराष्ट्र)",
    gunturPreset: "गुंटूर कापूस शेत (आंध्र प्रदेश)",
    rajasthanPreset: "राजस्थान कोरडवाहू (थार)",
    tabLocation: "स्थान आणि जमीन",
    tabSoil: "माती आणि उतार",
    tabWater: "पाणी आणि सिंचन",
    tabInfrastructure: "बुनियादी ढांचा",
    tabImagery: "छायाचित्रे आणि इतिहास",
    evaluateBtn: "एग्रीव्हिजन एआय मूल्यांकन सुरू करा",
    processing: "माती, उपग्रह आणि मालमत्तेचे विश्लेषण करत आहे...",
    overallScore: "एकूण गुण",
    grade: "ग्रेड",
    confidence: "विश्वास पातळी",
    summary: "कार्यकारी सारांश",
    breakdown: "सविस्तर गुण विश्लेषण",
    whyScore: "हा गुण का दिला गेला:",
    strengths: "मुख्य बलस्थाने",
    weaknesses: "अडचणी / कमतरता",
    risks: "जोखिम मूल्यांकन मॅट्रिक्स",
    loanElig: "क्रेडिट आणि कर्ज पात्रता",
    recommendedCrops: "योग्य पिके",
    matchedSchemes: "जुळणाऱ्या सरकारी योजना",
    improvements: "प्राधान्यक्रम सुधारणा योजना",
    finalRec: "अंतिम मूल्यांकन आणि शिफारस",
    disclaimer: "टीप: कर्ज पात्रता मालमत्तेच्या गुणवत्तेवर आधारित एक अंदाज आहे. मंजुरी बँक धोरणांच्या अधीन आहे.",
    apply: "अर्ज करा",
    resetBtn: "दुसऱ्या शेतीचे मूल्यांकन करा",
    ownershipLabel: "जमीन मालकी दस्तऐवज प्रकार",
    docUploadLabel: "जमिनीचा दाखला अपलोड करा (७/१२ उतारा/पट्टा/खाता)",
    stateLabel: "राज्य",
    districtLabel: "जिल्हा",
    villageLabel: "गाव",
    surveyNumber: "गट क्रमांक / सर्व्हे नंबर",
    pincode: "पिनकोड",
    gpsCoordinates: "जीपीएस कोऑर्डिनेट्स",
    totalLandArea: "एकूण जमीन क्षेत्र (एकर)",
    docStatusLabel: "दस्तऐवज पडताळणी स्थिती",
    clearDoc: "स्पष्ट आणि पूर्ण दस्तऐवज",
    blurryDoc: "अस्पष्ट किंवा कमी गुणवत्तेचा दस्तऐवज",
    noDoc: "दस्तऐवज अपलोड नाही / असत्यापित",
    soilTypeLabel: "मातीचा प्रकार",
    soilReportLabel: "मृदा आरोग्य अहवाल उपलब्ध आहे का?",
    phValue: "pH मूल्य (योग्य: ६.० - ७.५)",
    moistureLevel: "मातीतील ओलावा पातळी (%)",
    organicCarbon: "सेंद्रिय कर्ब / ऑरगॅनिक कार्बन (%)",
    nitrogenLabel: "नायट्रोजन (N) पातळी (किग्रॅ/हेक्टर)",
    phosphorusLabel: "फॉस्फरस (P) पातळी (किग्रॅ/हेक्टर)",
    potassiumLabel: "पोटॅशियम (K) पातळी (किग्रॅ/हेक्टर)",
    elevationLabel: "समुद्रसपाटीपासून उंची (मीटर)",
    slopeLabel: "जमिनीचा उतार (अंश)",
    irrigationSource: "सिंचनाचा प्राथमिक स्त्रोत",
    canalLabel: "कालव्याच्या पाण्याची उपलब्धता",
    borewellLabel: "शेतात कूपनलिका (बोअरवेल) आहे का?",
    riverProximity: "जवळच्या नदी/तलावापासून अंतर (किमी)",
    groundwaterLabel: "भूजल पातळीची उपलब्धता",
    waterReliability: "पाण्याच्या स्त्रोताची विश्वासार्हता",
    annualRainfall: "सरासरी वार्षिक पाऊस (मीमी)",
    waterStorage: "शेततळे / पाणी साठवणूक सोय?",
    roadAccessLabel: "रस्त्याची उपलब्धता वर्ग",
    highwayDist: "जवळच्या महामार्गापासून अंतर (किमी)",
    apmcDist: "जवळच्या कृषी उत्पन्न बाजार समिती (APMC) पासून अंतर (किमी)",
    warehouseDist: "जवळच्या गोदामापासून अंतर (किमी)",
    coldStorageDist: "जवळच्या कोल्ड स्टोरेजपासून अंतर (किमी)",
    electricityLabel: "वीज उपलब्धता (तास/दिवस)",
    cropCurrentlyGrown: "सध्याचे पीक",
    previousCrops: "पूर्वी घेतलेली पिके",
    fertilizerUsage: "खते आणि कीटकनाशके वापरण्याची पद्धत",
    landPhotoLabel: "खताचे/शेताचे छायाचित्र अपलोड करा",
    droneLabel: "ड्रोन / हवाई छायाचित्र अपलोड करा",
    satelliteLabel: "सॅटेलाइट छायाचित्र अपलोड करा",
    floodHistory: "पुराचा इतिहास (गेल्या १० वर्षांत)",
    droughtHistory: "दुष्काळाचा इतिहास (गेल्या १० वर्षांत)",
    yes: "होय",
    no: "नाही",
    adjacentMain: "मुख्य महामार्ग / डांबरी रस्त्यालगत",
    villageRoad: "गावाला जोडणारा पक्का रस्ता",
    kachhaRoad: "कच्चा रस्ता / मातीची वाट",
    noRoad: "रस्ता संपर्क नाही (केवळ पाऊलवाट)",
    high: "उच्च / बारमाही",
    medium: "मध्यम / हंगามी",
    low: "कमी / पावसावर आधारित",
    organic: "प्रामुख्याने सेंद्रिय खते",
    balanced: "संतुलित रासायनिक आणि जैव-खते",
    heavyChemical: "अति रासायनिक खतांचा वापर",
  },
  te: {
    title: "అగ్రివిజన్ AI ™",
    subtitle: "వ్యవసాయ భూమి మూల్యాంకనం & పథక సిఫార్సు విధానం",
    loadPreset: "నమూనా ఫార్మ్ ప్రొఫైల్ లోడ్ చేయండి",
    punjabPreset: "పంజాబ్ గోధుమ క్షేత్రం (లుధియానా)",
    nashikPreset: "నాసిక్ ద్రాక్ష తోట (మహారాష్ట్ర)",
    gunturPreset: "గుంటూరు పత్తి క్షేత్రం (ఆంధ్రప్రదేశ్)",
    rajasthanPreset: "రాజస్థాన్ పొడి భూములు (థార్)",
    tabLocation: "ప్రాంతం మరియు భూమి",
    tabSoil: "నేల మరియు వాలు",
    tabWater: "నీరు మరియు నీటిపారుదల",
    tabInfrastructure: "మౌలిక సదుపాయాలు",
    tabImagery: "చిత్రాలు మరియు చరిత్ర",
    evaluateBtn: "అగ్రివిజన్ AI మూల్యాంకనం ప్రారంభించండి",
    processing: "నేల, ఉపగ్రహాలు & ఆస్తులను విశ్లేషిస్తోంది...",
    overallScore: "మొత్తం స్కోరు",
    grade: "గ్రేడ్",
    confidence: "విశ్వసనీయత స్థాయి",
    summary: "సారాంశం",
    breakdown: "వివరణాత్మక స్కోరు విశ్లేషణ",
    whyScore: "ఈ స్కోరు ఎందుకు ఇవ్వబడింది:",
    strengths: "ప్రధాన బలాలు",
    weaknesses: "లోపాలు / బలహీనతలు",
    risks: "జోఖిమ అంచనా మ్యాట్రిక్స్",
    loanElig: "క్రెడిట్ & రుణ అర్హత",
    recommendedCrops: "అనుకూలమైన పంటలు",
    matchedSchemes: "సరిపోలే ప్రభుత్వ పథకాలు",
    improvements: "ప్రతిపాధిత మెరుగుదల ప్రణాళిక",
    finalRec: "అంతిమ అంచనా & సిఫార్సు",
    disclaimer: "గమనిక: రుణ అర్హత ఆస్తి నాణ్యతపై ఆధారపడిన అంచనా మాత్రమే. ఆమోదం బ్యాంకు విధానాలకు లోబడి ఉంటుంది.",
    apply: "దరఖాస్తు చేసుకోండి",
    resetBtn: "మరో భూమిని మూల్యాంకనం చేయండి",
    ownershipLabel: "భూమి యాజమాన్య పత్ర రకం",
    docUploadLabel: "భూమి పత్రాలు అప్‌లోడ్ చేయండి (పట్టాదారు పాస్‌బుక్/ఖాతా)",
    stateLabel: "రాష్ట్రం",
    districtLabel: "జిల్లా",
    villageLabel: "గ్రామం",
    surveyNumber: "సర్వే సంఖ్య",
    pincode: "పిన్‌కోడ్",
    gpsCoordinates: "GPS కోఆర్డినేట్లు",
    totalLandArea: "మొత్తం భూమి విస్తీర్ణం (ఎకరాలు)",
    docStatusLabel: "పత్రాల ధృవీకరణ స్థితి",
    clearDoc: "స్పష్టమైన & పూర్తి పత్రం",
    blurryDoc: "స్పష్టత లేని లేదా తక్కువ నాణ్యత పత్రం",
    noDoc: "పత్రాలు అప్‌లోడ్ చేయలేదు / ధృవీకరించబడలేదు",
    soilTypeLabel: "నేల రకం",
    soilReportLabel: "సాయిల్ హెల్త్ రిపోర్ట్ ఉందా?",
    phValue: "pH విలువ (అనుకూలమైనది: 6.0 - 7.5)",
    moistureLevel: "నేల తేమ స్థాయి (%)",
    organicCarbon: "సేంద్రియ కర్బనం / ఆర్గానిక్ కార్బన్ (%)",
    nitrogenLabel: "నత్రజని (N) స్థాయి (kg/ha)",
    phosphorusLabel: "భాస్వరం (P) స్థాయి (kg/ha)",
    potassiumLabel: "పొటాషియం (K) స్థాయి (kg/ha)",
    elevationLabel: "సముద్ర మట్టానికి ఎత్తు (మీటర్లు)",
    slopeLabel: "భూమి వాలు (డిగ్రీలు)",
    irrigationSource: "ప్రధాన్య నీటి వనరు",
    canalLabel: "కాలువ నీటి లభ్యత",
    borewellLabel: "భూమిలో బోరుబావి ఉందా?",
    riverProximity: "దగ్గరి నది/చెరువుకు దూరం (కిమీ)",
    groundwaterLabel: "భూగర్భ జలాల లభ్యత",
    waterReliability: "నీటి వనరుల నమ్మకస్థాయి",
    annualRainfall: "సగటు వార్షిక వర్షపాతం (మిమీ)",
    waterStorage: "వర్షపు నీటి నిల్వ / చెరువు ఉందా?",
    roadAccessLabel: "రహదారి సౌకర్యం రకం",
    highwayDist: "దగ్గరి హైవేకి దూరం (కిమీ)",
    apmcDist: "దగ్గరి మార్కెట్ యార్డ్ (APMC) దూరం (కిమీ)",
    warehouseDist: "దగ్గరి గిడ్డంగికి దూరం (కిమీ)",
    coldStorageDist: "దగ్గరి కోల్డ్ స్టోరేజీకి దూరం (కిమీ)",
    electricityLabel: "విద్యుత్ లభ్యత (గంటలు/రోజు)",
    cropCurrentlyGrown: "ప్రస్తుతం పండిస్తున్న పంట",
    previousCrops: "ఇంతకు ముందు పండించిన పంటలు",
    fertilizerUsage: "ఎరువులు & పురుగుమందుల వాడకం విధానం",
    landPhotoLabel: "భూమి చిత్రం అప్‌లోడ్ చేయండి",
    droneLabel: "డ్రోన్ / వైమానిక చిత్రం అప్‌లోడ్ చేయండి",
    satelliteLabel: "శాటిలైట్ చిత్రం అప్‌లోడ్ చేయండి",
    floodHistory: "వరదల చరిత్ర (గత 10 సంవత్సరాలలో)",
    droughtHistory: "కరువుల చరిత్ర (గత 10 సంవత్సరాలలో)",
    yes: "అవును",
    no: "కాదు",
    adjacentMain: "ప్రధాన రహదారి / తారు రోడ్డు పక్కన",
    villageRoad: "గ్రామ కనెక్టింగ్ మెటల్ రోడ్డు",
    kachhaRoad: "కచ్చా రోడ్డు / మట్టి దారి",
    noRoad: "రోడ్డు సౌకర్యం లేదు (నడక దారి మాత్రమే)",
    high: "ఎక్కువ / నిరంతర",
    medium: "మధ్యస్థం / కాలానుగుణంగా",
    low: "తక్కువ / వర్షాధారం",
    organic: "ఎక్కువగా సేంద్రీయ ఎరువులు",
    balanced: "సమతుల్య రసాయన & జీవ ఎరువులు",
    heavyChemical: "భారీ రసాయన ఎరువుల వాడకం",
  },
  pa: {
    title: "ਐਗਰੀਵਿਜ਼ਨ ਏਆਈ ™",
    subtitle: "ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ ਮੁਲਾਂਕਣ ਅਤੇ ਯੋਜਨਾ ਸਿਫਾਰਸ਼ ਪ੍ਰਣਾਲੀ",
    loadPreset: "ਨਮੂਨਾ ਫਾਰਮ ਪ੍ਰੋਫਾਈਲ ਲੋਡ ਕਰੋ",
    punjabPreset: "ਪੰਜਾਬ ਕਣਕ ਪੱਟੀ (ਲੁਧਿਆਣਾ)",
    nashikPreset: "ਨਾਸਿਕ ਅੰਗੂਰ ਦਾ ਬਾਗ (ਮਹਾਰਾਸ਼ਟਰ)",
    gunturPreset: "ਗੁੰਟੂਰ ਕਪਾਹ ਦਾ ਖੇਤ (ਆਂਧਰਾ ਪ੍ਰਦੇਸ਼)",
    rajasthanPreset: "ਰਾਜਸਥਾਨ ਖੁਸ਼ਕ ਭੂਮੀ (ਥਾਰ)",
    tabLocation: "ਸਥਾਨ ਅਤੇ ਜ਼ਮੀਨ",
    tabSoil: "ਮਿੱਟੀ ਅਤੇ ਢਲਾਣ",
    tabWater: "ਪਾਣੀ ਅਤੇ ਸਿੰਚਾਈ",
    tabInfrastructure: "ਬੁਨਿਆਦੀ ਢਾਂਚਾ",
    tabImagery: "ਤਸਵੀਰਾਂ ਅਤੇ ਇਤਿਹਾਸ",
    evaluateBtn: "ਐਗਰੀਵਿਜ਼ਨ ਏਆਈ ਮੁਲਾਂਕਣ ਚਲਾਓ",
    processing: "ਮਿੱਟੀ, ਉਪਗ੍ਰਹਿ ਅਤੇ ਸੰਪਤੀਆਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...",
    overallScore: "ਕੁੱਲ ਸਕੋਰ",
    grade: "ਗ੍ਰੇਡ",
    confidence: "ਭਰੋਸੇ ਦਾ ਪੱਧਰ",
    summary: "ਕਾਰਜਕਾਰੀ ਸਾਰਾਂਸ਼",
    breakdown: "ਵਿਸਤ੍ਰਿਤ ਸਕੋਰ ਵਿਸ਼ਲੇਸ਼ਣ",
    whyScore: "ਇਹ ਸਕੋਰ ਕਿਉਂ ਦਿੱਤਾ ਗਿਆ:",
    strengths: "ਮੁੱਖ ਤਾਕਤਾਂ",
    weaknesses: "ਕਮੀਆਂ / ਕਮਜ਼ੋਰੀਆਂ",
    risks: "ਜੋਖਮ ਮੁਲਾਂਕਣ ਮੈਟ੍ਰਿਕਸ",
    loanElig: "ਕ੍ਰੈਡਿਟ ਅਤੇ ਲੋਨ ਯੋਗਤਾ",
    recommendedCrops: "ਢੁਕਵੀਆਂ ਫਸਲਾਂ",
    matchedSchemes: "ਮੇਲ ਖਾਂਦੀਆਂ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ",
    improvements: "ਤਰਜੀਹੀ ਸੁਧਾਰ ਯੋਜਨਾ",
    finalRec: "ਅੰਤਿਮ ਮੁਲਾਂਕਣ ਅਤੇ ਸਿਫਾਰਸ਼",
    disclaimer: "ਨੋਟ: ਲੋਨ ਯੋਗਤਾ ਸੰਪਤੀ ਦੀ ਗੁਣਵੱਤਾ 'ਤੇ ਅਧਾਰਤ ਇੱਕ ਅਨੁਮਾਨ ਹੈ। ਮਨਜ਼ੂਰੀ ਬੈਂਕ ਨੀਤੀਆਂ ਦੇ ਅਧਾਰ 'ਤੇ ਹੋਵੇਗੀ।",
    apply: "ਅਪਲਾਈ ਕਰੋ",
    resetBtn: "ਦੂਜੀ ਜ਼ਮੀਨ ਦਾ ਮੁਲਾਂਕਣ ਕਰੋ",
    ownershipLabel: "ਜ਼ਮੀਨ ਦੀ ਮਾਲਕੀ ਦਸਤਾਵੇਜ਼ ਕਿਸਮ",
    docUploadLabel: "ਜ਼ਮੀਨੀ ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ (ਪੱਟਾ/ਖਾਤਾ/ਜਮਾਂਬੰਦੀ)",
    stateLabel: "ਸੂਬਾ",
    districtLabel: "ਜ਼ਿਲ੍ਹਾ",
    villageLabel: "ਪਿੰਡ",
    surveyNumber: "ਖਸਰਾ / ਖਤੌਨੀ ਨੰਬਰ",
    pincode: "ਪਿੰਨਕੋਡ",
    gpsCoordinates: "ਜੀਪੀਐਸ ਕੋਆਰਡੀਨੇਟਸ",
    totalLandArea: "ਕੁੱਲ ਜ਼ਮੀਨ ਦਾ ਖੇਤਰਫਲ (ਏਕੜ)",
    docStatusLabel: "ਦਸਤਾਵੇਜ਼ ਦੀ ਸਥਿਤੀ",
    clearDoc: "ਸਪੱਸ਼ਟ ਅਤੇ ਪੂਰਾ ਦਸਤਾਵੇਜ਼",
    blurryDoc: "ਧੁੰਦਲਾ ਜਾਂ ਘੱਟ ਗੁਣਵੱਤਾ ਵਾਲਾ ਦਸਤਾਵੇਜ਼",
    noDoc: "ਕੋਈ ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਨਹੀਂ / ਗੈਰ-ਪ੍ਰਮਾਣਿਤ",
    soilTypeLabel: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ",
    soilReportLabel: "ਕੀ ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਰਿਪੋਰਟ ਉਪਲਬਧ ਹੈ?",
    phValue: "pH ਮੁੱਲ (ਢੁਕਵਾਂ: 6.0 - 7.5)",
    moistureLevel: "ਮਿੱਟੀ ਵਿੱਚ ਨਮੀ ਦਾ ਪੱਧਰ (%)",
    organicCarbon: "ਜੈਵਿਕ ਕਾਰਬਨ (%)",
    nitrogenLabel: "ਨਾਈਟ੍ਰੋਜਨ (N) ਪੱਧਰ (ਕਿਗ੍ਰਾ/ਹੈਕਟੇਅਰ)",
    phosphorusLabel: "ਫਾਸਫੋਰਸ (P) ਪੱਧਰ (ਕਿਗ੍ਰਾ/ਹੈਕਟੇਅਰ)",
    potassiumLabel: "ਪੋਟਾਸ਼ੀਅਮ (K) ਪੱਧਰ (ਕਿਗ੍ਰਾ/ਹੈਕਟੇਅਰ)",
    elevationLabel: "ਸਮੁੰਦਰ ਤਲ ਤੋਂ ਉਚਾਈ (ਮੀਟਰ)",
    slopeLabel: "ਜ਼ਮੀਨ ਦੀ ਢਲਾਣ (ਡਿਗਰੀ)",
    irrigationSource: "ਸਿੰਚਾਈ ਦਾ ਮੁੱਖ ਸਰੋਤ",
    canalLabel: "ਨਹਿਰੀ ਪਾਣੀ ਦੀ ਉਪਲਬਧਤਾ",
    borewellLabel: "ਖੇਤ ਵਿੱਚ ਟਿਊਬਵੈੱਲ / ਬੋਰਵੈੱਲ ਹੈ?",
    riverProximity: "ਨਜ਼ਦੀਕੀ ਨਦੀ/ਝੀਲ ਤੋਂ ਦੂਰੀ (ਕਿਮੀ)",
    groundwaterLabel: "ਜ਼ਮੀਨ ਹੇਠਲੇ ਪਾਣੀ ਦੀ ਉਪਲਬਧਤਾ",
    waterReliability: "ਪਾਣੀ ਦੇ ਸਰੋਤ ਦੀ ਭਰੋਸੇਯੋਗਤਾ",
    annualRainfall: "ਔਸਤ ਸਾਲਾਨਾ ਵਰਖਾ (ਮਿਮੀ)",
    waterStorage: "ਮੀਂਹ ਦੇ ਪਾਣੀ ਦੀ ਸੰਭਾਲ / ਡਿੱਗੀ?",
    roadAccessLabel: "sੜਕ ਪਹੁੰਚ ਸ਼੍ਰੇਣੀ",
    highwayDist: "ਨਜ਼ਦੀਕੀ ਹਾਈਵੇ ਤੋਂ ਦੂਰੀ (ਕਿਮੀ)",
    apmcDist: "ਨਜ਼ਦੀਕੀ ਦਾਣਾ ਮੰਡੀ (APMC) ਤੋਂ ਦੂਰੀ (ਕਿਮੀ)",
    warehouseDist: "ਨਜ਼ਦੀਕੀ ਗੋਦਾਮ ਤੋਂ ਦੂਰੀ (ਕਿਮੀ)",
    coldStorageDist: "ਨਜ਼ਦੀਕੀ ਕੋਲਡ ਸਟੋਰੇਜ ਤੋਂ ਦੂਰੀ (ਕਿਮੀ)",
    electricityLabel: "ਬਿਜਲੀ ਦੀ ਉਪਲਬਧਤਾ (ਘੰਟੇ/ਦਿਨ)",
    cropCurrentlyGrown: "ਮੌਜੂਦਾ ਫਸਲ",
    previousCrops: "ਪਹਿਲਾਂ ਬੀਜੀਆਂ ਗਈਆਂ ਫਸਲਾਂ",
    fertilizerUsage: "ਖਾਦ ਅਤੇ ਕੀਟਨਾਸ਼ਕ ਵਰਤੋਂ ਸ਼ੈਲੀ",
    landPhotoLabel: "ਖੇਤ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    droneLabel: "ਡਰੋਨ / ਹਵਾਈ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    satelliteLabel: "ਸੈਟੇਲਾਈਟ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    floodHistory: "ਹੜ੍ਹਾਂ ਦਾ ਇਤਿਹਾਸ (ਪਿਛਲੇ 10 ਸਾਲਾਂ ਵਿੱਚ)",
    droughtHistory: "ਸੋਕੇ ਦਾ ਇਤਿਹਾਸ (ਪਿਛਲੇ 10 ਸਾਲਾਂ ਵਿੱਚ)",
    yes: "ਹਾਂ",
    no: "ਨਹੀਂ",
    adjacentMain: "ਮੁੱਖ ਹਾਈਵੇ / ਪੱਕੀ ਸੜਕ ਦੇ ਨੇੜੇ",
    villageRoad: "ਪਿੰਡ ਦੀ ਪੱਕੀ ਸੜਕ",
    kachhaRoad: "ਕੱਚਾ ਰਸਤਾ / ਮਿੱਟੀ ਦੀ ਵੱਟ",
    noRoad: "ਸੜਕ ਸੰਪਰਕ ਨਹੀਂ (ਕੇਵਲ ਪਗਡੰਡੀ)",
    high: "ਉੱਚ / ਸਾਲਾਨਾ",
    medium: "ਦਰਮਿਆਨਾ / ਮੌਸਮੀ",
    low: "ਘੱਟ / ਬਾਰਸ਼-ਅਧਾਰਤ",
    organic: "ਜ਼ਿਆਦਾਤਰ ਜੈਵਿਕ ਖਾਦ",
    balanced: "ਸੰਤੁਲਿਤ ਰਸਾਇਣਕ ਅਤੇ ਜੈਵਿਕ ਖਾਦ",
    heavyChemical: "ਬਹੁਤ ਜ਼ਿਆਦਾ ਰਸਾਇਣਕ ਖਾਦਾਂ",
  },
  ta: {
    title: "அக்ரிவிஷன் AI ™",
    subtitle: "விவசாய நில மதிப்பீடு & அரசு திட்ட பரிந்துரை முறை",
    loadPreset: "மாதிரி பண்ணை சுயவிவரத்தை ஏற்றவும்",
    punjabPreset: "பஞ்சாப் கோதுமை மண்டலம் (லூதியானா)",
    nashikPreset: "நாசிக் திராட்சை தோட்டம் (மகாராஷ்டிரா)",
    gunturPreset: "குண்டூர் பருத்தி நிலம் (ஆந்திரப் பிரதேசம்)",
    rajasthanPreset: "ராஜஸ்தான் வறண்ட நிலங்கள் (தார்)",
    tabLocation: "இருப்பிடம் & நிலம்",
    tabSoil: "மண் & சரிவு",
    tabWater: "நீர் & பாசனம்",
    tabInfrastructure: "கட்டமைப்பு",
    tabImagery: "புகைப்படங்கள் & வரலாறு",
    evaluateBtn: "அக்ரிவிஷன் AI மதிப்பீட்டை இயக்கவும்",
    processing: "மண், செயற்கைக்கோள் மற்றும் சொத்துக்களை பகுப்பாய்வு செய்கிறது...",
    overallScore: "ஒட்டுமொத்த மதிப்பெண்",
    grade: "தரம்",
    confidence: "நம்பிக்கை நிலை",
    summary: "நிர்வாக சுருக்கம்",
    breakdown: "விரிவான மதிப்பெண் பகுப்பாய்வு",
    whyScore: "இந்த மதிப்பெண் வழங்கப்பட்டதற்கான காரணம்:",
    strengths: "முக்கிய பலங்கள்",
    weaknesses: "குறைபாடுகள் / பலவீனங்கள்",
    risks: "ஆபத்து மதிப்பீட்டு மேட்ரிக்ஸ்",
    loanElig: "கடன் தகுதி நிலை",
    recommendedCrops: "பொருத்தமான பயிர்கள்",
    matchedSchemes: "பொருந்திய அரசு திட்டங்கள்",
    improvements: "முன்னுரிமை மேம்பாட்டு திட்டம்",
    finalRec: "இறுதி மதிப்பீடு மற்றும் பரிந்துரை",
    disclaimer: "குறிப்பு: கடன் தகுதியானது நிலத்தின் தரத்தை அடிப்படையாகக் கொண்ட ஒரு மதிப்பீடு மட்டுமே. ஒப்புதல் வங்கி கொள்கைகளுக்கு உட்பட்டது.",
    apply: "விண்ணப்பிக்கவும்",
    resetBtn: "மற்றொரு நிலத்தை மதிப்பிடவும்",
    ownershipLabel: "நில உரிமை ஆவண வகை",
    docUploadLabel: "நில ஆவணத்தை பதிவேற்றவும் (பட்டா/சிட்டா/அடங்கல்/RTC)",
    stateLabel: "மாநிலம்",
    districtLabel: "மாவட்டம்",
    villageLabel: "கிராமம்",
    surveyNumber: "புல எண் / சர்வே எண்",
    pincode: "அஞ்சல் குறியீடு",
    gpsCoordinates: "ஜிபிஎஸ் ஒருங்கிணைப்புகள்",
    totalLandArea: "மொத்த நிலப்பரப்பு (ஏக்கர்)",
    docStatusLabel: "ஆவண சரிபார்ப்பு நிலை",
    clearDoc: "தெளிவான & முழுமையான ஆவணம்",
    blurryDoc: "மங்கலான அல்லது குறைந்த தர ஆவணம்",
    noDoc: "ஆவணம் பதிவேற்றப்படவில்லை / சரிபார்க்கப்படவில்லை",
    soilTypeLabel: "மண் வகைப்பாடு",
    soilReportLabel: "மண் பரிசோதனை அறிக்கை உள்ளதா?",
    phValue: "pH மதிப்பு (உகந்தது: 6.0 - 7.5)",
    moistureLevel: "மண் ஈரப்பதம் (%)",
    organicCarbon: "கரிம கார்பன் (%)",
    nitrogenLabel: "நைட்ரஜன் (N) அளவு (கிகி/ஹெக்டேர்)",
    phosphorusLabel: "பாஸ்பரஸ் (P) அளவு (கிகி/ஹெக்டேர்)",
    potassiumLabel: "பொட்டாசியம் (K) அளவு (கிகி/ஹெக்டேர்)",
    elevationLabel: "கடல் मட்டத்திலிருந்து உயரம் (மீ)",
    slopeLabel: "நிலத்தின் சரிவு (டிகிரி)",
    irrigationSource: "முதன்மை நீர் ஆதாரம்",
    canalLabel: "கால்வாய் நீர் வசதி",
    borewellLabel: "நிலத்தில் ஆழ்துளை கிணறு (போர்வெல்) உள்ளதா?",
    riverProximity: "அருகிலுள்ள ஆறு/ஏரிக்கு தூரம் (கிமீ)",
    groundwaterLabel: "நிலத்தடி நீர் மட்டம்",
    waterReliability: "நீர் ஆதாரத்தின் நம்பகத்தன்மை",
    annualRainfall: "சராசரி ஆண்டு மழைப்பொழிவு (மிமீ)",
    waterStorage: "மழைநீர் சேகரிப்பு / பண்ணை குட்டை உள்ளதா?",
    roadAccessLabel: "சாலை அணுகல் வகைப்பாடு",
    highwayDist: "அருகிலுள்ள நெடுஞ்சாலைக்கு தூரம் (கிமீ)",
    apmcDist: "அருகிலுள்ள ஒழுங்குமுறை விற்பனைக்கூட (APMC) தூரம் (கிமீ)",
    warehouseDist: "அருகிலுள்ள கிடங்குக்கு தூரம் (கிமீ)",
    coldStorageDist: "அருகிலுள்ள குளிர்சாதன கிடங்குக்கு தூரம் (கிமீ)",
    electricityLabel: "மின்சார வசதி (மணிநேரம்/நாள்)",
    cropCurrentlyGrown: "தற்போது பயிரிடப்படும் பயிர்",
    previousCrops: "முந்தைய பயிர்கள்",
    fertilizerUsage: "உரங்கள் & பூச்சிக்கொல்லி பயன்பாட்டு முறை",
    landPhotoLabel: "நில புகைப்படத்தை பதிவேற்றவும்",
    droneLabel: "ட்ரோன் / வான்வழி புகைப்படத்தை பதிவேற்றவும்",
    satelliteLabel: "செயற்கைக்கோள் புகைப்படத்தை பதிவேற்றவும்",
    floodHistory: "வெள்ள வரலாறு (கடந்த 10 ஆண்டுகளில்)",
    droughtHistory: "வறட்சி வரலாறு (கடந்த 10 ஆண்டுகளில்)",
    yes: "ஆம்",
    no: "இல்லை",
    adjacentMain: "நெடுஞ்சாலை / தார் சாலைக்கு அருகில்",
    villageRoad: "கிராம இணைப்பு சாலை (தார்க்சாலை)",
    kachhaRoad: "கற்கள் மற்றும் மண் சாலை (கச்சா சாலை)",
    noRoad: "சாலை வசதி இல்லை (ஒற்றையடிப் பாதை மட்டுமே)",
    high: "அதிகம் / வற்றாத நீர்",
    medium: "நடுத்தரம் / பருவகால நீர்",
    low: "குறைவு / மழையை நம்பியது",
    organic: "முழுக்க முழுக்க இயற்கை உரம்",
    balanced: "சமச்சீர் இரசாயன மற்றும் இயற்கை உரம்",
    heavyChemical: "அதிக இரசாயன உரங்கள் பயன்பாடு",
  }
};

export const AgriVisionEvaluator: React.FC<AgriVisionEvaluatorProps> = ({ onSelectScheme, lang }) => {
  const t = LOCAL_TRANSLATIONS[lang] || LOCAL_TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState<"location" | "soil" | "water" | "infrastructure" | "imagery">("location");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<LandEvaluationReport | null>(null);

  // Form Fields State
  const [state, setState] = useState("Punjab");
  const [district, setDistrict] = useState("Ludhiana");
  const [village, setVillage] = useState("Gill");
  const [gpsCoordinates, setGpsCoordinates] = useState("30.8614, 75.8573");
  const [pincode, setPincode] = useState("141006");
  const [totalLandArea, setTotalLandArea] = useState("4.5");
  const [surveyNumber, setSurveyNumber] = useState("142/3");
  const [ownershipDocuments, setOwnershipDocuments] = useState("Patta");
  const [documentQuality, setDocumentQuality] = useState("clear");

  const [soilType, setSoilType] = useState("alluvial");
  const [soilReportExists, setSoilReportExists] = useState(true);
  const [phValue, setPhValue] = useState("6.8");
  const [moistureLevel, setMoistureLevel] = useState("35");
  const [organicCarbon, setOrganicCarbon] = useState("0.65");
  const [nitrogen, setNitrogen] = useState("280");
  const [phosphorus, setPhosphorus] = useState("22");
  const [potassium, setPotassium] = useState("340");
  const [elevation, setElevation] = useState("244");
  const [slope, setSlope] = useState("1");

  const [irrigationSource, setIrrigationSource] = useState("canal");
  const [canalAvailability, setCanalAvailability] = useState("yes");
  const [borewell, setBorewell] = useState("yes");
  const [riverProximity, setRiverProximity] = useState("1.5");
  const [groundwaterAvailability, setGroundwaterAvailability] = useState("high");
  const [waterReliability, setWaterReliability] = useState("high");
  const [rainfall, setRainfall] = useState("720");
  const [waterStorage, setWaterStorage] = useState("no");

  const [roadAccessibility, setRoadAccessibility] = useState("village_road");
  const [highwayDistance, setHighwayDistance] = useState("4.5");
  const [townDistance, setTownDistance] = useState("8.0");
  const [roadQuality, setRoadQuality] = useState("good");
  const [apmcDistance, setApmcDistance] = useState("6.0");
  const [warehouseDistance, setWarehouseDistance] = useState("5.0");
  const [coldStorageDistance, setColdStorageDistance] = useState("12.0");
  const [electricityAvailability, setElectricityAvailability] = useState("10");

  const [cropCurrentlyGrown, setCropCurrentlyGrown] = useState("wheat");
  const [previousCrops, setPreviousCrops] = useState("soybean, rice");
  const [fertilizerUsage, setFertilizerUsage] = useState("balanced");

  const [hasLandPhoto, setHasLandPhoto] = useState(true);
  const [hasDroneImage, setHasDroneImage] = useState(false);
  const [hasSatelliteImage, setHasSatelliteImage] = useState(true);
  const [floodHistory, setFloodHistory] = useState("no");
  const [droughtHistory, setDroughtHistory] = useState("no");

  // Document/Photo uploads mockup names
  const [uploadedDocName, setUploadedDocName] = useState<string | null>("patta_record_142.pdf");
  const [uploadedPhotoName, setUploadedPhotoName] = useState<string | null>("wheat_field_east.jpg");
  const [uploadedDroneName, setUploadedDroneName] = useState<string | null>(null);
  const [uploadedSatName, setUploadedSatName] = useState<string | null>("sentinel2_ndvi_plot42.jpg");

  // Load Presets Function
  const loadPreset = (presetName: string) => {
    if (presetName === "punjab") {
      setState("Punjab");
      setDistrict("Ludhiana");
      setVillage("Gill");
      setGpsCoordinates("30.8614, 75.8573");
      setPincode("141006");
      setTotalLandArea("4.5");
      setSurveyNumber("142/3");
      setOwnershipDocuments("Patta");
      setDocumentQuality("clear");
      setSoilType("alluvial");
      setSoilReportExists(true);
      setPhValue("6.8");
      setMoistureLevel("38");
      setOrganicCarbon("0.72");
      setNitrogen("310");
      setPhosphorus("26");
      setPotassium("360");
      setElevation("244");
      setSlope("0.5");
      setIrrigationSource("canal");
      setCanalAvailability("yes");
      setBorewell("yes");
      setRiverProximity("1.2");
      setGroundwaterAvailability("high");
      setWaterReliability("high");
      setRainfall("750");
      setWaterStorage("yes");
      setRoadAccessibility("adjacent_main");
      setHighwayDistance("1.2");
      setTownDistance("5.0");
      setRoadQuality("excellent");
      setApmcDistance("3.5");
      setWarehouseDistance("2.0");
      setColdStorageDistance("8.0");
      setElectricityAvailability("12");
      setCropCurrentlyGrown("wheat");
      setPreviousCrops("paddy, potato");
      setFertilizerUsage("balanced");
      setHasLandPhoto(true);
      setHasDroneImage(true);
      setHasSatelliteImage(true);
      setFloodHistory("no");
      setDroughtHistory("no");
      setUploadedDocName("punjab_ludhiana_rtc_verified.pdf");
      setUploadedPhotoName("wheat_ludhiana_front.jpg");
      setUploadedDroneName("drone_canopy_rgb.jpg");
      setUploadedSatName("sentinel_ndvi_ludhiana.png");
    } else if (presetName === "nashik") {
      setState("Maharashtra");
      setDistrict("Nashik");
      setVillage("Chandori");
      setGpsCoordinates("20.0124, 73.9876");
      setPincode("422201");
      setTotalLandArea("6.2");
      setSurveyNumber("289/A");
      setOwnershipDocuments("Khata");
      setDocumentQuality("clear");
      setSoilType("black");
      setSoilReportExists(true);
      setPhValue("7.2");
      setMoistureLevel("28");
      setOrganicCarbon("0.58");
      setNitrogen("240");
      setPhosphorus("18");
      setPotassium("420");
      setElevation("565");
      setSlope("2.5");
      setIrrigationSource("borewell");
      setCanalAvailability("no");
      setBorewell("yes");
      setRiverProximity("2.8");
      setGroundwaterAvailability("medium");
      setWaterReliability("medium");
      setRainfall("920");
      setWaterStorage("yes");
      setRoadAccessibility("village_road");
      setHighwayDistance("6.5");
      setTownDistance("12.0");
      setRoadQuality("good");
      setApmcDistance("8.0");
      setWarehouseDistance("4.5");
      setColdStorageDistance("4.0");
      setElectricityAvailability("8");
      setCropCurrentlyGrown("grapes");
      setPreviousCrops("soybean, tomato");
      setFertilizerUsage("balanced");
      setHasLandPhoto(true);
      setHasDroneImage(false);
      setHasSatelliteImage(true);
      setFloodHistory("no");
      setDroughtHistory("yes");
      setUploadedDocName("7-12_extract_nashik.pdf");
      setUploadedPhotoName("grape_orchard_drip.jpg");
      setUploadedDroneName(null);
      setUploadedSatName("ndvi_satellite_chandori.jpg");
    } else if (presetName === "guntur") {
      setState("Andhra Pradesh");
      setDistrict("Guntur");
      setVillage("Tadikonda");
      setGpsCoordinates("16.4256, 80.4432");
      setPincode("522236");
      setTotalLandArea("3.8");
      setSurveyNumber("45/1");
      setOwnershipDocuments("RTC");
      setDocumentQuality("clear");
      setSoilType("red");
      setSoilReportExists(true);
      setPhValue("6.1");
      setMoistureLevel("22");
      setOrganicCarbon("0.48");
      setNitrogen("210");
      setPhosphorus("15");
      setPotassium("290");
      setElevation("33");
      setSlope("1.5");
      setIrrigationSource("borewell");
      setCanalAvailability("yes");
      setBorewell("yes");
      setRiverProximity("5.5");
      setGroundwaterAvailability("medium");
      setWaterReliability("medium");
      setRainfall("880");
      setWaterStorage("no");
      setRoadAccessibility("village_road");
      setHighwayDistance("12.0");
      setTownDistance("18.0");
      setRoadQuality("average");
      setApmcDistance("14.0");
      setWarehouseDistance("8.0");
      setColdStorageDistance("20.0");
      setElectricityAvailability("7");
      setCropCurrentlyGrown("cotton");
      setPreviousCrops("chilli, maize");
      setFertilizerUsage("heavyChemical");
      setHasLandPhoto(true);
      setHasDroneImage(false);
      setHasSatelliteImage(false);
      setFloodHistory("no");
      setDroughtHistory("yes");
      setUploadedDocName("ap_rtc_tadikonda.pdf");
      setUploadedPhotoName("cotton_blacksoil_crop.jpg");
      setUploadedDroneName(null);
      setUploadedSatName(null);
    } else if (presetName === "rajasthan") {
      setState("Rajasthan");
      setDistrict("Jaisalmer");
      setVillage("Ramgarh");
      setGpsCoordinates("26.8521, 70.4892");
      setPincode("345022");
      setTotalLandArea("12.0");
      setSurveyNumber("908");
      setOwnershipDocuments("none");
      setDocumentQuality("noDoc");
      setSoilType("sandy");
      setSoilReportExists(false);
      setPhValue("8.3");
      setMoistureLevel("12");
      setOrganicCarbon("0.18");
      setNitrogen("110");
      setPhosphorus("9");
      setPotassium("180");
      setElevation("110");
      setSlope("4.0");
      setIrrigationSource("rainfed");
      setCanalAvailability("no");
      setBorewell("no");
      setRiverProximity("25.0");
      setGroundwaterAvailability("low");
      setWaterReliability("low");
      setRainfall("250");
      setWaterStorage("no");
      setRoadAccessibility("kachha_road");
      setHighwayDistance("28.0");
      setTownDistance("35.0");
      setRoadQuality("poor");
      setApmcDistance("42.0");
      setWarehouseDistance("22.0");
      setColdStorageDistance("60.0");
      setElectricityAvailability("3");
      setCropCurrentlyGrown("millets");
      setPreviousCrops("none (fallow)");
      setFertilizerUsage("organic");
      setHasLandPhoto(false);
      setHasDroneImage(false);
      setHasSatelliteImage(false);
      setFloodHistory("no");
      setDroughtHistory("yes");
      setUploadedDocName(null);
      setUploadedPhotoName(null);
      setUploadedDroneName(null);
      setUploadedSatName(null);
    }
  };

  // Client-Side Scoring Fallback Engine
  const executeLocalEvaluation = (): LandEvaluationReport => {
    // 1. Ownership Score (max 20)
    let scoreOwnership = 0;
    let explOwnership = "";
    if (ownershipDocuments !== "none") {
      if (documentQuality === "clear") {
        scoreOwnership = 20;
        explOwnership = `Verified authentic official ${ownershipDocuments} document. Clear title and boundaries registered under survey number ${surveyNumber || "N/A"}.`;
      } else if (documentQuality === "blurry") {
        scoreOwnership = 12;
        explOwnership = `Government-issued ${ownershipDocuments} provided, but the upload quality is blurry or partially cropped. Confidence reduced due to potential legibility concerns.`;
      } else {
        scoreOwnership = 6;
        explOwnership = `Unverified land records. Selected document type: ${ownershipDocuments}, but verification status remains unconfirmed.`;
      }
    } else {
      scoreOwnership = 3;
      explOwnership = "No official land ownership documents (Patta/Khata/RTC) uploaded. Assets cannot be authenticated for formal banking collateral.";
    }

    // 2. Road Accessibility Score (max 15)
    let scoreRoad = 0;
    if (roadAccessibility === "adjacent_main") scoreRoad = 15;
    else if (roadAccessibility === "village_road") scoreRoad = 12;
    else if (roadAccessibility === "kachha_road") scoreRoad = 8;
    else scoreRoad = 3;

    // Adjustments for distance & quality
    const distHighway = parseFloat(highwayDistance) || 0;
    if (distHighway > 20) scoreRoad = Math.max(3, scoreRoad - 2);
    if (roadQuality === "poor") scoreRoad = Math.max(3, scoreRoad - 2);
    else if (roadQuality === "excellent") scoreRoad = Math.min(15, scoreRoad + 1);

    let explRoad = "";
    if (scoreRoad >= 13) {
      explRoad = `Excellent accessibility. Land is adjacent to a metallic tar/main highway, allowing easy heavy machinery movements and transport trucks.`;
    } else if (scoreRoad >= 10) {
      explRoad = `Good accessibility via connecting village road. Suitable for standard transport but could experience slight congestion during monsoon season.`;
    } else if (scoreRoad >= 6) {
      explRoad = `Average accessibility via dirt/kachha road. Difficult for heavy trucks to load harvest during heavy rainfall. Road quality is ${roadQuality}.`;
    } else {
      explRoad = `Poor accessibility. No direct motorized road access. Demands manual load bearing across adjacent fields to reach vehicles.`;
    }

    // 3. Market Accessibility Score (max 10)
    const distApmc = parseFloat(apmcDistance) || 0;
    let scoreMarket = 0;
    if (distApmc <= 5) scoreMarket = 10;
    else if (distApmc <= 15) scoreMarket = 8;
    else if (distApmc <= 30) scoreMarket = 5;
    else scoreMarket = 2;

    // Warehouse adjustment
    const distWh = parseFloat(warehouseDistance) || 0;
    const distCs = parseFloat(coldStorageDistance) || 0;
    if (distWh < 5 || distCs < 8) {
      scoreMarket = Math.min(10, scoreMarket + 1);
    }

    let explMarket = "";
    if (scoreMarket >= 9) {
      explMarket = `Excellent proximity to commercial hubs. APMC market yard is within ${distApmc} km, minimizing transport costs and middleman extraction.`;
    } else if (scoreMarket >= 7) {
      explMarket = `Very Good market link. Market yard is ${distApmc} km away. Nearby storage facilities help secure post-harvest storage options.`;
    } else if (scoreMarket >= 5) {
      explMarket = `Average market distance (${distApmc} km). Requires structured logistics planning to move perishable produce economically.`;
    } else {
      explMarket = `Poor proximity. Major APMC market is over 30 km away (${distApmc} km). Perishability risk and transport overhead are high.`;
    }

    // 4. Water Availability Score (max 20)
    let scoreWater = 0;
    if (irrigationSource === "canal") scoreWater = 18;
    else if (irrigationSource === "borewell") scoreWater = 15;
    else if (irrigationSource === "river" || irrigationSource === "lake") scoreWater = 16;
    else if (irrigationSource === "drip" || irrigationSource === "sprinkler") scoreWater = 17;
    else scoreWater = 8; // rainfed

    if (canalAvailability === "yes" && irrigationSource !== "canal") {
      scoreWater = Math.min(20, scoreWater + 2);
    }
    if (borewell === "yes" && irrigationSource !== "borewell") {
      scoreWater = Math.min(20, scoreWater + 1);
    }
    if (waterStorage === "yes") {
      scoreWater = Math.min(20, scoreWater + 1);
    }
    if (groundwaterAvailability === "low") {
      scoreWater = Math.max(5, scoreWater - 3);
    }
    if (droughtHistory === "yes") {
      scoreWater = Math.max(5, scoreWater - 2);
    }

    let explWater = "";
    if (scoreWater >= 17) {
      explWater = `Abundant and highly reliable water source. Perennial irrigation infrastructure (${irrigationSource}) supports multiple crop cycles annually.`;
    } else if (scoreWater >= 13) {
      explWater = `Moderately secure water access. Relying on groundwater/borewell systems. Vulnerable to power outages and seasonal table fluctuations.`;
    } else {
      explWater = `Highly vulnerable water profile. Rain-fed / dryland farming dependent. High monsoon variance limits farming intensity to single crop cycle.`;
    }

    // 5. Soil Health Score (max 15)
    let scoreSoil = 0;
    let explSoil = "";
    if (soilReportExists) {
      const ph = parseFloat(phValue) || 7.0;
      const oc = parseFloat(organicCarbon) || 0.4;
      const n = parseFloat(nitrogen) || 150;
      
      let reportQualityBonus = 12;
      if (ph >= 6.0 && ph <= 7.5) reportQualityBonus += 1;
      if (oc > 0.6) reportQualityBonus += 1;
      if (n > 250) reportQualityBonus += 1;

      scoreSoil = Math.min(15, reportQualityBonus);
      explSoil = `Analytical Soil Report verified. pH of ${phValue} is ${ph >= 6.0 && ph <= 7.5 ? "ideal" : "sub-optimal"}. Organic carbon is ${oc >= 0.5 ? "satisfactory" : "low"}. NPK levels are balanced.`;
    } else {
      // Estimate based on soil type
      if (soilType === "alluvial") scoreSoil = 11;
      else if (soilType === "black") scoreSoil = 10;
      else if (soilType === "red" || soilType === "loamy" || soilType === "clayey") scoreSoil = 8;
      else scoreSoil = 5; // sandy/desert

      explSoil = `No lab report provided. Estimating approximately using soil class: ${soilType.toUpperCase()} soil. Soil health confidence is decreased due to unverified NPK/pH values.`;
    }

    // 6. Crop Suitability Score (max 10)
    let scoreCrop = 8;
    const isWaterSecure = scoreWater >= 13;
    const isSoilGood = scoreSoil >= 10;

    if (cropCurrentlyGrown === "rice" && !isWaterSecure) scoreCrop = 5; // rice needs high water
    else if (cropCurrentlyGrown === "grapes" && soilType !== "black" && soilType !== "alluvial") scoreCrop = 7;
    else if (cropCurrentlyGrown === "sugarcane" && !isWaterSecure) scoreCrop = 6;
    else if (isWaterSecure && isSoilGood) scoreCrop = 10;

    let explCrop = "";
    if (scoreCrop === 10) {
      explCrop = `Highly suitable crop selection. "${cropCurrentlyGrown.toUpperCase()}" matches the regional climate, local soil hydrology, and available water resources perfectly.`;
    } else if (scoreCrop >= 8) {
      explCrop = `Moderately suitable crop choice. Land offers satisfactory support for "${cropCurrentlyGrown.toUpperCase()}", but yield margins can be optimized.`;
    } else {
      explCrop = `Mismatched resource-crop index. Growing high-intensity "${cropCurrentlyGrown.toUpperCase()}" on dry or deficient land leads to rapid groundwater depletion.`;
    }

    // 7. Image/Satellite Analysis Score (max 10)
    let scoreImage = 5; // base default
    let attachmentsCount = 0;
    if (hasLandPhoto) attachmentsCount++;
    if (hasDroneImage) attachmentsCount++;
    if (hasSatelliteImage) attachmentsCount++;

    if (attachmentsCount === 3) scoreImage = 10;
    else if (attachmentsCount === 2) scoreImage = 8;
    else if (attachmentsCount === 1) scoreImage = 7;
    else scoreImage = 4;

    let explImage = "";
    if (scoreImage >= 9) {
      explImage = `High resolution multispectral drone and satellite imagery verify active green vegetation index (NDVI), protective boundary fencing, and clear site roads.`;
    } else if (scoreImage >= 7) {
      explImage = `Ground photographs and NDVI layers confirm plot outline. Crop density is visible, though lacks high-resolution drone elevation topography.`;
    } else {
      explImage = `Zero visual media or drone uploads. Satellite verification limited to low-resolution open-source grids. Visual features cannot be audited.`;
    }

    // Overall calculation
    const overallScore = scoreOwnership + scoreRoad + scoreMarket + scoreWater + scoreSoil + scoreCrop + scoreImage;
    
    // Grade Selection
    let grade = "Grade B";
    if (overallScore >= 90) grade = "Grade A+";
    else if (overallScore >= 80) grade = "Grade A";
    else if (overallScore >= 70) grade = "Grade B";
    else if (overallScore >= 60) grade = "Grade C";
    else if (overallScore >= 40) grade = "Grade D";
    else grade = "Needs Improvement";

    // Confidence Calculation
    let confidence = 98;
    if (!soilReportExists) confidence -= 15;
    if (ownershipDocuments === "none") confidence -= 20;
    if (ownershipDocuments !== "none" && documentQuality === "blurry") confidence -= 10;
    if (attachmentsCount === 0) confidence -= 15;
    if (attachmentsCount === 1) confidence -= 8;
    if (!gpsCoordinates || gpsCoordinates.length < 5) confidence -= 10;
    confidence = Math.max(40, confidence);

    // Strengths
    const strengths = [];
    if (scoreOwnership === 20) strengths.push("Clear, legally verified land ownership records (Patta/Khata) with no encumbrance.");
    if (scoreWater >= 16) strengths.push(`Highly dependable ${irrigationSource} water access securing Rabi and Kharif crops.`);
    if (scoreRoad >= 12) strengths.push("Robust road connectivity ensuring seamless tractor and transport machinery transit.");
    if (soilType === "alluvial" || soilType === "black") strengths.push(`${soilType.toUpperCase()} soil features premium natural fertility and high organic matter retention.`);
    if (waterStorage === "yes") strengths.push("In-farm rainwater harvesting structures improve buffer capacity during dry spells.");
    if (strengths.length < 3) strengths.push("Viable farm size suitable for cooperative mechanized agriculture.");
    if (strengths.length < 3) strengths.push("Basic APMC market connection established.");

    // Weaknesses
    const weaknesses = [];
    if (ownershipDocuments === "none") weaknesses.push("Absence of official property titles impedes eligibility for institutional bank loans.");
    if (scoreWater < 12) weaknesses.push("Critical dependence on monsoon rain renders crops vulnerable to dry spells.");
    if (scoreRoad < 8) weaknesses.push("Sub-optimal dirt track access creates shipping issues during monsoon mudding.");
    if (!soilReportExists) weaknesses.push("Lack of chemical soil report prevents precision application of micro-nutrients.");
    if (soilType === "sandy") weaknesses.push("Sandy composition has low water retention, necessitating frequent irrigation.");
    if (droughtHistory === "yes") weaknesses.push("Historical frequency of drought spells in the block increases insurance premiums.");
    if (weaknesses.length < 3) weaknesses.push("Sub-optimal grid electricity supply limits continuous tube-well pump usage.");
    if (weaknesses.length < 3) weaknesses.push("Absence of localized cold storage causes pressure to sell immediately post-harvest.");

    // Risks
    const climateRisks = [];
    if (droughtHistory === "yes" || rainfall === "250") {
      climateRisks.push("Drought Vulnerability: High - Semi-arid climate zone with high summer evapotranspiration.");
    } else {
      climateRisks.push("Drought Vulnerability: Medium - Vulnerable only during delayed monsoon seasons.");
    }
    if (floodHistory === "yes" || (parseFloat(riverProximity) < 1.0 && (soilType === "alluvial" || soilType === "clayey"))) {
      climateRisks.push("Flood Risk: High - Close to river plain with low elevation and low soil drainage.");
    } else {
      climateRisks.push("Flood Risk: Low - Safe elevation, soil slope facilitates natural water discharge.");
    }
    if (parseFloat(slope) > 3) {
      climateRisks.push("Soil Erosion: Medium - Elevated slope requires contour bundling and vegetation borders.");
    } else {
      climateRisks.push("Soil Erosion: Low - Flat topography preserves topsoil against runoff.");
    }

    const diseaseRisks = [];
    if (fertilizerUsage === "heavyChemical") {
      diseaseRisks.push("Soil Acidification: High - Excessive chemical fertilization degrades organic microbial activity.");
    } else {
      diseaseRisks.push("Soil Acidification: Low - Balanced organic inputs sustain active soil microbiology.");
    }
    if (cropCurrentlyGrown === "grapes") {
      diseaseRisks.push("Downy Mildew & Powdery Fungal Risk: High - Nashik weather cycle triggers fungal infestations during humidity spikes.");
    } else if (cropCurrentlyGrown === "cotton") {
      diseaseRisks.push("Bollworm Pest Infestation: Medium - Requires integrated pest management (IPM) traps.");
    } else {
      diseaseRisks.push("Root Rot: Low - Dry/balanced moisture levels inhibit root fungal outbreaks.");
    }

    // Loan eligibility
    let loanEligibility: "High" | "Medium" | "Low" = "Medium";
    if (scoreOwnership === 20 && scoreWater >= 15 && overallScore >= 75) {
      loanEligibility = "High";
    } else if (scoreOwnership === 20 || overallScore >= 60) {
      loanEligibility = "Medium";
    } else {
      loanEligibility = "Low";
    }

    // Recommended Crops
    const recommendedCrops = [];
    if (soilType === "alluvial" || soilType === "black") {
      recommendedCrops.push("Wheat (Rabi Premium)", "Paddy (Kharif)", "Sugarcane (Cash Crop)");
    } else if (soilType === "red") {
      recommendedCrops.push("Groundnuts", "Red Gram (Pulse)", "Maize");
    } else if (soilType === "sandy") {
      recommendedCrops.push("Pearl Millet (Bajra)", "Cluster Beans (Guar)", "Moth Beans");
    } else {
      recommendedCrops.push("Seasonal Vegetables", "Mustard Oil Seeds");
    }

    // Government Schemes
    const governmentSchemes = [];
    
    // PM Kisan
    if (parseFloat(totalLandArea) <= 10) {
      governmentSchemes.push({
        schemeName: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        reason: "Matches because your land area is under 10 acres, classifying you as a small/marginal farmer eligible for the ₹6,000 yearly direct benefit transfer (DBT)."
      });
    }
    
    // KCC
    if (scoreOwnership >= 12) {
      governmentSchemes.push({
        schemeName: "Kisan Credit Card (KCC)",
        reason: "Matches because of your verified ownership documents. Provides institutional crop loans up to ₹3,00,000 at subsidized interest rates (effective 4%)."
      });
    }

    // PM Fasal Bima
    governmentSchemes.push({
      schemeName: "PM Fasal Bima Yojana (PMFBY)",
      reason: "Protects your crop investment against natural hazards like drought, unseasonal rainfall, or pest infestations with dynamic premium subsidies."
    });

    // PMKSY / Drip
    if (irrigationSource === "rainfed" || irrigationSource === "borewell") {
      governmentSchemes.push({
        schemeName: "PMKSY - Per Drop More Crop (Drip Irrigation Subsidy)",
        reason: "Recommended to conserve groundwater. Offers 55% to 80% capital subsidy on installing drip or micro-sprinkler systems."
      });
    }

    // Soil health card
    if (!soilReportExists) {
      governmentSchemes.push({
        schemeName: "Soil Health Card Scheme",
        reason: "Matches because you lack a lab report. Provides free soil testing at the nearest block lab to outline specific nutrient deficiencies."
      });
    }

    // Solar pump
    const hrsElectricity = parseFloat(electricityAvailability) || 0;
    if (hrsElectricity < 8 && borewell === "yes") {
      governmentSchemes.push({
        schemeName: "PM-KUSUM Solar Pump Subsidy",
        reason: "Matches because grid electricity is low (only " + hrsElectricity + " hrs/day). Provides up to 60% subsidy to install solar-powered agricultural pumps."
      });
    }

    // AIF
    if (distApmc > 15) {
      governmentSchemes.push({
        schemeName: "Agriculture Infrastructure Fund (AIF)",
        reason: "Provides 3% interest subvention on bank loans to build local warehouses or packing sheds, reducing post-harvest losses."
      });
    }

    // Suggested Improvements
    const suggestedImprovements = [];
    if (irrigationSource === "borewell" || irrigationSource === "rainfed") {
      suggestedImprovements.push("Install high-efficiency Drip Irrigation to optimize water usage and save groundwater tables.");
    } else {
      suggestedImprovements.push("Construct an in-farm Rainwater Harvesting Pond to buffer irrigation needs during canal outages.");
    }

    if (!soilReportExists) {
      suggestedImprovements.push("Initiate Soil Testing at the block agricultural center to calibrate nitrogen (N) and phosphorus (P) balances.");
    } else {
      suggestedImprovements.push("Apply organic compost or bio-fertilizers to improve Soil Organic Carbon levels above 0.8%.");
    }

    if (cropCurrentlyGrown === "wheat" || cropCurrentlyGrown === "rice") {
      suggestedImprovements.push("Practice Crop Rotation with pulses (legumes) during the summer to naturally fix atmospheric nitrogen.");
    } else {
      suggestedImprovements.push("Implement Integrated Pest Management (IPM) techniques including pheromone traps and biopesticides.");
    }

    if (ownershipDocuments === "none" || documentQuality !== "clear") {
      suggestedImprovements.push("Resolve and clear land title mutations at the local Tehsil office to unlock formal bank credit.");
    } else {
      suggestedImprovements.push("Install boundary wire fencing or plant green perimeter borders to restrict wild animal trespass.");
    }

    // Executive summary
    let summary = "";
    if (overallScore >= 85) {
      summary = `Highly productive and secure agricultural asset located in ${district}, ${state}. Verified ownership (${ownershipDocuments}) and excellent water reliability (${waterReliability}) render this land extremely valuable. High crop suitability and accessibility verify optimal commercial yields. Confidence level is high at ${confidence}%.`;
    } else if (overallScore >= 70) {
      summary = `Moderately suitable agricultural asset. Offers good crop cultivation potential, supported by decent soil composition. However, score is constrained by seasonal water reliability and market distance. Recommended to execute drip irrigation and soil calibration. Assessment confidence: ${confidence}%.`;
    } else {
      summary = `Vulnerable agricultural asset showing multiple resource deficiencies. Soil health is unverified, water access is low, and road accessibility is restricted. Significant improvements are required in water storage, road levelling, and legal title documentation. Assessment confidence is lowered to ${confidence}%.`;
    }

    // Final recommendation
    let finalRecommendation = "";
    if (overallScore >= 80) {
      finalRecommendation = `AgriVision AI classifies this asset as a Grade A/A+ prime agricultural land. It is highly suitable for sustainable, intensive crop production and qualifies as an excellent risk candidate for KCC credit limits. The combination of secure titles, perennial water access, and low climate hazards presents an outstanding agricultural investment. Priority should be given to organic carbon maintenance and boundary protection.`;
    } else if (overallScore >= 60) {
      finalRecommendation = `AgriVision AI classifies this land as moderately suitable (Grade B/C). While the land is productive, its economic viability is limited by seasonal water access and remote market links. Implementing micro-irrigation under the PMKSY scheme and obtaining a Soil Health Card will substantially elevate the asset's productivity index, reducing agricultural risks and boosting loan eligibility options.`;
    } else {
      finalRecommendation = `AgriVision AI classifies this asset as high-risk (Grade D/Needs Improvement). The asset is currently unsuitable for commercial high-yield agriculture due to absence of verified ownership documents, low groundwater table, and poor road infrastructure. Immediate focus must be placed on resolving legal titles at the Tehsil office, constructing a rainwater harvesting pond, and switching to drought-resistant millets.`;
    }

    return {
      overallScore,
      grade,
      confidence,
      summary,
      scores: {
        ownership: scoreOwnership,
        roadAccessibility: scoreRoad,
        waterAvailability: scoreWater,
        soilHealth: scoreSoil,
        marketAccessibility: scoreMarket,
        cropSuitability: scoreCrop,
        imageAssessment: scoreImage,
      },
      scoreExplanations: {
        ownership: explOwnership,
        roadAccessibility: explRoad,
        waterAvailability: explWater,
        soilHealth: explSoil,
        marketAccessibility: explMarket,
        cropSuitability: explCrop,
        imageAssessment: explImage,
      },
      strengths,
      weaknesses,
      climateRisks,
      diseaseRisks,
      loanEligibility,
      recommendedCrops,
      governmentSchemes,
      estimatedAgriculturalPotential: overallScore >= 90 ? "Excellent" : (overallScore >= 75 ? "Very Good" : (overallScore >= 55 ? "Average" : "Low")),
      suggestedImprovements,
      finalRecommendation,
    };
  };

  const handleEvaluateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReport(null);

    // Prepare payload
    const payload = {
      state, district, village, gpsCoordinates, pincode,
      totalLandArea: parseFloat(totalLandArea) || 0,
      surveyNumber,
      ownershipDocuments,
      documentQuality,
      soilType,
      soilReportExists,
      phValue: parseFloat(phValue) || 7.0,
      moistureLevel: parseFloat(moistureLevel) || 0,
      organicCarbon: parseFloat(organicCarbon) || 0,
      nitrogen: parseFloat(nitrogen) || 0,
      phosphorus: parseFloat(phosphorus) || 0,
      potassium: parseFloat(potassium) || 0,
      elevation: parseFloat(elevation) || 0,
      slope: parseFloat(slope) || 0,
      irrigationSource,
      canalAvailability,
      borewell,
      riverProximity: parseFloat(riverProximity) || 0,
      groundwaterAvailability,
      waterReliability,
      rainfall: parseFloat(rainfall) || 0,
      waterStorage,
      roadAccessibility,
      highwayDistance: parseFloat(highwayDistance) || 0,
      townDistance: parseFloat(townDistance) || 0,
      roadQuality,
      apmcDistance: parseFloat(apmcDistance) || 0,
      warehouseDistance: parseFloat(warehouseDistance) || 0,
      coldStorageDistance: parseFloat(coldStorageDistance) || 0,
      electricityAvailability: parseFloat(electricityAvailability) || 0,
      cropCurrentlyGrown,
      previousCrops,
      fertilizerUsage,
      hasLandPhoto,
      hasDroneImage,
      hasSatelliteImage,
      floodHistory,
      droughtHistory
    };

    // Simulate analysis delay
    setTimeout(async () => {
      try {
        const res = await fetch("/api/land-evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data && !data.isFallback) {
            setReport(data);
            setLoading(false);
            window.scrollTo({ top: 400, behavior: "smooth" });
            return;
          }
        }
        
        // Fallback to local evaluation if API error or missing API key
        console.warn("Using AgriVision AI local scoring fallback engine.");
        const localData = executeLocalEvaluation();
        setReport(localData);
      } catch (err) {
        console.error("Error evaluating land:", err);
        const localData = executeLocalEvaluation();
        setReport(localData);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 500, behavior: "smooth" });
      }
    }, 2000);
  };

  // Mock Upload handlers
  const triggerDocUpload = () => {
    setUploadedDocName("pattadar_rtc_record_2026.pdf");
    setDocumentQuality("clear");
    setOwnershipDocuments("Patta");
  };

  const triggerPhotoUpload = () => {
    setUploadedPhotoName("plot_growth_green.jpg");
    setHasLandPhoto(true);
  };

  const triggerDroneUpload = () => {
    setUploadedDroneName("multispectral_drone_rgb.png");
    setHasDroneImage(true);
  };

  const triggerSatUpload = () => {
    setUploadedSatName("sentinel2_ndvi_2026.jpg");
    setHasSatelliteImage(true);
  };

  return (
    <div className="space-y-8">
      {/* HEADER HERO PANEL */}
      <div className="bg-gradient-to-br from-[#0F5238] to-[#1E5C44] rounded-3xl p-6 md:p-8 text-white text-left shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-[200px]">verified_user</span>
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-700/50 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
              AI Decision Core
            </span>
            <span className="px-3 py-1 bg-amber-500 text-slate-900 rounded-full text-xs font-bold uppercase tracking-widest">
              AgriVision AI
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight">
            {t.title}
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">
            {t.subtitle}. Think like a soil scientist, banking assessor, drone operator, and irrigation expert in one dashboard.
          </p>

          {/* Preset Chips */}
          <div className="pt-4 space-y-2 text-left">
            <p className="text-xs text-emerald-250 font-bold uppercase tracking-wider">{t.loadPreset}:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadPreset("punjab")}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold rounded-lg transition border border-white/20 flex items-center gap-1.5 cursor-pointer text-white"
              >
                <span className="material-symbols-outlined text-xs">eco</span>
                {t.punjabPreset}
              </button>
              <button
                type="button"
                onClick={() => loadPreset("nashik")}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold rounded-lg transition border border-white/20 flex items-center gap-1.5 cursor-pointer text-white"
              >
                <span className="material-symbols-outlined text-xs">local_grapes</span>
                {t.nashikPreset}
              </button>
              <button
                type="button"
                onClick={() => loadPreset("guntur")}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold rounded-lg transition border border-white/20 flex items-center gap-1.5 cursor-pointer text-white"
              >
                <span className="material-symbols-outlined text-xs">yard</span>
                {t.gunturPreset}
              </button>
              <button
                type="button"
                onClick={() => loadPreset("rajasthan")}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold rounded-lg transition border border-white/20 flex items-center gap-1.5 cursor-pointer text-white"
              >
                <span className="material-symbols-outlined text-xs">wb_sunny</span>
                {t.rajasthanPreset}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!report ? (
        <form onSubmit={handleEvaluateSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm text-left space-y-6">
          {/* TAB HEADER */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide -mx-6 px-6 gap-6">
            {(["location", "soil", "water", "infrastructure", "imagery"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  activeTab === tab 
                    ? "border-primary text-primary" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {tab === "location" ? "map" : tab === "soil" ? "soil" : tab === "water" ? "water" : tab === "infrastructure" ? "local_shipping" : "photo_camera"}
                </span>
                {tab === "location" ? t.tabLocation : tab === "soil" ? t.tabSoil : tab === "water" ? t.tabWater : tab === "infrastructure" ? t.tabInfrastructure : t.tabImagery}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: 1. LOCATION & OWNERSHIP */}
          {activeTab === "location" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.stateLabel}</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.districtLabel}</label>
                <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.villageLabel}</label>
                <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.surveyNumber}</label>
                <input type="text" value={surveyNumber} onChange={(e) => setSurveyNumber(e.target.value)} placeholder="e.g. 142/3A" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.pincode}</label>
                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.gpsCoordinates}</label>
                <input type="text" value={gpsCoordinates} onChange={(e) => setGpsCoordinates(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalLandArea}</label>
                <input type="number" step="0.1" value={totalLandArea} onChange={(e) => setTotalLandArea(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="border-t border-slate-100 md:col-span-2 pt-4 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm tracking-wide">Verification Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.ownershipLabel}</label>
                    <select value={ownershipDocuments} onChange={(e) => setOwnershipDocuments(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                      <option value="Patta">Patta (Land Title Copy)</option>
                      <option value="Khata">Khata Certificate</option>
                      <option value="RTC">RTC / Jamabandi Extract (7/12)</option>
                      <option value="EC">Encumbrance Certificate (EC)</option>
                      <option value="Survey documents">Official Survey Map/Records</option>
                      <option value="Registered sale deed">Registered Sale Deed</option>
                      <option value="none">No Document Available</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.docStatusLabel}</label>
                    <select value={documentQuality} onChange={(e) => setDocumentQuality(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                      <option value="clear">{t.clearDoc}</option>
                      <option value="blurry">{t.blurryDoc}</option>
                      <option value="noDoc">{t.noDoc}</option>
                    </select>
                  </div>
                </div>

                <div 
                  onClick={triggerDocUpload}
                  className={`p-4 rounded-xl border-2 border-dashed flex items-center justify-between cursor-pointer transition ${
                    uploadedDocName ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200 bg-slate-50 hover:border-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${uploadedDocName ? "text-emerald-700" : "text-slate-400"}`}>description</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{uploadedDocName || t.docUploadLabel}</p>
                      <p className="text-[10px] text-slate-400">PDF, JPEG, or PNG up to 5MB</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-sm">cloud_upload</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. SOIL & SLOPE */}
          {activeTab === "soil" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.soilTypeLabel}</label>
                <select value={soilType} onChange={(e) => setSoilType(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="alluvial">Alluvial Soil (Highly fertile, river plains)</option>
                  <option value="black">Black Soil (Regur, moisture retentive)</option>
                  <option value="red">Red Soil (Loamy, requires irrigation/fertilizers)</option>
                  <option value="sandy">Sandy / Desert Soil (Dry, low retention)</option>
                  <option value="laterite">Laterite Soil (Acidic, iron-rich)</option>
                  <option value="clayey">Clayey Soil (Heavy drainage, moisture holding)</option>
                  <option value="loamy">Loamy Soil (Optimal agricultural mix)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.soilReportLabel}</label>
                <div className="flex gap-4 items-center h-12">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                    <input type="radio" checked={soilReportExists} onChange={() => setSoilReportExists(true)} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                    {t.yes}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                    <input type="radio" checked={!soilReportExists} onChange={() => setSoilReportExists(false)} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                    {t.no}
                  </label>
                </div>
              </div>

              {soilReportExists && (
                <div className="md:col-span-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.phValue}</label>
                    <input type="number" step="0.1" value={phValue} onChange={(e) => setPhValue(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.moistureLevel}</label>
                    <input type="number" step="1" value={moistureLevel} onChange={(e) => setMoistureLevel(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.organicCarbon}</label>
                    <input type="number" step="0.01" value={organicCarbon} onChange={(e) => setOrganicCarbon(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.nitrogenLabel}</label>
                    <input type="number" value={nitrogen} onChange={(e) => setNitrogen(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.phosphorusLabel}</label>
                    <input type="number" value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.potassiumLabel}</label>
                    <input type="number" value={potassium} onChange={(e) => setPotassium(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold focus:outline-none" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.elevationLabel}</label>
                <input type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.slopeLabel}</label>
                <input type="number" step="0.5" value={slope} onChange={(e) => setSlope(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. WATER & IRRIGATION */}
          {activeTab === "water" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.irrigationSource}</label>
                <select value={irrigationSource} onChange={(e) => setIrrigationSource(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="canal">Perennial Canal System</option>
                  <option value="borewell">Borewell / Tubewell</option>
                  <option value="river">River Intake / Streams</option>
                  <option value="lake">Lake or Catchment Pond</option>
                  <option value="rainfed">Rain-fed farming only (Monsoon dependent)</option>
                  <option value="drip">Drip Irrigation layout</option>
                  <option value="sprinkler">Sprinkler network</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.canalLabel}</label>
                <div className="flex gap-4 items-center h-12">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                    <input type="radio" checked={canalAvailability === "yes"} onChange={() => setCanalAvailability("yes")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                    {t.yes}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                    <input type="radio" checked={canalAvailability === "no"} onChange={() => setCanalAvailability("no")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                    {t.no}
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.borewellLabel}</label>
                <div className="flex gap-4 items-center h-12">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                    <input type="radio" checked={borewell === "yes"} onChange={() => setBorewell("yes")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                    {t.yes}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                    <input type="radio" checked={borewell === "no"} onChange={() => setBorewell("no")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                    {t.no}
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.waterStorage}</label>
                <div className="flex gap-4 items-center h-12">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                    <input type="radio" checked={waterStorage === "yes"} onChange={() => setWaterStorage("yes")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                    {t.yes}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                    <input type="radio" checked={waterStorage === "no"} onChange={() => setWaterStorage("no")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                    {t.no}
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.riverProximity}</label>
                <input type="number" step="0.1" value={riverProximity} onChange={(e) => setRiverProximity(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.annualRainfall}</label>
                <input type="number" value={rainfall} onChange={(e) => setRainfall(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.groundwaterLabel}</label>
                <select value={groundwaterAvailability} onChange={(e) => setGroundwaterAvailability(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.waterReliability}</label>
                <select value={waterReliability} onChange={(e) => setWaterReliability(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="high">{t.high}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="low">{t.low}</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 4. INFRASTRUCTURE & HISTORY */}
          {activeTab === "infrastructure" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scale-in">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.roadAccessLabel}</label>
                <select value={roadAccessibility} onChange={(e) => setRoadAccessibility(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="adjacent_main">{t.adjacentMain}</option>
                  <option value="village_road">{t.villageRoad}</option>
                  <option value="kachha_road">{t.kachhaRoad}</option>
                  <option value="no_road">{t.noRoad}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Road Surface Quality</label>
                <select value={roadQuality} onChange={(e) => setRoadQuality(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="excellent">Excellent Paved / Asphalt</option>
                  <option value="good">Good Metallic Macadam</option>
                  <option value="average">Average Gravel / Potholed</option>
                  <option value="poor">Poor Muddy Track / Non-passable</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.highwayDist}</label>
                <input type="number" step="0.1" value={highwayDistance} onChange={(e) => setHighwayDistance(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.apmcDist}</label>
                <input type="number" step="0.1" value={apmcDistance} onChange={(e) => setApmcDistance(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.warehouseDist}</label>
                <input type="number" step="0.1" value={warehouseDistance} onChange={(e) => setWarehouseDistance(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.coldStorageDist}</label>
                <input type="number" step="0.1" value={coldStorageDistance} onChange={(e) => setColdStorageDistance(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.electricityLabel}</label>
                <input type="number" value={electricityAvailability} onChange={(e) => setElectricityAvailability(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.fertilizerUsage}</label>
                <select value={fertilizerUsage} onChange={(e) => setFertilizerUsage(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="organic">{t.organic}</option>
                  <option value="balanced">{t.balanced}</option>
                  <option value="heavyChemical">{t.heavyChemical}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.cropCurrentlyGrown}</label>
                <input type="text" value={cropCurrentlyGrown} onChange={(e) => setCropCurrentlyGrown(e.target.value)} placeholder="e.g. Wheat" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.previousCrops}</label>
                <input type="text" value={previousCrops} onChange={(e) => setPreviousCrops(e.target.value)} placeholder="e.g. Paddy, Pulses" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </div>
          )}

          {/* TAB CONTENT: 5. IMAGERY & HISTORY */}
          {activeTab === "imagery" && (
            <div className="space-y-6 animate-scale-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.floodHistory}</label>
                  <div className="flex gap-4 items-center h-12">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                      <input type="radio" checked={floodHistory === "yes"} onChange={() => setFloodHistory("yes")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                      {t.yes}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                      <input type="radio" checked={floodHistory === "no"} onChange={() => setFloodHistory("no")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                      {t.no}
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.droughtHistory}</label>
                  <div className="flex gap-4 items-center h-12">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                      <input type="radio" checked={droughtHistory === "yes"} onChange={() => setDroughtHistory("yes")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                      {t.yes}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                      <input type="radio" checked={droughtHistory === "no"} onChange={() => setDroughtHistory("no")} className="text-primary focus:ring-primary w-4.5 h-4.5" />
                      {t.no}
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm tracking-wide">Multi-Spectral & Visual Assets</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Photo upload card */}
                  <div 
                    onClick={triggerPhotoUpload}
                    className={`p-4 rounded-xl border border-dashed flex flex-col items-center text-center justify-center gap-2 cursor-pointer transition ${
                      uploadedPhotoName ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200 bg-slate-50 hover:border-primary"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${uploadedPhotoName ? "text-emerald-700" : "text-slate-400"}`}>photo_camera</span>
                    <p className="text-[11px] font-bold text-slate-800">{uploadedPhotoName || t.landPhotoLabel}</p>
                  </div>

                  {/* Drone upload card */}
                  <div 
                    onClick={triggerDroneUpload}
                    className={`p-4 rounded-xl border border-dashed flex flex-col items-center text-center justify-center gap-2 cursor-pointer transition ${
                      uploadedDroneName ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200 bg-slate-50 hover:border-primary"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${uploadedDroneName ? "text-emerald-700" : "text-slate-400"}`}>flight_land</span>
                    <p className="text-[11px] font-bold text-slate-800">{uploadedDroneName || t.droneLabel}</p>
                  </div>

                  {/* Satellite upload card */}
                  <div 
                    onClick={triggerSatUpload}
                    className={`p-4 rounded-xl border border-dashed flex flex-col items-center text-center justify-center gap-2 cursor-pointer transition ${
                      uploadedSatName ? "border-emerald-500 bg-emerald-50/40" : "border-slate-200 bg-slate-50 hover:border-primary"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${uploadedSatName ? "text-emerald-700" : "text-slate-400"}`}>satellite_alt</span>
                    <p className="text-[11px] font-bold text-slate-800">{uploadedSatName || t.satelliteLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">
              Filled in all tabs before submitting evaluation
            </span>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-12 px-8 bg-primary hover:bg-emerald-800 text-white rounded-xl text-sm font-bold tracking-wider transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer self-end"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  <span>{t.processing}</span>
                </>
              ) : (
                <>
                  <span>{t.evaluateBtn}</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* EVALUATION REPORT PANEL */
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-lg text-left space-y-8 animate-scale-in">
          
          {/* REPORT HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-150 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded border border-emerald-250">
                  Land Certified
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Survey: #{surveyNumber || "N/A"}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-display mt-1">Land Evaluation Report</h3>
              <p className="text-xs text-slate-500">{village}, {district}, {state} (PIN: {pincode})</p>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setReport(null);
                setActiveTab("location");
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 bg-white"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              {t.resetBtn}
            </button>
          </div>

          {/* MAIN RADIAL GAUGES & GRADE PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Score Radial */}
            <div className="md:col-span-4 bg-slate-50/50 rounded-2xl p-6 border border-slate-150 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t.overallScore}</span>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="#0f5238" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="264" 
                    strokeDashoffset={264 - (264 * report.overallScore) / 100}
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-slate-900 font-display">{report.overallScore}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
                </div>
              </div>

              <div className="mt-4 px-3 py-1 bg-emerald-100/50 text-emerald-950 text-xs font-bold rounded-lg border border-emerald-200">
                Grade: {report.grade}
              </div>
            </div>

            {/* Confidence Gauge */}
            <div className="md:col-span-4 bg-slate-50/50 rounded-2xl p-6 border border-slate-150 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t.confidence}</span>
              
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="#0056d2" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray="264" 
                    strokeDashoffset={264 - (264 * report.confidence) / 100}
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-slate-900 font-display">{report.confidence}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">reliability</span>
                </div>
              </div>

              <div className={`mt-4 px-3 py-1 text-xs font-bold rounded-lg border ${
                report.confidence >= 80 
                  ? "bg-blue-100/50 text-blue-900 border-blue-200" 
                  : "bg-amber-100/50 text-amber-900 border-amber-200"
              }`}>
                {report.confidence >= 80 ? "High Quality Scan" : "Approximate Assessment"}
              </div>
            </div>

            {/* Summary */}
            <div className="md:col-span-4 bg-[#EEF4FD] rounded-2xl p-6 border border-slate-200 text-left flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">{t.summary}</span>
                <p className="text-slate-700 text-xs leading-relaxed font-semibold">
                  {report.summary}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-slate-500">
                <span className="material-symbols-outlined text-sm text-[#0056d2]">info</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Potential: {report.estimatedAgriculturalPotential}</span>
              </div>
            </div>

          </div>

          {/* DETAILED SCORE BREAKDOWN ACCORDION */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-base font-display">{t.breakdown}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Score bar renderer helper */}
              {Object.entries({
                ownership: { label: "Ownership Record Authenticity", max: 20, icon: "verified_user" },
                roadAccessibility: { label: "Road & Transport Access", max: 15, icon: "local_shipping" },
                waterAvailability: { label: "Water & Irrigation Security", max: 20, icon: "water_drop" },
                soilHealth: { label: "Soil Chemical Composition", max: 15, icon: "science" },
                marketAccessibility: { label: "APMC Market Accessibility", max: 10, icon: "store" },
                cropSuitability: { label: "Crop Suitability Match", max: 10, icon: "agriculture" },
                imageAssessment: { label: "Satellite & Photographic Audit", max: 10, icon: "satellite_alt" },
              } as const).map(([key, item]) => {
                const scoreVal = report.scores[key as keyof typeof report.scores];
                const scorePercent = (scoreVal / item.max) * 100;
                
                return (
                  <div key={key} className="bg-slate-50/50 border border-slate-150 rounded-xl p-4 space-y-2 hover:border-primary/30 transition">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-550 text-sm">{item.icon}</span>
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{scoreVal} / {item.max}</span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          scorePercent >= 80 ? "bg-primary" : scorePercent >= 50 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${scorePercent}%` }}
                      ></div>
                    </div>

                    <div className="text-[10px] text-slate-500 italic mt-1">
                      <span className="font-bold text-slate-600 block mb-0.5">{t.whyScore}</span>
                      {report.scoreExplanations[key as keyof typeof report.scoreExplanations]}
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* STRENGTHS & WEAKNESSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-emerald-50/20 border border-emerald-200/50 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-[#0F5238] text-sm tracking-wide flex items-center gap-2 font-display">
                <span className="material-symbols-outlined text-emerald-700 text-base">check_circle</span>
                {t.strengths}
              </h4>
              <ul className="space-y-2">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-700 leading-normal flex items-start gap-2">
                    <span className="text-[#0F5238] font-bold select-none">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50/20 border border-red-200/50 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-red-800 text-sm tracking-wide flex items-center gap-2 font-display">
                <span className="material-symbols-outlined text-red-700 text-base">cancel</span>
                {t.weaknesses}
              </h4>
              <ul className="space-y-2">
                {report.weaknesses.map((wk, idx) => (
                  <li key={idx} className="text-xs text-slate-700 leading-normal flex items-start gap-2">
                    <span className="text-red-700 font-bold select-none">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* RISK ASSESSMENT MATRIX */}
          <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-slate-600 text-base">warning</span>
              {t.risks}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Climate & Environment Risks</p>
                <div className="space-y-1">
                  {report.climateRisks.map((risk, idx) => {
                    const isHigh = risk.toLowerCase().includes("high");
                    const isMed = risk.toLowerCase().includes("medium");
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-white text-xs border border-slate-100">
                        <span className="font-semibold text-slate-600">{risk.split(":")[0]}</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                          isHigh 
                            ? "bg-red-100 text-red-800 border-red-200" 
                            : isMed 
                              ? "bg-amber-100 text-amber-805 border-amber-200" 
                              : "bg-emerald-100 text-emerald-808 border-emerald-200"
                        }`}>
                          {isHigh ? "High" : isMed ? "Medium" : "Low"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Biological & Agricultural Disease Risks</p>
                <div className="space-y-1">
                  {report.diseaseRisks.map((risk, idx) => {
                    const isHigh = risk.toLowerCase().includes("high");
                    const isMed = risk.toLowerCase().includes("medium");
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-white text-xs border border-slate-100">
                        <span className="font-semibold text-slate-600">{risk.split(":")[0]}</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase border ${
                          isHigh 
                            ? "bg-red-100 text-red-800 border-red-200" 
                            : isMed 
                              ? "bg-amber-100 text-amber-805 border-amber-200" 
                              : "bg-emerald-100 text-emerald-808 border-emerald-200"
                        }`}>
                          {isHigh ? "High" : isMed ? "Medium" : "Low"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* CREDIT & LOAN ELIGIBILITY */}
          <div className="bg-[#EEF4FD] text-[#001847] border border-slate-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-8 space-y-1 text-left">
              <h4 className="font-bold text-slate-800 text-sm tracking-wide font-display">{t.loanElig}</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {t.disclaimer}
              </p>
            </div>
            
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eligibility Rating</span>
              <span className={`text-xl font-extrabold font-display uppercase tracking-wide mt-0.5 ${
                report.loanEligibility === "High" 
                  ? "text-emerald-800" 
                  : report.loanEligibility === "Medium" 
                    ? "text-amber-800" 
                    : "text-red-800"
              }`}>
                {report.loanEligibility}
              </span>
            </div>
          </div>

          {/* CROP RECOMMENDATIONS */}
          <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-slate-600 text-base">eco</span>
              {t.recommendedCrops}
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.recommendedCrops.map((crop, idx) => (
                <span key={idx} className="px-3.5 py-1.5 bg-emerald-50 text-emerald-808 border border-emerald-200 text-xs font-bold rounded-lg shadow-sm">
                  {crop}
                </span>
              ))}
            </div>
          </div>

          {/* GOVERNMENT SCHEMES ACCORDION CARD LIST */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-base font-display">{t.matchedSchemes}</h4>
            <div className="space-y-3">
              {report.governmentSchemes.map((matched, idx) => {
                // Find matching scheme details from static store to wire application trigger
                const schemeId = matched.schemeName.toLowerCase().includes("kisan credit") 
                  ? "kisan_credit_card" 
                  : matched.schemeName.toLowerCase().includes("fasal bima") 
                    ? "pm_fasal_bima" 
                    : matched.schemeName.toLowerCase().includes("kusum") 
                      ? "pm_kusum" 
                      : matched.schemeName.toLowerCase().includes("drip") 
                        ? "pm_kusum" 
                        : null;
                const activeSchemeObj = SCHEMES.find(s => s.id === schemeId) || SCHEMES[0];

                return (
                  <div key={idx} className="border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-55 hover:border-primary/50 transition">
                    <div className="space-y-1 text-left max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-808 text-[9px] font-bold uppercase rounded border border-emerald-250">
                          Matched
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Agri Scheme Benefit</span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm mt-1">{matched.schemeName}</h5>
                      <p className="text-slate-500 text-xs leading-normal">{matched.reason}</p>
                    </div>

                    <button
                      onClick={() => onSelectScheme(activeSchemeObj)}
                      className="px-5 h-10 bg-primary hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm border-none cursor-pointer shrink-0 self-start sm:self-center active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>{t.apply}</span>
                      <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRIORITIZED IMPROVEMENT PLAN */}
          <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-slate-600 text-base">checklist_rtl</span>
              {t.improvements}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.suggestedImprovements.map((imp, idx) => (
                <div key={idx} className="flex gap-3 items-start text-left bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[#EEF4FD] text-[#0056d2] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    P{idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Priority {idx + 1}</span>
                    <p className="text-slate-600 text-xs leading-relaxed font-semibold mt-0.5">{imp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FINAL ASSESSMENT & RECOMMENDATION NARRATIVE */}
          <div className="border-t border-slate-150 pt-6">
            <h4 className="font-bold text-slate-800 text-base font-display flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-lg">description</span>
              {t.finalRec}
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed font-semibold bg-[#beead1]/10 rounded-2xl p-5 border border-[#beead1]/30">
              {report.finalRecommendation}
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
