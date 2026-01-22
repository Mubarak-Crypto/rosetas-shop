"use client";

import { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // 1. Check on load if user has already chosen
    const consent = localStorage.getItem("rosetas_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }

    // 2. Listen for "Open Settings" clicks from the Footer
    const handleOpenSettings = () => setIsVisible(true);
    window.addEventListener("open-cookie-settings", handleOpenSettings);

    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("rosetas_cookie_consent", "accepted");
    setIsVisible(false);
    // Here you would trigger analytics pixel if you had one
  };

  const handleReject = () => {
    localStorage.setItem("rosetas_cookie_consent", "essential_only");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="max-w-5xl mx-auto bg-[#1F1F1F] text-white/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 justify-between">
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/5 rounded-xl text-[#D4C29A] shrink-0">
            <Cookie size={28} />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-base text-white flex items-center gap-2">
                {language === 'EN' ? "Cookie Settings" : "Cookie-Einstellungen"}
                <span className="text-[10px] uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded text-white/60">
                    {language === 'EN' ? "GDPR Compliant" : "DSGVO Konform"}
                </span>
            </h4>
            <p className="text-xs text-white/70 leading-relaxed max-w-2xl">
              {language === 'EN' 
                ? "We use cookies to ensure the basic functionality of our shop (e.g. Shopping Cart, Checkout). You can choose to accept all cookies or stick to essential ones only." 
                : "Wir verwenden Cookies, um die Grundfunktionen unseres Shops (z. B. Warenkorb, Kasse) zu gewährleisten. Sie können wählen, ob Sie alle Cookies akzeptieren oder nur die essenziellen zulassen möchten."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
          {/* REJECT BUTTON (Essential Only) */}
          <button 
            onClick={handleReject}
            className="w-full sm:w-auto px-6 py-3 bg-transparent border border-white/20 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
          >
            {language === 'EN' ? "Essential Only" : "Nur Essenzielle"}
          </button>

          {/* ACCEPT BUTTON */}
          <button 
            onClick={handleAccept}
            className="w-full sm:w-auto px-8 py-3 bg-[#D4C29A] hover:bg-[#C9A24D] text-[#1F1F1F] text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-[#D4C29A]/10"
          >
            {language === 'EN' ? "Accept All" : "Alle Akzeptieren"}
          </button>
        </div>

      </div>
    </div>
  );
}