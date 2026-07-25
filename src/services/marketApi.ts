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
        throw new Error(error.response?.data?.message || "Failed to reach the server. Please verify your internet connection and try again.");
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

export interface MandiPricesResponse {
  data: MandiPrice[];
  isCached: boolean;
  lastUpdated: string;
}

export interface HistoricalPrice {
  date: string;
  modalPrice: number;
}

export const marketApi = {
  getCommodities: (): Promise<Commodity[]> =>
    requestWithRetry<Commodity[]>({ url: "/commodities", method: "GET" }),

  getStates: (): Promise<string[]> =>
    requestWithRetry<string[]>({ url: "/states", method: "GET" }),

  getDistricts: (state: string): Promise<string[]> =>
    requestWithRetry<string[]>({
      url: `/districts?state=${encodeURIComponent(state)}`,
      method: "GET",
    }),

  getMarkets: (district: string): Promise<string[]> =>
    requestWithRetry<string[]>({
      url: `/markets?district=${encodeURIComponent(district)}`,
      method: "GET",
    }),

  getMandiPrices: (params: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    date?: string;
  }): Promise<MandiPricesResponse> => {
    const queryParams = new URLSearchParams();
    if (params.commodity) queryParams.set("commodity", params.commodity);
    if (params.state) queryParams.set("state", params.state);
    if (params.district) queryParams.set("district", params.district);
    if (params.market) queryParams.set("market", params.market);
    if (params.date) queryParams.set("date", params.date);

    const qs = queryParams.toString();
    return requestWithRetry<MandiPricesResponse>({
      url: `/mandi-prices${qs ? "?" + qs : ""}`,
      method: "GET",
    });
  },

  getHistory: (commodity: string, market: string): Promise<HistoricalPrice[]> =>
    requestWithRetry<HistoricalPrice[]>({
      url: `/history?commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(market)}`,
      method: "GET",
    }),

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
    if (params.date) queryParams.set("date", params.date);

    const qs = queryParams.toString();
    return requestWithRetry<any[]>({
      url: `/mandi${qs ? "?" + qs : ""}`,
      method: "GET",
    }).then(data => {
      const latestRecord = data.reduce((latest: any, current: any) => {
        if (!latest) return current;
        return new Date(current.last_updated) > new Date(latest.last_updated) ? current : latest;
      }, null);

      const mappedData = data.map(item => ({
        commodity: item.commodity,
        market: item.market,
        district: item.district,
        state: "Tamil Nadu",
        arrivalDate: item.arrival_date,
        minimumPrice: Number(item.min_price),
        maximumPrice: Number(item.max_price),
        modalPrice: Number(item.modal_price),
        unit: "Rs/Kg",
      }));

      return {
        data: mappedData,
        isCached: false,
        lastUpdated: latestRecord ? latestRecord.last_updated : new Date().toISOString(),
      };
    });
  },

  getScraperStats: (): Promise<any[]> =>
    requestWithRetry<any[]>({ url: "/scraper-stats", method: "GET" }),

  triggerScrape: (): Promise<any> =>
    requestWithRetry<any>({ url: "/scraper-trigger", method: "POST" }),
};
