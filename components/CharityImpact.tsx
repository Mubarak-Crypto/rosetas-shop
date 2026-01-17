"use client";

import { Heart, Droplets, HandHeart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link"; // ✨ Import Link for the button

export default function CharityImpact() {
  return (
    <section className="relative py-24 px-4 md:px-8 bg-[#F6EFE6] text-[#1F1F1F] overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#E3D7C5] to-transparent" />
      <div className="absolute -left-20 top-20 w-64 h-64 bg-[#E3D7C5]/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E3D7C5]/30 text-[#1F1F1F] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#E3D7C5]"
          >
             <span className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F] animate-pulse" />
             Verified Impact
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            // ✨ BOLD HEADING FIX (font-extrabold)
            className="text-4xl md:text-6xl font-serif font-extrabold text-[#1F1F1F] tracking-tight"
          >
            More Than Just Flowers
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-[#1F1F1F]/60 text-lg leading-relaxed font-medium"
          >
            Every bouquet you purchase helps us build wells, support communities, and bring life to those in need. 
            Beauty with a purpose.
          </motion.p>
        </div>

        {/* Content Grid - Reverted to 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Water Wells */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group relative h-[450px] rounded-[2.5rem] overflow-hidden bg-[#E3D7C5] shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <img 
              src="/water-well.jpg" 
              alt="Water Well Project" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale opacity-90 group-hover:opacity-100 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 text-white w-full">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-white border border-white/20">
                <Droplets size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Clean Water</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium">
                We fund the construction of water wells in arid regions, providing clean drinking water.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E3D7C5] bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-[#E3D7C5] rounded-full" />
                <span>Since 2024</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Community Support */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="h-[450px] bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-8 border border-[#E3D7C5]/50 flex flex-col justify-between hover:shadow-xl hover:border-[#E3D7C5] transition-all duration-300 group"
          >
            <div>
              <div className="w-12 h-12 bg-[#F6EFE6] rounded-2xl flex items-center justify-center mb-6 text-[#1F1F1F] group-hover:bg-[#1F1F1F] group-hover:text-[#E3D7C5] transition-colors border border-[#E3D7C5]/30">
                <HandHeart size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#1F1F1F] mb-3">Community</h3>
              <p className="text-[#1F1F1F]/60 text-sm leading-relaxed font-medium">
                Beyond water, we support local orphanages and food drives during holy months. Your order contributes directly to these food parcels.
              </p>
            </div>
            <div className="mt-auto pt-8 border-t border-[#1F1F1F]/5">
               <div className="flex justify-between items-center">
                 <span className="text-4xl font-serif text-[#1F1F1F]">10%</span>
                 <span className="text-[10px] font-bold text-[#1F1F1F]/40 uppercase tracking-widest text-right">Of Profits<br/>Donated</span>
               </div>
            </div>
          </motion.div>

          {/* Card 3: Transparency Pledge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="h-[450px] bg-[#1F1F1F] rounded-[2.5rem] p-8 text-white flex flex-col justify-center text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
            
            <div className="relative z-10 flex flex-col h-full justify-center">
                <Heart className="mx-auto mb-6 text-[#E3D7C5]" size={40} strokeWidth={1.5} />
                
                <h3 className="text-2xl font-bold mb-4">Our Promise</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-8 font-medium">
                  "We believe that true success lies in what you give back. We are committed to full transparency regarding where your money goes."
                </p>
                
                {/* ✨ FIXED BUTTON: Now wrapped in Link so it works */}
                <Link href="/impact-report" className="mx-auto w-full">
                    <button className="w-full px-6 py-4 bg-white/10 hover:bg-[#E3D7C5] hover:text-[#1F1F1F] backdrop-blur-sm rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5 group-hover:scale-105">
                    Read Impact Report <ArrowRight size={14} />
                    </button>
                </Link>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}