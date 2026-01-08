"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link"; 
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext"; // ✨ Added Language Import

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { language, t } = useLanguage(); // ✨ Access translation functions

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* 1. DARK BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* 2. THE SLIDING DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#F6EFE6] border-l border-black/5 shadow-2xl z-[60] flex flex-col"
          >
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-black/5 bg-[#F6EFE6]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-[#C9A24D]" size={20} />
                <h2 className="text-xl font-bold text-[#1F1F1F] tracking-wide">
                  {language === 'EN' ? "Your Cart" : "Dein Warenkorb"}
                </h2>
                <span className="bg-black/5 text-xs px-2 py-1 rounded-full text-[#1F1F1F]/60 font-mono">
                  {cart.length} {language === 'EN' ? "items" : "Artikel"}
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#1F1F1F]/40 hover:text-[#1F1F1F]"
              >
                <X size={20} />
              </button>
            </div>

            {/* CART ITEMS LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#1F1F1F]/40">
                  <ShoppingBag size={48} className="opacity-20" />
                  <p className="font-medium">{language === 'EN' ? "Your cart is empty." : "Dein Warenkorb ist leer."}</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-[#C9A24D] text-sm font-bold hover:underline"
                  >
                    {language === 'EN' ? "Start Shopping" : "Jetzt Shoppen"}
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout 
                    key={item.uniqueId} 
                    className="flex gap-4 bg-white/40 p-4 rounded-2xl border border-black/5 shadow-sm"
                  >
                    <div className="w-20 h-20 bg-black rounded-xl overflow-hidden border border-black/5 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[#1F1F1F] text-sm">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.uniqueId)} className="text-[#1F1F1F]/30 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        <div className="text-xs text-[#1F1F1F]/60 mt-1 space-x-2 font-medium">
                          {Object.values(item.options).join(", ")}
                        </div>

                        {item.extras && item.extras.length > 0 && (
                          <div className="text-[10px] text-[#C9A24D] mt-1 flex flex-wrap gap-1 font-bold">
                            {item.extras.map(e => (
                              <span key={e} className="bg-[#C9A24D]/10 px-1.5 py-0.5 rounded border border-[#C9A24D]/20">+ {e}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="font-mono text-[#1F1F1F] text-sm font-bold">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                        
                        <div className="flex items-center bg-white/60 rounded-lg border border-black/5">
                          <button 
                            onClick={() => updateQuantity(item.uniqueId, -1)}
                            className="p-1.5 hover:text-[#C9A24D] text-[#1F1F1F]/40 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#1F1F1F]">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.uniqueId, 1)}
                            className="p-1.5 hover:text-[#C9A24D] text-[#1F1F1F]/40 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* FOOTER (Checkout) */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-black/5 bg-[#F6EFE6] space-y-4">
                <div className="flex justify-between items-center text-sm text-[#1F1F1F]/60 font-medium">
                  <span>{language === 'EN' ? "Subtotal" : "Zwischensumme"}</span>
                  <span className="text-[#1F1F1F] font-mono text-xl font-bold">€{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#1F1F1F]/40 text-center font-medium">
                  {language === 'EN' ? "Shipping calculated at checkout." : "Versandkosten werden beim Checkout berechnet."}
                </p>
                
                {/* --- FORCED VISIBILITY CHECKOUT BUTTON --- */}
                <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="block">
                  <button className="w-full bg-[#1F1F1F] font-bold py-4 rounded-xl shadow-lg hover:bg-[#C9A24D] transition-all flex items-center justify-center gap-2">
                    {/* !text-white and style override to defeat global CSS !important black text */}
                    <span 
                        className="!text-white" 
                        style={{ color: 'white', display: 'inline-block' }}
                    >
                        {language === 'EN' ? "Checkout Securely" : "Sicher zur Kasse"}
                    </span> 
                    <ArrowRight 
                        size={18} 
                        className="!text-white" 
                        style={{ color: 'white' }} 
                    />
                  </button>
                </Link>
                
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}