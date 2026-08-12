/**
 * Master Tamil Nadu Agricultural Database — TypeScript Definitions
 * Official schema powering the Farmer Assistance & Land Intelligence Portal.
 */

export interface TNDistrict {
  districtCode: string;           // e.g. "TN-SLM"
  districtNameEn: string;         // e.g. "Salem"
  districtNameTa: string;         // e.g. "சேலம்"
  collectorOfficeAddress: string; // Official Collectorate address
  agricultureOfficeAddress: string; // Joint Director of Agriculture office address
  majorCrops: string[];           // Primary crops grown in district
  averageRainfallMm: number;      // Annual avg rainfall in mm
  soilTypes: string[];            // Main soil categories (Red Soil, Black Soil, etc.)
  climateZone: string;            // Agro-climatic zone classification
}

export type MarketCategory = 
  | "Uzhavar Sandhai"
  | "Regulated Market"
  | "Wholesale Market"
  | "Paddy Market"
  | "Vegetable Market"
  | "Fruit Market"
  | "Flower Market"
  | "Coconut Market"
  | "Turmeric Market"
  | "Cotton Market"
  | "Groundnut Market"
  | "Banana Market"
  | "Onion Market"
  | "Chilli Market"
  | "Pulses Market"
  | "Oilseed Market"
  | "Livestock Market";

export type MarketOwnership = "Government of Tamil Nadu" | "Cooperative" | "Panchayat Union" | "Private APMC Registered";

export interface TNMarket {
  uniqueMarketId: string;         // e.g. "TN-MKT-SLM-001"
  officialMarketCode: string;     // e.g. "TNAGMARK-SLM-AMP"
  officialMarketNameEn: string;   // e.g. "Ammapet Uzhavar Sandhai"
  officialMarketNameTa: string;   // e.g. "அம்மாபேட்டை உழவர் சந்தை"
  commonName: string;             // e.g. "Ammapet Market"
  districtEn: string;             // e.g. "Salem"
  districtTa: string;             // e.g. "சேலம்"
  taluk: string;                  // e.g. "Salem South"
  block: string;                  // e.g. "Salem"
  revenueVillage: string;         // e.g. "Ammapet"
  address: string;                // Full address
  nearbyLandmark: string;         // Landmark info
  pincode: string;                // 6-digit Pincode
  latitude: number;               // GIS Latitude
  longitude: number;              // GIS Longitude
  googleMapsUrl: string;          // Direct maps link
  marketCategory: MarketCategory; // Primary category
  ownership: MarketOwnership;     // Ownership authority
  managingDepartment: string;     // e.g. "Agricultural Marketing and Agri Business Department"
  marketStatus: "Active" | "Maintenance" | "Seasonal" | "Inactive";
  openingTime: string;            // e.g. "06:00"
  closingTime: string;            // e.g. "13:00"
  workingDays: string;            // e.g. "All 7 Days"
  holidayInformation: string;     // Holiday rules
  phoneNumber: string;            // Primary phone
  alternatePhone: string;         // Secondary phone
  email: string;                  // Official email
  officialWebsite: string;        // Official URL
  yearEstablished: number;        // Year founded
  marketCapacityTons: number;     // Daily capacity in Metric Tons
  parkingAvailable: boolean;      // Amenities
  toiletFacility: boolean;
  drinkingWater: boolean;
  restArea: boolean;
  digitalPaymentAvailable: boolean;
  auctionFacility: boolean;
  storageFacility: boolean;
  warehouseAvailable: boolean;
  coldStorageAvailable: boolean;
  weighbridgeAvailable: boolean;
  loadingFacility: boolean;
  transportFacility: boolean;
  accessibilityFriendly: boolean; // Wheelchair access
  photoUrl: string;               // Market photo
  lastVerifiedDate: string;       // ISO Date
  dataSource: string;             // Government source reference
}

export type CommodityCategory = 
  | "Cereals & Pulses" 
  | "Vegetables" 
  | "Fruits" 
  | "Spices & Condiments" 
  | "Oilseeds" 
  | "Commercial Crops" 
  | "Flowers";

export interface TNCommodity {
  commodityId: string;            // e.g. "TN-COM-TOM"
  englishName: string;            // e.g. "Tomato"
  tamilName: string;              // e.g. "தக்காளி"
  scientificName: string;         // e.g. "Solanum lycopersicum"
  category: CommodityCategory;    // Primary category
  subcategory: string;            // Sub-category designation
  typicalUnit: string;            // e.g. "₹/Quintal" or "₹/Kg"
  season: "Kharif" | "Rabi" | "Zaid" | "Year-Round";
  imageUrl?: string;
}

export interface TNMarketCommodityMapping {
  marketId: string;
  commodityId: string;
  availability: "High" | "Medium" | "Low" | "Seasonal";
  season: string;
  isPriorityCommodity: boolean;
}

export interface TNDailyPrice {
  priceId: string;                // Unique record UUID/ID
  marketId: string;               // Foreign Key -> TNMarket
  commodityId: string;            // Foreign Key -> TNCommodity
  arrivalDate: string;            // YYYY-MM-DD
  minimumPrice: number;           // INR per Quintal
  maximumPrice: number;           // INR per Quintal
  modalPrice: number;             // INR per Quintal (Most common transaction price)
  unit: string;                   // "₹/Quintal"
  arrivalQuantityTons: number;    // Daily volume arrived
  source: string;                 // Source tag
  updatedTime: string;            // ISO Timestamp
  verificationStatus: "Verified Live" | "Cached" | "Govt Validated";
}

export interface TNMasterDataset {
  districts: TNDistrict[];
  markets: TNMarket[];
  commodities: TNCommodity[];
  marketCommodityMappings: TNMarketCommodityMapping[];
  dailyPrices: TNDailyPrice[];
  metadata: {
    datasetVersion: string;
    totalDistricts: number;
    totalMarkets: number;
    totalCommodities: number;
    totalPriceRecords: number;
    lastGenerated: string;
    authority: string;
  };
}
