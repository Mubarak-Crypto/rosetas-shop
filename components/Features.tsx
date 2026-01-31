"use client";

import { motion } from "framer-motion";
import { Sparkles, Award, Clock, Gift } from "lucide-react";
import { useLanguage } from "../context/LanguageContext"; // ✨ Added Language Import

export default function Features() {
  // ✨ UPDATED: Added 'language' to access current language state (EN/DE)
  const { language, t } = useLanguage(); 

  // Updated features array with YOUR SPECIFIC NEW TEXT
  const features = [
    {
      icon: Award, // Card 1
      title: language === 'EN' ? "Design with Recognition" : "Design mit Wiedererkennung",
      description: language === 'EN' ? "A design you see — and instantly recognize." : "Ein Design, das man sieht – und direkt wiedererkennt.",
      color: "rose"
    },
    {
      icon: Sparkles, // Card 2
      title: language === 'EN' ? "Moments That Last" : "Momente, die bleiben",
      description: language === 'EN' ? "Not just given — but consciously chosen." : "Nicht nur verschenkt – sondern bewusst ausgewählt.",
      color: "#D8C3A5"
    },
    {
      icon: Clock, // Card 3
      title: language === 'EN' ? "Craftsmanship at the Highest Level" : "Handwerk auf höchstem Niveau",
      description: language === 'EN' ? "Quality you can see — and feel." : "Qualität, die man sieht – und spürt.",
      color: "rose"
    },
    {
      icon: Gift, // Card 4 (KEPT EXACTLY AS IS)
      title: t('feat_4_title'),
      description: t('feat_4_desc'),
      color: "#D8C3A5"
    }
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-black/5 bg-transparent">
      
      {/* ✨ NEW: Custom CSS for the Silver-Beige Glow */}
      <style jsx global>{`
        @keyframes soft-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        
        .rosetas-elegant-glow {
          /* Gradient: Silver Grey -> Soft Beige -> Bright White -> Beige -> Silver */
          background: linear-gradient(
            120deg, 
            #A0A0A0 20%, 
            #D8C3A5 40%, 
            #FFFFFF 50%, 
            #D8C3A5 60%, 
            #A0A0A0 80%
          );
          background-size: 200% auto;
          
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          
          /* Soft glow drop shadow in beige/white to create that 'clean' elegant look */
          filter: drop-shadow(0 0 8px rgba(216, 195, 165, 0.5));
          
          animation: soft-shimmer 4s linear infinite;
        }
      `}</style>

      <div className="text-center mb-16">
        
        {/* ✨ UPDATED HEADLINE: Text color fixed to Ink Black for visibility */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 flex flex-wrap justify-center items-baseline gap-2 text-[#1F1F1F]">
          {t('features_headline_start')} 
          {/* Applied the new Silver-Beige Glow Class */}
          <span className="font-serif italic text-4xl md:text-5xl rosetas-elegant-glow tracking-wide">
            Rosetas
          </span> 
          {t('features_headline_end')}
        </h2>

        <p className="text-[#1F1F1F]/60 max-w-2xl mx-auto text-lg">
          {t('features_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            // ✨ Updated styles to match Light Theme (Ink Black text, visible borders)
            className="p-6 rounded-2xl bg-white/40 border border-black/5 hover:bg-white/60 hover:border-[#C9A24D]/30 transition-all group shadow-sm"
          >
            {/* Logic to handle colors safely */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
              feature.color === 'rose' 
                ? 'bg-[#C9A24D]/10 text-[#C9A24D]' 
                : 'bg-[#C9A24D]/10 text-[#C9A24D]'
            }`}>
              <feature.icon size={24} />
            </div>
            
            <h3 className="text-lg font-bold mb-2 text-[#1F1F1F]">{feature.title}</h3>
            <p className="text-sm text-[#1F1F1F]/60 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}