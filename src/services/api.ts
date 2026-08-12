import { marketApi, Commodity, MandiPrice, MandiPricesResponse, HistoricalPrice } from "./marketApi";

export type { Commodity, MandiPrice, MandiPricesResponse, HistoricalPrice };

// Re-export marketApi as api so that components importing { api } continue to function without any changes
export const api = marketApi;
