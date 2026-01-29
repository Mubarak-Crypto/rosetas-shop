"use client";

import { useRef } from "react"; 
import { motion } from "framer-motion";
import { ChevronRight, Star, Loader2, ArrowRight, Scissors, Sparkles, Heart, Crown, ArrowDown, Globe, BookOpen } from "lucide-react"; 
import ProductCard from "./ProductCard"; 
import Features from "./Features"; 
import Navbar from "./Navbar";
import Link from "next/link";
import Image from "next/image"; 
import { useLanguage } from "../context/LanguageContext"; 

// ✨ ACCEPT DATA AS PROPS (Instead of fetching it slowly)
export default function HomeClient({ products = [], settings = null }: { products: any[], settings: any }) {
  const shopSectionRef = useRef<HTMLDivElement>(null); 
  const { language, t } = useLanguage(); 

  const scrollToShop = () => {
    shopSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] selection:bg-[#D4C29A] selection:text-white overflow-x-hidden relative font-sans w-full">
      
      <style jsx global>{`
        /* ✨ FONTS PRESERVED EXACTLY AS REQUESTED */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Allura&display=swap');
        
        @keyframes shine-glide {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .silver-glow-text {
          background: linear-gradient(
            120deg, 
            #1F1F1F 40%, 
            #C0C0C0 48%, 
            #FFFFFF 50%, 
            #C0C0C0 52%, 
            #1F1F1F 60%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent; 
          animation: shine-glide 4s linear infinite;
        }

        .font-playfair {
            font-family: 'Playfair Display', serif;
        }

        .handwritten-font {
            font-family: 'Allura', cursive;
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#D4C29A]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-[#D4C29A]/5 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      {/* ✨ UPDATED: Increased padding px-6 to stop text cutting off */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-12 md:pt-12 md:pb-24 lg:pt-20 lg:pb-32 grid xl:grid-cols-2 gap-10 md:gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          /* ✨ FIXED: Added 'flex flex-col items-start' to FORCE left alignment */
          className="space-y-4 md:space-y-8 relative z-20 flex flex-col items-start text-left"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4C29A]/30 bg-[#D4C29A]/10 text-[#D4C29A] text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm">
            <Star size={12} className="fill-[#D4C29A]" />
            {language === 'EN' ? "The Premium Collection" : "Die Premium-Kollektion"}
          </div>

          {/* ✨ FIXED: Strictly 2 lines, responsive font size for S24 Ultra */}
          <h1 className="font-bold leading-tight text-[#1F1F1F] tracking-tight font-playfair text-left">
            {/* Line 1: Not just Flowers */}
            <span className="block text-[32px] sm:text-5xl md:text-7xl xl:text-8xl whitespace-nowrap overflow-visible text-left">
                Not just Flowers
            </span>
            
            {/* Line 2: — A Statement */}
            {/* ✨ FIXED: Removed 'justify-center', added 'justify-start' for Left Alignment */}
            <span className="flex items-center justify-start gap-2 md:gap-4 mt-0 md:mt-2 whitespace-nowrap flex-nowrap overflow-visible">
              <span className="opacity-40 text-2xl md:text-6xl font-light font-sans shrink-0">—</span>
              <span 
                className="handwritten-font text-[48px] sm:text-7xl md:text-8xl xl:text-9xl silver-glow-text pr-4 md:pr-6 py-2 leading-none" 
              >
                A Statement
              </span>
            </span>
          </h1>
          
          {/* ✨ FIXED: Removed 'mx-auto' so it stays on the left */}
          <p className="text-base md:text-lg text-[#1F1F1F]/60 max-w-md leading-relaxed font-medium text-left">
            {t('hero_subtitle')}
          </p>

          {/* ✨ FIXED: Removed 'justify-center', added 'justify-start' for Left Alignment */}
          {/* ✨ Added md:mb-0 to reset margin on desktop */}
          <div className="flex flex-wrap gap-4 pt-2 md:pt-4 mb-6 md:mb-0 justify-start w-full">
            <button 
              onClick={scrollToShop}
              className="group relative px-6 py-4 md:px-8 md:py-5 rounded-full transition-all flex items-center gap-3 active:scale-95 z-30" 
              style={{
                boxShadow: '0 0 25px rgba(205, 175, 149, 0.9), 0 0 50px rgba(205, 175, 149, 0.6)', 
                border: '2px solid #FFFFFF', 
                backgroundColor: '#CDAF95',
                color: '#1F1F1F'
              }}
            >
              <span className="flex items-center gap-2 font-bold text-sm md:text-base">
                {t('shop_now')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          /* ✨ UPDATED: Added md:mt-20 to prevent tablet overlap (Fix 3) */
          className="relative h-[350px] lg:h-[500px] w-full flex items-center justify-center mt-0 md:mt-20 xl:mt-0"
        >
          <div className="relative w-full max-w-sm md:max-w-md aspect-[4/5] rounded-[2rem] md:rounded-[3rem] bg-white border border-black/5 flex items-center justify-center overflow-hidden shadow-2xl">
            {settings?.show_hero_image && settings?.hero_image_url ? (
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full">
                    <Image 
                      src={settings.hero_image_url} 
                      alt="Hero Bouquet" 
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700" 
                      style={{ 
                        transform: `scale(${parseInt(settings.hero_zoom || '100') / 100}) translateY(${(parseInt(settings.hero_vertical_shift || '50') - 50) * 0.5}%)`
                      }}
                    />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#F6EFE6] flex items-center justify-center italic text-black/10 font-serif text-2xl">Rosetas</div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10 pointer-events-none" />
            
            <div className="z-20 text-center p-4 md:p-8 mt-auto absolute bottom-0 w-full">
              <div className="bg-white/90 backdrop-blur-md border border-black/5 px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl mx-auto w-11/12 shadow-lg">
                <h3 className="text-lg md:text-xl font-bold text-[#1F1F1F] leading-tight">
                  {settings?.hero_title || 'Glitter Rose Edition'}
                </h3>
                <p className="text-[10px] md:text-xs text-[#1F1F1F]/40 uppercase tracking-wider mt-1 font-bold">
                  {settings?.hero_subtitle || 'Premium Velvet Finish'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* OUR STORY Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-[#D4C29A] font-black tracking-[0.2em] uppercase text-[10px] md:text-xs">
            {t('story_badge')}
          </h2>
          <h3 className="text-3xl md:text-6xl font-bold tracking-tighter text-[#1F1F1F]">
            {language === 'EN' 
              ? <>Where Artistry Meets <br /> <span className="italic font-serif text-[#D4C29A]">Elegance.</span></> 
              : <>Wo Kunstfertigkeit auf <br /> <span className="italic font-serif text-[#D4C29A]">Eleganz trifft.</span></>
            }
          </h3>
          <p className="text-[#1F1F1F]/60 text-base md:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
            {t('story_text')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pt-12 border-t border-black/5">
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#D4C29A]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-[#D4C29A]" size={24} />
             </div>
             <h4 className="font-bold text-lg">{t('feat_1_title')}</h4>
             <p className="text-[#1F1F1F]/40 text-sm font-medium">
               {t('feat_1_desc')}
             </p>
          </div>
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#D4C29A]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-[#D4C29A]" size={24} />
             </div>
             <h4 className="font-bold text-lg">{t('feat_2_title')}</h4>
             <p className="text-[#1F1F1F]/40 text-sm font-medium">
               {t('feat_2_desc')}
             </p>
          </div>
          <div className="space-y-4">
             <div className="w-12 h-12 bg-[#D4C29A]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Crown className="text-[#D4C29A]" size={24} />
             </div>
             <h4 className="font-bold text-lg">{t('feat_3_title')}</h4>
             <p className="text-[#1F1F1F]/40 text-sm font-medium">
               {t('feat_3_desc')}
             </p>
          </div>
        </div>

        <div className="pt-8">
          <button 
            onClick={scrollToShop}
            className="px-8 py-3 md:px-10 md:py-4 font-bold rounded-full transition-all flex items-center gap-2 mx-auto active:scale-95 text-sm md:text-base"
            style={{
              boxShadow: '0 0 25px rgba(205, 175, 149, 0.9), 0 0 50px rgba(205, 175, 149, 0.6)', 
              border: '2px solid #FFFFFF', 
              backgroundColor: '#CDAF95', 
              color: '#1F1F1F'
            }}
          >
            {t('shop_now')} <ArrowDown size={18} />
          </button>
        </div>
      </section>

      {/* Best Sellers */}
      {/* ✨ UPDATED: Centered Header on Mobile (text-center), Left on Desktop (md:text-left) */}
      <section ref={shopSectionRef} id="shop" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-black/5 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('our_collection')}</h2>
            <p className="text-[#1F1F1F]/40 font-medium">{language === 'EN' ? "Chosen by our most exclusive clients." : "Ausgewählt von unseren exklusivsten Kunden."}</p>
          </div>
          
          {/* ✨ UPDATED: Centered Button on Mobile (mx-auto), Left on Desktop (md:mx-0) */}
          <Link href="/shop" className="w-fit mx-auto md:mx-0">
            <button 
                className="px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border backdrop-blur-sm"
                style={{
                    backgroundColor: '#CDAF95',
                    color: '#1F1F1F',
                    borderColor: '#CDAF95',
                    boxShadow: '0 0 15px rgba(205, 175, 149, 0.6)'
                }}
            >
              {language === 'EN' ? "View All" : "Alle anzeigen"} <ChevronRight size={14} />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.length > 0 ? products.map((product, index) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={language === 'EN' && product.name_en ? product.name_en : product.name} 
              price={product.price} 
              salePrice={product.sale_price} 
              isOnSale={product.is_on_sale} 
              globalDiscount={settings?.is_global_sale_active ? settings?.global_discount_percentage : 0} 
              category={product.category}
              image={product.images?.[0] || "/products/red-glitter.jpg"} 
              delay={index * 0.1} 
              promoLabel={product.promo_label}
              stock={product.stock}
            />
          )) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-[#1F1F1F]/30 bg-white border border-dashed border-black/10 rounded-3xl">
              <p className="font-bold uppercase tracking-widest text-sm">{language === 'EN' ? "No active products found." : "Keine aktiven Produkte gefunden."}</p>
            </div>
          )}
        </div>
      </section>

      {/* SUPPLIES BANNER */}
      <section className="px-4 md:px-6 py-12">
        <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white border border-black/5 shadow-sm">
            <div className="absolute top-0 right-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-[#D4C29A]/5 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 text-center md:text-left">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 text-[#D4C29A] text-xs md:text-sm font-black uppercase tracking-widest mx-auto md:mx-0">
                  <Scissors size={14} />
                  {language === 'EN' ? "For Professionals" : "Für Profis"}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-[#1F1F1F]">{t('supplies_title')}</h2>
                <p className="text-[#1F1F1F]/60 text-base md:text-lg leading-relaxed font-medium">
                  {language === 'EN' 
                    ? "Source the same high-quality materials we use for our floral creations — carefully selected for quality and style."
                    : t('supplies_subtitle')}
                </p>
              </div>

              <Link href="/supplies">
                <button className="px-8 py-4 btn-luminous text-[#1F1F1F] font-bold rounded-xl transition-all text-sm md:text-base">
                  {t('browse_supplies')}
                </button>
              </Link>
            </div>
        </div>
      </section>

      {/* ✨ IMPACT SECTION (Dynamic 3-Column Grid) */}
      {/* 1. Corrected Link: now points to /impact-report
          2. Corrected Color: 3rd card is now a Cream Tone (bg-[#F4EBE0])
      */}
      {settings?.show_impact_section && (
        <section className="relative px-4 md:px-6 py-20 bg-[#F6EFE6] border-t border-black/5">
            <div className="max-w-7xl mx-auto space-y-16">
                
                {/* Section Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 text-[#D4C29A] text-xs font-black uppercase tracking-[0.2em] bg-[#D4C29A]/10 px-4 py-2 rounded-full">
                        <Globe size={12} /> {language === 'EN' ? "Verified Impact" : "Verifizierter Einfluss"}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-playfair font-bold text-[#1F1F1F] leading-tight">
                        {language === 'EN' 
                          ? (settings?.impact_title_en || "More Than Just Flowers")
                          : (settings?.impact_title_de || "Mehr als nur Blumen")
                        }
                    </h2>
                    <p className="text-lg text-[#1F1F1F]/60 leading-relaxed">
                        {language === 'EN' 
                          ? (settings?.impact_subtitle_en || "Every bouquet you purchase helps us build wells and support communities.")
                          : (settings?.impact_subtitle_de || "Jeder Strauß hilft uns, Brunnen zu bauen und Gemeinschaften zu unterstützen.")
                        }
                    </p>
                </div>

                {/* ✨ The 3-Column Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    
                    {/* Grid 1: Water Wells */}
                    <div className="group relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-xl transition-all hover:-translate-y-2">
                        <Image 
                            src={settings?.impact_card1_image || "/impact/water-well.jpg"} 
                            alt="Water Well Project" 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <div className="bg-[#D4C29A] text-[#1F1F1F] text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider">
                                {language === 'EN' ? "Ongoing Project" : "Laufendes Projekt"}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                {language === 'EN' 
                                  ? (settings?.impact_card1_title_en || "Water Wells")
                                  : (settings?.impact_card1_title_de || "Wasserbrunnen")
                                }
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {language === 'EN' 
                                  ? (settings?.impact_card1_text_en || "10% of profits go directly to building water wells.")
                                  : (settings?.impact_card1_text_de || "10% der Gewinne fließen direkt in den Bau von Wasserbrunnen.")
                                }
                            </p>
                        </div>
                    </div>

                    {/* Grid 2: Community */}
                    <div className="group relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-xl transition-all hover:-translate-y-2">
                        <Image 
                            src={settings?.impact_card2_image || "/impact/community.jpg"} 
                            alt="Community Support" 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <div className="bg-white text-[#1F1F1F] text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider">
                                {language === 'EN' ? "Local Impact" : "Lokaler Einfluss"}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">
                                {language === 'EN' 
                                  ? (settings?.impact_card2_title_en || "Community")
                                  : (settings?.impact_card2_title_de || "Gemeinschaft")
                                }
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {language === 'EN' 
                                  ? (settings?.impact_card2_text_en || "Beyond water, we support local orphanages and food drives.")
                                  : (settings?.impact_card2_text_de || "Neben Wasser unterstützen wir lokale Waisenhäuser und Lebensmittelaktionen.")
                                }
                            </p>
                        </div>
                    </div>

                    {/* Grid 3: Read Full Report (Designed Card - Cream Color) */}
                    {/* ✨ Fixed Link: /impact-report */}
                    {/* ✨ Fixed Color: bg-[#F4EBE0] (Cream) */}
                    <Link href="/impact-report" className="group h-[450px] rounded-[2.5rem] overflow-hidden bg-[#F4EBE0] border border-[#D4C29A]/20 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl flex flex-col items-center justify-center text-center p-8 relative">
                        
                        <div className="relative z-10 w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-[#D4C29A]/20 backdrop-blur-sm">
                            <ArrowRight size={32} className="text-[#D4C29A]" />
                        </div>
                        
                        <h3 className="relative z-10 text-3xl font-playfair font-bold text-[#1F1F1F] mb-4">
                            {language === 'EN' ? "Read Full Impact Report" : "Vollständigen Bericht lesen"}
                        </h3>
                        
                        <p className="relative z-10 text-[#1F1F1F]/50 text-sm max-w-[200px] mb-8 font-medium">
                            {language === 'EN' ? "See exactly how your purchase changes lives." : "Sehen Sie genau, wie Ihr Kauf Leben verändert."}
                        </p>

                        <span className="relative z-10 text-[#D4C29A] text-xs font-black uppercase tracking-widest border-b border-[#D4C29A] pb-1">
                            {language === 'EN' ? "Explore" : "Entdecken"}
                        </span>
                    </Link>

                </div>
            </div>
        </section>
      )}

      <Features />

    </main>
  );
}