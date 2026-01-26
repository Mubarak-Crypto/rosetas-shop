"use client";

import { useState, useEffect } from "react";
import { Cookie, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem("rosetas_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }

    const handleOpenSettings = () => setIsVisible(true);
    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem("rosetas_cookie_consent", "acknowledged");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="max-w-5xl mx-auto bg-[#1F1F1F] backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 justify-between">
        
        <div className="flex items-start gap-4 text-left">
          <div className="p-3 bg-white/5 rounded-xl text-[#D4C29A] shrink-0">
            <Cookie size={28} />
          </div>
          <div className="space-y-2">
            {/* INLINE STYLE FOR HEADING */}
            <h4 className="font-bold text-base" style={{ color: '#FFFFFF' }}>
                {language === 'EN' ? "Essential Technologies" : "Notwendige Technologien"}
            </h4>
            
            {/* INLINE STYLE FOR DESCRIPTION - FORCED BRIGHT WHITE */}
            <p className="text-xs leading-relaxed max-w-2xl" style={{ color: '#FFFFFF', opacity: 1 }}>
              {language === 'EN' 
                ? "This shop uses essential technologies (Local Storage, Stripe for secure payments, and Google Maps) to ensure a safe and functional shopping experience. By continuing, you acknowledge the use of these necessary tools." 
                : "Dieser Shop verwendet notwendige Technologien (Lokaler Speicher, Stripe für sichere Zahlungen und Google Maps), um ein sicheres und funktionales Einkaufserlebnis zu gewährleisten. Durch die weitere Nutzung stimmen Sie diesen erforderlichen Tools zu."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
          <button 
            onClick={handleAcknowledge}
            className="w-full sm:w-auto px-10 py-3 bg-[#D4C29A] hover:bg-[#C9A24D] text-[#1F1F1F] text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95 shadow-lg shadow-[#D4C29A]/10 flex items-center justify-center gap-2"
          >
            {language === 'EN' ? "Okay" : "Verstanden"}
            <Check size={14} strokeWidth={3} />
          </button>
        </div>

      </div>
    </div>
  );
}