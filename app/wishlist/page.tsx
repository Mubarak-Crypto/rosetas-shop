"use client";

import Navbar from "../../components/Navbar";
import ProductCard from "../../components/ProductCard";
import { useWishlist } from "../../context/WishlistContext";
import { useLanguage } from "../../context/LanguageContext";
import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] font-sans selection:bg-[#C9A24D] selection:text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter capitalize text-[#1F1F1F]">
            {language === 'EN' ? "Your Wishlist" : "Deine Wunschliste"}
          </h1>
          <p className="text-[#1F1F1F]/60 max-w-2xl mx-auto font-medium">
            {language === 'EN' 
              ? "Save your favorites now, decide later." 
              : "Speichern Sie Ihre Favoriten jetzt, entscheiden Sie später."}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white/40 rounded-[3rem] border border-dashed border-black/5 mx-auto max-w-2xl">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Heart size={32} className="text-[#1F1F1F]/20" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#1F1F1F]">
                {language === 'EN' ? "Your wishlist is empty" : "Deine Wunschliste ist leer"}
              </h2>
              <p className="text-[#1F1F1F]/50 font-medium">
                {language === 'EN' ? "Browse our collection and find something you love." : "Stöbern Sie in unserer Kollektion und finden Sie etwas, das Sie lieben."}
              </p>
            </div>
            <Link href="/shop">
              <button className="px-8 py-4 bg-[#1F1F1F] text-white font-bold rounded-full hover:bg-[#C9A24D] transition-all flex items-center gap-2">
                <ShoppingBag size={18} /> {language === 'EN' ? "Go to Shop" : "Zum Shop"}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard 
                  id={Number(product.id)} 
                  title={product.title}
                  price={product.price}
                  salePrice={product.salePrice}
                  isOnSale={product.isOnSale}
                  category={product.category}
                  image={product.image}
                  videoUrl={product.videoUrl}
                  promoLabel={product.promoLabel}
                  stock={product.stock}
                  globalDiscount={0} 
                  /* ✅ FIXED: Added the required delay prop */
                  delay={index * 0.05}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}