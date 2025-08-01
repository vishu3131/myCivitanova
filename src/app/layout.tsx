import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import { PageTransition } from '@/components/PageTransition';
import { CircularDevNavigation } from '@/components/CircularDevNavigation';
import { BottomNavbar } from '@/components/BottomNavbar';

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
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">
        <PageTransition>
          {children}
        </PageTransition>
        <div className="md:hidden">
          <BottomNavbar />
        </div>
        <CircularDevNavigation />
      </body>
    </html>
  );
}
