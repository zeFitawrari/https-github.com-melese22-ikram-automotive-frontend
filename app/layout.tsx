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

// Inline theme script: applies the dark/light class to <html> before hydration
// so there is no flash of an incorrect theme. Reads localStorage + system preference.
const themeScript = `(function(){try{var t=localStorage&&localStorage.getItem('ikram-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var h=document.documentElement;if(t==='dark'||(t!=='light'&&d)){h.classList.add('dark');}else{h.classList.remove('dark');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          id="ikram-theme-init"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
