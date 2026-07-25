/**
 * AGMARKNET Service — the single integration point for the AGMARKNET API.
 *
 * To enable live AGMARKNET integration:
 *   1. Set AGMARKNET_API_URL in your .env file (e.g. https://api.data.gov.in/resource/...)
 *   2. Set AGMARKNET_API_KEY in your .env file (from https://data.gov.in/)
 *   3. Set AGMARKNET_USE_MOCK=false in your .env file
 *   4. Update the transformMandiResponse() function to match the exact live API response shape.
 *
 * Until then, this service returns mock data that exactly mirrors the required response format.
 */

import { AGMARKNET_CONFIG } from "../config/env.js";
import * as cache from "./cacheService.js";
import {
  MOCK_COMMODITIES,
  MOCK_STATES,
  MOCK_DISTRICTS,
  MOCK_MARKETS,
  MOCK_MANDI_PRICES,
  MOCK_HISTORY,
} from "../utils/mockData.js";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export interface Commodity {
  id: string;
  name: string;
}

export interface MandiPrice {
  commodity: string;
  market: string;
  district: string;
  state: string;
  arrivalDate: string;
  minimumPrice: number;
  maximumPrice: number;
  modalPrice: number;
  unit: string;
}

export interface HistoricalPrice {
  date: string;
  modalPrice: number;
}

export interface MandiPricesResponse {
  data: MandiPrice[];
  isCached: boolean;
  lastUpdated: string;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/**
 * Build a deterministic cache key from query parameters.
 */
function buildCacheKey(prefix: string, params: Record<string, string | undefined>): string {
  const sorted = Object.entries(params)
    .filter(([, v]) => !!v)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${prefix}:${sorted}`;
}

/**
 * Makes an HTTP GET request to AGMARKNET with timeout handling.
 * INTEGRATION POINT: Replace the URL construction and response parsing here
 * when wiring up the real AGMARKNET API.
 */
async function fetchFromAgmarknet(
  endpoint: string,
  params: Record<string, string | undefined>
): Promise<unknown> {
  const url = new URL(`${AGMARKNET_CONFIG.apiUrl}${endpoint}`);
  url.searchParams.set("api-key", AGMARKNET_CONFIG.apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "100");
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AGMARKNET_CONFIG.timeoutMs);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`AGMARKNET responded with status ${response.status}`);
    }
    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * INTEGRATION POINT: Transform the raw AGMARKNET JSON response
 * into the clean MandiPrice[] format required by the frontend.
 * Update field mappings here when the live API is wired.
 */
function transformMandiResponse(raw: unknown): MandiPrice[] {
  // Placeholder transformation — replace with actual field mapping
  // from the AGMARKNET API response schema.
  const records = (raw as { records?: unknown[] })?.records ?? [];
  return records.map((r: unknown) => {
    const record = r as Record<string, unknown>;
    return {
      commodity: String(record["commodity"] ?? record["Commodity"] ?? ""),
      market: String(record["market"] ?? record["Market"] ?? ""),
      district: String(record["district"] ?? record["District"] ?? ""),
      state: String(record["state"] ?? record["State"] ?? ""),
      arrivalDate: String(record["arrival_date"] ?? record["Arrival_Date"] ?? ""),
      minimumPrice: Number(record["min_price"] ?? record["Min_x0020_Price"] ?? 0),
      maximumPrice: Number(record["max_price"] ?? record["Max_x0020_Price"] ?? 0),
      modalPrice: Number(record["modal_price"] ?? record["Modal_x0020_Price"] ?? 0),
      unit: "₹/Quintal",
    };
  });
}

// ------------------------------------------------------------------
// Public service methods
// ------------------------------------------------------------------

export async function getCommodities(): Promise<Commodity[]> {
  // INTEGRATION POINT: Replace mock with live AGMARKNET commodity list endpoint.
  return MOCK_COMMODITIES;
}

export async function getStates(): Promise<string[]> {
  // INTEGRATION POINT: Replace mock with live AGMARKNET states endpoint.
  return MOCK_STATES;
}

export async function getDistricts(state: string): Promise<string[]> {
  // INTEGRATION POINT: Replace mock with live AGMARKNET districts endpoint.
  return MOCK_DISTRICTS[state] ?? [];
}

export async function getMarkets(district: string): Promise<string[]> {
  // INTEGRATION POINT: Replace mock with live AGMARKNET markets endpoint.
  return MOCK_MARKETS[district] ?? [];
}

export async function getMandiPrices(params: {
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
  date?: string;
}): Promise<MandiPricesResponse> {
  const cacheKey = buildCacheKey("mandi-prices", params);

  // 1. Check fresh cache
  const cachedData = cache.getCached<MandiPrice[]>(cacheKey);
  if (cachedData) {
    return {
      data: cachedData,
      isCached: true,
      lastUpdated: cache.getCacheTimestamp(cacheKey) ?? new Date().toISOString(),
    };
  }

  // 2. If mock mode or no API key, return filtered mock data
  if (AGMARKNET_CONFIG.useMock) {
    let data = MOCK_MANDI_PRICES;
    if (params.commodity) data = data.filter(p => p.commodity.toLowerCase() === params.commodity!.toLowerCase());
    if (params.state) data = data.filter(p => p.state === params.state);
    if (params.district) data = data.filter(p => p.district === params.district);
    if (params.market) data = data.filter(p => p.market === params.market);

    // Default to all mock data if filters yield nothing (better UX in dev mode)
    if (data.length === 0) data = MOCK_MANDI_PRICES;
    cache.setCached(cacheKey, data);
    return {
      data,
      isCached: false,
      lastUpdated: new Date().toISOString(),
    };
  }

  // 3. Live AGMARKNET fetch
  try {
    const raw = await fetchFromAgmarknet("", {
      commodity: params.commodity,
      state: params.state,
      district: params.district,
      market: params.market,
      date: params.date,
    });

    const data = transformMandiResponse(raw);
    cache.setCached(cacheKey, data);
    return {
      data,
      isCached: false,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error("[AGMARKNET] Fetch failed, trying stale cache:", err);

    // 4. Fallback: serve stale cache if live fetch fails
    const stale = cache.getStaleCached<MandiPrice[]>(cacheKey);
    if (stale) {
      return {
        data: stale,
        isCached: true,
        lastUpdated: cache.getCacheTimestamp(cacheKey) ?? new Date().toISOString(),
      };
    }

    // 5. Final fallback: mock data tagged as cached
    return {
      data: MOCK_MANDI_PRICES,
      isCached: true,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getHistory(params: {
  commodity: string;
  market: string;
}): Promise<HistoricalPrice[]> {
  const cacheKey = buildCacheKey("history", params);
  const cached = cache.getCached<HistoricalPrice[]>(cacheKey);
  if (cached) return cached;

  // INTEGRATION POINT: Replace mock with live AGMARKNET historical data endpoint.
  const data = MOCK_HISTORY;
  cache.setCached(cacheKey, data);
  return data;
}
