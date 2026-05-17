import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Sheik] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não definidos. Configure o .env para usar o banco em nuvem.",
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-key",
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
