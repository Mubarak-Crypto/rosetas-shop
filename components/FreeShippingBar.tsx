"use client";

import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { Truck, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function FreeShippingBar() {
  const { cart, cartTotal } = useCart();
  const { language } = useLanguage();

  // 1. Check if the cart contains any "Supplies"
  const hasSupplies = cart.some(item => 
    item.category === 'supplies' || item.category === 'Floristenbedarf'
  );

  // If no supplies in cart, do not show this bar (per client request)
  if (!hasSupplies) return null;

  // 2. Define the Threshold
  const FREE_SHIPPING_THRESHOLD = 80;
  
  // 3. Calculate Progress
  const progress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const missingAmount = FREE_SHIPPING_THRESHOLD - cartTotal;
  const isQualified = cartTotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="py-4 px-6 bg-[#F6EFE6] border-b border-[#D4C29A]/30">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full ${isQualified ? "bg-green-100 text-green-600" : "bg-[#D4C29A]/20 text-[#D4C29A]"}`}>
          {isQualified ? <Check size={16} strokeWidth={3} /> : <Truck size={16} />}
        </div>
        
        <p className="text-sm font-medium text-[#1F1F1F]">
          {isQualified ? (
            <span className="text-green-600 font-bold">
              {language === 'EN' ? "You've unlocked FREE Shipping (DE)!" : "Kostenloser Versand nach DE aktiviert!"}
            </span>
          ) : (
            <>
              {language === 'EN' ? "Add " : "Füge noch "}
              <span className="font-bold text-[#1F1F1F]">€{missingAmount.toFixed(2)}</span>
              {language === 'EN' 
                ? " for Free Shipping (DE)" 
                : " hinzu für kostenlosen Versand (DE)"}
            </>
          )}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
        {/* Animated Fill */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${isQualified ? "bg-green-500" : "bg-[#D4C29A]"}`}
        />
      </div>
    </div>
  );
}