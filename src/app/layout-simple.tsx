import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Civitanova Marche App',
  description: 'Applicazione ufficiale della città di Civitanova Marche',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter?.variable || ''}>
      <body className="font-sans bg-black text-white">
        {children}
      </body>
    </html>
  );
}