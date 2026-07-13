import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Inter, Playfair_Display } from 'next/font/google';
import { PostHogProvider } from '@/lib/analytics/provider';
import { CookieConsent } from '@/components/CookieConsent';
import './globals.css';

const inter = Inter({
 subsets: ['latin'],
 variable: '--font-sans',
 display: 'swap',
});

const playfairDisplay = Playfair_Display({
 subsets: ['latin'],
 variable: '--font-display',
 display: 'swap',
 weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
 title: 'Escape Tour – GPS-Escape-Touren für eure Stadt',
 description: 'Erlebt eure Stadt als Escape-Abenteuer. Löst Rätsel an echten Orten und entdeckt versteckte Ecken per GPS-Escape-Tour. Wählt euren Standort und legt los.',
 manifest: '/manifest.json',
 keywords: ['Escape Tour', 'GPS-Tour', 'Schnitzeljagd', 'Stadtführung', 'Rätsel', 'Outdoor Escape Game'],
 authors: [{ name: 'Escape Tour' }],
 creator: 'Escape Tour',
 publisher: 'Escape Tour',
 formatDetection: {
  email: false,
  address: false,
  telephone: false,
 },
 appleWebApp: {
  capable: true,
  statusBarStyle: 'black-translucent',
  title: 'Escape Tour',
 },
 metadataBase: new URL('https://myescapetour.com'),
 alternates: {
  canonical: '/',
 },
 openGraph: {
  title: 'Escape Tour – GPS-Escape-Touren für eure Stadt',
  description: 'Erlebt eure Stadt als Escape-Abenteuer. Löst Rätsel an echten Orten und entdeckt versteckte Ecken per GPS-Escape-Tour.',
  url: 'https://myescapetour.com',
  siteName: 'Escape Tour',
  locale: 'de_DE',
  type: 'website',
  images: [
   {
    url: '/og-image.jpg',
    width: 1200,
    height: 630,
    alt: 'Escape Tour',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Escape Tour – GPS-Escape-Touren für eure Stadt',
  description: 'Erlebt eure Stadt als Escape-Abenteuer. Löst Rätsel an echten Orten und entdeckt versteckte Ecken per GPS-Escape-Tour.',
  images: ['/og-image.jpg'],
 },
 robots: {
  index: true,
  follow: true,
  googleBot: {
   index: true,
   follow: true,
   'max-video-preview': -1,
   'max-image-preview': 'large',
   'max-snippet': -1,
  },
 },
};

export const viewport: Viewport = {
 width: 'device-width',
 initialScale: 1,
 maximumScale: 5,
 userScalable: true,
 themeColor: [
  { media: '(prefers-color-scheme: light)', color: '#000000' },
  { media: '(prefers-color-scheme: dark)', color: '#000000' },
 ],
};

interface RootLayoutProps {
 readonly children: React.ReactNode;
}

/**
 * Providers component placeholder
 * Will wrap the app with context providers (theme, auth, etc.)
 */
function Providers({ children }: { readonly children: React.ReactNode }) {
 return (
  <Suspense fallback={null}>
   <PostHogProvider>{children}</PostHogProvider>
  </Suspense>
 );
}

/**
 * Root layout component
 * Provides the base HTML structure and global providers
 */
export default function RootLayout({ children }: RootLayoutProps) {
 return (
  <html lang="de" className={`${inter.variable} ${playfairDisplay.variable}`}>
   <head>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
   </head>
   <body className="min-h-screen bg-dark-950 text-white font-sans antialiased">
    <Providers>{children}</Providers>
    <CookieConsent />
   </body>
  </html>
 );
}
