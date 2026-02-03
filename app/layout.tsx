import type { Metadata, Viewport } from "next"; // ✨ Added Viewport Type
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { LanguageProvider } from "../context/LanguageContext"; // ✨ Added Language Import
import { WishlistProvider } from "../context/WishlistContext"; // ✨ NEW: Import Wishlist Provider
import CartSidebar from "../components/CartSidebar";
import Footer from "../components/Footer"; 
import Script from "next/script"; // ✨ Added for Tidio Integration
import VacationBanner from "../components/VacationBanner"; // ✨ NEW: Import Vacation Banner
import CookieConsent from "../components/CookieConsent"; // ✨ NEW: Import Cookie Consent Banner
import ExitIntentPopup from "../components/ExitIntentPopup"; // ✨ NEW: Import Exit Intent Popup

// 🗑️ Removed unused SocialProof import

const inter = Inter({ subsets: ["latin"] });

// ✨ NEW: Separated Viewport export to fix Next.js warnings
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// 🚀 GOOGLE SEO UPGRADE: Full Metadata for Search Engines
export const metadata: Metadata = {
  title: 'Rosetas Bouquets | Luxury Glitter Roses & Eternal Flowers',
  description: 'Shop the most beautiful glitter roses, eternal bouquets, and luxury floral arrangements. The perfect gift for any occasion. Shipping worldwide.',
  keywords: [
    'Glitter Roses', 
    'Rose Bouquets', 
    'Eternal Roses', 
    'Luxury Flowers', 
    'Glitter Flowers', 
    'Rosetas Bouquets', 
    'Glitzer Rosen',        // German
    'Ewige Rosen',          // German
    'Rosenstrauß',          // German
    'Luxus Blumen',         // German
    'Geschenk für sie',     // German
    'Germany Flowers'
  ],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Rosetas Bouquets | Luxury Glitter Roses',
    description: 'The world\'s most sparkly roses. Handcrafted luxury bouquets.',
    siteName: 'Rosetas Bouquets',
    type: 'website',
    locale: 'en_US', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ✨ Added overflow-x-hidden to body to prevent messy horizontal scrolling on phones */}
      <body className={`${inter.className} antialiased overflow-x-hidden w-full min-h-screen relative`}>
        {/* ✨ Wrapped with LanguageProvider to enable DE/EN switching */}
        <LanguageProvider>
          {/* ✨ Re-ordered CartProvider to ensure it wraps correctly */}
          <CartProvider>
            {/* ✨ NEW: Wrapped with WishlistProvider for Saved Items */}
            <WishlistProvider>
              
              {/* ✨ NEW: Vacation Banner (Shows only if active) */}
              <VacationBanner />

              {/* ✨ NEW: Exit Intent Popup (Triggers on leave) */}
              <ExitIntentPopup />

              {/* 1. The Main Content of the page */}
              {children}

              {/* 2. The Slide-out Cart (Hidden until clicked) */}
              <CartSidebar /> 

              {/* 3. The Footer (Now visible at the bottom) */}
              <Footer /> 

              {/* ✨ NEW: Cookie Consent Banner (Overlay at bottom) */}
              <CookieConsent />

            </WishlistProvider>
          </CartProvider>
        </LanguageProvider>

        {/* 💬 Rosetta's Tidio Live Chat Widget */}
        <Script 
          src="//code.tidio.co/9omzpnf35weioflov9qjkg9cgo7rt2x6.js" 
          strategy="afterInteractive" 
        />
      </body>
    </html>
  );
}