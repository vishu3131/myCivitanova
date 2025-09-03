import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;
let supabaseFallback: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  // Prova prima con la service_role key
  if (supabaseServiceKey && 
      supabaseServiceKey !== 'your-service-role-key-here' && 
      supabaseServiceKey !== '__REPLACE_WITH_YOUR_SERVICE_ROLE_KEY__') {
    if (!supabaseAdmin) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
    }
    return supabaseAdmin;
  }

  // Fallback alla chiave anon con warning
  if (supabaseAnonKey) {
    console.warn('⚠️  ATTENZIONE: Usando chiave anon invece di service_role. Alcune operazioni potrebbero essere limitate dalle politiche RLS.');
    console.warn('📝 Per risolvere: configura SUPABASE_SERVICE_ROLE_KEY nel file .env');
    
    if (!supabaseFallback) {
      supabaseFallback = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false }
      });
    }
    return supabaseFallback;
  }

  throw new Error('Missing both SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
}