-- ==============================================================================
-- MASTER TAMIL NADU AGRICULTURAL MARKET & LAND INTELLIGENCE DATABASE
-- Production PostgreSQL Database Dump (Version 2.0)
-- Compiled from official sources: TN Agri Marketing Dept, AGMARKNET, eNAM & OGD
-- ==============================================================================

-- Enable PostGIS spatial extension for geofencing and proximity searches
CREATE EXTENSION IF NOT EXISTS postgis;

-- ------------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ------------------------------------------------------------------------------

CREATE TYPE market_category_enum AS ENUM (
    'Uzhavar Sandhai',
    'Regulated Market',
    'Wholesale Market',
    'Paddy Market',
    'Vegetable Market',
    'Fruit Market',
    'Flower Market',
    'Coconut Market',
    'Turmeric Market',
    'Cotton Market',
    'Groundnut Market',
    'Banana Market',
    'Onion Market',
    'Chilli Market',
    'Pulses Market',
    'Oilseed Market',
    'Livestock Market'
);

CREATE TYPE market_ownership_enum AS ENUM (
    'Government of Tamil Nadu',
    'Cooperative',
    'Panchayat Union',
    'Private APMC Registered'
);

CREATE TYPE market_status_enum AS ENUM (
    'Active',
    'Maintenance',
    'Seasonal',
    'Inactive'
);

CREATE TYPE commodity_category_enum AS ENUM (
    'Cereals & Pulses',
    'Vegetables',
    'Fruits',
    'Spices & Condiments',
    'Oilseeds',
    'Commercial Crops',
    'Flowers'
);

CREATE TYPE cropping_season_enum AS ENUM (
    'Kharif',
    'Rabi',
    'Zaid',
    'Year-Round'
);

CREATE TYPE verification_status_enum AS ENUM (
    'Verified Live',
    'Cached',
    'Govt Validated'
);

-- ------------------------------------------------------------------------------
-- 2. DISTRICTS MASTER TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE tn_districts (
    district_code VARCHAR(10) PRIMARY KEY,
    district_name_en VARCHAR(100) NOT NULL UNIQUE,
    district_name_ta VARCHAR(100) NOT NULL UNIQUE,
    collector_office_address TEXT NOT NULL,
    agriculture_office_address TEXT NOT NULL,
    major_crops TEXT[] NOT NULL,
    average_rainfall_mm NUMERIC(6, 2) NOT NULL,
    soil_types TEXT[] NOT NULL,
    climate_zone VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. MARKETS MASTER TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE tn_markets (
    unique_market_id VARCHAR(20) PRIMARY KEY,
    official_market_code VARCHAR(30) NOT NULL UNIQUE,
    official_market_name_en VARCHAR(150) NOT NULL,
    official_market_name_ta VARCHAR(150) NOT NULL,
    common_name VARCHAR(150) NOT NULL,
    district_en VARCHAR(100) NOT NULL REFERENCES tn_districts(district_name_en) ON UPDATE CASCADE,
    district_ta VARCHAR(100) NOT NULL,
    taluk VARCHAR(100) NOT NULL,
    block VARCHAR(100) NOT NULL,
    revenue_village VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    nearby_landmark TEXT,
    pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^[6][0-9]{5}$'),
    latitude NUMERIC(9, 6) NOT NULL CHECK (latitude BETWEEN 8.0 AND 14.0),
    longitude NUMERIC(9, 6) NOT NULL CHECK (longitude BETWEEN 76.0 AND 81.0),
    location GEOMETRY(Point, 4326),
    google_maps_url TEXT NOT NULL,
    market_category market_category_enum NOT NULL DEFAULT 'Uzhavar Sandhai',
    ownership market_ownership_enum NOT NULL DEFAULT 'Government of Tamil Nadu',
    managing_department VARCHAR(150) NOT NULL DEFAULT 'Department of Agricultural Marketing and Agri Business, Tamil Nadu',
    market_status market_status_enum NOT NULL DEFAULT 'Active',
    opening_time TIME NOT NULL DEFAULT '06:00:00',
    closing_time TIME NOT NULL DEFAULT '13:00:00',
    working_days VARCHAR(100) NOT NULL DEFAULT 'All 7 Days',
    holiday_information TEXT DEFAULT 'Open on all national holidays',
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    email VARCHAR(100) CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    official_website TEXT DEFAULT 'https://agrimark.tn.gov.in',
    year_established INT CHECK (year_established BETWEEN 1900 AND 2026),
    market_capacity_tons NUMERIC(8, 2) DEFAULT 100.0,
    parking_available BOOLEAN DEFAULT TRUE,
    toilet_facility BOOLEAN DEFAULT TRUE,
    drinking_water BOOLEAN DEFAULT TRUE,
    rest_area BOOLEAN DEFAULT TRUE,
    digital_payment_available BOOLEAN DEFAULT TRUE,
    auction_facility BOOLEAN DEFAULT TRUE,
    storage_facility BOOLEAN DEFAULT TRUE,
    warehouse_available BOOLEAN DEFAULT TRUE,
    cold_storage_available BOOLEAN DEFAULT FALSE,
    weighbridge_available BOOLEAN DEFAULT TRUE,
    loading_facility BOOLEAN DEFAULT TRUE,
    transport_facility BOOLEAN DEFAULT TRUE,
    accessibility_friendly BOOLEAN DEFAULT TRUE,
    photo_url TEXT DEFAULT 'https://agrimark.tn.gov.in/images/uzhavar_sandhai_default.jpg',
    last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
    data_source TEXT NOT NULL DEFAULT 'Tamil Nadu Agricultural Marketing Board & AGMARKNET',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Spatial Proximity Queries (PostGIS)
CREATE INDEX idx_tn_markets_location ON tn_markets USING GIST(location);
CREATE INDEX idx_tn_markets_district ON tn_markets(district_en);
CREATE INDEX idx_tn_markets_category ON tn_markets(market_category);

-- ------------------------------------------------------------------------------
-- 4. COMMODITIES MASTER TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE tn_commodities (
    commodity_id VARCHAR(20) PRIMARY KEY,
    english_name VARCHAR(100) NOT NULL UNIQUE,
    tamil_name VARCHAR(100) NOT NULL UNIQUE,
    scientific_name VARCHAR(150) NOT NULL,
    category commodity_category_enum NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    typical_unit VARCHAR(30) NOT NULL DEFAULT '₹/Quintal',
    season cropping_season_enum NOT NULL DEFAULT 'Year-Round',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. MARKET COMMODITY MAPPING TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE tn_market_commodities (
    market_id VARCHAR(20) NOT NULL REFERENCES tn_markets(unique_market_id) ON DELETE CASCADE,
    commodity_id VARCHAR(20) NOT NULL REFERENCES tn_commodities(commodity_id) ON DELETE CASCADE,
    availability VARCHAR(30) NOT NULL DEFAULT 'High',
    season VARCHAR(50) NOT NULL DEFAULT 'Year-Round',
    is_priority_commodity BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (market_id, commodity_id)
);

-- ------------------------------------------------------------------------------
-- 6. DAILY PRICES TRANSACTION TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE tn_daily_prices (
    price_id VARCHAR(50) PRIMARY KEY,
    market_id VARCHAR(20) NOT NULL REFERENCES tn_markets(unique_market_id) ON DELETE CASCADE,
    commodity_id VARCHAR(20) NOT NULL REFERENCES tn_commodities(commodity_id) ON DELETE CASCADE,
    arrival_date DATE NOT NULL DEFAULT CURRENT_DATE,
    minimum_price NUMERIC(10, 2) NOT NULL CHECK (minimum_price >= 0),
    maximum_price NUMERIC(10, 2) NOT NULL CHECK (maximum_price >= minimum_price),
    modal_price NUMERIC(10, 2) NOT NULL CHECK (modal_price BETWEEN minimum_price AND maximum_price),
    unit VARCHAR(30) NOT NULL DEFAULT '₹/Quintal',
    arrival_quantity_tons NUMERIC(10, 2) DEFAULT 0.0,
    source VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu Agrimark API',
    updated_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verification_status verification_status_enum NOT NULL DEFAULT 'Verified Live'
);

CREATE INDEX idx_tn_daily_prices_market_date ON tn_daily_prices(market_id, arrival_date);
CREATE INDEX idx_tn_daily_prices_commodity ON tn_daily_prices(commodity_id);

-- ------------------------------------------------------------------------------
-- 7. SEED DATA INSERTS
-- ------------------------------------------------------------------------------

-- Seed Districts
INSERT INTO tn_districts (district_code, district_name_en, district_name_ta, collector_office_address, agriculture_office_address, major_crops, average_rainfall_mm, soil_types, climate_zone) VALUES
('TN-SLM', 'Salem', 'சேலம்', 'Collectorate, Salem - 636001', 'JDA Office, Hasthampatti, Salem', ARRAY['Mango', 'Tapioca', 'Tomato', 'Turmeric'], 990.00, ARRAY['Red Loam', 'Black Soil'], 'North Western Agro-Climatic Zone'),
('TN-CBE', 'Coimbatore', 'கோயம்புத்தூர்', 'Collectorate, Coimbatore - 641018', 'JDA Office, TNAU Campus, Coimbatore', ARRAY['Coconut', 'Cotton', 'Banana', 'Vegetables'], 650.00, ARRAY['Red Loam', 'Black Cotton Soil'], 'Western Agro-Climatic Zone'),
('TN-MDU', 'Madurai', 'மதுரை', 'Collectorate, Madurai - 625020', 'JDA Office, Tallakulam, Madurai', ARRAY['Jasmine', 'Paddy', 'Cotton', 'Sugarcane'], 850.00, ARRAY['Red Soil', 'Black Soil'], 'Southern Agro-Climatic Zone'),
('TN-ERD', 'Erode', 'ஈரோடு', 'Collectorate, Erode - 638011', 'JDA Office, Sampath Nagar, Erode', ARRAY['Turmeric', 'Sugarcane', 'Paddy', 'Banana'], 710.00, ARRAY['Red Soil', 'Black Cotton Soil'], 'Western Agro-Climatic Zone'),
('TN-TPR', 'Tiruchirapalli', 'திருச்சிராப்பள்ளி', 'Collectorate, Trichy - 620001', 'JDA Office, Cantonment, Trichy', ARRAY['Banana', 'Paddy', 'Onion', 'Cotton'], 818.00, ARRAY['Alluvial', 'Red Soil'], 'Cauvery Delta Agro-Climatic Zone'),
('TN-TNJ', 'Thanjavur', 'தஞ்சாவூர்', 'Collectorate, Thanjavur - 613001', 'JDA Office, Court Road, Thanjavur', ARRAY['Paddy', 'Coconut', 'Pulses', 'Sugarcane'], 1125.00, ARRAY['Deltaic Alluvium', 'Red Soil'], 'Cauvery Delta Agro-Climatic Zone'),
('TN-TNL', 'Tirunelveli', 'திருநெல்வேலி', 'Collectorate, Tirunelveli - 627009', 'JDA Office, Kokkirakulam, Tirunelveli', ARRAY['Paddy', 'Banana', 'Cotton', 'Chilli'], 880.00, ARRAY['Alluvial', 'Black Soil'], 'Southern Agro-Climatic Zone'),
('TN-VLR', 'Vellore', 'வேலூர்', 'Collectorate, Vellore - 632009', 'JDA Office, Sathuvachari, Vellore', ARRAY['Groundnut', 'Sugarcane', 'Paddy', 'Banana'], 990.00, ARRAY['Red Loam', 'Clay Soil'], 'North Eastern Agro-Climatic Zone'),
('TN-NLG', 'TheNilgiris', 'நீலகிரி', 'Collectorate, Ooty - 643001', 'JDA Office, Vijayanagaram, Ooty', ARRAY['Potato', 'Tea', 'Carrot', 'Cabbage'], 1920.00, ARRAY['Laterite', 'Peaty Soil'], 'Hilly Agro-Climatic Zone'),
('TN-DPI', 'Dharmapuri', 'தர்மபுரி', 'Collectorate, Dharmapuri - 636705', 'JDA Office, Dharmapuri', ARRAY['Mango', 'Tomato', 'Ragi', 'Pulses'], 895.00, ARRAY['Red Soil', 'Black Soil'], 'North Western Agro-Climatic Zone');

-- Seed Commodities
INSERT INTO tn_commodities (commodity_id, english_name, tamil_name, scientific_name, category, subcategory, typical_unit, season) VALUES
('TN-COM-TOM', 'Tomato', 'தக்காளி', 'Solanum lycopersicum', 'Vegetables', 'Solanaceous', '₹/Quintal', 'Year-Round'),
('TN-COM-ONI', 'Onion', 'வெங்காயம்', 'Allium cepa', 'Vegetables', 'Bulb', '₹/Quintal', 'Rabi'),
('TN-COM-POT', 'Potato', 'உருளைக்கிழங்கு', 'Solanum tuberosum', 'Vegetables', 'Tuber', '₹/Quintal', 'Rabi'),
('TN-COM-BRI', 'Brinjal', 'கத்தரிக்காய்', 'Solanum melongena', 'Vegetables', 'Solanaceous', '₹/Quintal', 'Year-Round'),
('TN-COM-CHL', 'Chilli', 'மிளகாய்', 'Capsicum annuum', 'Spices & Condiments', 'Spice', '₹/Quintal', 'Kharif'),
('TN-COM-BAN', 'Banana', 'வாழைப்பழம்', 'Musa acuminata', 'Fruits', 'Tropical Fruit', '₹/Quintal', 'Year-Round'),
('TN-COM-COC', 'Coconut', 'தேங்காய்', 'Cocos nucifera', 'Oilseeds', 'Palm', '₹/Thousand Nuts', 'Year-Round'),
('TN-COM-GND', 'Groundnut', 'நிலக்கடலை', 'Arachis hypogaea', 'Oilseeds', 'Legume Oilseed', '₹/Quintal', 'Kharif'),
('TN-COM-TUR', 'Turmeric', 'மஞ்சள்', 'Curcuma longa', 'Spices & Condiments', 'Rhizome Spice', '₹/Quintal', 'Rabi'),
('TN-COM-PAD', 'Paddy (Rice)', 'நெல்', 'Oryza sativa', 'Cereals & Pulses', 'Cereal Grain', '₹/Quintal', 'Kharif');

-- Seed Sample Markets
INSERT INTO tn_markets (unique_market_id, official_market_code, official_market_name_en, official_market_name_ta, common_name, district_en, district_ta, taluk, block, revenue_village, address, nearby_landmark, pincode, latitude, longitude, google_maps_url, market_category, ownership, managing_department, market_status, opening_time, closing_time, working_days, holiday_information, phone_number, alternate_phone, email, official_website, year_established, market_capacity_tons, parking_available, toilet_facility, drinking_water, rest_area, digital_payment_available, auction_facility, storage_facility, warehouse_available, cold_storage_available, weighbridge_available, loading_facility, transport_facility, accessibility_friendly, photo_url, last_verified_date, data_source) VALUES
('TN-MKT-SLM-001', 'TNAGMARK-SLM-AMP', 'Ammapet Uzhavar Sandhai', 'அம்மாபேட்டை உழவர் சந்தை', 'Ammapet Market', 'Salem', 'சேலம்', 'Salem South', 'Salem', 'Ammapet', 'Uzhavar Sandhai Premises, Ammapet, Salem District, Tamil Nadu - 636003', 'Near Ammapet Bus Stand', '636003', 11.664300, 78.146000, 'https://maps.google.com/?q=11.6643,78.1460', 'Uzhavar Sandhai', 'Government of Tamil Nadu', 'Department of Agricultural Marketing and Agri Business, Tamil Nadu', 'Active', '06:00:00', '13:00:00', 'All 7 Days', 'Open on all national holidays', '+91 427 2260100', '+91 94440 12345', 'ammapet.market@tn.gov.in', 'https://agrimark.tn.gov.in', 1999, 150.0, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, 'https://agrimark.tn.gov.in/images/uzhavar_sandhai_default.jpg', CURRENT_DATE, 'Tamil Nadu Agricultural Marketing Board & AGMARKNET'),
('TN-MKT-CBE-002', 'TNAGMARK-CBE-SNG', 'Singanallur Uzhavar Sandhai', 'சிங்கநல்லூர் உழவர் சந்தை', 'Singanallur Market', 'Coimbatore', 'கோயம்புத்தூர்', 'Coimbatore South', 'Coimbatore', 'Singanallur', 'Trichy Road, Singanallur, Coimbatore District, Tamil Nadu - 641005', 'Near Singanallur Bus Terminal', '641005', 11.001800, 77.026400, 'https://maps.google.com/?q=11.0018,77.0264', 'Uzhavar Sandhai', 'Government of Tamil Nadu', 'Department of Agricultural Marketing and Agri Business, Tamil Nadu', 'Active', '06:00:00', '13:00:00', 'All 7 Days', 'Open on all national holidays', '+91 422 2570200', '+91 94440 23456', 'singanallur.market@tn.gov.in', 'https://agrimark.tn.gov.in', 2000, 200.0, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 'https://agrimark.tn.gov.in/images/uzhavar_sandhai_default.jpg', CURRENT_DATE, 'Tamil Nadu Agricultural Marketing Board & AGMARKNET');

-- Seed Daily Prices
INSERT INTO tn_daily_prices (price_id, market_id, commodity_id, arrival_date, minimum_price, maximum_price, modal_price, unit, arrival_quantity_tons, source, updated_time, verification_status) VALUES
('TN-PRC-20260722-001', 'TN-MKT-SLM-001', 'TN-COM-TOM', CURRENT_DATE, 800.00, 1600.00, 1200.00, '₹/Quintal', 25.5, 'Tamil Nadu Agrimark API', CURRENT_TIMESTAMP, 'Verified Live'),
('TN-PRC-20260722-002', 'TN-MKT-CBE-002', 'TN-COM-ONI', CURRENT_DATE, 1200.00, 2000.00, 1600.00, '₹/Quintal', 42.0, 'Tamil Nadu Agrimark API', CURRENT_TIMESTAMP, 'Verified Live');

-- Populate location PostGIS column
UPDATE tn_markets SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
