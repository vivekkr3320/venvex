import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Handle empty config gracefully for client-side demo runs
const isConfigured = supabaseUrl && supabaseAnonKey;

if (!isConfigured) {
  console.warn(
    'Supabase URL or Anon Key is missing. Invoicely will run in local demo/mock mode.'
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const hasSupabaseConfig = () => !!supabase;
