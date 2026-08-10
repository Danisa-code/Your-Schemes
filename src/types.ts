export type LanguageCode = "en" | "ta";

export interface TranslationSet {
  goodMorning: string;
  rajesh: string;
  krishiSahay: string;
  empoweringGrowth: string;
  weatherTitle: string;
  sunnyClear: string;
  humidity: string;
  wind: string;
  rain: string;
  exploreSchemes: string;
  schemesAvailable: string;
  landEvaluation: string;
  checkSoil: string;
  yourLandAssets: string;
  viewAll: string;
  northernField: string;
  wheatCrop: string;
  healthy: string;
  expertTipTitle: string;
  expertTipText: string;
  searchPlaceholder: string;
  allSchemes: string;
  government: string;
  banking: string;
  insurance: string;
  machinery: string;
  applyNow: string;
  droughtTitle: string;
  droughtDesc: string;
  viewDetails: string;
  landAreaView: string;
  gpsVerified: string;
  sitePhotography: string;
  addPhoto: string;
  landDetails: string;
  currentCrop: string;
  landSizeAcres: string;
  ownershipVerification: string;
  submitEvaluation: string;
  whyMattersTitle: string;
  whyMattersDesc: string;
  stepPersonal: string;
  stepIdentity: string;
  stepBanking: string;
  schemeAppTitle: string;
  fertilizerSubDesc: string;
  farmerFullName: string;
  farmerFullNamePlace: string;
  phoneNumber: string;
  phoneNumberPlace: string;
  address: string;
  addressPlace: string;
  selectIdProof: string;
  idNumber: string;
  idNumberPlace: string;
  uploadId: string;
  uploadDesc: string;
  chooseFiles: string;
  secureBank: string;
  bankName: string;
  bankAccount: string;
  ifscCode: string;
  branchName: string;
  termsAgreement: string;
  termsLink: string;
  nextStep: string;
  back: string;
  submitApplication: string;
  appSubmitted: string;
  thankYouMessage: string;
  appIdLabel: string;
  subDateLabel: string;
  estStatusLabel: string;
  estStatusVal: string;
  returnHome: string;
  downloadReceipt: string;
  securedEncryption: string;
  voiceAssistant: string;
  voiceStatusIdle: string;
  voiceStatusListening: string;
  voiceStatusProcessing: string;
  voiceGuideTitle: string;
  voiceSpeakPrompt: string;
  voiceErrorMic: string;
  homeNav: string;
  schemesNav: string;
  landNav: string;
  profileNav: string;
  profileTitle: string;
  farmerProfile: string;
  assetSummary: string;
  calculatorsNav?: string;
  communityNav?: string;
  darkMode?: string;
  lightMode?: string;
  locationRequestTitle?: string;
  locationRequestDesc?: string;
  locationAllow?: string;
  locationDeny?: string;
  locationGranted?: string;
  locationError?: string;
  diseaseNav?: string;
  diseaseTitle?: string;
  diseaseDesc?: string;
  takePhoto?: string;
  uploadPhoto?: string;
  detectDisease?: string;
  processingImage?: string;
  diseaseReportTitle?: string;
  mandiNav?: string;
}

export type AppScreen = "home" | "schemes" | "land" | "profile" | "apply_scheme" | "success" | "calculators" | "community" | "disease_detection" | "mandi_prices" | "admin";

export interface Scheme {
  id: string;
  title: string;
  description: string;
  category: "Government" | "Banking" | "Insurance" | "Machinery";
  badge: string;
  badgeType: "active" | "open" | "banking" | "subsidy" | "machinery" | "govt";
  icon: string;
  criteria: string;
  benefit: string;
  documents?: string[];
  process?: string[];
  lastDate?: string;
}

export interface LandAsset {
  name: string;
  size: string;
  crop: string;
  status: "Healthy" | "Attention" | "Water Needed";
  image: string;
}

export interface VoiceCommandResponse {
  action: "NAVIGATE" | "FILL_FORM" | "SEARCH" | "CHANGE_LANGUAGE" | "SUBMIT_FORM" | "NONE";
  target?: string;
  data?: {
    farmerName?: string;
    phoneNumber?: string;
    address?: string;
    cropType?: string;
    landSize?: number;
    idType?: string;
    idNumber?: string;
    bankName?: string;
    bankAccount?: string;
    ifscCode?: string;
    branchName?: string;
    searchQuery?: string;
    languageCode?: string;
  };
  voiceResponse: string;
  isFallback?: boolean;
}

export interface DiseaseReport {
  crop: string;
  disease: string;
  similarity?: number;
  description: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}
