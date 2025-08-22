import './globals.css';
import '../styles/quartieri.css';
import '../styles/search-input.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { PageTransition } from '@/components/PageTransition';
import { CircularDevNavigation } from '@/components/CircularDevNavigation';
import BottomNavbarClientWrapper from '@/components/BottomNavbarClientWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SidebarProvider } from '@/context/SidebarContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { GlobalLoader } from '@/components/GlobalLoader';
import IntroOverlay from '@/components/IntroOverlay';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata = {
  title: 'Civitanova Marche App',
  description: 'Applicazione ufficiale della città di Civitanova Marche',
  'apple-mobile-web-app-capable': 'yes',
  'apple-touch-fullscreen': 'yes',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseHostname = (() => {
    try {
      return supabaseUrl ? new URL(supabaseUrl).hostname : null;
    } catch {
      return null;
    }
  })();

  return (
    <html lang="it" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {/* Network preconnects to reduce handshake latency */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {supabaseHostname && (
          <>
            <link rel="dns-prefetch" href={`//${supabaseHostname}`} />
            <link rel="preconnect" href={`https://${supabaseHostname}`} crossOrigin="anonymous" />
          </>
        )}
      </head>
      <body className="font-sans bg-black text-white">
        <ErrorBoundary>
          <LoadingProvider>
            <SidebarProvider>
              <IntroOverlay />
              <GlobalLoader />
              <PageTransition>
                {children}
              </PageTransition>
              <div>
                <BottomNavbarClientWrapper />
                <CircularDevNavigation />
              </div>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </SidebarProvider>
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
