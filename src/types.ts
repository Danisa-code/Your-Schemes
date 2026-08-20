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
  // --- New: Official Scheme URL / Redirection keys ---
  applyOnOfficialWebsite?: string;
  officialGovWebsite?: string;
  officialGovWebsiteTa?: string;
  redirectWarningTitle?: string;
  redirectWarningDesc?: string;
  redirectWarningNote?: string;
  continueBtn?: string;
  cancelBtn?: string;
  offlineSchemeMsg?: string;
  offlineSchemeContact?: string;
  linkUnavailableMsg?: string;
  verificationRequiredMsg?: string;
  lastVerified?: string;
  viewSchemeDetails?: string;
  schemeGovernmentLevel?: string;
  schemeDepartment?: string;
  schemeEligibility?: string;
  schemeBenefits?: string;
  schemeDocuments?: string;
  schemeApplicationType?: string;
  findNearbyOffice?: string;
}

export type AppScreen = "home" | "schemes" | "land" | "profile" | "apply_scheme" | "success" | "calculators" | "community" | "disease_detection" | "mandi_prices" | "admin" | "login" | "dashboard" | "farmer_profile" | "complete_profile";

// --- Verification and Application Type enums ---
export type VerificationStatus = "VERIFIED" | "VERIFICATION_REQUIRED" | "OFFLINE" | "LINK_UNAVAILABLE";
export type ApplicationType = "ONLINE" | "OFFLINE" | "BOTH" | "INFORMATION_ONLY";
export type GovernmentLevel = "CENTRAL" | "TAMIL_NADU" | "CENTRAL_AND_STATE";

export interface Scheme {
  id: string;
  // Legacy fields (preserved for backward compatibility)
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

  // --- New: Extended scheme data model ---
  scheme_id?: string;
  name_ta?: string;                        // Tamil scheme name
  department?: string;                     // Responsible government department
  government_level?: GovernmentLevel;      // CENTRAL | TAMIL_NADU | CENTRAL_AND_STATE
  description_ta?: string;                 // Tamil description
  eligibility_en?: string;                 // English eligibility criteria
  eligibility_ta?: string;                 // Tamil eligibility criteria
  benefits_en?: string;                    // English benefits
  benefits_ta?: string;                    // Tamil benefits
  documents_ta?: string[];                 // Tamil document list
  application_type?: ApplicationType;      // ONLINE | OFFLINE | BOTH | INFORMATION_ONLY
  official_info_url?: string | null;       // Official scheme information page URL
  official_application_url?: string | null; // Actual application portal URL
  official_source_domain?: string | null;  // Domain of the official source
  last_verified_date?: string | null;      // ISO date when URL was last verified
  verification_status?: VerificationStatus; // VERIFIED | VERIFICATION_REQUIRED | OFFLINE | LINK_UNAVAILABLE
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
