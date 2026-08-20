import rawMandiData from "../data/officialTnMandiPrices.json";
import { Commodity, MandiPrice, MandiPricesResponse } from "./marketApi";

// Normalization alias dictionary
const COMMODITY_ALIASES: Record<string, string[]> = {
  "paddy": ["paddy", "dhan", "rice", "ponni", "ir20", "cr1009", "bpt5204", "sona masuri", "deluxe"],
  "rice": ["rice", "paddy", "dhan", "ponni", "ir20", "cr1009", "bpt5204"],
  "turmeric": ["turmeric", "manjal", "curcuma", "bunch", "finger", "bulb"],
  "groundnut": ["groundnut", "peanut", "kadalai", "nilakadalai", "pod"],
  "blackgram": ["blackgram", "urad", "ulundu"],
  "greengram": ["greengram", "moong", "paasi payaru", "pasi payaru"],
  "redgram": ["redgram", "arhar", "tur", "tuvarai"],
  "maize": ["maize", "corn", "makka cholam", "makka"],
  "cotton": ["cotton", "kapas", "paruthi"],
  "coconut": ["coconut", "thengai", "kopra", "copra"],
  "onion": ["onion", "small onion", "big onion", "bellary", "vengayam", "sambar onion"],
  "tomato": ["tomato", "thakkali", "nattu thakkali", "hybrid tomato"],
  "chilli": ["chilli", "green chilli", "red chilli", "milagai", "dry chilli"],
  "potato": ["potato", "urulaikizhangu"],
  "banana": ["banana", "plantain", "nendran", "poovan", "robusta", "rasthali", "valai"],
};

export const localMandiService = {
  getCommodities: (): Commodity[] => {
    const commodityMap = new Map<string, {
      name: string;
      markets: Set<string>;
      minPrice: number;
      maxPrice: number;
      prices: number[];
    }>();

    for (const r of rawMandiData as any[]) {
      const name = r.commodity || "Unknown";
      if (!commodityMap.has(name)) {
        commodityMap.set(name, {
          name,
          markets: new Set(),
          minPrice: Number(r.min_price) || 0,
          maxPrice: Number(r.max_price) || 0,
          prices: [],
        });
      }

      const entry = commodityMap.get(name)!;
      entry.markets.add(r.market);
      const modal = Number(r.modal_price) || 0;
      if (modal > 0) entry.prices.push(modal);
      const min = Number(r.min_price) || 0;
      const max = Number(r.max_price) || 0;
      if (min > 0 && (entry.minPrice === 0 || min < entry.minPrice)) entry.minPrice = min;
      if (max > entry.maxPrice) entry.maxPrice = max;
    }

    return Array.from(commodityMap.values()).map((c, idx) => {
      const avg = c.prices.length > 0 ? Math.round(c.prices.reduce((a, b) => a + b, 0) / c.prices.length) : c.minPrice;
      return {
        id: String(idx + 1),
        name: c.name,
        displayName: c.name,
        category: "Agriculture / Horticulture",
        marketCount: c.markets.size,
        minPrice: c.minPrice,
        maxPrice: c.maxPrice,
        modalPrice: avg,
        unit: "₹/Kg",
        source: "Department of Agricultural Marketing & Agri Business, Govt. of Tamil Nadu",
      };
    });
  },

  getMandiPrices: (commodity?: string, district?: string, market?: string): MandiPricesResponse => {
    let filtered = (rawMandiData as any[]).map((item: any) => ({
      commodity: item.commodity || "Unknown",
      variety: item.variety || "Local",
      market: item.market || "Regulated Market",
      district: item.district || "Tamil Nadu",
      state: "Tamil Nadu",
      arrivalDate: item.arrival_date || new Date().toISOString().split("T")[0],
      minimumPrice: Number(item.min_price) || 0,
      maximumPrice: Number(item.max_price) || 0,
      modalPrice: Number(item.modal_price) || 0,
      unit: item.unit || "₹/Kg",
      source: item.source || "Department of Agricultural Marketing and Agri Business, Govt. of Tamil Nadu",
    }));

    if (commodity && commodity !== "All") {
      const qLower = commodity.toLowerCase().trim();
      const aliases = COMMODITY_ALIASES[qLower] || [qLower];
      filtered = filtered.filter((r) => {
        const cLower = r.commodity.toLowerCase();
        const vLower = (r.variety || "").toLowerCase();
        return aliases.some((a) => cLower.includes(a) || vLower.includes(a));
      });
    }

    if (district && district !== "All") {
      const dLower = district.toLowerCase().trim();
      filtered = filtered.filter((r) => r.district.toLowerCase() === dLower || r.district.toLowerCase().includes(dLower));
    }

    if (market && market !== "All") {
      const mLower = market.toLowerCase().trim();
      filtered = filtered.filter((r) => r.market.toLowerCase() === mLower || r.market.toLowerCase().includes(mLower));
    }

    return {
      data: filtered,
      isCached: true,
      lastUpdated: new Date().toISOString(),
      source: "Department of Agricultural Marketing and Agri Business, Government of Tamil Nadu",
    };
  },
};
