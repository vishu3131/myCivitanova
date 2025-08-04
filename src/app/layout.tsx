import './globals.css';
import '../styles/quartieri.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { PageTransition } from '@/components/PageTransition';
import { CircularDevNavigation } from '@/components/CircularDevNavigation';
import BottomNavbarClientWrapper from '@/components/BottomNavbarClientWrapper';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
  return (
    <html lang="it" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans bg-black text-white">
        <ErrorBoundary>
          <PageTransition>
            {children}
          </PageTransition>
          <div className="md:hidden">
            <BottomNavbarClientWrapper />
            <CircularDevNavigation />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
