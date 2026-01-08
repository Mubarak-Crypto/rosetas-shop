"use client";

import { useEffect, useState, useRef } from "react"; // ✨ Added useRef
import { motion } from "framer-motion";
import { ChevronRight, Star, Loader2, ArrowRight, Scissors, Sparkles, Heart, Crown, ArrowDown } from "lucide-react"; 
import ProductCard from "../components/ProductCard"; 
import Features from "../components/Features"; 
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase"; 
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const shopSectionRef = useRef<HTMLDivElement>(null); // ✨ Ref for the scroll logic

  // Smooth scroll function
  const scrollToShop = () => {
    shopSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // FETCH REAL PRODUCTS FROM DATABASE
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active') 
        .neq('category', 'supplies') 
        .order('created_at', { ascending: false }) 
        .limit(3); 

      if (!error && data) {
        setProducts(data);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-midnight text-white selection:bg-neon-rose selection:text-black overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-rose/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-rose/5 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-rose/30 bg-neon-rose/10 text-neon-rose text-xs font-bold tracking-widest uppercase shadow-glow-rose">
            <Star size={12} className="fill-neon-rose" />
            The Premium Collection
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Not just a rose. <br />
            <span className="sparkle-text">
              A Statement.
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-md leading-relaxed">
            Hand-crafted luxury satin bouquets with our signature diamond-dust glitter finish.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={scrollToShop}
              className="group px-8 py-5 bg-neon-rose text-white font-bold text-lg rounded-full shadow-glow-rose hover:scale-105 transition-all flex items-center gap-3"
            >
              Shop Collection
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[400px] lg:h-[500px] w-full flex items-center justify-center"
        >
          <div className="relative w-full max-w-md aspect-[4/5] rounded-[3rem] bg-glass border border-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
            <img 
              src="/products/image2 (1).jpeg" 
              alt="Hero Rose" 
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
            />
            <div className="z-20 text-center p-8 mt-auto absolute bottom-0 w-full">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl mx-auto w-11/12">
                <h3 className="text-xl font-bold text-white">Glitter Rose Edition</h3>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">Premium Velvet Finish</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ✨ NEW SECTION: OUR STORY & ABOUT US (The Informational Section) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-neon-rose font-bold tracking-[0.2em] uppercase text-sm">
            Hand-Crafted in Essen • Our Story
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Where Artistry Meets <br /> <span className="italic font-serif text-neon-rose">Elegance.</span>
          </h3>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            At Rosetas, we don't just sell flowers; we create permanent moments of luxury. 
            Based in Essen, Germany, our studio specializes in hand-crafted satin bouquets 
            designed to capture emotions that never fade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/5">
          <div className="space-y-4">
             <div className="w-12 h-12 bg-neon-rose/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-neon-rose" size={24} />
             </div>
             <h4 className="font-bold text-lg">The Rosetas Shine</h4>
             <p className="text-gray-500 text-sm">Our proprietary diamond-dust glitter ensures your bouquet sparkles with maximum brilliance.</p>
          </div>
          <div className="space-y-4">
             <div className="w-12 h-12 bg-neon-rose/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-neon-rose" size={24} />
             </div>
             <h4 className="font-bold text-lg">Who We Are</h4>
             <p className="text-gray-500 text-sm">A small team of dedicated artisans at Albert-Schweitzer-Str. 5, creating individual masterpieces.</p>
          </div>
          <div className="space-y-4">
             <div className="w-12 h-12 bg-neon-rose/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Crown className="text-neon-rose" size={24} />
             </div>
             <h4 className="font-bold text-lg">Luxury Details</h4>
             <p className="text-gray-500 text-sm">From personalized ribbons to crystal crowns, we offer the ultimate gifting experience.</p>
          </div>
        </div>

        <div className="pt-8">
          <button 
            onClick={scrollToShop}
            className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-neon-rose hover:text-white transition-all shadow-glow-white flex items-center gap-2 mx-auto"
          >
            Go to Shop <ArrowDown size={18} />
          </button>
        </div>
      </section>

      {/* Best Sellers */}
      <section ref={shopSectionRef} id="shop" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5 scroll-mt-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Curated Selections</h2>
            <p className="text-gray-400">Chosen by our most exclusive clients.</p>
          </div>
          
          <Link href="/shop">
            <button className="text-neon-rose hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              View All <ChevronRight size={16} />
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-neon-rose">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length > 0 ? products.map((product, index) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                title={product.name} 
                price={`€${product.price}`} 
                category={product.category}
                image={product.images?.[0] || "/products/red-glitter.jpg"} 
                delay={index * 0.1} 
              />
            )) : (
              <div className="col-span-3 text-center py-10 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p>No active products found in the database.</p>
                <p className="text-xs mt-2">Go to Admin Panel to add products.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* FLORIST SUPPLIES BANNER */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-white/5 border border-white/10">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-rose/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-12 gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 text-neon-rose text-sm font-bold uppercase tracking-widest">
                  <Scissors size={14} />
                  For Professionals
                </div>
                <h2 className="text-4xl md:text-5xl font-bold">Florist Supplies</h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Source the same premium ribbons, wires, and wrapping materials we use in our luxury studio.
                </p>
              </div>

              <Link href="/supplies">
                <button className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neon-rose hover:text-white transition-all shadow-lg hover:shadow-glow-rose">
                  Browse Supplies
                </button>
              </Link>
            </div>
        </div>
      </section>

      <Features />

    </main>
  );
}