// scraper.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { districtMarketMap } from "./districtMarketMap.js";

dotenv.config();

const CROP_LIST = [
  { id: '8', name: 'Tomato' },
  { id: '9', name: 'Potato' },
  { id: '10', name: 'Small Onion' },
  { id: '11', name: 'Big Onion' },
  { id: '12', name: 'Chilli' },
  { id: '13', name: 'Brinjal' },
  { id: '14', name: 'Bhendi' },
  { id: '15', name: 'Drumstick' },
  { id: '16', name: 'Ribbed gourd' },
  { id: '17', name: 'Bottle Gourd' },
  { id: '18', name: 'Snake gourd' },
  { id: '19', name: 'Bitter Gourd' },
  { id: '20', name: 'Coconut' },
  { id: '21', name: 'Radish' },
  { id: '22', name: 'Beans' },
  { id: '23', name: 'Avarai' },
  { id: '24', name: 'Carrot' },
  { id: '25', name: 'Betel vine' },
  { id: '26', name: 'Mango (fruit)' },
  { id: '27', name: 'Banana (fruit)' },
  { id: '32', name: 'Ginger' },
  { id: '34', name: 'sapota' },
  { id: '35', name: 'Guava' },
  { id: '36', name: 'Custard Apple' },
  { id: '37', name: 'Pappaya' },
  { id: '38', name: 'Cluster Beans' },
  { id: '39', name: 'Ash gourd' },
  { id: '40', name: 'Elephant foot Yam' },
  { id: '41', name: 'Mango (veg)' },
  { id: '42', name: 'Tapioca' },
  { id: '43', name: 'Baby Corn' },
  { id: '44', name: 'Amla' },
  { id: '45', name: 'Banana (veg)' },
  { id: '46', name: 'Banana flower' },
  { id: '47', name: 'Banana stem' },
  { id: '48', name: 'Banana Leaf' },
  { id: '49', name: 'Greens' },
  { id: '50', name: 'Coriander Leaf' },
  { id: '51', name: 'Curry Leaf' },
  { id: '52', name: 'Mint Leaf' },
  { id: '53', name: 'Pumpkin' },
  { id: '55', name: 'Lemon' },
  { id: '56', name: 'Beetroot' },
  { id: '57', name: 'Chow Chow' },
  { id: '58', name: 'Cabbage' },
  { id: '59', name: 'garlic' },
  { id: '60', name: 'Cowpea' },
  { id: '61', name: 'Mochai' },
  { id: '62', name: 'Colacasia' },
  { id: '63', name: 'Sweet Potato' },
  { id: '64', name: 'Kovvaikai' },
  { id: '65', name: 'Cucumber' },
  { id: '66', name: 'Cauliflower' },
  { id: '67', name: 'Groundnut' },
  { id: '68', name: 'Sweet corn' },
  { id: '69', name: 'Mushroom' },
  { id: '70', name: 'Knol Khol' },
  { id: '71', name: 'Turnip' },
  { id: '72', name: 'Peas' },
  { id: '73', name: 'Brocoli' },
  { id: '74', name: 'Capsicum' },
  { id: '75', name: 'Pomegranate' },
  { id: '76', name: 'Grapes' },
  { id: '77', name: 'Apple' },
  { id: '78', name: 'Orange' },
  { id: '79', name: 'Sweet lime' },
  { id: '80', name: 'Pinapple' },
  { id: '81', name: 'Muskmelon' },
  { id: '82', name: 'Watermelon' },
  { id: '83', name: 'Jackfruit' },
  { id: '84', name: 'Pear' },
  { id: '85', name: 'Sundaikai' },
  { id: '86', name: 'Fig' },
  { id: '87', name: 'Jamun' },
  { id: '88', name: 'Goose berry (Nellikkai)' },
  { id: '89', name: 'Citron (Narthai)' },
  { id: '90', name: 'Tamarind' },
  { id: '91', name: 'Perandai' },
  { id: '92', name: 'Butter Beans' },
  { id: '93', name: 'Soya Beans' },
  { id: '94', name: 'Karunaikizhangu' },
  { id: '95', name: 'Dragon fruit' },
  { id: '96', name: 'Siru Kizhagu' },
  { id: '97', name: 'Bajji chilli' },
  { id: '98', name: 'Onion leaf' },
  { id: '99', name: 'Water Apple' },
  { id: '100', name: 'Red Chilli' },
  { id: '101', name: 'Wood Apple' },
  { id: '102', name: 'Double Beans' },
  { id: '103', name: 'Bread Fruit' },
  { id: '104', name: 'Nerium' },
  { id: '105', name: 'kakatan' },
  { id: '106', name: 'Rose' },
  { id: '107', name: 'Marigold' },
  { id: '108', name: 'Tuberose' },
  { id: '109', name: 'Jasmine' },
  { id: '110', name: 'crossandra' },
  { id: '111', name: 'Pichi' },
  { id: '112', name: 'Red Cabbage' },
  { id: '113', name: 'Redgram' },
  { id: '114', name: 'Marikozhunthu' },
  { id: '115', name: 'Wild lemon' },
  { id: '116', name: 'Tender Coconut' },
  { id: '117', name: 'Sugarcane' },
  { id: '118', name: 'Tulasi' },
  { id: '119', name: 'Ma.Inji' },
  { id: '121', name: 'Purple Yam' },
  { id: '122', name: 'Pidikarunai' },
  { id: '123', name: 'Turmeric Bunch' },
  { id: '124', name: 'Panangkizhangu' },
  { id: '125', name: 'Palmyra fruit' },
  { id: '126', name: 'Athalakkai' },
  { id: '127', name: 'Ixora' },
  { id: '128', name: 'Kadampam' },
  { id: '129', name: 'Tomato(Local)' },
  { id: '130', name: 'Tomato (Bangalore)' },
  { id: '131', name: 'Brinjal (Green Striped)' },
  { id: '132', name: 'Brinjal (Blue Striped)' },
  { id: '133', name: 'Brinjal (White)' },
  { id: '134', name: 'Brinjal (Spiny)' },
  { id: '135', name: 'Bitter Gourd (Big)' },
  { id: '136', name: 'Bitter Gourd (Mithi Pagal)' },
  { id: '137', name: 'Potato (Ooty)' },
  { id: '138', name: 'Potato (Agra)' },
  { id: '139', name: 'Avarai (Big)' },
  { id: '140', name: 'Avarai (Nadu)' },
  { id: '141', name: 'garlic (Nadu)' },
  { id: '142', name: 'garlic (Malai Poondu)' },
  { id: '143', name: 'Mango (Neelam)' },
  { id: '144', name: 'Mango (Banganapalli)' },
  { id: '145', name: 'Mango (Alphonso)' },
  { id: '146', name: 'Mango (Bangalora)' },
  { id: '147', name: 'Mango (Imam Pasand)' },
  { id: '148', name: 'Mango (Malgova)' },
  { id: '149', name: 'Mango (Sindhura)' },
  { id: '150', name: 'Mango (Rumani)' },
  { id: '151', name: 'Banana (Red banana)' },
  { id: '152', name: 'Banana (Nendran)' },
  { id: '153', name: 'Banana (Rasthali)' },
  { id: '154', name: 'Banana  (Karpuravalli)' },
  { id: '155', name: 'Banana (Poovan)' },
  { id: '156', name: 'Banana (Yelakki)' },
  { id: '157', name: 'Banana (Matti)' },
  { id: '158', name: 'Banana (Nadu)' },
  { id: '159', name: 'Banana (Green banana)' },
  { id: '160', name: 'tomato' }
];

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project")) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase credentials not configured correctly in environment variables.");
}

function parseCropName(name: string) {
  const match = name.match(/^([^(]+)\s*\(([^)]+)\)$/);
  let commodity = name;
  let variety = 'Local';
  if (match) {
    commodity = match[1].trim();
    variety = match[2].trim();
  }
  // Capitalize first letter
  commodity = commodity.charAt(0).toUpperCase() + commodity.slice(1);
  variety = variety.charAt(0).toUpperCase() + variety.slice(1);
  return { commodity, variety };
}

export async function runScraper() {
  console.log(`Starting scraper run at ${new Date().toISOString()}`);

  const dateStr = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]; // IST Date
  let rowsInserted = 0;
  let rowsUpdated = 0;
  let rowsFailed = 0;
  const errorsList: string[] = [];

  const allRecords: any[] = [];

  for (const crop of CROP_LIST) {
    const url = `https://agrimark.tn.gov.in/home/us_dist_report_api/${dateStr}/${crop.id}`;

    let attempts = 3; 
    let success = false;
    let dataText = "";

    while (attempts > 0 && !success) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (res.ok) {
          dataText = await res.text();
          success = true;
        } else {
          throw new Error(`Status ${res.status}`);
        }
      } catch (err: any) {
        attempts--;
        console.warn(`Attempt failed for crop ${crop.name} (id: ${crop.id}). Remaining attempts: ${attempts}. Error: ${err.message}`);
        if (attempts > 0) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    if (!success) {
      errorsList.push(`Failed to fetch crop ${crop.name} after 3 attempts.`);
      continue;
    }

    if (!dataText || dataText === 'error' || dataText.trim() === '[]' || dataText.trim() === '{}') {
      continue;
    }

    try {
      const parsedData = JSON.parse(dataText);
      const { commodity, variety } = parseCropName(crop.name);

      for (const [marketKey, prices] of Object.entries(parsedData)) {
        const priceInfo = prices as { min?: string; max?: string; modal?: string | number };
        const marketName = marketKey.trim();

        // STRICT FILTER: only accept markets that are in our Tamil Nadu districtMarketMap
        if (!districtMarketMap.hasOwnProperty(marketName)) {
          console.log(`[Scraper] Skipping unknown market (non-TN): "${marketName}"`);
          continue;
        }

        const districtName = districtMarketMap[marketName];

        const minPrice = parseFloat(priceInfo.min || '0');
        const maxPrice = parseFloat(priceInfo.max || '0');
        const modalPrice = typeof priceInfo.modal === 'number' ? priceInfo.modal : parseFloat(priceInfo.modal || '0');

        if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(modalPrice)) {
          rowsFailed++;
          continue;
        }

        // Skip zero-price records
        if (minPrice === 0 && maxPrice === 0 && modalPrice === 0) {
          continue;
        }

        allRecords.push({
          district: districtName,
          market: marketName,
          commodity,
          variety,
          grade: 'N/A',
          arrival_date: dateStr,
          min_price: minPrice,
          max_price: maxPrice,
          modal_price: modalPrice,
          source: 'Tamil Nadu Agrimark',
          source_state: 'Tamil Nadu',
          last_updated: new Date().toISOString()
        });
      }
    } catch (e: any) {
      errorsList.push(`JSON parsing error for crop ${crop.name}: ${e.message}`);
    }

    // Gentle delay to not overwhelm the website
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`Scraper parsed ${allRecords.length} records. Committing to database...`);

  if (supabase && allRecords.length > 0) {
    try {
      // Chunk upserts to prevent huge request sizes
      const CHUNK_SIZE = 100;
      for (let i = 0; i < allRecords.length; i += CHUNK_SIZE) {
        const chunk = allRecords.slice(i, i + CHUNK_SIZE);
        const { error, data } = await supabase
          .from('mandi_prices')
          .upsert(chunk, { onConflict: 'district,market,commodity,variety,arrival_date' });

        if (error) {
          throw new Error(error.message);
        }
      }

      // Compute inserted vs updated (just basic simulation or we can count success)
      rowsInserted = allRecords.length;
    } catch (err: any) {
      console.error("Supabase upsert failure:", err.message);
      errorsList.push(`Database upsert failed: ${err.message}`);
      rowsFailed += allRecords.length;
    }
  } else if (!supabase) {
    console.log("Dry run: Database not connected. Logging parsed prices to console (first 3 records):");
    console.log(allRecords.slice(0, 3));
    rowsInserted = allRecords.length;
  }

  // Calculate next run time
  // IST times: 7 AM, 11 AM, 3 PM.
  // Next run is calculated in UTC/Local based on current time
  const now = new Date();
  let nextRun = new Date();
  nextRun.setUTCHours(1, 30, 0, 0); // 7 AM IST
  if (now > nextRun) {
    nextRun.setUTCHours(5, 30, 0, 0); // 11 AM IST
  }
  if (now > nextRun) {
    nextRun.setUTCHours(9, 30, 0, 0); // 3 PM IST
  }
  if (now > nextRun) {
    nextRun.setUTCDate(now.getUTCDate() + 1);
    nextRun.setUTCHours(1, 30, 0, 0); // 7 AM IST tomorrow
  }

  const runStatus = errorsList.length === 0 ? 'SUCCESS' : (rowsInserted > 0 ? 'PARTIAL' : 'FAILED');

  if (supabase) {
    try {
      await supabase.from('scraper_logs').insert([{
        run_time: new Date().toISOString(),
        rows_inserted: rowsInserted,
        rows_updated: rowsUpdated,
        rows_failed: rowsFailed,
        status: runStatus,
        errors: errorsList.length > 0 ? errorsList.join('\n') : null,
        next_run: nextRun.toISOString()
      }]);
    } catch (err: any) {
      console.error("Failed to write to scraper_logs table:", err.message);
    }
  }

  console.log(`Scraper run complete. Status: ${runStatus}. Records: ${rowsInserted} processed.`);
  return {
    status: runStatus,
    rowsInserted,
    rowsUpdated,
    rowsFailed,
    errors: errorsList,
    nextRun
  };
}

// Allow CLI trigger directly
if (process.argv[1] && process.argv[1].endsWith('scraper.ts')) {
  runScraper().catch(console.error);
}
