import axios, { AxiosRequestConfig } from "axios";

// Redirect to local Node.js Express server on port 3000
const BASE_URL = "/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/**
 * Executes an Axios request with a retry policy (up to 3 retries on network failures).
 */
async function requestWithRetry<T>(config: AxiosRequestConfig, retries = 3, delayMs = 1500): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      const isLastAttempt = attempt === retries;
      
      // If it's a validation error (400) or not found (404), do not retry (fail fast)
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        throw new Error(error.response.data?.message || `API error: ${error.response.status}`);
      }

      if (isLastAttempt) {
        logError(error);
        throw new Error(error.response?.data?.message || "Official Tamil Nadu mandi price data is temporarily unavailable.");
      }

      console.warn(`Request to ${config.url} failed (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Request failed");
}

function logError(error: any) {
  if (error.response) {
    console.error(`[API Error] Response: ${error.response.status} - `, error.response.data);
  } else if (error.request) {
    console.error("[API Error] No response received from server:", error.request);
  } else {
    console.error("[API Error] Config failure:", error.message);
  }
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
  getCommodities: (): Promise<Commodity[]> =>
    requestWithRetry<any>({ url: "/commodities", method: "GET" }).then((res) => {
      const rawList = Array.isArray(res) ? res : (res.data || []);
      return rawList.map((item: any, idx: number) => {
        if (typeof item === "string") {
          return { id: String(idx), name: item };
        }
        return {
          id: item.id || item.name || String(idx),
          name: item.name || item.displayName || "Unknown",
          displayName: item.displayName || item.name,
          category: item.category,
          marketCount: item.marketCount,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          modalPrice: item.modalPrice,
          unit: item.unit || "₹/Kg",
          source: item.source
        };
      });
    }),

  getStates: (): Promise<string[]> => Promise.resolve(["Tamil Nadu"]),

  getDistricts: (_state?: string): Promise<string[]> =>
    requestWithRetry<any>({
      url: `/districts`,
      method: "GET",
    }).then((res) => (Array.isArray(res) ? res : (res.data || []))),

  getMarkets: (district?: string): Promise<string[]> =>
    requestWithRetry<any>({
      url: `/markets${district && district !== "All" ? `?district=${encodeURIComponent(district)}` : ""}`,
      method: "GET",
    }).then((res) => (Array.isArray(res) ? res : (res.data || []))),

  getMandiPrices: (params: {
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
    return requestWithRetry<any>({
      url: `/mandi-prices${qs ? "?" + qs : ""}`,
      method: "GET",
    }).then((res) => {
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

      return {
        data: dataList,
        isCached: false,
        lastUpdated: new Date().toISOString(),
        source: res.source || "Department of Agricultural Marketing and Agri Business, Govt. of Tamil Nadu",
      };
    });
  },

  getHistory: (commodity: string, market: string): Promise<HistoricalPrice[]> =>
    requestWithRetry<any>({
      url: `/history?commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(market)}`,
      method: "GET",
    }).then((res) => (Array.isArray(res) ? res : (res.data || []))),

  getLiveMandiPrices: (params: {
    district?: string;
    commodity?: string;
    market?: string;
    date?: string;
  }): Promise<MandiPricesResponse> => {
    const queryParams = new URLSearchParams();
    if (params.district) queryParams.set("district", params.district);
    if (params.commodity) queryParams.set("commodity", params.commodity);
    if (params.market) queryParams.set("market", params.market);

    const qs = queryParams.toString();
    return requestWithRetry<any>({
      url: `/mandi-prices${qs ? "?" + qs : ""}`,
      method: "GET",
    }).then((res) => {
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

      return {
        data: dataList, 
        isCached: false,
        lastUpdated: new Date().toISOString(),
        source: res.source || "Department of Agricultural Marketing and Agri Business, Govt. of Tamil Nadu",
      };
    });
  },

  getScraperStats: (): Promise<any[]> => Promise.resolve([]),

  triggerScrape: (): Promise<any> => Promise.resolve({ success: true }),
};
