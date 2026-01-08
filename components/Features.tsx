"use client";

import { motion } from "framer-motion";
import { Sparkles, Award, Clock, Gift } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Artisan Precision",
    description: "Every petal is placed by hand. No mass production. Just perfection.",
    color: "rose"
  },
  {
    icon: Sparkles,
    title: "Crystal Glitter Finish",
    description: "Our proprietary glitter application ensures maximum brilliance under any light.",
    color: "#D8C3A5"
  },
  {
    icon: Clock,
    title: "Eternal Beauty",
    description: "Preserved to last. A memory that doesn't fade after a week.",
    color: "rose"
  },
  {
    icon: Gift,
    title: "The Ultimate Gift",
    description: "Arrives in premium packaging designed to leave a lasting impression.",
    color: "#D8C3A5"
  }
];

export default function Features() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-black/20">
      <div className="text-center mb-16">
        
        {/* ✨ UPDATED HEADLINE */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 flex flex-wrap justify-center items-baseline gap-2">
          That’s why 
          <span className="font-serif italic text-4xl md:text-5xl sparkle-text tracking-wide">
            Rosetas
          </span> 
          is the choice
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          We don't just sell flowers. We create permanent moments of luxury.
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
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            {/* Logic to handle colors safely */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
              feature.color === 'rose' 
                ? 'bg-neon-rose/10 text-neon-rose shadow-[0_0_15px_rgba(243,229,171,0.2)]' 
                : 'bg-neon-rose/10 text-neon-rose shadow-[0_0_15px_rgba(176,38,255,0.2)]'
            }`}>
              <feature.icon size={24} />
            </div>
            
            <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}