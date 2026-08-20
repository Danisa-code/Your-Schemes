import axios from "axios";
import { MARKET_DISTRICT_MAP, getDistrictForMarket } from "../scraper/districtMarketMap";
import { TN_OFFICIAL_CROPS } from "../scraper/tnOfficialCrops";

export interface NormalizedMandiRecord {
  commodity: string;
  variety: string;
  market: string;
  district: string;
  state: "Tamil Nadu";
  arrivalDate: string;
  minimumPrice: number;
  maximumPrice: number;
  modalPrice: number;
  unit: "₹/Kg" | "₹/Quintal";
  source: string;
  lastUpdated: string;
}

export interface CommoditySummary {
  name: string;
  displayName: string;
  category: string;
  marketCount: number;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: "₹/Kg" | "₹/Quintal";
  source: string;
  lastUpdated: string;
}

export class AgmarknetService {
  private cache: NormalizedMandiRecord[] = [];
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private isFetching: boolean = false;

  private readonly SOURCE_NAME =
    "Department of Agricultural Marketing and Agri Business, Government of Tamil Nadu";

  /**
   * Alias resolution map for farmer-friendly search queries
   */
  private readonly ALIAS_MAP: Record<string, string[]> = {
    rice: ["paddy", "paddy(common)", "paddy(dhan)", "paddy-adt 37", "paddy-bpt", "paddy-ponni", "paddy-co 51", "paddy-rnr", "rice"],
    paddy: ["paddy", "paddy(common)", "paddy(dhan)", "paddy(basmati)", "rice"],
    dhan: ["paddy", "paddy(common)", "paddy(dhan)"],
    turmeric: ["turmeric", "turmeric bunch", "turmeric (raw)", "turmeric(raw)", "manjal", "haldi"],
    manjal: ["turmeric", "turmeric bunch", "turmeric (raw)"],
    haldi: ["turmeric", "turmeric bunch", "turmeric (raw)"],
    groundnut: ["groundnut", "groundnut (split)", "groundnut pods (raw)", "peanut", "verkadalai", "kadalai"],
    peanut: ["groundnut", "groundnut (split)", "groundnut pods (raw)"],
    verkadalai: ["groundnut", "groundnut (split)", "groundnut pods (raw)"],
    blackgram: ["black gram", "black gram dal", "black gram(urd beans)(whole)", "black gram (urd bean)", "urad", "blackgram", "cowpea", "mochai", "ulundhu"],
    "black gram": ["black gram", "black gram dal", "black gram(urd beans)(whole)", "black gram (urd bean)", "urad", "blackgram", "cowpea", "mochai", "ulundhu"],
    urad: ["black gram", "black gram dal", "black gram(urd beans)(whole)", "urad", "blackgram", "ulundhu"],
    ulundhu: ["black gram", "black gram dal", "black gram(urd beans)(whole)", "urad", "blackgram", "ulundhu"],
    redgram: ["redgram", "red gram", "thuvarai", "tur", "arhar", "pigeon pea"],
    thuvarai: ["redgram", "red gram", "tur", "arhar"],
    greengram: ["green gram", "moong", "paasi payaru"],
    maize: ["maize", "sweet corn", "baby corn", "makka cholam", "cholam", "corn"],
    corn: ["maize", "sweet corn", "baby corn", "makka cholam"],
    cotton: ["cotton", "kapas", "paruthi"],
    kapas: ["cotton", "paruthi"],
    paruthi: ["cotton", "kapas"],
    coconut: ["coconut", "tender coconut", "thengai", "elaneer", "copra"],
    thengai: ["coconut", "tender coconut"],
    gingelly: ["gingelly", "gingelly(sesamum,sesame,til)", "sesame", "til", "ellu"],
    sesame: ["gingelly", "gingelly(sesamum,sesame,til)", "sesame", "til", "ellu"],
    ellu: ["gingelly", "sesame", "til"],
    chilli: ["chilli", "red chilli", "bajji chilli", "green chilli", "milagai"],
    chillies: ["chilli", "red chilli", "bajji chilli", "green chilli", "milagai"],
    milagai: ["chilli", "red chilli", "bajji chilli"],
    onion: ["small onion", "big onion", "onion leaf", "shallot", "vengayam"],
    vengayam: ["small onion", "big onion", "shallot"],
    tomato: ["tomato", "tomato(local)", "tomato (bangalore)", "thakkali"],
    thakkali: ["tomato", "tomato(local)", "tomato (bangalore)"],
    potato: ["potato", "potato (ooty)", "potato (agra)", "urulaikizhangu", "aloo"],
    urulaikizhangu: ["potato", "potato (ooty)", "potato (agra)"],
    banana: ["banana (fruit)", "banana (veg)", "banana flower", "banana stem", "banana leaf", "banana (red banana)", "banana (nendran)", "banana (rasthali)", "banana  (karpuravalli)", "banana (poovan)", "banana (yelakki)", "banana (matti)", "banana (nadu)", "banana (green banana)", "vazhaipazham", "vazhaikkai"],
    vazhai: ["banana (fruit)", "banana (veg)", "banana flower", "banana stem", "banana leaf"],
    mango: ["mango (fruit)", "mango (veg)", "mango (neelam)", "mango (banganapalli)", "mango (alphonso)", "mango (bangalora)", "mango (imam pasand)", "mango (malgova)", "mango (sindhura)", "mango (rumani)", "mambazham", "mangai"],
    ginger: ["ginger", "ma.inji", "inji", "adrak"],
    inji: ["ginger", "ma.inji"],
    garlic: ["garlic", "garlic (nadu)", "garlic (malai poondu)", "poondu", "lahsun"],
    poondu: ["garlic", "garlic (nadu)", "garlic (malai poondu)"],
    brinjal: ["brinjal", "brinjal (green striped)", "brinjal (blue striped)", "brinjal (white)", "brinjal (spiny)", "kathirikai", "baingan"],
    kathirikai: ["brinjal", "brinjal (green striped)", "brinjal (blue striped)", "brinjal (white)", "brinjal (spiny)"]
  };

  /**
   * Main entry point: Fetch all official Tamil Nadu mandi prices
   */
  public async getMandiPrices(forceRefresh: boolean = false): Promise<NormalizedMandiRecord[]> {
    const isCacheValid =
      !forceRefresh &&
      this.cache.length > 0 &&
      Date.now() - this.cacheTimestamp < this.CACHE_TTL_MS;

    if (isCacheValid) {
      return this.cache;
    }

    if (this.isFetching && this.cache.length > 0) {
      return this.cache;
    }

    try {
      this.isFetching = true;
      const records = await this.fetchAllOfficialTamilNaduData();
      if (records.length > 0) {
        this.cache = records;
        this.cacheTimestamp = Date.now();
        console.log(`[AgmarknetService] Successfully loaded and cached ${records.length} official TN mandi records.`);
      }
      return this.cache;
    } catch (error: any) {
      console.error("[AgmarknetService] Error fetching mandi data:", error.message);
      return this.cache;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Fetch from dual official Tamil Nadu Government sources:
   * 1. TN Agrimark Uzhavar Sandhai API (148 official commodities & varieties)
   * 2. Agmarknet Tamil Nadu APMC Regulated Markets API (Commercial grains, pulses, oilseeds, commercial spices)
   */
  private async fetchAllOfficialTamilNaduData(): Promise<NormalizedMandiRecord[]> {
    const allRecords: NormalizedMandiRecord[] = [];
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1. Fetch TN Agrimark Uzhavar Sandhai records across all active official crops
    const uzhavarRecords = await this.fetchAgrimarkUzhavarSandhai(today);
    allRecords.push(...uzhavarRecords);

    // 2. Fetch TN APMC / Regulated Markets records from official open data feed
    const apmcRecords = await this.fetchOfficialAPMCData();
    allRecords.push(...apmcRecords);

    // Deduplicate by commodity, market, arrivalDate
    const seen = new Set<string>();
    const uniqueRecords: NormalizedMandiRecord[] = [];

    for (const r of allRecords) {
      const key = `${r.commodity.toLowerCase()}_${r.variety.toLowerCase()}_${r.market.toLowerCase()}_${r.arrivalDate}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRecords.push(r);
      }
    }

    return uniqueRecords;
  }

  /**
   * Fetch official Uzhavar Sandhai prices from agrimark.tn.gov.in
   */
  private async fetchAgrimarkUzhavarSandhai(date: string): Promise<NormalizedMandiRecord[]> {
    const records: NormalizedMandiRecord[] = [];

    // Prioritized list of active crop IDs (Vegetables, Spices, Fruits, Commercial)
    const activeCrops = TN_OFFICIAL_CROPS;

    // Fetch in batches of 10 to avoid overwhelming network while remaining fast
    const batchSize = 10;
    for (let i = 0; i < activeCrops.length; i += batchSize) {
      const batch = activeCrops.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (crop) => {
          try {
            const cropRecords = await this.fetchCropWithDateFallback(crop, date);
            records.push(...cropRecords);
          } catch (e) {
            // Silently continue to next crop
          }
        })
      );
    }

    return records;
  }

  /**
   * Fetch specific crop from agrimark.tn.gov.in with multi-day check for seasonal arrivals
   */
  private async fetchCropWithDateFallback(
    crop: { id: string; name: string; category?: string },
    primaryDate: string
  ): Promise<NormalizedMandiRecord[]> {
    const datesToCheck = [primaryDate];

    // Check yesterday and day before if seasonal
    const d1 = new Date();
    d1.setDate(d1.getDate() - 1);
    datesToCheck.push(d1.toISOString().split("T")[0]);

    const d2 = new Date();
    d2.setDate(d2.getDate() - 2);
    datesToCheck.push(d2.toISOString().split("T")[0]);

    for (const dateStr of datesToCheck) {
      try {
        const url = `https://agrimark.tn.gov.in/home/us_dist_report_api/${dateStr}/${crop.id}`;
        const response = await axios.post(url, {}, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json, text/plain, */*"
          },
          timeout: 4000
        });

        if (response.data && typeof response.data === "object" && Object.keys(response.data).length > 0) {
          const parsed = this.parseAgrimarkCropResponse(crop.name, response.data, dateStr);
          if (parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        // Try next date
      }
    }

    return [];
  }

  /**
   * Parse agrimark.tn.gov.in dictionary response
   */
  private parseAgrimarkCropResponse(
    cropName: string,
    data: Record<string, any>,
    arrivalDate: string
  ): NormalizedMandiRecord[] {
    const records: NormalizedMandiRecord[] = [];

    // Parse variety from name if in parentheses e.g. "Tomato(Local)" -> commodity: "Tomato", variety: "Local"
    let commodity = cropName;
    let variety = "Common / Local";

    const varietyMatch = cropName.match(/^(.*?)\s*\((.*?)\)$/);
    if (varietyMatch) {
      commodity = varietyMatch[1].trim();
      variety = varietyMatch[2].trim();
    }

    for (const [rawMarket, info] of Object.entries(data)) {
      if (!info || typeof info !== "object") continue;

      const cleanMarket = rawMarket.trim();
      const district = getDistrictForMarket(cleanMarket);

      const minPrice = info.min !== undefined && info.min !== null && info.min !== "" ? parseFloat(String(info.min)) : 0;
      const maxPrice = info.max !== undefined && info.max !== null && info.max !== "" ? parseFloat(String(info.max)) : minPrice;
      const modalPrice = info.modal !== undefined && info.modal !== null && info.modal !== "" ? parseFloat(String(info.modal)) : Math.round((minPrice + maxPrice) / 2);

      if (modalPrice > 0 || minPrice > 0 || maxPrice > 0) {
        records.push({
          commodity,
          variety,
          market: cleanMarket,
          district,
          state: "Tamil Nadu",
          arrivalDate,
          minimumPrice: isNaN(minPrice) ? modalPrice : minPrice,
          maximumPrice: isNaN(maxPrice) ? modalPrice : maxPrice,
          modalPrice: isNaN(modalPrice) ? minPrice : modalPrice,
          unit: "₹/Kg",
          source: this.SOURCE_NAME,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    return records;
  }

  /**
   * Fetch official APMC Regulated Markets data (Paddy, Turmeric, Groundnut, Blackgram, Maize, Cotton)
   * from official Government Open Data Agmarknet feed for State: Tamil Nadu
   */
  private async fetchOfficialAPMCData(): Promise<NormalizedMandiRecord[]> {
    const records: NormalizedMandiRecord[] = [];
    const apiKey = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
    const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";

    const targetCommodities = [
      "Paddy(Common)",
      "Paddy(Dhan)(Common)",
      "Paddy(Dhan)(Basmati)",
      "Paddy",
      "Turmeric",
      "Turmeric (Raw)",
      "Groundnut",
      "Groundnut (Split)",
      "Groundnut pods (Raw)",
      "Black Gram (Urd Bean)",
      "Black Gram (Urd Bean)(Whole)",
      "Maize",
      "Cotton",
      "Coconut",
      "Gingelly(Sesamum,Sesame,Til)"
    ];

    for (const comm of targetCommodities) {
      try {
        const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=50&filters[state]=Tamil Nadu&filters[commodity]=${encodeURIComponent(comm)}`;
        const res = await axios.get(url, { timeout: 3500 });
        if (res.data && res.data.records && Array.isArray(res.data.records)) {
          for (const raw of res.data.records) {
            const parsed = this.parseAgmarknetOpenDataRecord(raw);
            if (parsed) {
              records.push(parsed);
            }
          }
        }
      } catch (e) {
        // Continue to next commodity
      }
    }

    return records;
  }

  /**
   * Normalize an Agmarknet open data record
   */
  private parseAgmarknetOpenDataRecord(raw: any): NormalizedMandiRecord | null {
    if (!raw || !raw.commodity || !raw.market) return null;

    let commodity = String(raw.commodity).trim();
    // Normalize Paddy / Rice naming
    if (commodity.toLowerCase().includes("paddy")) {
      commodity = "Paddy";
    } else if (commodity.toLowerCase().includes("turmeric")) {
      commodity = "Turmeric";
    } else if (commodity.toLowerCase().includes("groundnut")) {
      commodity = "Groundnut";
    } else if (commodity.toLowerCase().includes("black gram") || commodity.toLowerCase().includes("urd")) {
      commodity = "Blackgram";
    }

    const variety = raw.variety && String(raw.variety).trim() !== "" ? String(raw.variety).trim() : "Common / Local";
    const market = String(raw.market).trim();
    const district = raw.district && String(raw.district).trim() !== "" ? String(raw.district).trim() : getDistrictForMarket(market);

    // Format date DD/MM/YYYY to YYYY-MM-DD
    let arrivalDate = new Date().toISOString().split("T")[0];
    if (raw.arrival_date) {
      const parts = String(raw.arrival_date).split("/");
      if (parts.length === 3) {
        arrivalDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }

    const minPrice = parseFloat(String(raw.min_price || 0));
    const maxPrice = parseFloat(String(raw.max_price || minPrice));
    const modalPrice = parseFloat(String(raw.modal_price || minPrice));

    if (modalPrice <= 0 && minPrice <= 0 && maxPrice <= 0) return null;

    return {
      commodity,
      variety,
      market,
      district,
      state: "Tamil Nadu",
      arrivalDate,
      minimumPrice: isNaN(minPrice) ? modalPrice : minPrice,
      maximumPrice: isNaN(maxPrice) ? modalPrice : maxPrice,
      modalPrice: isNaN(modalPrice) ? minPrice : modalPrice,
      unit: "₹/Quintal",
      source: "Tamil Nadu Regulated Markets & APMC Committees (agrimark.tn.gov.in / Agmarknet)",
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Search and filter prices with alias resolution and case-insensitivity
   */
  public filterRecords(
    records: NormalizedMandiRecord[],
    commodityQuery?: string,
    districtQuery?: string,
    marketQuery?: string
  ): NormalizedMandiRecord[] {
    let results = records;

    // 1. Commodity Filtering / Search with Alias Resolution
    if (commodityQuery && commodityQuery.trim() !== "" && commodityQuery.trim().toLowerCase() !== "all") {
      const q = commodityQuery.trim().toLowerCase();
      const resolvedTerms = this.resolveSearchTerms(q);

      results = results.filter((record) => {
        const commName = record.commodity.toLowerCase();
        const varName = record.variety.toLowerCase();

        return resolvedTerms.some(
          (term) =>
            commName.includes(term) ||
            varName.includes(term) ||
            term.includes(commName)
        );
      });
    }

    // 2. District Filtering
    if (districtQuery && districtQuery.trim() !== "" && districtQuery.trim().toLowerCase() !== "all") {
      const d = districtQuery.trim().toLowerCase();
      results = results.filter((record) => record.district.toLowerCase().includes(d));
    }

    // 3. Market Filtering
    if (marketQuery && marketQuery.trim() !== "" && marketQuery.trim().toLowerCase() !== "all") {
      const m = marketQuery.trim().toLowerCase();
      results = results.filter((record) => record.market.toLowerCase().includes(m));
    }

    return results;
  }

  /**
   * Resolve user search term into official commodity/variety search terms
   */
  public resolveSearchTerms(query: string): string[] {
    const q = query.trim().toLowerCase();
    const terms = new Set<string>([q]);

    // Check alias dictionary
    for (const [alias, targets] of Object.entries(this.ALIAS_MAP)) {
      if (q === alias || q.includes(alias) || alias.includes(q)) {
        for (const target of targets) {
          terms.add(target.toLowerCase());
        }
      }
    }

    // Check official crop aliases
    for (const crop of TN_OFFICIAL_CROPS) {
      const cropName = crop.name.toLowerCase();
      if (cropName.includes(q) || q.includes(cropName)) {
        terms.add(cropName);
      }
      for (const al of crop.aliases || []) {
        if (al.includes(q) || q.includes(al)) {
          terms.add(cropName);
          terms.add(al.toLowerCase());
        }
      }
    }

    return Array.from(terms);
  }

  /**
   * Get unique commodities list with counts
   */
  public getCommodityList(records: NormalizedMandiRecord[]): CommoditySummary[] {
    const map = new Map<string, NormalizedMandiRecord[]>();

    for (const r of records) {
      const list = map.get(r.commodity) || [];
      list.push(r);
      map.set(r.commodity, list);
    }

    const summaries: CommoditySummary[] = [];

    for (const [name, list] of map.entries()) {
      const prices = list.map((r) => r.modalPrice).filter((p) => p > 0);
      const minP = Math.min(...list.map((r) => r.minimumPrice));
      const maxP = Math.max(...list.map((r) => r.maximumPrice));
      const avgP = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : minP;

      const sample = list[0];

      summaries.push({
        name,
        displayName: name,
        category: this.getCategoryForCommodity(name),
        marketCount: list.length,
        minPrice: isFinite(minP) ? minP : 0,
        maxPrice: isFinite(maxP) ? maxP : 0,
        modalPrice: avgP,
        unit: sample.unit,
        source: sample.source,
        lastUpdated: sample.lastUpdated
      });
    }

    return summaries.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get category for a commodity name
   */
  private getCategoryForCommodity(name: string): string {
    const found = TN_OFFICIAL_CROPS.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(c.name.toLowerCase())
    );
    if (found && found.category) return found.category;

    const lower = name.toLowerCase();
    if (lower.includes("paddy") || lower.includes("rice") || lower.includes("corn") || lower.includes("maize")) return "Cereals";
    if (lower.includes("gram") || lower.includes("urad") || lower.includes("tur") || lower.includes("cowpea") || lower.includes("mochai")) return "Pulses";
    if (lower.includes("groundnut") || lower.includes("sesame") || lower.includes("gingelly") || lower.includes("mustard")) return "Oilseeds";
    if (lower.includes("turmeric") || lower.includes("chilli") || lower.includes("ginger") || lower.includes("garlic") || lower.includes("tamarind")) return "Spices";
    if (lower.includes("banana") || lower.includes("mango") || lower.includes("apple") || lower.includes("orange") || lower.includes("grapes")) return "Fruits";
    return "Vegetables";
  }
}

export const agmarknetService = new AgmarknetService();
