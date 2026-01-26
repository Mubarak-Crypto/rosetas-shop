"use client";

import { useState, useEffect } from "react";
import { X, Tag, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

export default function ExitIntentPopup() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false); 
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const discountCodes = [
    { code: "ROSE10", desc_en: "10% Off Your First Order", desc_de: "10% Rabatt auf Ihre erste Bestellung" },
  ];

  useEffect(() => {
    // ⏳ Delay trigger by 5 seconds so it doesn't pop up immediately
    const loadTime = Date.now();

    const handleMouseLeave = (e: MouseEvent) => {
      if (window.innerWidth < 768) return; 
      
      // Only show if user has been on site for at least 5 seconds
      const secondsOnSite = (Date.now() - loadTime) / 1000;
      if (secondsOnSite < 5) return;

      if (e.clientY <= 0 && !hasShown) {
        const alreadyShown = sessionStorage.getItem("exit_popup_shown");
        if (!alreadyShown) {
          setIsVisible(true);
          setHasShown(true);
          sessionStorage.setItem("exit_popup_shown", "true");
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClose = () => setIsVisible(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Added backdrop-blur for that luxury feel
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={handleClose} // Close if clicking outside the box
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#F6EFE6] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative border border-[#C9A24D]/30"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors text-[#1F1F1F]/40 hover:text-[#1F1F1F]"
            >
              <X size={20} />
            </button>

            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-[#E6DCCA] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Tag size={36} className="text-[#C9A24D]" />
              </div>

              <h2 className="text-3xl font-bold text-[#1F1F1F] mb-3 tracking-tight">
                {language === 'EN' ? "Wait! Don't Miss Out" : "Warten Sie!"}
              </h2>
              <p className="text-[#1F1F1F]/60 mb-8 font-medium leading-relaxed">
                {language === 'EN' 
                  ? "Before you go, take an exclusive gift for your first bouquet." 
                  : "Bevor Sie gehen, sichern Sie sich ein exklusives Geschenk für Ihren ersten Strauß."}
              </p>

              <div className="space-y-4">
                {discountCodes.map((offer) => (
                  <div key={offer.code} className="bg-white border border-black/5 rounded-2xl p-5 flex items-center justify-between shadow-sm group hover:border-[#C9A24D]/50 transition-colors">
                    <div className="text-left">
                      <p className="font-black text-[#1F1F1F] text-xl tracking-tighter">{offer.code}</p>
                      <p className="text-[10px] text-[#1F1F1F]/40 font-bold uppercase tracking-widest mt-1">
                        {language === 'EN' ? offer.desc_en : offer.desc_de}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCopy(offer.code)}
                      className="bg-[#1F1F1F] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C9A24D] transition-all flex items-center gap-2 min-w-[110px] justify-center shadow-lg active:scale-95"
                    >
                      {copiedCode === offer.code ? (
                        <>
                          <Check size={14} strokeWidth={3} /> {language === 'EN' ? "Copied" : "Kopiert"}
                        </>
                      ) : (
                        <>
                          <Copy size={14} strokeWidth={3} /> {language === 'EN' ? "Copy" : "Kopieren"}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleClose}
                className="mt-8 text-[10px] font-black text-[#1F1F1F]/20 hover:text-[#1F1F1F] transition-colors uppercase tracking-[0.2em]"
              >
                {language === 'EN' ? "Continue to browse" : "Weiter stöbern"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}