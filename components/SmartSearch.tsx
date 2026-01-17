"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { searchRoseMeanings } from "../lib/roseMeanings"; // ✨ Use new helper
import { useLanguage } from "../context/LanguageContext"; // ✨ Use language context

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartSearch({ isOpen, onClose }: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { language, t } = useLanguage(); // Get current language

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSearch = (term: string) => {
    // 1. If it matches a Rose Meaning, we search for the COLOR NAME
    const meanings = searchRoseMeanings(term);
    
    if (meanings.length > 0) {
        // If we found a meaning (e.g. "Love" -> "Ruby Fire"), search for "Ruby Fire"
        // We pass the English name to the shop filter usually, or the specific query
        router.push(`/shop?search=${encodeURIComponent(meanings[0].colorName.en)}`);
    } else {
        // 2. Normal search
        router.push(`/shop?search=${encodeURIComponent(term)}`);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  // Quick tags for suggestions (Bilingual)
  const suggestions = language === 'EN' 
    ? ["Anniversary", "Love", "Apology", "Birthday", "Business"]
    : ["Jahrestag", "Liebe", "Entschuldigung", "Geburtstag", "Business"];

  // Get Live Results
  const results = searchRoseMeanings(query);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 px-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="w-full max-w-3xl bg-[#F6EFE6] rounded-[2rem] overflow-hidden shadow-2xl relative border border-[#1F1F1F]/5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Input Area */}
            <div className="p-8 pb-4">
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2 text-[#D4C29A] text-xs font-black uppercase tracking-widest">
                    <Sparkles size={14} />
                    <span>{language === 'EN' ? "Smart Occasion Search" : "Smarte Anlass-Suche"}</span>
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-[#1F1F1F]/5 rounded-full transition-colors">
                    <X size={20} className="text-[#1F1F1F]" />
                 </button>
              </div>

              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1F1F1F]/40" size={24} />
                <input 
                  ref={inputRef}
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={language === 'EN' ? "What is the occasion? (e.g., Anniversary...)" : "Welcher Anlass? (z.B. Jahrestag...)"}
                  className="w-full bg-white border border-[#1F1F1F]/10 rounded-2xl py-6 pl-16 pr-6 text-xl md:text-2xl font-serif text-[#1F1F1F] placeholder:text-[#1F1F1F]/20 focus:outline-none focus:border-[#D4C29A] transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Suggestions / Meaning Section */}
            <div className="px-8 pb-8 bg-white/50 border-t border-[#1F1F1F]/5 pt-6 h-[400px] overflow-y-auto custom-scrollbar">
              {query.length > 0 ? (
                 <div className="space-y-4">
                    {results.length > 0 ? results.map((item) => (
                       <button 
                         key={item.id}
                         onClick={() => handleSearch(item.colorName.en)} // Search for the color name
                         className="w-full text-left p-4 hover:bg-white rounded-xl transition-all flex items-center justify-between group border border-transparent hover:border-[#1F1F1F]/5"
                       >
                         <div>
                           {/* Display Match: Color Name + Feeling */}
                           <div className="flex items-center gap-2 mb-1">
                               <span className="text-lg font-bold capitalize text-[#1F1F1F]">
                                   {language === 'EN' ? item.colorName.en : item.colorName.de}
                               </span>
                               <span className="px-2 py-0.5 bg-[#D4C29A]/10 text-[#D4C29A] text-[10px] font-black uppercase tracking-widest rounded-full">
                                   Match
                               </span>
                           </div>
                           
                           <p className="text-sm text-[#1F1F1F]/60 font-serif italic mb-2">
                             "{language === 'EN' ? item.quote.en : item.quote.de}"
                           </p>

                           <div className="flex flex-wrap gap-2">
                                {(language === 'EN' ? item.occasions.en : item.occasions.de).map((occ, idx) => (
                                    <span key={idx} className="text-[10px] bg-[#1F1F1F]/5 px-2 py-1 rounded text-[#1F1F1F]/60">
                                        {occ}
                                    </span>
                                ))}
                           </div>
                         </div>
                         <ArrowRight className="text-[#D4C29A] opacity-0 group-hover:opacity-100 transition-opacity" />
                       </button>
                    )) : (
                      <div className="p-4 text-[#1F1F1F]/40 italic">
                        {language === 'EN' ? "Searching for products matching" : "Suche nach Produkten für"} "{query}"...
                        <button onClick={() => handleSearch(query)} className="block mt-2 text-[#D4C29A] font-bold underline decoration-dotted">
                            {language === 'EN' ? "View Results" : "Ergebnisse anzeigen"}
                        </button>
                      </div>
                    )}
                 </div>
              ) : (
                // Default State: Suggestions
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#1F1F1F]/40 mb-4">
                    {language === 'EN' ? "Popular Occasions" : "Beliebte Anlässe"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {suggestions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSearch(tag)}
                        className="px-6 py-3 bg-white border border-[#1F1F1F]/5 rounded-xl text-sm font-bold text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-white transition-all shadow-sm"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}