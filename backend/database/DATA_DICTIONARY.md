# Data Dictionary — Tamil Nadu Agricultural Master Database

## 1. Table: `tn_districts`

| Field Name | Data Type | Nullable | Primary/Foreign Key | Description & Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `district_code` | `VARCHAR(10)` | NO | PRIMARY KEY | Standard district code (e.g. `TN-SLM`). Pattern: `^TN-[A-Z]{3}$` |
| `district_name_en` | `VARCHAR(100)` | NO | UNIQUE | Official English district name (e.g. `Salem`) |
| `district_name_ta` | `VARCHAR(100)` | NO | UNIQUE | Official Tamil script district name (e.g. `சேலம்`) |
| `collector_office_address` | `TEXT` | NO | - | Address of District Collectorate office |
| `agriculture_office_address` | `TEXT` | NO | - | Address of Joint Director of Agriculture (JDA) office |
| `major_crops` | `TEXT[]` | NO | - | Array of dominant agricultural crops grown in district |
| `average_rainfall_mm` | `NUMERIC(6,2)` | NO | - | Average annual rainfall in mm (>0) |
| `soil_types` | `TEXT[]` | NO | - | Array of major soil types (e.g., Red Soil, Black Cotton Soil) |
| `climate_zone` | `VARCHAR(150)` | NO | - | Official agro-climatic zone classification |

---

## 2. Table: `tn_markets`

| Field Name | Data Type | Nullable | Description & Constraints |
| :--- | :--- | :--- | :--- |
| `unique_market_id` | `VARCHAR(20)` | NO (PK) | Unique Market UUID / ID (`TN-MKT-SLM-001`) |
| `official_market_code` | `VARCHAR(30)` | NO (UK) | AGMARKNET official market code (`TNAGMARK-SLM-AMP`) |
| `official_market_name_en` | `VARCHAR(150)` | NO | Full official English market name |
| `official_market_name_ta` | `VARCHAR(150)` | NO | Full official Tamil market name (`அம்மாபேட்டை உழவர் சந்தை`) |
| `common_name` | `VARCHAR(150)` | NO | Popular local market name |
| `district_en` | `VARCHAR(100)` | NO (FK) | References `tn_districts(district_name_en)` |
| `district_ta` | `VARCHAR(100)` | NO | Tamil district name (`சேலம்`) |
| `taluk` | `VARCHAR(100)` | NO | Revenue Taluk |
| `block` | `VARCHAR(100)` | NO | Panchayat Block |
| `revenue_village` | `VARCHAR(100)` | NO | Revenue Village name |
| `address` | `TEXT` | NO | Full street & postal address |
| `nearby_landmark` | `TEXT` | YES | Landmark reference (e.g. `Near Bus Terminal`) |
| `pincode` | `VARCHAR(6)` | NO | 6-digit Pincode (`^6[0-9]{5}$`) |
| `latitude` | `NUMERIC(9,6)` | NO | WGS84 Latitude (8.0°N to 14.0°N) |
| `longitude` | `NUMERIC(9,6)` | NO | WGS84 Longitude (76.0°E to 81.0°E) |
| `location` | `GEOMETRY` | YES | PostGIS Spatial Point (`SRID=4326`) |
| `google_maps_url` | `TEXT` | NO | Direct Google Maps navigation URL |
| `market_category` | `ENUM` | NO | `Uzhavar Sandhai`, `Regulated Market`, `Wholesale Market`, etc. |
| `ownership` | `ENUM` | NO | `Government of Tamil Nadu`, `Cooperative`, etc. |
| `managing_department` | `VARCHAR(150)` | NO | Managing authority |
| `market_status` | `ENUM` | NO | `Active`, `Maintenance`, `Seasonal`, `Inactive` |
| `opening_time` | `TIME` | NO | Daily opening time (e.g., `06:00:00`) |
| `closing_time` | `TIME` | NO | Daily closing time (e.g., `13:00:00`) |
| `working_days` | `VARCHAR(100)` | NO | e.g. `All 7 Days` |
| `phone_number` | `VARCHAR(20)` | NO | Primary contact number |
| `email` | `VARCHAR(100)` | YES | Validated email address format |
| `market_capacity_tons` | `NUMERIC(8,2)` | YES | Daily processing capacity in Metric Tons |
| `cold_storage_available` | `BOOLEAN` | NO | Availability of refrigeration facilities |
| `weighbridge_available` | `BOOLEAN` | NO | Digital weighbridge for vehicles/goods |
| `accessibility_friendly` | `BOOLEAN` | NO | Wheelchair & ramp accessibility |
| `last_verified_date` | `DATE` | NO | Date of last field verification |

---

## 3. Tamil Localization Glossary

| English Term | Standard Tamil Term | Usage Context |
| :--- | :--- | :--- |
| District | மாவட்டம் | Administrative boundary |
| Market / Mandi | சந்தை / அங்காடி | Agricultural trade center |
| Farmer Market | உழவர் சந்தை | Direct farmer-to-consumer market |
| Regulated Market | ஒழுங்குமுறை விற்பனைக்கூடம் | State-managed APMC market |
| Minimum Price | குறைந்தபட்ச விலை | Lowest traded price per Quintal |
| Maximum Price | அதிகபட்ச விலை | Highest traded price per Quintal |
| Modal Price | சராசரி / முகப்பு விலை | Most frequent transaction price |
| Cold Storage | குளிர்ந்த சேமிப்பகம் | Temperature controlled warehouse |
| Weighbridge | எடைமேடை | Electronic truck scale |
| Subsidy | மானியம் | Government financial assistance |
| Tractor | டிராக்டர் | Agricultural machinery |
