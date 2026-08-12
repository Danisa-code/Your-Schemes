// supabase.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project")
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!supabase) {
  console.warn("Supabase client is uninitialized. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set correctly in your .env file.");
}
