/**
 * Mock data for AGMARKNET integration — Tamil Nadu Only.
 * These responses exactly mirror the expected live API response format.
 * When live AGMARKNET integration is enabled, the agmarknetService.ts will
 * replace these with real fetched data — the frontend requires NO changes.
 */

export const MOCK_COMMODITIES = [
  { id: "PADDY", name: "Paddy" },
  { id: "TOMATO", name: "Tomato" },
  { id: "ONION", name: "Onion" },
  { id: "COCONUT", name: "Coconut" },
  { id: "BANANA", name: "Banana" },
  { id: "COTTON", name: "Cotton" },
  { id: "GROUNDNUT", name: "Groundnut" },
  { id: "TURMERIC", name: "Turmeric" },
  { id: "CHILLI", name: "Chilli" },
  { id: "BRINJAL", name: "Brinjal" },
  { id: "MAIZE", name: "Maize" },
  { id: "SUGARCANE", name: "Sugarcane" },
  { id: "BLACK_GRAM", name: "Black Gram" },
  { id: "GREEN_GRAM", name: "Green Gram" },
  { id: "SESAME", name: "Sesame" },
  { id: "RAGI", name: "Ragi" },
  { id: "MILLETS", name: "Millets" },
];

// Tamil Nadu only
export const MOCK_STATES = ["Tamil Nadu"];

// Tamil Nadu districts from user specifications
export const MOCK_DISTRICTS: Record<string, string[]> = {
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Salem",
    "Erode",
    "Tiruppur",
    "Tirunelveli",
    "Thanjavur",
    "Trichy",
    "Dindigul",
    "Villupuram",
    "Kanyakumari",
    "Namakkal",
    "Karur",
    "Cuddalore",
    "Thoothukudi",
    "Dharmapuri",
    "Krishnagiri",
    "Sivagangai",
    "Ramanathapuram",
  ],
};

export const MOCK_MARKETS: Record<string, string[]> = {
  "Chennai": ["Koyambedu", "Madhavaram", "Tambaram"],
  "Coimbatore": ["R.S.Puram", "Singanallur", "Pollachi", "Vadavalli"],
  "Madurai": ["Anna Nagar", "Chokkikulam", "Palanganatham", "Melur"],
  "Salem": ["Ammapet", "Attur", "Hasthampatti", "Edapadi"],
  "Erode": ["Gobichettipalayam", "Perundurai", "Sampath Nagar"],
  "Tiruppur": ["Tiruppur Market", "Kangayam", "Dharapuram"],
  "Tirunelveli": ["Palayamkottai", "Melapalayam", "Ambasamudram"],
  "Thanjavur": ["Kumbakonam", "Pattukottai", "Papanasam"],
  "Trichy": ["Gandhi Market", "K.K.Nagar", "Thuraiyur"],
  "Dindigul": ["Dindigul Market", "Oddanchatram", "Palani"],
  "Villupuram": ["Villupuram Market", "Tindivanam", "Gingee"],
  "Kanyakumari": ["Nagercoil", "Marthandam", "Thuckalay"],
  "Namakkal": ["Namakkal Market", "Rasipuram", "Tiruchengode"],
  "Karur": ["Karur Market", "Kulithalai", "Aravakurichi"],
  "Cuddalore": ["Cuddalore Market", "Chidambaram", "Panruti"],
  "Thoothukudi": ["Thoothukudi Market", "Kovilpatti", "Tiruchendur"],
  "Dharmapuri": ["Dharmapuri Market", "Harur", "Pennagaram"],
  "Krishnagiri": ["Krishnagiri Market", "Hosur", "Pochampalli"],
  "Sivagangai": ["Sivagangai Market", "Karaikudi", "Devakottai"],
  "Ramanathapuram": ["Ramanathapuram Market", "Paramakudi", "Rameswaram"],
};

const today = new Date().toISOString().split("T")[0];

export const MOCK_MANDI_PRICES = [
  {
    commodity: "Tomato",
    market: "Ammapet",
    district: "Salem",
    state: "Tamil Nadu",
    arrivalDate: today,
    minimumPrice: 800,
    maximumPrice: 1600,
    modalPrice: 1200,
    unit: "₹/Quintal",
  },
  {
    commodity: "Onion",
    market: "Singanallur",
    district: "Coimbatore",
    state: "Tamil Nadu",
    arrivalDate: today,
    minimumPrice: 1200,
    maximumPrice: 2000,
    modalPrice: 1600,
    unit: "₹/Quintal",
  },
  {
    commodity: "Paddy",
    market: "Koyambedu",
    district: "Chennai",
    state: "Tamil Nadu",
    arrivalDate: today,
    minimumPrice: 1800,
    maximumPrice: 2400,
    modalPrice: 2100,
    unit: "₹/Quintal",
  },
  {
    commodity: "Banana",
    market: "Pollachi",
    district: "Coimbatore",
    state: "Tamil Nadu",
    arrivalDate: today,
    minimumPrice: 2000,
    maximumPrice: 3500,
    modalPrice: 2750,
    unit: "₹/Quintal",
  },
  {
    commodity: "Coconut",
    market: "Papanasam",
    district: "Thanjavur",
    state: "Tamil Nadu",
    arrivalDate: today,
    minimumPrice: 1500,
    maximumPrice: 2500,
    modalPrice: 2000,
    unit: "₹/Quintal",
  },
  {
    commodity: "Cotton",
    market: "Attur",
    district: "Salem",
    state: "Tamil Nadu",
    arrivalDate: today,
    minimumPrice: 6000,
    maximumPrice: 8500,
    modalPrice: 7250,
    unit: "₹/Quintal",
  },
  {
    commodity: "Groundnut",
    market: "Gobichettipalayam",
    district: "Erode",
    state: "Tamil Nadu",
    arrivalDate: today,
    minimumPrice: 5500,
    maximumPrice: 7500,
    modalPrice: 6500,
    unit: "₹/Quintal",
  },
  {
    commodity: "Turmeric",
    market: "Sampath Nagar",
    district: "Erode",
    state: "Tamil Nadu",
    arrivalDate: today,
    minimumPrice: 7000,
    maximumPrice: 10000,
    modalPrice: 8500,
    unit: "₹/Quintal",
  },
];

export const MOCK_HISTORY = [
  { date: "2026-07-13", modalPrice: 1100 },
  { date: "2026-07-14", modalPrice: 1150 },
  { date: "2026-07-15", modalPrice: 1300 },
  { date: "2026-07-16", modalPrice: 1250 },
  { date: "2026-07-17", modalPrice: 1400 },
  { date: "2026-07-18", modalPrice: 1350 },
  { date: "2026-07-19", modalPrice: 1200 },
  { date: "2026-07-20", modalPrice: 1100 },
  { date: "2026-07-21", modalPrice: 1150 },
  { date: "2026-07-22", modalPrice: 1200 },
];
