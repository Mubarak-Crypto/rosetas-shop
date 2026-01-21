"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertCircle, Truck, Check, PenTool, Clock } from "lucide-react"; 
import Link from "next/link"; 
import { useState, useEffect } from "react"; 
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext"; 

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart, cartExpiry } = useCart();
  const { language, t } = useLanguage(); 
  
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!cartExpiry || cart.length === 0) {
        setTimeLeft("");
        return;
    }

    const interval = setInterval(() => {
        const now = Date.now();
        const diff = cartExpiry - now;

        if (diff <= 0) {
            clearInterval(interval);
            clearCart(); 
            setIsCartOpen(false);
            alert(language === 'EN' ? "Your reservation has expired." : "Ihre Reservierung ist abgelaufen.");
        } else {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [cartExpiry, cart.length, clearCart, setIsCartOpen, language]);

  // ✨ Logic for Supplies Minimum Order (€80) - Kept this!
  const suppliesSubtotal = cart
    .filter(item => item.category === 'supplies' || item.category === 'Floristenbedarf')
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const MIN_SUPPLIES_VALUE = 80;
  const isSuppliesBelowMinimum = suppliesSubtotal > 0 && suppliesSubtotal < MIN_SUPPLIES_VALUE;
  
  // Only calculate missing amount for the error message
  const missingAmount = Math.max(0, MIN_SUPPLIES_VALUE - suppliesSubtotal);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

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
                  {cart.length}
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#1F1F1F]/40 hover:text-[#1F1F1F]"
              >
                <X size={20} />
              </button>
            </div>

            {/* ✨ RESERVATION TIMER BANNER (Soft Beige & Black) */}
            {cart.length > 0 && timeLeft && (
                <div className="bg-[#EAE0D5] text-[#1F1F1F] text-xs font-bold text-center py-3 px-4 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1 border-b border-[#1F1F1F]/5">
                    <Clock size={14} className="text-[#1F1F1F]/60" />
                    <span>
                        {language === 'EN' ? "Items reserved for:" : "Artikel reserviert für:"} 
                        <span className="text-[#1F1F1F] ml-1 font-mono text-sm">{timeLeft}</span>
                    </span>
                </div>
            )}

            {/* 🗑️ REMOVED: Free Shipping Progress Bar (Green Bar) is gone as requested */}

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
                cart.map((item) => {
                  const isUnlimited = item.maxStock >= 999;
                  const isMaxedOut = !isUnlimited && item.quantity >= item.maxStock;

                  return (
                    <motion.div 
                      layout 
                      key={item.uniqueId} 
                      className="flex gap-4 bg-white/40 p-4 rounded-2xl border border-black/5 shadow-sm"
                    >
                      {/* ✨ FIX: Changed object-contain to object-cover here */}
                      <div className="w-20 h-20 bg-black rounded-xl overflow-hidden border border-black/5 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                              {item.extras.map((e: string) => (
                                <span key={e} className="bg-[#C9A24D]/10 px-1.5 py-0.5 rounded border border-[#C9A24D]/20">+ {e}</span>
                              ))}
                            </div>
                          )}

                          {item.customText && (
                              /* ✨ FIX: Added break-all and w-full to handle long text properly */
                              <div className="mt-2 text-[10px] bg-white/50 p-1.5 rounded-lg border border-black/5 w-full break-all">
                                  <span className="text-gray-400 font-bold uppercase tracking-widest mr-1">
                                      <PenTool size={10} className="inline mr-1 mb-0.5"/> 
                                      {language === 'EN' ? "Text:" : "Text:"}
                                  </span>
                                  <span className="text-[#1F1F1F] font-bold italic">
                                      "{item.customText}"
                                  </span>
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
                              disabled={isMaxedOut}
                              className={`p-1.5 transition-colors ${isMaxedOut ? "text-gray-200 cursor-not-allowed" : "hover:text-[#C9A24D] text-[#1F1F1F]/40"}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-black/5 bg-[#F6EFE6] space-y-4">
                
                {/* ✨ RESTORED: Alert for Minimum Order €80 (Blocks Checkout) */}
                {isSuppliesBelowMinimum && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start animate-pulse">
                    <AlertCircle className="text-red-500 shrink-0" size={18} />
                    <p className="text-[11px] font-bold text-[#1F1F1F] leading-tight">
                      {language === 'EN' 
                        ? `Florist Supplies require a minimum of €${MIN_SUPPLIES_VALUE}. Please add €${missingAmount.toFixed(2)} more to continue.`
                        : `Für Floristik-Zubehör gilt ein Mindestbestellwert von €${MIN_SUPPLIES_VALUE}. Bitte füge noch €${missingAmount.toFixed(2)} hinzu.`
                      }
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-[#1F1F1F]/60 font-medium">
                  <span>{language === 'EN' ? "Subtotal" : "Zwischensumme"}</span>
                  <span className="text-[#1F1F1F] font-mono text-xl font-bold">€{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#1F1F1F]/40 text-center font-medium">
                  {language === 'EN' ? "Shipping calculated at checkout." : "Versandkosten werden beim Checkout berechnet."}
                </p>
                
                {/* ✨ RESTORED: Checkout Button logic (Disabled if below €80) */}
                <Link 
                  href={isSuppliesBelowMinimum ? "#" : "/checkout"} 
                  onClick={(e) => {
                    if (isSuppliesBelowMinimum) e.preventDefault();
                    else setIsCartOpen(false);
                  }} 
                  className={`block transition-all ${isSuppliesBelowMinimum ? 'cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                >
                  <button 
                    disabled={isSuppliesBelowMinimum}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 font-bold
                      ${isSuppliesBelowMinimum 
                        ? 'bg-gray-300 border-2 border-transparent cursor-not-allowed' 
                        : 'bg-[#add9af] border-2 border-white shadow-[0_0_20px_rgba(173,217,175,0.4)] hover:shadow-[0_0_30px_rgba(173,217,175,0.6)] hover:bg-[#9ccc9e]'
                      }`}
                  >
                    <span 
                        className="!text-white" 
                        style={{ color: 'white', display: 'inline-block' }}
                    >
                        {isSuppliesBelowMinimum 
                          ? (language === 'EN' ? "Minimum Order Not Met" : "Mindestbestellwert nicht erreicht")
                          : (language === 'EN' ? "Checkout Securely" : "Sicher zur Kasse")
                        }
                    </span> 
                    {!isSuppliesBelowMinimum && (
                      <ArrowRight 
                          size={18} 
                          className="!text-white" 
                          style={{ color: 'white' }} 
                      />
                    )}
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