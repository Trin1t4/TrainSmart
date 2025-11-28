import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Provide a friendly error during development instead of the cryptic Supabase internal error
  const missing = [] as string[];
  if (!url) missing.push("VITE_SUPABASE_URL");
  if (!anonKey) missing.push("VITE_SUPABASE_ANON_KEY");
  throw new Error(
    `Missing Supabase environment variables: ${missing.join(", ")}.\n` +
      `Create a .env file in the client/ folder (or set your env) and restart the dev server. See client/.env.example.`
  );
}

export const supabase: SupabaseClient = createClient(url, anonKey);

export default supabase;
