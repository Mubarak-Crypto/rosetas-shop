"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { ShoppingBag, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function SocialProof() {
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // 1. Fetch the absolute latest real order from Supabase
    const fetchLatestOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('customer_name, city, items, created_at')
        .order('created_at', { ascending: false })
        .limit(3); // Grab the last 3 to rotate nicely if we wanted

      if (data && data.length > 0) {
        // Pick a random one from the last 3 so it's not always the exact same one on refresh
        const randomOrder = data[Math.floor(Math.random() * data.length)];
        setRecentOrder(randomOrder);
        
        // 2. Delay the popup so it doesn't bombard the user immediately
        setTimeout(() => setIsVisible(true), 5000); 
      }
    };

    fetchLatestOrder();
  }, []);

  if (!recentOrder) return null;

  // Format Name: "Anna from Berlin" -> "Anna"
  const firstName = recentOrder.customer_name.split(' ')[0];
  const city = recentOrder.city || (language === 'EN' ? "Germany" : "Deutschland");
  
  // Get the first item name
  const firstItem = recentOrder.items && recentOrder.items[0] 
    ? (language === 'EN' && recentOrder.items[0].name_en ? recentOrder.items[0].name_en : recentOrder.items[0].name)
    : (language === 'EN' ? "Luxury Bouquet" : "Luxus-Bouquet");

  // Determine Image
  const image = recentOrder.items && recentOrder.items[0] ? recentOrder.items[0].image : "/placeholder.jpg";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="fixed bottom-4 left-4 z-40 bg-white/90 backdrop-blur-md border border-[#D4C29A]/30 p-4 rounded-2xl shadow-xl max-w-xs flex items-center gap-4 cursor-pointer hover:bg-white transition-colors"
          onClick={() => setIsVisible(false)} // Click to dismiss
        >
          {/* Close Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
            className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1 border shadow-sm"
          >
            <X size={12} />
          </button>

          {/* Product Image */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-black/5">
            <img src={image} alt="Recent Order" className="w-full h-full object-cover" />
          </div>

          {/* Text Info */}
          <div>
            <p className="text-xs font-bold text-[#1F1F1F]">
              {firstName} {language === 'EN' ? "from" : "aus"} {city}
            </p>
            <p className="text-[10px] text-[#1F1F1F]/60 font-medium">
              {language === 'EN' ? "purchased" : "kaufte"} <span className="text-[#C9A24D] font-bold">{firstItem}</span>
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ShoppingBag size={10} className="text-green-600" />
              <p className="text-[9px] text-green-600 font-bold uppercase tracking-wide">
                {language === 'EN' ? "Verified Purchase" : "Verifizierter Kauf"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}