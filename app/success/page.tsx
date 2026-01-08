"use client";

import { useEffect } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import
import { motion } from "framer-motion";

export default function SuccessPage() {
  const { clearCart } = useCart();
  const { t } = useLanguage(); // ✨ Access translation function

  useEffect(() => {
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
      <p className="text-[#1F1F1F]/60 max-w-md mb-12 text-lg font-medium">
        {t('success_message')}
      </p>

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