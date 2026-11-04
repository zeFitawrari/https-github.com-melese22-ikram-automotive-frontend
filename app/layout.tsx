import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Ikram Automotive Workshop',
  description: 'EV-Centric Workshop & Customization Management System',
  metadataBase: new URL('https://ikramautomotive.com'),
  openGraph: {
    images: ['/og-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
