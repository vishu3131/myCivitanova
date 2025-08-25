import SyncTestPage from '@/components/SyncTestPage';

/**
 * MYCIVITANOVA - PAGINA TEST SINCRONIZZAZIONE
 * 
 * Pagina Next.js per testare il sistema di sincronizzazione
 * tra Firebase e Supabase.
 * 
 * Accessibile su: /test-sync
 */

export default function TestSyncPage() {
  return <SyncTestPage />;
}

export const metadata = {
  title: 'Test Sincronizzazione | MyCivitanova',
  description: 'Pagina di test per il sistema di sincronizzazione Firebase-Supabase',
};