import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Mask the publishable API key for secure logging
const maskedKey = supabaseAnonKey 
  ? `${supabaseAnonKey.slice(0, 6)}...${supabaseAnonKey.slice(-6)}` 
  : "Not Configured";

console.log(`[Supabase Service] Initializing client... URL: ${supabaseUrl || "Not Configured"} | Anon Key: ${maskedKey}`);

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your-project") || supabaseAnonKey.includes("your-supabase-anon-key")) {
  console.warn(
    "[Supabase Service] Supabase configuration is missing or using placeholders. " +
    "Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
