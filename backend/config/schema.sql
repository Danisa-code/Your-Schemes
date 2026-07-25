-- schema.sql
-- Run this in the Supabase SQL Editor to set up the database tables

-- Table for storing Mandi Prices
CREATE TABLE IF NOT EXISTS mandi_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district VARCHAR(255) NOT NULL,
    market VARCHAR(255) NOT NULL,
    commodity VARCHAR(255) NOT NULL,
    variety VARCHAR(255) NOT NULL,
    grade VARCHAR(50) DEFAULT 'N/A',
    arrival_date DATE NOT NULL,
    min_price NUMERIC(10,2) NOT NULL,
    max_price NUMERIC(10,2) NOT NULL,
    modal_price NUMERIC(10,2) NOT NULL,
    source VARCHAR(255) DEFAULT 'Tamil Nadu Agrimark',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (district, market, commodity, variety, arrival_date)
);

-- Indices for rapid querying and filtering
CREATE INDEX IF NOT EXISTS idx_mandi_prices_district ON mandi_prices(district);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_commodity ON mandi_prices(commodity);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_arrival_date ON mandi_prices(arrival_date);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_market ON mandi_prices(market);

-- Table for tracking scraper logs
CREATE TABLE IF NOT EXISTS scraper_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_time TIMESTAMPTZ DEFAULT NOW(),
    rows_inserted INTEGER DEFAULT 0,
    rows_updated INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'FAILED', 'PARTIAL'
    errors TEXT,
    next_run TIMESTAMPTZ
);
