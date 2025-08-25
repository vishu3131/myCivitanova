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
import { FirebaseSupabaseSyncProvider } from '@/components/FirebaseSupabaseSyncProvider';

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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
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
  // Firebase configuration will be handled in components that need it

  return (
    <html lang="it" className={`${inter?.variable || ''} ${spaceGrotesk?.variable || ''}`}>
      <head>
        {/* Network preconnects to reduce handshake latency */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Firebase preconnects will be handled automatically */}
      </head>
      <body className="font-sans bg-black text-white">
        <ErrorBoundary>
          <LoadingProvider>
            <SidebarProvider>
              <FirebaseSupabaseSyncProvider
                options={{
                  autoSync: true,
                  refreshInterval: 30000,
                  enableNotifications: false,
                  realtimeSync: true,
                  realtimeSyncOptions: {
                    enableAuthSync: true,
                    enableProfileSync: true,
                    enableBatchSync: false,
                    debounceDelay: 1000,
                    maxRetries: 3,
                    retryDelay: 2000
                  }
                }}
              >
                <IntroOverlay />
                <GlobalLoader />
                <PageTransition>
                  {children}
                </PageTransition>
                <div>
                  <BottomNavbarClientWrapper />
                  {/* <CircularDevNavigation /> */}
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
              </FirebaseSupabaseSyncProvider>
            </SidebarProvider>
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
