"use client";

import Navbar from "./Navbar";
import ProductCard from "./ProductCard";
import { useLanguage } from "../context/LanguageContext";

export default function MakeupClient({ products = [], settings = null }: { products: any[], settings: any }) {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-playfair font-bold mb-12 text-center">
          {language === 'EN' ? "Premium Add-ons" : "Premium-Ergänzungen"}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id}
              {...product}
              title={language === 'EN' && product.name_en ? product.name_en : product.name}
              image={product.images?.[0]}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </main>
  );
}