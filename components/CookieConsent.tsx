"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if user has already accepted
    const consent = localStorage.getItem("rosetas_cookie_consent");
    if (!consent) {
      // Small delay so it slides in nicely
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("rosetas_cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="max-w-4xl mx-auto bg-[#1F1F1F] text-white/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-between">
        
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/5 rounded-xl text-[#D4C29A]">
            <Cookie size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">
                {language === 'EN' ? "We value your privacy" : "Wir schätzen Ihre Privatsphäre"}
            </h4>
            <p className="text-xs text-white/60 leading-relaxed max-w-xl">
              {language === 'EN' 
                ? "We use essential technologies (like local storage) to ensure our shop works securely. We do not use third-party marketing trackers." 
                : "Wir verwenden essenzielle Technologien (wie Local Storage), um sicherzustellen, dass unser Shop sicher funktioniert. Wir verwenden keine Marketing-Tracker von Drittanbietern."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-3 bg-[#D4C29A] hover:bg-[#C9A24D] text-[#1F1F1F] text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 whitespace-nowrap"
          >
            {language === 'EN' ? "Okay, Got it" : "Okay, Verstanden"}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}