import { Request, Response } from "express";
import { agmarknetService } from "../services/agmarknetService";
import { TN_DISTRICTS } from "../scraper/districtMarketMap";

/**
 * GET /api/mandi-prices
 * Query parameters: commodity, district, market, refresh
 */
export async function getMandiPrices(req: Request, res: Response): Promise<void> {
  try {
    const commodity = req.query.commodity as string | undefined;
    const district = req.query.district as string | undefined;
    const market = req.query.market as string | undefined;
    const refresh = req.query.refresh === "true";

    console.log(`[MandiController] GET /api/mandi-prices - Commodity: "${commodity || 'All'}", District: "${district || 'All'}", Market: "${market || 'All'}"`);

    // Fetch all cached/live records from official source
    const allRecords = await agmarknetService.getMandiPrices(refresh);
    console.log(`[MandiController] Official records in database/cache: ${allRecords.length}`);

    // Apply filtering with alias normalization
    const filteredRecords = agmarknetService.filterRecords(allRecords, commodity, district, market);
    console.log(`[MandiController] Records matching filters: ${filteredRecords.length}`);

    res.json({
      success: true,
      total: filteredRecords.length,
      totalAvailable: allRecords.length,
      source: "Department of Agricultural Marketing and Agri Business, Government of Tamil Nadu",
      data: filteredRecords
    });
  } catch (error: any) {
    console.error("[MandiController] Error in getMandiPrices:", error);
    res.status(500).json({
      success: false,
      error: "Official Tamil Nadu mandi price data is temporarily unavailable.",
      details: error.message
    });
  }
}

/**
 * GET /api/commodities
 * Returns unique list of commodities with price summaries
 */
export async function getCommodities(req: Request, res: Response): Promise<void> {
  try {
    const records = await agmarknetService.getMandiPrices();
    const commodities = agmarknetService.getCommodityList(records);

    res.json({
      success: true,
      total: commodities.length,
      data: commodities
    });
  } catch (error: any) {
    console.error("[MandiController] Error in getCommodities:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load commodities from official source.",
      details: error.message
    });
  }
}

/**
 * GET /api/states
 */
export async function getStates(req: Request, res: Response): Promise<void> {
  res.json(["Tamil Nadu"]);
}

/**
 * GET /api/districts
 * Returns all 38 Tamil Nadu districts
 */
export async function getDistricts(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      total: TN_DISTRICTS.length,
      data: TN_DISTRICTS
    });
  } catch (error: any) {
    console.error("[MandiController] Error in getDistricts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch districts.",
      details: error.message
    });
  }
}

/**
 * GET /api/markets
 * Returns unique list of markets
 */
export async function getMarkets(req: Request, res: Response): Promise<void> {
  try {
    const district = req.query.district as string | undefined;
    const records = await agmarknetService.getMandiPrices();

    let filtered = records;
    if (district && district.toLowerCase() !== "all") {
      filtered = records.filter(r => r.district.toLowerCase().includes(district.toLowerCase()));
    }

    const markets = Array.from(new Set(filtered.map(r => r.market))).sort();

    res.json({
      success: true,
      total: markets.length,
      data: markets
    });
  } catch (error: any) {
    console.error("[MandiController] Error in getMarkets:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch markets.",
      details: error.message
    });
  }
}

/**
 * GET /api/mandi
 * Alias for live mandi prices
 */
export async function getMandi(req: Request, res: Response): Promise<void> {
  return getMandiPrices(req, res);
}

/**
 * GET /api/history
 * Returns historical records for a commodity
 */
export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const commodity = (req.query.commodity as string) || "Tomato";
    const market = req.query.market as string | undefined;

    const allRecords = await agmarknetService.getMandiPrices();
    const filtered = agmarknetService.filterRecords(allRecords, commodity, undefined, market);

    const historyPoints = filtered.slice(0, 30).map((r) => ({
      date: r.arrivalDate,
      modalPrice: r.modalPrice,
      minPrice: r.minimumPrice,
      maxPrice: r.maximumPrice,
    }));

    res.json(historyPoints);
  } catch (error: any) {
    console.error("[MandiController] Error in getHistory:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch commodity history.",
      details: error.message
    });
  }
}

/**
 * GET /api/scraper-stats
 */
export async function getScraperStats(req: Request, res: Response): Promise<void> {
  res.json([
    {
      source: "Department of Agricultural Marketing and Agri Business, Govt. of Tamil Nadu",
      status: "ACTIVE",
      lastCheck: new Date().toISOString()
    }
  ]);
}

/**
 * POST /api/scraper-trigger
 */
export async function triggerScraperRun(req: Request, res: Response): Promise<void> {
  try {
    await agmarknetService.getMandiPrices(true);
    res.json({ success: true, message: "Mandi prices refreshed from official Tamil Nadu Government source." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
