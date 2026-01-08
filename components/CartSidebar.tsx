"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link"; // <--- Imported Link
import { useCart } from "../context/CartContext";

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* 1. DARK BACKDROP (Click to close) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* 2. THE SLIDING DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-[60] flex flex-col"
          >
            
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-neon-rose" size={20} />
                <h2 className="text-xl font-bold text-white tracking-wide">Your Cart</h2>
                <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300 font-mono">
                  {cart.length} items
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* CART ITEMS LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                  <ShoppingBag size={48} className="opacity-20" />
                  <p>Your cart is empty.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-neon-rose text-sm font-bold hover:underline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout 
                    key={item.uniqueId} 
                    className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-black rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white text-sm">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.uniqueId)} className="text-gray-500 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        {/* Selected Options (Red, Blue, etc.) */}
                        <div className="text-xs text-gray-400 mt-1 space-x-2">
                          {Object.values(item.options).join(", ")}
                        </div>

                        {/* Extras (+Crown) */}
                        {item.extras && item.extras.length > 0 && (
                          <div className="text-[10px] text-neon-rose mt-1 flex flex-wrap gap-1">
                            {item.extras.map(e => (
                              <span key={e} className="bg-neon-rose/10 px-1.5 py-0.5 rounded border border-neon-rose/20">+ {e}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-mono text-neon-rose text-sm font-bold">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                        
                        <div className="flex items-center bg-black rounded-lg border border-white/10">
                          <button 
                            onClick={() => updateQuantity(item.uniqueId, -1)}
                            className="p-1.5 hover:text-white text-gray-500 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.uniqueId, 1)}
                            className="p-1.5 hover:text-white text-gray-500 transition-colors"
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
              <div className="p-6 border-t border-white/10 bg-[#0a0a0a] space-y-4">
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-mono text-lg">€{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 text-center">Shipping calculated at checkout.</p>
                
                {/* --- LINK TO CHECKOUT PAGE --- */}
                <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                  <button className="w-full bg-neon-rose text-white font-bold py-4 rounded-xl shadow-glow-rose hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
                    Checkout Securely <ArrowRight size={18} />
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