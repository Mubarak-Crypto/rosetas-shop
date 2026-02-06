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
    // 🏆 BRAND KEYWORDS (New Additions)
    'Rosetas Bouquets', 'Rose Bouquets', 'Rosetas Bouquts', 'Roses Bouquets',
    'Rosetas Bouquet online Shop', 'Rosetas Bouquets Shop', 'Rosetas Bouquet Shop',

    // 🌟 ORIGINAL KEYWORDS
    'Glitter Roses', 'Rose Bouquets', 'Eternal Roses', 'Luxury Flowers', 
    'Glitter Flowers', 'Rosetas Bouquets', 'Germany Flowers',

    // 🌍 NEW ENGLISH KEYWORDS
    // General Gifts
    'buy gift items online', 'online gift shop', 'gift ideas', 'gifts for every occasion', 
    'gift shop', 'gift items shop', 'gift items Germany', 'gift shop Germany', 
    'online gifts Germany', 'gift delivery Germany', 'special gift ideas for women', 
    'elegant gifts online',

    // Roses & Rose Gifts
    'buy glitter rose', 'glitter rose gift', 'eternal rose gift', 'rose gift box', 
    'rose gift box', 'rose basket', 'roses as a gift', 'luxury rose gift', 
    'luxury rose gift box', 'rose gift for birthday', 'romantic rose gift',

    // Glitter Flowers Specifics
    'buy glitter flowers', 'glitter flower bouquet', 'glitter rose bouquet', 
    'glitter flower gift', 'buy glitter flowers online', 'pink glitter roses', 
    'red glitter roses', 'gold glitter roses', 'silver glitter flowers', 
    'black glitter roses', 'blue glitter flowers', 'rose gold glitter roses', 
    'colorful glitter flowers', 'buy glitter flower bouquet', 'luxury glitter flower bouquet', 
    'glitter flower bouquet gift', 'glitter rose bouquet for women', 'glitter flowers for special occasions',

    // Character Flowers (Hello Kitty, Stitch, Barbie)
    'Hello Kitty flowers', 'Hello Kitty flower bouquet', 'Hello Kitty rose gift', 'Hello Kitty flower gift box',
    'Stitch flowers', 'Stitch flower bouquet', 'Stitch rose gift', 'Stitch flower gift box',
    'Barbie flowers', 'Barbie flower bouquet', 'Barbie rose gift', 'Barbie flower gift box',

    // Men & Special Gifts
    'football flower gift', 'football rose gift', 'gift for football fan', 
    'flowers for men', 'rose gift for men', 'flower gift box for men',

    // Occasions
    'birthday flower gift', 'glitter flowers Valentine’s Day', 'anniversary flower gift', 
    'rose gift Mother’s Day', 'romantic flower gift box', 'flower gift for girlfriend', 
    'pink glitter roses gift', 'glitter flower bouquet birthday', 'luxury rose gift box', 
    'unique flower gift idea', 'unique glitter flowers',

    // Premium & Box Gifts
    'flower gift box', 'flower bouquet as a gift', 'special flower gift', 'modern flower gift idea', 
    'buy premium flowers online', 'decorative flower gift', 'long-lasting flower gift', 
    'luxury flower gift box', 'premium flower gift', 'exclusive rose gift box', 
    'elegant flower arrangement', 'designer flower gift', 'high-quality rose gift', 
    'luxury gift for women', 'luxury gift for girlfriend', 'eternal flower gift', 
    'preserved rose gift', 'long-lasting rose gift box', 'flowers that last long gift',

    // Emotions & Social
    'personalized flower gift box', 'romantic gift box', 'love gift with flowers', 
    'gift to say thank you', 'apology flower gift', 'surprise flower gift',
    'Instagram flower gift', 'TikTok flower trend', 'trendy flower gift', 
    'viral flower gift idea', 'modern flower gift box', 'send flowers online', 
    'flower gift delivery', 'flower gift shipping', 'flower delivery Germany',

    // 🇩🇪 GERMAN KEYWORDS (Original & New)
    'Glitzer Rosen', 'Ewige Rosen', 'Rosenstrauß', 'Luxus Blumen', 'Geschenk für sie',

    // Geschenke Allgemein
    'Geschenkartikel online kaufen', 'Geschenke online Shop', 'Geschenkideen', 
    'Geschenke für jeden Anlass', 'Geschenkshop', 'Geschenkartikel Shop', 
    'Geschenkartikel Deutschland', 'Geschenkshop Deutschland', 'Geschenk online Deutschland', 
    'Geschenkversand Deutschland', 'besondere Geschenkideen für Frauen', 
    'luxuriöse Geschenkbox mit Rosen', 'edle Geschenke online kaufen', 
    'Geschenk mit Rosen für Geburtstag', 'romantisches Geschenk mit Rosen',

    // Rosen & Boxen
    'Glitzerrose kaufen', 'Glitzerrosen Geschenk', 'Ewige Rose Geschenk', 
    'Rosen Geschenkbox', 'Rosenbox Geschenk', 'Rosenkorb', 'Rosen als Geschenk', 
    'Luxus Rosen Geschenk', 'Geschenkbox kaufen', 'Geschenkbox für Frauen', 
    'Geschenkbox für Männer', 'Geschenkbox Geburtstag', 'Geschenkkorb', 
    'Geschenkkorb kaufen', 'Geschenkkorb Geschenk',

    // Glitzer Blumen (DE)
    'Glitzer Blumen', 'Glitzerblumen kaufen', 'Glitzer Blumenstrauß', 
    'Glitzer Rosenstrauß', 'Glitzer Blumen Geschenk', 'Glitzer Blumen online kaufen', 
    'pinke Glitzer Rosen', 'rote Glitzer Rosen', 'goldene Glitzer Rosen', 
    'silberne Glitzer Blumen', 'schwarze Glitzer Rosen', 'blaue Glitzer Blumen', 
    'roségold Glitzer Rosen', 'bunte Glitzer Blumen', 'Glitzer Blumenstrauß kaufen', 
    'luxuriöser Glitzer Blumenstrauß', 'Glitzer Blumenstrauß Geschenk', 
    'Glitzer Rosenstrauß für Frauen', 'Glitzer Blumen für besondere Anlässe',

    // Charaktere (DE)
    'Hello Kitty Blumen', 'Hello Kitty Blumenstrauß', 'Hello Kitty Rosen Geschenk', 
    'Hello Kitty Geschenkbox Blumen', 'Stitch Blumen', 'Stitch Blumenstrauß', 
    'Stitch Rosen Geschenk', 'Stitch Geschenkbox Blumen', 'Barbie Blumen', 
    'Barbie Blumenstrauß', 'Barbie Rosen Geschenk', 'Barbie Geschenkbox Blumen',

    // Männer & Fußball (DE)
    'Fußball Blumen', 'Fußball Rosen Geschenk', 'Geschenk für Fußballfan', 
    'Männer Blumen Geschenk', 'Rosen Geschenk für Männer', 'Geschenkbox Männer Blumen',

    // Anlässe & Personen (DE)
    'Geschenk Geburtstag', 'Geschenk Valentinstag', 'Geschenk Jahrestag', 
    'Geschenk Hochzeit', 'Geschenk Muttertag', 'Geschenk für Freundin', 
    'Geschenk für Freund', 'Geschenk für Frau', 'Geschenk für Mann',
    'Geschenk für Erzieherin', 'Geschenk für Kollegin Büro', 'Geschenk für Arbeitskollegin', 
    'Geschenk für Chefin Blumen', 'Geschenk für Mitarbeiterin', 'neutrales Blumen Geschenk', 
    'seriöses Geschenk mit Blumen', 'Blumen Geschenk zum Einzug', 
    'Geschenk zum Abschluss Blumen', 'Geschenk zum Schulabschluss', 
    'Geschenk zur Beförderung', 'Dankeschön Geschenk Blumen', 
    'Geschenk für junge Frau', 'Geschenk für erwachsene Frau', 
    'Geschenk für beste Freundin', 'Geschenk für Ehefrau', 'Geschenk für Schwester', 
    'Geschenk für Tochter',

    // Premium & Eigenschaften (DE)
    'Blumen Geschenkbox', 'Blumenstrauß als Geschenk', 'besondere Blumen Geschenk', 
    'moderne Blumen Geschenkidee', 'hochwertige Blumen online kaufen', 
    'Blumen mit Deko Geschenk', 'langlebige Blumen Geschenk', 'dekorative Blumen Geschenk', 
    'Luxus Geschenkbox Blumen', 'Premium Blumen Geschenk', 'exklusive Rosen Geschenkbox', 
    'edles Blumenarrangement', 'Designer Blumen Geschenk', 'hochwertige Rosen Geschenk', 
    'Luxus Geschenk für Frauen', 'Luxus Geschenk für Freundin', 'ewige Blumen Geschenk', 
    'haltbare Rosen Geschenk', 'langlebige Rosen Geschenkbox', 'konservierte Rosen Geschenk', 
    'Blumen die lange halten Geschenk', 'Rosen für die Ewigkeit Geschenk',
    'Geschenkbox mit Blumen und Rosen', 'personalisierte Geschenkbox Blumen', 
    'Geschenkbox mit Deko', 'Geschenkbox Überraschung', 'Geschenkbox Liebe', 
    'Geschenkbox romantisch', 'Liebesgeschenk mit Blumen', 'romantisches Blumen Geschenk', 
    'Geschenk aus Liebe', 'Geschenk um Danke zu sagen', 'Entschuldigung Geschenk Blumen', 
    'Überraschung Geschenk Blumen', 'Aufmerksamkeit Geschenk Blumen',

    // Social & Delivery (DE)
    'Instagram Blumen Geschenk', 'TikTok Blumen Trend', 'trendige Blumen Geschenk', 
    'virale Blumen Geschenkidee', 'moderne Geschenkbox Blumen', 'Blumen online verschenken', 
    'Blumen Geschenk liefern lassen', 'Blumen Geschenk Versand', 
    'Geschenk Blumen schnell geliefert', 'Blumen Geschenk deutschlandweit'
  ],
  icons: {
    icon: '/favicon.ico',
    apple: '/logo-black.png', // ✨ Updated: Black logo for phone home screens
  },
  openGraph: {
    title: 'Rosetas Bouquets | Luxury Glitter Roses',
    description: 'The world\'s most sparkly roses. Handcrafted luxury bouquets.',
    siteName: 'Rosetas Bouquets',
    type: 'website',
    locale: 'en_US', 
    // ✨ I REMOVED the "images" list here so it uses your new opengraph-image.png automatically!
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