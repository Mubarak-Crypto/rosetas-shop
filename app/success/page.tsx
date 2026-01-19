"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase"; // ✨ Need Supabase for stock updates

export default function SuccessPage() {
  const { clearCart, cart } = useCart(); // ✨ Added cart to reference last items
  const { t, language } = useLanguage(); // ✨ Access translation function
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);

  useEffect(() => {
    // Capture items and handle stock deduction
    if (cart.length > 0) {
      setPurchasedItems([...cart]);
      updateStockDatabase([...cart]); // ✨ Trigger Stock Deduction
      clearCart();
    }
  }, []);

  // ✨ NEW: Logic to deduct stock from Database
  const updateStockDatabase = async (items: any[]) => {
    for (const item of items) {
      try {
        // 1. Get fresh product data (to check matrix/limits)
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.productId)
          .single();

        if (!product) continue;

        // 2. Handle Variants (Stock Matrix)
        if (product.stock_matrix && product.stock_matrix.length > 0) {
            const matrix = product.stock_matrix;
            
            // ✨ CRITICAL FIX: Use rawOptions (Database Keys) if available, otherwise fallback to options
            // This ensures we match "Farbe" even if the user bought "Color"
            const optionsToMatch = item.rawOptions || item.options;

            // Find the specific row that matches the customer's choices
            const rowIndex = matrix.findIndex((row: any) => {
                // Check if every option in the cart matches this row
                return Object.entries(optionsToMatch).every(([key, val]) => row[key] === val);
            });

            if (rowIndex !== -1) {
                const currentRow = matrix[rowIndex];
                
                // 🚨 CRITICAL CHECK: If stock is -1 (Unlimited), DO NOT DEDUCT
                if (currentRow.stock === -1) {
                    console.log(`Skipping stock deduction for unlimited item: ${item.name}`);
                    continue; 
                }

                // Otherwise, deduct quantity
                const newQty = Math.max(0, currentRow.stock - item.quantity);
                matrix[rowIndex].stock = newQty;

                // Update the matrix in DB
                await supabase.from('products').update({ stock_matrix: matrix }).eq('id', item.productId);
            }
        } 
        // 3. Handle Simple Products (Main Stock)
        else {
            // 🚨 CRITICAL CHECK: If stock is -1 (Unlimited), DO NOT DEDUCT
            if (product.stock === -1) {
                console.log(`Skipping stock deduction for unlimited product: ${item.name}`);
                continue;
            }

            const newStock = Math.max(0, product.stock - item.quantity);
            await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
        }

      } catch (err) {
        console.error("Error updating stock:", err);
      }
    }
  };

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