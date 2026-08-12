/**
 * Mandi Routes — maps REST API endpoints to controller handlers.
 * All routes are mounted under /api in server.ts.
 */

import { Router } from "express";
import {
  getCommodities,
  getStates,
  getDistricts,
  getMarkets,
  getMandiPrices,
  getHistory,
  getMandi,
  getScraperStats,
  triggerScraperRun,
} from "../controllers/mandiController.js";

const router = Router();

// GET /api/commodities — list of available commodities
router.get("/commodities", getCommodities);

// GET /api/states — list of all states
router.get("/states", getStates);

// GET /api/districts?state=Tamil Nadu — districts for a state
router.get("/districts", getDistricts);

// GET /api/markets?district=Salem — markets for a district
router.get("/markets", getMarkets);

// GET /api/mandi-prices?commodity=Wheat&state=Tamil Nadu&district=Salem
router.get("/mandi-prices", getMandiPrices);

// GET /api/history?commodity=Wheat&market=Salem Mandi — historical prices
router.get("/history", getHistory);

// GET /api/mandi — get live mandi prices from Supabase
router.get("/mandi", getMandi);

// GET /api/scraper-stats — get scraper logs
router.get("/scraper-stats", getScraperStats);

// POST /api/scraper-trigger — trigger manual scraper run
router.post("/scraper-trigger", triggerScraperRun);

export default router;
