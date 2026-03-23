import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';

interface MarketingLayoutProps {
 readonly children: React.ReactNode;
}

/**
 * Marketing layout component
 * Wraps marketing pages with header and footer
 */
export default function MarketingLayout({ children }: MarketingLayoutProps) {
 return (
  <div className="flex min-h-screen flex-col">
   <Header />
   <main className="flex-1">{children}</main>
   <Footer />
  </div>
 );
}
