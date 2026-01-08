"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'DE' | 'EN';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 📖 Full Translation Dictionary - NOW INCLUDES SUPPLIES & ALL PAGES
const translations: Record<Language, Record<string, string>> = {
  DE: {
    // Navbar & Common
    "nav_shop": "Shop",
    "nav_supplies": "Floristenbedarf", // ✨ Added
    "nav_about": "Über uns",
    "admin_login": "Admin Login",
    "cart": "Warenkorb",
    
    // Home Page
    "hero_title": "Handgefertigte Glitzer-Rosen",
    "hero_subtitle": "Luxus-Bouquets aus Essen, Deutschland",
    "shop_now": "Jetzt Shoppen",
    "our_collection": "Unsere Kollektion",
    
    // Features Component
    "features_headline_start": "Deshalb ist",
    "features_headline_end": "die erste Wahl",
    "features_subtitle": "Wir verkaufen nicht nur Blumen. Wir schaffen bleibende Momente voller Luxus.",
    "feat_1_title": "Handwerkliche Präzision",
    "feat_1_desc": "Jedes Blütenblatt wird von Hand gesetzt. Keine Massenproduktion. Nur Perfektion.",
    "feat_2_title": "Kristall-Glitzer-Finish",
    "feat_2_desc": "Unser spezielles Glitzer-Verfahren sorgt für maximale Brillanz unter jedem Licht.",
    "feat_3_title": "Ewige Schönheit",
    "feat_3_desc": "Konserviert für die Ewigkeit. Eine Erinnerung, die nicht nach einer Woche verblasst.",
    "feat_4_title": "Das ultimative Geschenk",
    "feat_4_desc": "Wird in einer Premium-Verpackung geliefert, die einen bleibenden Eindruck hinterlässt.",

    // Supplies Page ✨ Added
    "supplies_title": "Profi-Floristenbedarf",
    "supplies_subtitle": "Hochwertige Materialien für Ihre eigenen Kreationen",

    // Product & Shop
    "add_to_cart": "In den Warenkorb",
    "select_options": "Optionen auswählen",
    "ribbon_placeholder": "Bandtext eingeben...",
    "ribbon_label": "Personalisierter Bandtext *",
    "ribbon_error": "Bitte geben Sie Ihren Text ein, um fortzufahren.",
    "in_stock": "Auf Lager",
    "out_of_stock": "Ausverkauft",
    "back_to_shop": "Zurück zum Shop",
    "customize_upgrade": "Anpassen & Erweitern",
    
    // Checkout Page
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

    // Success Page
    "success_title": "Zahlung erfolgreich!",
    "success_message": "Vielen Dank für Ihre Bestellung. Wir haben Ihre Zahlung erhalten und bereiten Ihr Luxus-Bouquet vor.",
    "success_continue": "WEITER SHOPPEN",
    "success_email_note": "Eine Bestätigungs-E-Mail wurde an Ihren Posteingang gesendet.",

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
    "footer_contact": "Kontakt"
  },
  EN: {
    // Navbar & Common
    "nav_shop": "Shop",
    "nav_supplies": "Florist Supplies", // ✨ Added
    "nav_about": "About Us",
    "admin_login": "Admin Login",
    "cart": "Cart",

    // Home Page
    "hero_title": "Hand-crafted Glitter Roses",
    "hero_subtitle": "Luxury Bouquets from Essen, Germany",
    "shop_now": "Shop Now",
    "our_collection": "Our Collection",

    // Features Component
    "features_headline_start": "That’s why",
    "features_headline_end": "is the choice",
    "features_subtitle": "We don't just sell flowers. We create permanent moments of luxury.",
    "feat_1_title": "Artisan Precision",
    "feat_1_desc": "Every petal is placed by hand. No mass production. Just perfection.",
    "feat_2_title": "Crystal Glitter Finish",
    "feat_2_desc": "Our proprietary glitter application ensures maximum brilliance under any light.",
    "feat_3_title": "Eternal Beauty",
    "feat_3_desc": "Preserved to last. A memory that doesn't fade after a week.",
    "feat_4_title": "The Ultimate Gift",
    "feat_4_desc": "Arrives in premium packaging designed to leave a lasting impression.",

    // Supplies Page ✨ Added
    "supplies_title": "Professional Florist Supplies",
    "supplies_subtitle": "High-quality materials for your own creations",

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

    // Checkout Page
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

    // Success Page
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
    "footer_contact": "Contact"
  }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('DE');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    console.log("🔄 Language switched to:", lang);
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};