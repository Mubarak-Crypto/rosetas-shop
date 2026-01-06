"use client";

import { motion } from "framer-motion";
import { Play, Lock, Clock, ShieldCheck } from "lucide-react";

interface CourseProps {
  title: string;
  price: number;
  duration: string;
  image: string;
  level: string;
}

export default function CourseCard({ title, price, duration, image, level }: CourseProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-neon-purple/50 transition-all cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
            <Lock size={20} className="text-white group-hover:hidden" />
            <Play size={20} className="text-white hidden group-hover:block ml-1 fill-white" />
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 bg-neon-purple text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-glow-purple">
          Digital Course
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs text-neon-purple font-bold uppercase tracking-widest">{level}</p>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={12} /> {duration}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-neon-purple transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <ShieldCheck size={14} className="text-green-400" />
          <span>Copy Protected Content</span>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xl font-bold text-white">€{price}</span>
          <button className="text-xs font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Preview
          </button>
        </div>
      </div>
    </motion.div>
  );
}