"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // ✨ Import Supabase

type Language = 'DE' | 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getCategoryName: (key: string) => string; // ✨ NEW FUNCTION
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 📖 Full Translation Dictionary - UPDATED FOR ENGLISH CONSISTENCY
const translations: Record<Language, Record<string, string>> = {
  DE: {
    // Navbar & Common
    "nav_shop": "Shop",
    "nav_supplies": "Floristenbedarf", 
    "nav_about": "Über uns",
    "admin_login": "Admin Login",
    "cart": "Warenkorb",
    
    // Home Page
    "hero_title": "Not just flowers — a statement.",
    "hero_subtitle": "Für Wirkung gemacht.", 
    "shop_now": "Zum Shop gehen",
    "our_collection": "Unsere Kollektion",
    
    // ✨ STORY SECTION (German version confirmed)
    "story_badge": "HANDGEFERTIGT IN ESSEN • UNSERE GESCHICHTE",
    "story_title": "Wo Kunstfertigkeit auf Eleganz trifft.",
    "story_text": "Bei Rosetas entstehen keine gewöhnlichen Blumen, sondern Statements aus Eleganz und Qualität. Seit unserer Gründung im Jahr 2025 stehen wir für hochwertige, handgefertigte Blumenkonzepte, die Emotionen bewahren und Luxus neu definieren.",

    // Features Component
    "features_headline_start": "Deshalb ist",
    "features_headline_end": "die erste Wahl",
    "features_subtitle": "Qualität, Verständnis und Umsetzung – auf die Sie zählen können.",
    "feat_1_title": "Rosetas Glanz",
    "feat_1_desc": "Ein Blick genügt, um Rosetas zu erkennen",
    "feat_2_title": "Mehr als ein Geschenk",
    "feat_2_desc": "Ein bleibende Eindruck für besondere Momente",
    "feat_3_title": "Perfektion im Detail",
    "feat_3_desc": "Bewusst ausgewählte Akzente von der ersten Idee bis zum letzten Feinschliff",
    "feat_4_title": "Das ultimative Geschenk",
    "feat_4_desc": "Wird in einer Premium-Verpackung geliefert, die einen bleibenden Eindruck hinterlässt.",

    "supplies_title": "Floristenbedarf",
    "supplies_subtitle": "Beziehen Sie die gleichen hochwertigen Materialien, die wir für unsere floralen Arbeiten nutzen – sorgfältig ausgewählt für Qualität und Stil.",
    "browse_supplies": "Zubehör durchsuchen",

    // Product & Shop Logic
    "add_to_cart": "In den Warenkorb",
    "select_options": "Optionen auswählen",
    "ribbon_placeholder": "Bandtext eingeben...",
    "ribbon_label": "Personalisierter Bandtext *",
    "ribbon_error": "Bitte geben Sie Ihren Text ein, um fortzufahren.",
    "in_stock": "Auf Lager",
    "out_of_stock": "Ausverkauft",
    "back_to_shop": "Zurück zum Shop",
    "customize_upgrade": "Anpassen & Erweitern",
    
    // Checkout & Success
    "checkout_back": "Zurück zum Shop",
    "checkout_secure": "Sicherer Checkout",
    "checkout_shipping": "Versand",
    "checkout_payment": "Zahlung",
    "checkout_contact": "Kontaktinformationen",
    "checkout_email": "E-Mail-Adresse",
    "checkout_phone": "Telefonnummer",
    "checkout_address": "Lieferadresse",
    "checkout_first_name": "Vorname",
    "checkout_last_name": "Nachname",
    "checkout_street": "Straße & Hausnummer",
    "checkout_city": "Stadt",
    "checkout_zip": "Postleitzahl",
    "checkout_continue": "Weiter zur Zahlung",
    "checkout_change": "Ändern",
    "checkout_method": "Zahlungsmethode",
    "checkout_summary": "Bestellübersicht",
    "checkout_total": "Gesamtsumme",
    "checkout_processing": "Wird verarbeitet...",
    "checkout_pay": "Bezahlen",
    "checkout_empty": "Dein Warenkorb ist leer",
    "checkout_loading_payment": "Sichere Zahlung wird geladen...",

    "success_title": "Zahlung erfolgreich!",
    "success_message": "Vielen Dank für Ihre Bestellung. Wir haben Ihre Zahlung erhalten und bereiten Ihr Luxus-Bouquet vor.",
    "success_continue": "WEITER SHOPPEN",
    "success_email_note": "Eine Bestätigungs-E-Mail wurde an Ihren Posteigang gesendet.",

    // Reviews
    "reviews_title": "Kundenbewertungen",
    "write_review": "Bewertung schreiben",
    "customer_reviews": "Kundenbewertungen",
    "no_reviews": "Noch keine Bewertungen. Sei der Erste!",
    "posting": "Wird gepostet...",
    "post_review": "Bewertung posten",
    "your_name": "Dein Name",
    "share_thoughts": "Teile deine Gedanken...",

    // Footer & Legal
    "footer_rights": "Alle Rechte vorbehalten.",
    "footer_impressum": "Impressum",
    "footer_terms": "AGB",
    "footer_policy": "Datenschutz",
    "footer_shipping": "Versand & Rückgabe",
    "footer_contact": "Kontakt",
    "legal_business_type": "Rosetas Bouquets - Einzelunternehmen" 
  },
  EN: {
    // Navbar & Common
    "nav_shop": "Shop",
    "nav_supplies": "Florist Supplies", 
    "nav_about": "About Us",
    "admin_login": "Admin Login",
    "cart": "Cart",

    // Home Page
    "hero_title": "Not just flowers — a statement.",
    // ✨ UPDATED: Replaced old "Essen Germany" text as requested
    "hero_subtitle": "Designed to make an impact.", 
    "shop_now": "Shop Now",
    "our_collection": "Our Collection",

    // ✨ STORY SECTION (Updated English Phrasing)
    "story_badge": "Hand-Crafted in Essen • Our Story",
    "story_title": "Where Artistry Meets Elegance.",
    "story_text": "At Rosetas, we don’t create ordinary flowers — we create statements of elegance and quality. Since our founding in 2025, we have stood for high-quality, handcrafted floral concepts designed to preserve emotions and redefine luxury.",

    // Features Component
    "features_headline_start": "That’s why",
    "features_headline_end": "is the choice",
    "features_subtitle": "Quality and execution you can count on.",
    "feat_1_title": "The Rosetas Shine",
    "feat_1_desc": "One look is enough to recognize a Rosetas creation.",
    "feat_2_title": "More than a gift",
    "feat_2_desc": "A lasting impression for special moments.",
    "feat_3_title": "Perfection in Detail",
    "feat_3_desc": "Consciously selected accents from the first idea to the final touch.",
    "feat_4_title": "The Ultimate Gift",
    "feat_4_desc": "Arrives in premium packaging designed to leave a lasting impression.",

    "supplies_title": "Florist Supplies",
    "supplies_subtitle": "Source the same premium materials we use in our luxury studio – carefully selected for quality and style.",
    "browse_supplies": "Browse Supplies",

    // Product & Shop
    "add_to_cart": "Add to Cart",
    "select_options": "Select Options",
    "ribbon_placeholder": "Enter ribbon text...",
    "ribbon_label": "Personalized Ribbon Text *",
    "ribbon_error": "Please enter your custom text to proceed.",
    "in_stock": "In Stock",
    "out_of_stock": "Out of Stock",
    "back_to_shop": "Back to Shop",
    "customize_upgrade": "Customize & Upgrade",

    // Checkout & Success
    "checkout_back": "Back to Shop",
    "checkout_secure": "Secure Checkout",
    "checkout_shipping": "Shipping",
    "checkout_payment": "Payment",
    "checkout_contact": "Contact Information",
    "checkout_email": "Email Address",
    "checkout_phone": "Phone Number",
    "checkout_address": "Shipping Address",
    "checkout_first_name": "First Name",
    "checkout_last_name": "Last Name",
    "checkout_street": "Street Address",
    "checkout_city": "City",
    "checkout_zip": "Postal Code",
    "checkout_continue": "Continue to Payment",
    "checkout_change": "Change",
    "checkout_method": "Payment Method",
    "checkout_summary": "Order Summary",
    "checkout_total": "Total",
    "checkout_processing": "Processing...",
    "checkout_pay": "Pay",
    "checkout_empty": "Your cart is empty",
    "checkout_loading_payment": "Loading secure payment...",

    "success_title": "Payment Successful!",
    "success_message": "Thank you for your order. We have received your payment and are preparing your luxury bouquet.",
    "success_continue": "CONTINUE SHOPPING",
    "success_email_note": "A confirmation email has been sent to your inbox.",

    // Reviews
    "reviews_title": "Customer Feedback",
    "write_review": "Write a Review",
    "customer_reviews": "Customer Reviews",
    "no_reviews": "No reviews yet. Be the first!",
    "posting": "Posting...",
    "post_review": "Post Review",
    "your_name": "Your Name",
    "share_thoughts": "Share your thoughts...",

    // Footer & Legal
    "footer_rights": "All rights reserved.",
    "footer_impressum": "Impressum",
    "footer_terms": "Terms & Conditions",
    "footer_policy": "Privacy Policy",
    "footer_shipping": "Shipping & Returns",
    "footer_contact": "Contact",
    "legal_business_type": "Rosetas Bouquets - Sole Proprietorship" 
  }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('DE');
  
  // ✨ Store translations in state
  const [categoryDict, setCategoryDict] = useState<Record<string, { en: string, de: string }>>({});

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
    
    // ✨ Fetch translations once on load
    const fetchTranslations = async () => {
        const { data } = await supabase.from('category_translations').select('*');
        if (data) {
            const dict: Record<string, { en: string, de: string }> = {};
            data.forEach((item: any) => {
                dict[item.category_key] = { en: item.name_en, de: item.name_de };
            });
            setCategoryDict(dict);
        }
    };
    fetchTranslations();
  }, []);

  const handleSetLanguage = (lang: Language) => {
    console.log("🔄 Language switched to:", lang);
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  // ✨ Helper to get the translated category name
  const getCategoryName = (key: string) => {
      const entry = categoryDict[key];
      if (!entry) return key; // Fallback to original if not found
      return language === 'EN' ? entry.en : entry.de;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, getCategoryName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};