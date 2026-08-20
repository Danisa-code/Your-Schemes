import axios, { AxiosRequestConfig } from "axios";
import { localMandiService } from "./localMandiService";

// Redirect to local Node.js Express server on port 3000
const BASE_URL = "/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

/**
 * Executes an Axios request with a retry policy.
 */
async function requestWithRetry<T>(config: AxiosRequestConfig, retries = 1, delayMs = 500): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Request failed");
}

export interface Commodity {
  id: string;
  name: string;
  displayName?: string;
  category?: string;
  marketCount?: number;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  unit?: string;
  source?: string;
}

export interface MandiPrice {
  commodity: string;
  variety?: string;
  market: string;
  district: string;
  state: string;
  arrivalDate: string;
  minimumPrice: number;
  maximumPrice: number;
  modalPrice: number;
  unit: string;
  source?: string;
}

export interface MandiPricesResponse {
  data: MandiPrice[];
  isCached: boolean;
  lastUpdated: string;
  source?: string;
}

export interface HistoricalPrice {
  date: string;
  modalPrice: number;
  minPrice?: number;
  maxPrice?: number;
}

export const marketApi = {
  getCommodities: async (): Promise<Commodity[]> => {
    try {
      const res = await requestWithRetry<any>({ url: "/commodities", method: "GET" });
      const rawList = Array.isArray(res) ? res : (res.data || []);
      if (rawList.length > 0) {
        return rawList.map((item: any, idx: number) => ({
          id: item.id || item.name || String(idx),
          name: item.name || item.displayName || "Unknown",
          displayName: item.displayName || item.name,
          category: item.category,
          marketCount: item.marketCount,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          modalPrice: item.modalPrice,
          unit: item.unit || "₹/Kg",
          source: item.source,
        }));
      }
    } catch (err) {
      console.warn("[MarketAPI] Backend commodities unavailable, using official TN dataset fallback");
    }
    return localMandiService.getCommodities();
  },

  getStates: (): Promise<string[]> => Promise.resolve(["Tamil Nadu"]),

  getDistricts: async (_state?: string): Promise<string[]> => {
    try {
      const res = await requestWithRetry<any>({ url: "/districts", method: "GET" });
      const list = Array.isArray(res) ? res : (res.data || []);
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("[MarketAPI] Districts API unavailable, using fallback");
    }
    const commodities = localMandiService.getMandiPrices();
    const set = new Set<string>();
    commodities.data.forEach((r) => { if (r.district) set.add(r.district); });
    return Array.from(set).sort();
  },

  getMarkets: async (district?: string): Promise<string[]> => {
    try {
      const res = await requestWithRetry<any>({
        url: `/markets${district && district !== "All" ? `?district=${encodeURIComponent(district)}` : ""}`,
        method: "GET",
      });
      const list = Array.isArray(res) ? res : (res.data || []);
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("[MarketAPI] Markets API unavailable, using fallback");
    }
    const prices = localMandiService.getMandiPrices(undefined, district);
    const set = new Set<string>();
    prices.data.forEach((r) => { if (r.market) set.add(r.market); });
    return Array.from(set).sort();
  },

  getMandiPrices: async (params: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    date?: string;
    refresh?: boolean;
  }): Promise<MandiPricesResponse> => {
    const queryParams = new URLSearchParams();
    if (params.commodity) queryParams.set("commodity", params.commodity);
    if (params.district) queryParams.set("district", params.district);
    if (params.market) queryParams.set("market", params.market);
    if (params.refresh) queryParams.set("refresh", "true");

    const qs = queryParams.toString();
    try {
      const res = await requestWithRetry<any>({
        url: `/mandi-prices${qs ? "?" + qs : ""}`,
        method: "GET",
      });
      const dataList: MandiPrice[] = (res.data || []).map((item: any) => ({
        commodity: item.commodity,
        variety: item.variety || "Common / Local",
        market: item.market,
        district: item.district,
        state: item.state || "Tamil Nadu",
        arrivalDate: item.arrivalDate || item.arrival_date,
        minimumPrice: Number(item.minimumPrice ?? item.min_price ?? 0),
        maximumPrice: Number(item.maximumPrice ?? item.max_price ?? 0),
        modalPrice: Number(item.modalPrice ?? item.modal_price ?? 0),
        unit: item.unit || "₹/Kg",
        source: item.source || "Department of Agricultural Marketing and Agri Business, Govt. of Tamil Nadu",
      }));

      if (dataList.length > 0) {
        return {
          data: dataList,
          isCached: false,
          lastUpdated: new Date().toISOString(),
          source: res.source || "Department of Agricultural Marketing and Agri Business, Govt. of Tamil Nadu",
        };
      }
    } catch (err) {
      console.warn("[MarketAPI] Backend /api/mandi-prices unavailable, using local TN dataset fallback");
    }

    return localMandiService.getMandiPrices(params.commodity, params.district, params.market);
  },

  getHistory: async (commodity: string, market: string): Promise<HistoricalPrice[]> => {
    try {
      const res = await requestWithRetry<any>({
        url: `/history?commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(market)}`,
        method: "GET",
      });
      return Array.isArray(res) ? res : (res.data || []);
    } catch {
      return [];
    }
  },

  getLiveMandiPrices: async (params: {
    district?: string;
    commodity?: string;
    market?: string;
    date?: string;
  }): Promise<MandiPricesResponse> => {
    return marketApi.getMandiPrices(params);
  },

  getScraperStats: (): Promise<any[]> => Promise.resolve([]),

  triggerScrape: (): Promise<any> => Promise.resolve({ success: true }),
};
