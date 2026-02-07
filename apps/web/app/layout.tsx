import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
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
  title: 'Escape Tour Warnemünde – Das Vermächtnis des Lotsenkapitäns',
  description: 'Entdeckt Warnemünde auf eine ganz neue Art. Eine spannende Escape-Tour durch die maritime Geschichte des Ostseebades.',
  keywords: ['Escape Tour', 'Warnemünde', 'Schnitzeljagd', 'Stadtführung', 'Rätsel', 'Ostsee'],
  authors: [{ name: 'Escape Tour Warnemünde' }],
  creator: 'Escape Tour Warnemünde',
  publisher: 'Escape Tour Warnemünde',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://escape-tour-warnemuende.de'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Escape Tour Warnemünde – Das Vermächtnis des Lotsenkapitäns',
    description: 'Entdeckt Warnemünde auf eine ganz neue Art. Eine spannende Escape-Tour durch die maritime Geschichte des Ostseebades.',
    url: 'https://escape-tour-warnemuende.de',
    siteName: 'Escape Tour Warnemünde',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Escape Tour Warnemünde',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escape Tour Warnemünde – Das Vermächtnis des Lotsenkapitäns',
    description: 'Entdeckt Warnemünde auf eine ganz neue Art. Eine spannende Escape-Tour durch die maritime Geschichte des Ostseebades.',
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
    { media: '(prefers-color-scheme: light)', color: '#082f49' },
    { media: '(prefers-color-scheme: dark)', color: '#082f49' },
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
  return <>{children}</>;
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
      <body className="min-h-screen bg-navy-950 text-white font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
