import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set and not placeholder values
const isValidUrl = (url: string | undefined): boolean => {
  if (!url || url === 'YOUR_SUPABASE_URL') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidKey = (key: string | undefined): boolean => {
  return !!(key && key !== 'YOUR_SUPABASE_ANON_KEY' && key.length > 10);
};

const hasValidConfig = isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey);

if (!hasValidConfig) {
  console.warn('Supabase environment variables are not properly configured. Using dummy client.');
}

// Crea un client dummy se le variabili non sono disponibili (per il build)
export const supabase = hasValidConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createClient('https://dummy.supabase.co', 'dummy-key');
