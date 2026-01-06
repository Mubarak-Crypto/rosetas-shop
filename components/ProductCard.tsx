"use client";

import { motion } from "framer-motion";
import { Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface ProductProps {
  id: number; // <--- NEW PROP
  title: string;
  price: string;
  category: string;
  image: string;
  delay: number;
}

export default function ProductCard({ id, title, price, category, image, delay }: ProductProps) {
  return (
    // Link to the REAL ID now
    <Link href={`/product/${id}`} className="block h-full"> 
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: delay, duration: 0.5 }}
        className="group relative h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col"
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-transparent to-neon-rose/10 pointer-events-none" />

        <div className="h-72 w-full bg-black/40 flex items-center justify-center relative overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" 
          />
          <ShoppingBag className="absolute z-10 text-white/0 group-hover:text-white/80 transition-all duration-300 drop-shadow-lg transform scale-50 group-hover:scale-100" size={48} />
          <button className="absolute bottom-4 right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center translate-y-12 group-hover:translate-y-0 transition-transform duration-300 hover:scale-110 shadow-lg z-20">
            <Plus size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-end">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{category}</p>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-neon-rose transition-colors">{title}</h3>
          <p className="text-gray-300">{price}</p>
        </div>
      </motion.div>
    </Link>
  );
}