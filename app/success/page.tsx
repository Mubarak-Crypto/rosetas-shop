"use client";

import { useEffect, useState, Suspense } from "react";
// ✨ UPDATED: Added Loader2 to imports to fix the red line
import { CheckCircle, ArrowRight, Star, Hash, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext"; // ✨ Added Language Import
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase"; // ✨ Need Supabase for stock updates
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const { clearCart, cart } = useCart(); // ✨ Added cart to reference last items
  const { t, language } = useLanguage(); // ✨ Access translation function
  const searchParams = useSearchParams();
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  
  // ✨ NEW: Capture Order ID from URL
  const orderId = searchParams.get("order_id");

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
        className="mb-8"
      >
        {/* ✨ UPDATED: Custom SVG Icon to match the Sage Green Squircle Tick */}
        <svg 
          width="100" 
          height="100" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* The Rounded Square Box */}
          <rect 
            x="2.5" 
            y="2.5" 
            width="19" 
            height="19" 
            rx="5" 
            stroke="#8FC9A9" 
            strokeWidth="3" 
          />
          {/* The Checkmark */}
          <path 
            d="M7.5 12L10.5 15.5L16.5 8.5" 
            stroke="#8FC9A9" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('success_title')}</h1>
      
      {/* ✨ NEW: Display Branded Order Number ROSETAS-00037 style */}
      {orderId && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 p-4 bg-white rounded-2xl border border-black/5 shadow-sm flex items-center gap-3 w-full max-w-xs mx-auto"
        >
          <div className="w-10 h-10 bg-[#CDAF95]/20 rounded-full flex items-center justify-center text-[#CDAF95]">
            <Hash size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#1F1F1F]/40 leading-none mb-1">
              {language === 'EN' ? "Order Number" : "Bestellnummer"}
            </p>
            <p className="text-lg font-bold text-[#1F1F1F]">
              {/* If the URL already has the branded string from checkout, show it, otherwise format here */}
              {orderId.includes('ROSETAS-') ? orderId : `ROSETAS-${String(orderId).padStart(5, '0')}`}
            </p>
          </div>
        </motion.div>
      )}

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

// 🌐 Wrapper to handle useSearchParams in Next.js 13/14
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F6EFE6] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}