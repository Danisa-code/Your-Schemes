// cron.ts
import cron from "node-cron";
import { runScraper } from "./scraper.js";

// 7 AM IST  = 1:30 AM UTC (30 1 * * *)
// 11 AM IST = 5:30 AM UTC (30 5 * * *)
// 3 PM IST  = 9:30 AM UTC (30 9 * * *)
// Combined UTC cron pattern: '30 1,5,9 * * *'
export function initScheduler() {
  console.log("Initializing Live Tamil Nadu Mandi Price Scraper Cron Scheduler...");
  
  // Run on startup
  setTimeout(() => {
    console.log("Running initial startup scrape check...");
    runScraper().catch(console.error);
  }, 10000); // 10 seconds delay after startup

  cron.schedule('30 1,5,9 * * *', () => {
    console.log("Cron scheduled trigger: Starting daily price scrape...");
    runScraper().catch(console.error);
  });
}
