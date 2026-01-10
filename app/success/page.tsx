"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import
import { motion } from "framer-motion";

export default function SuccessPage() {
  const { clearCart, cart } = useCart(); // ✨ Added cart to reference last items
  const { t, language } = useLanguage(); // ✨ Access translation function
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);

  useEffect(() => {
    // Capture the items before clearing the cart for the review links
    if (cart.length > 0) {
      setPurchasedItems([...cart]);
    }
    
    // Clear the cart as soon as the page loads because the payment worked
    clearCart();
  }, []);

  return (
    /* ✅ FIXED: Background changed to Vanilla Cream and Text to Ink Black */
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex flex-col items-center justify-center p-6 text-center">
      
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        /* ✅ FIXED: Kept green but adjusted shadow for light background */
        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
      >
        <CheckCircle size={48} className="text-white" />
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('success_title')}</h1>
      <p className="text-[#1F1F1F]/60 max-w-md mb-8 text-lg font-medium">
        {t('success_message')}
      </p>

      {/* ✨ NEW: Verified Review Invitation Section */}
      {purchasedItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-xl mb-12 w-full max-w-lg"
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-[#C9A24D]">
             <Star size={16} fill="currentColor" />
             <span className="text-xs font-black uppercase tracking-[0.2em]">{t('write_review')}</span>
             <Star size={16} fill="currentColor" />
          </div>
          <h2 className="text-xl font-bold mb-6">
            {language === 'EN' ? "Share your experience!" : "Teile deine Erfahrung!"}
          </h2>
          <div className="space-y-3">
            {purchasedItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={`/product/${item.productId}?verify=true`}
                className="flex items-center justify-between p-4 bg-[#F6EFE6] rounded-2xl hover:bg-[#C9A24D] hover:text-white transition-all group"
              >
                <span className="font-bold text-sm truncate pr-4">{item.name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-black uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                    {language === 'EN' ? "Review" : "Bewerten"}
                  </span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-4 w-full max-w-sm">
        <Link href="/">
          {/* ✅ FIXED: Button matches Ink Black style with forced white text */}
          <button className="w-full bg-[#1F1F1F] hover:bg-[#C9A24D] py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group">
            <span 
              className="!text-white font-bold" 
              style={{ color: 'white', opacity: 1 }}
            >
              {t('success_continue')}
            </span> 
            <ArrowRight size={18} style={{ color: 'white' }} />
          </button>
        </Link>
        
        <p className="text-[#1F1F1F]/40 text-sm mt-4 font-medium">
          {t('success_email_note')}
        </p>
      </div>

    </div>
  );
}