import './globals.css';
import { Inter } from 'next/font/google';
import { SidebarProvider } from '@/context/SidebarContext';
import { FirebaseSupabaseSyncProvider } from '@/components/FirebaseSupabaseSyncProvider';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import BottomNavbarClientWrapper from '@/components/BottomNavbarClientWrapper';
import { LoadingProvider } from '@/context/LoadingContext';
import { GlobalLoader } from '@/components/GlobalLoader';
import { PageTransition } from '@/components/PageTransition';
import ToasterClient from '@/components/ToasterClient';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'MyCivitanova',
  description: 'Applicazione ufficiale della città di Civitanova Marche',
  metadataBase: new URL('https://mycivitanova.it'),
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyCivitanova',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProd = process.env.NODE_ENV === 'production';
  return (
    <html lang="it" className={inter?.variable || ''}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Canonical come fallback se non gestito per-route */}
        <link rel="canonical" href="https://mycivitanova.it" />
      </head>
      <body className="font-sans bg-black text-white">
        <LoadingProvider>
          <SidebarProvider>
            <FirebaseSupabaseSyncProvider
              autoSync={true}
              syncOnMount={true}
              realtimeSync={true}
              showNotifications={false}
              realtimeSyncOptions={{
                enableAuthSync: true,
                enableProfileSync: true,
                enableBatchSync: false,
                debounceDelay: 1000,
                maxRetries: 3
              }}
            >
              <GlobalLoader />
              <PageTransition>
                {children}
              </PageTransition>
              <BottomNavbarClientWrapper />
              <ToasterClient />
              {isProd && <Analytics />}
              {isProd && <SpeedInsights />}
            </FirebaseSupabaseSyncProvider>
          </SidebarProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
