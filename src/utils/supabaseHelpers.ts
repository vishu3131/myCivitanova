import { supabase } from './supabaseClient.ts';

/**
 * Verifica se Supabase è configurato correttamente
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://dummy.supabase.co' && 
    supabaseAnonKey !== 'dummy-key');
}

/**
 * Wrapper per operazioni Supabase che gestisce errori di configurazione
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping operation');
    return fallback || null;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Supabase operation failed:', error);
    return fallback || null;
  }
}

export { supabase };