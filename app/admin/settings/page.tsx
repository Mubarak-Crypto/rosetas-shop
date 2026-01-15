"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Save, Upload, Eye, EyeOff, MoveVertical, Loader2, Layout, Maximize, Type, LayoutDashboard } from "lucide-react"; // ✨ Added LayoutDashboard icon
import Link from "next/link"; // ✨ Added Link import

export default function StorefrontSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // The fixed ID we used in the SQL command
  const SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('storefront_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single();

    if (data) {
      setSettings(data);
    } else if (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `hero-bg-${Date.now()}.${fileExt}`;
    const filePath = `storefront/${fileName}`;

    // Upload to your existing 'product-images' bucket
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      
      // ✨ Added timestamp to force the preview to refresh immediately
      setSettings({ ...settings, hero_image_url: `${publicUrl}?t=${Date.now()}` });
    }
    setIsUploading(false);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('storefront_settings')
      .update({
        hero_image_url: settings.hero_image_url,
        hero_vertical_shift: settings.hero_vertical_shift,
        hero_zoom: settings.hero_zoom || '100%', // ✨ Added Zoom saving
        hero_title: settings.hero_title,       // ✨ Save Title
        hero_subtitle: settings.hero_subtitle, // ✨ Save Subtitle
        show_hero_image: settings.show_hero_image,
        updated_at: new Date().toISOString(),
      })
      .eq('id', SETTINGS_ID);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Storefront updated successfully!");
    }
    setIsSaving(false);
  };

  if (!settings) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6EFE6]">
      <Loader2 className="animate-spin text-[#C9A24D]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6EFE6] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[#C9A24D] font-bold text-xs uppercase tracking-widest mb-2">
              <Layout size={14} /> Admin Control
            </div>
            <h1 className="text-4xl font-bold text-[#1F1F1F]">Hero Section Settings</h1>
            <p className="text-[#1F1F1F]/50 mt-1 font-medium">Customize Rosetta's homepage visuals without touching code.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* ✨ NEW: Back to Dashboard Button */}
            <Link href="/admin/dashboard">
                <button className="text-[#1F1F1F]/40 hover:text-[#1F1F1F] px-4 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm">
                    <LayoutDashboard size={18} /> Back to Dashboard
                </button>
            </Link>

            <button 
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-[#C9A24D] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-[#C9A24D]/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Publish Changes</>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Visibility Toggle */}
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#1F1F1F]">Display Hero Image</label>
                <button 
                  onClick={() => setSettings({...settings, show_hero_image: !settings.show_hero_image})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-sm ${
                    settings.show_hero_image 
                    ? 'bg-green-50 border-green-100 text-green-600' 
                    : 'bg-red-50 border-red-100 text-red-600'
                  }`}
                >
                  {settings.show_hero_image ? <><Eye size={16} /> Active</> : <><EyeOff size={16} /> Hidden</>}
                </button>
              </div>
            </div>

            {/* ✨ NEW: Hero Text Inputs */}
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4">
              <label className="font-bold flex items-center gap-2 text-[#1F1F1F]"><Type size={16} /> Hero Text Overlays</label>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/40 ml-1 mb-1 block">Title (Top Line)</label>
                  <input 
                    type="text" 
                    value={settings.hero_title || ''}
                    onChange={(e) => setSettings({...settings, hero_title: e.target.value})}
                    placeholder="e.g. Glitter Rose Edition"
                    className="w-full bg-[#F6EFE6] border-none rounded-xl px-4 py-3 font-bold text-[#1F1F1F] focus:ring-2 focus:ring-[#C9A24D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]/40 ml-1 mb-1 block">Subtitle (Bottom Line)</label>
                  <input 
                    type="text" 
                    value={settings.hero_subtitle || ''}
                    onChange={(e) => setSettings({...settings, hero_subtitle: e.target.value})}
                    placeholder="e.g. Premium Velvet Finish"
                    className="w-full bg-[#F6EFE6] border-none rounded-xl px-4 py-3 text-sm font-medium text-[#1F1F1F] focus:ring-2 focus:ring-[#C9A24D]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Image Upload */}
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4">
              <label className="font-bold block">Featured Background Image</label>
              <div 
                onClick={() => document.getElementById('hero-file')?.click()}
                className="group border-2 border-dashed border-black/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#C9A24D]/50 hover:bg-[#C9A24D]/5 transition-all"
              >
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center group-hover:bg-[#C9A24D] group-hover:text-white transition-all">
                  {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">Click to upload new bouquet photo</p>
                </div>
              </div>
              <input type="file" id="hero-file" hidden onChange={handleUpload} accept="image/*" />
            </div>

            {/* 3. Zoom Level Slider */}
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-bold flex items-center gap-2"><Maximize size={16} /> Zoom Level</label>
                <span className="bg-black text-white text-[10px] px-2 py-1 rounded-md font-mono">{settings.hero_zoom || '100%'}</span>
              </div>
              <input 
                type="range" min="100" max="200" step="1"
                value={parseInt(settings.hero_zoom || '100')}
                onChange={(e) => setSettings({...settings, hero_zoom: `${e.target.value}%`})}
                className="w-full accent-[#C9A24D] h-2 bg-black/5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[11px] text-[#1F1F1F]/40 italic">Zoom in to make the vertical shifting more effective.</p>
            </div>

            {/* 4. Vertical Shift Slider */}
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-bold flex items-center gap-2"><MoveVertical size={16} /> Vertical Position</label>
                <span className="bg-black text-white text-[10px] px-2 py-1 rounded-md font-mono">{settings.hero_vertical_shift}</span>
              </div>
              <input 
                type="range" min="0" max="100" step="1"
                value={parseInt(settings.hero_vertical_shift || '50')}
                onChange={(e) => setSettings({...settings, hero_vertical_shift: `${e.target.value}%`})}
                className="w-full accent-[#C9A24D] h-2 bg-black/5 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[11px] text-[#1F1F1F]/40 italic">Shift the photo down so the motif sits perfectly in the frame.</p>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-widest text-[#1F1F1F]/40 ml-2">Real-time Preview</h2>
            <div className="relative aspect-[4/5] md:aspect-video lg:aspect-[4/5] w-full rounded-[3rem] bg-white border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center">
              
              {settings.show_hero_image ? (
                <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                    <img 
                    src={settings.hero_image_url} 
                    className="absolute w-full h-full object-cover transition-all duration-300"
                    style={{ 
                        // ✨ FIXED: Shift logic uses translateY for better control with zoom
                        transform: `
                          scale(${parseInt(settings.hero_zoom || '100') / 100}) 
                          translateY(${(parseInt(settings.hero_vertical_shift || '50') - 50) * 0.5}%)
                        `
                    }}
                    />
                </div>
              ) : (
                <div className="absolute inset-0 bg-[#F6EFE6] flex items-center justify-center text-[#1F1F1F]/10 font-serif italic text-4xl italic">Rosetas</div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {/* ✨ Updated Preview to use editable text */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4/5 z-20">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-black/5 text-center">
                  <p className="font-bold text-[#1F1F1F] text-lg leading-tight">{settings.hero_title || 'Glitter Rose Edition'}</p>
                  <p className="text-[10px] text-[#1F1F1F]/40 uppercase font-black tracking-widest mt-1">{settings.hero_subtitle || 'Premium Velvet Finish'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}