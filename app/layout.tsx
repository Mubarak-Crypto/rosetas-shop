import type { Metadata } from "next";
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

// 🗑️ Removed unused SocialProof import

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rosetas Bouquets - Luxury Glitter Roses",
  description: "Hand-crafted satin roses from Essen, Germany.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ✨ Wrapped with LanguageProvider to enable DE/EN switching */}
        <LanguageProvider>
          <CartProvider>
            {/* ✨ NEW: Wrapped with WishlistProvider for Saved Items */}
            <WishlistProvider>
              
              {/* ✨ NEW: Vacation Banner (Shows only if active) */}
              <VacationBanner />

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