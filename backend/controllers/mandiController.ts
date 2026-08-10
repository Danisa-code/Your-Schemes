/**
 * Mandi Controller — Express route handlers for all mandi-related endpoints.
 * Handles fetching live price data from Supabase with graceful fallback to mocks.
 */

import { Request, Response } from "express";
import * as agmarknet from "../services/agmarknetService.js";
import { supabase } from "../config/supabase.js";
import { runScraper } from "../scraper/scraper.js";

// Helper to get IST date string
function getISTDateString() {
  return new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0];
}

export async function getCommodities(req: Request, res: Response) {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("mandi_prices")
        .select("commodity")
        .order("commodity", { ascending: true });

      if (!error && data && data.length > 0) {
        // Extract unique sorted commodities
        const unique = Array.from(new Set(data.map((item: any) => item.commodity)));
        const formatted = unique.map((name: string) => ({ id: name.toUpperCase(), name }));
        return res.json(formatted);
      }
    }
    // Fallback
    const data = await agmarknet.getCommodities();
    res.json(data);
  } catch (err) {
    console.error("[mandiController] getCommodities error:", err);
    res.status(500).json({ error: "Failed to fetch commodities", message: "Please try again later." });
  }
}

export async function getStates(req: Request, res: Response) {
  try {
    // This portal is Tamil Nadu-specific — only return Tamil Nadu
    res.json(["Tamil Nadu"]);
  } catch (err) {
    console.error("[mandiController] getStates error:", err);
    res.status(500).json({ error: "Failed to fetch states", message: "Please try again later." });
  }
}

export async function getDistricts(req: Request, res: Response) {
  try {
    const { state } = req.query;
    if (!state || typeof state !== "string") {
      return res.status(400).json({ error: "Query parameter 'state' is required." });
    }

    if (state.toLowerCase() === "tamil nadu" && supabase) {
      const { data, error } = await supabase
        .from("mandi_prices")
        .select("district")
        .order("district", { ascending: true });

      if (!error && data && data.length > 0) {
        const unique = Array.from(new Set(data.map((item: any) => item.district)));
        return res.json(unique);
      }
    }

    // Fallback
    const data = await agmarknet.getDistricts(state);
    res.json(data);
  } catch (err) {
    console.error("[mandiController] getDistricts error:", err);
    res.status(500).json({ error: "Failed to fetch districts", message: "Please try again later." });
  }
}

export async function getMarkets(req: Request, res: Response) {
  try {
    const { district } = req.query;
    if (!district || typeof district !== "string") {
      return res.status(400).json({ error: "Query parameter 'district' is required." });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("mandi_prices")
        .select("market")
        .eq("district", district)
        .order("market", { ascending: true });

      if (!error && data && data.length > 0) {
        const unique = Array.from(new Set(data.map((item: any) => item.market)));
        return res.json(unique);
      }
    }

    // Fallback
    const data = await agmarknet.getMarkets(district);
    res.json(data);
  } catch (err) {
    console.error("[mandiController] getMarkets error:", err);
    res.status(500).json({ error: "Failed to fetch markets", message: "Please try again later." });
  }
}

export async function getMandiPrices(req: Request, res: Response) {
  try {
    const { commodity, state, district, market, date } = req.query as Record<string, string | undefined>;
    const result = await agmarknet.getMandiPrices({ commodity, state, district, market, date });
    res.json(result);
  } catch (err) {
    console.error("[mandiController] getMandiPrices error:", err);
    res.status(500).json({ error: "Failed to fetch mandi prices", message: "AGMARKNET may be temporarily unavailable. Please try again in a few minutes." });
  }
}

export async function getHistory(req: Request, res: Response) {
  try {
    const { commodity, market } = req.query as Record<string, string | undefined>;
    if (!commodity || !market) {
      return res.status(400).json({ error: "Query parameters 'commodity' and 'market' are required." });
    }
    const data = await agmarknet.getHistory({ commodity, market });
    res.json(data);
  } catch (err) {
    console.error("[mandiController] getHistory error:", err);
    res.status(500).json({ error: "Failed to fetch price history", message: "Please try again later." });
  }
}

// GET /api/mandi — Returns today's prices (or fallback to latest available day if today has no data).
export async function getMandi(req: Request, res: Response) {
  try {
    const { district, commodity, market, date } = req.query as Record<string, string | undefined>;

    if (!supabase) {
      // Fallback to mock data for development
      const mockResult = await agmarknet.getMandiPrices({ commodity, state: "Tamil Nadu", district, market, date });
      const mapped = (mockResult.data || []).map((item: any) => ({
        commodity: item.commodity,
        market: item.market,
        district: item.district,
        arrival_date: item.arrivalDate,
        min_price: item.minimumPrice,
        max_price: item.maximumPrice,
        modal_price: item.modalPrice,
        unit: item.unit || "₹/Kg",
        last_updated: mockResult.lastUpdated || new Date().toISOString()
      }));
      return res.json(mapped);
    }

    let targetDate = date;

    // If no specific date is queried, determine the latest date available in DB
    if (!targetDate) {
      const { data: dateData, error: dateError } = await supabase
        .from("mandi_prices")
        .select("arrival_date")
        .order("arrival_date", { ascending: false })
        .limit(1);

      if (!dateError && dateData && dateData.length > 0) {
        targetDate = dateData[0].arrival_date;
      } else {
        targetDate = getISTDateString();
      }
    }

    let query = supabase
      .from("mandi_prices")
      .select("*")
      .eq("arrival_date", targetDate);

    if (district) {
      query = query.eq("district", district);
    }
    if (commodity) {
      query = query.eq("commodity", commodity);
    }
    if (market) {
      query = query.eq("market", market);
    }

    const { data: prices, error: pricesError } = await query.order("commodity", { ascending: true });

    if (pricesError) {
      throw new Error(pricesError.message);
    }

    const filteredResults = prices || [];
    return res.json(filteredResults);
  } catch (err: any) {
    console.error("[mandiController] getMandi error:", err);
    res.status(500).json({ error: "Failed to fetch mandi prices", message: err.message });
  }
}

// GET /api/scraper-stats — Returns recent logs from the scraper_logs table
export async function getScraperStats(req: Request, res: Response) {
  try {
    if (!supabase) {
      // Return mock logs for development
      return res.json([
        {
          id: "mock-1",
          run_time: new Date().toISOString(),
          rows_inserted: 125,
          rows_updated: 40,
          rows_failed: 0,
          status: "SUCCESS",
          errors: null,
          next_run: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }

    const { data: logs, error } = await supabase
      .from("scraper_logs")
      .select("*")
      .order("run_time", { ascending: false })
      .limit(30);

    if (error) {
      throw new Error(error.message);
    }

    res.json(logs || []);
  } catch (err: any) {
    console.error("[mandiController] getScraperStats error:", err);
    res.status(500).json({ error: "Failed to fetch scraper metrics", message: err.message });
  }
}

// POST /api/scraper-trigger — trigger manual scraper run in background
export async function triggerScraperRun(req: Request, res: Response) {
  try {
    console.log("[mandiController] Manual scraper trigger requested...");
    // Trigger scraper run asynchronously in the background
    runScraper().catch(err => {
      console.error("[mandiController] Background manual scraper run error:", err);
    });
    res.json({ message: "Mandi price scraper run triggered successfully in the background." });
  } catch (err: any) {
    console.error("[mandiController] triggerScraperRun error:", err);
    res.status(500).json({ error: "Failed to manually trigger scraper", message: err.message });
  }
}
