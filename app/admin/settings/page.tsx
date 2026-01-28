"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Save, Upload, Eye, EyeOff, MoveVertical, Loader2, Layout, Maximize, Type, LayoutDashboard, Droplets, Palette, Plus, Trash2, X, Check, Heart, Quote, Star, Plane, Coffee, Globe, Image as ImageIcon } from "lucide-react"; 
import Link from "next/link"; 
import CategoryTranslationManager from "../../../components/admin/CategoryTranslationManager"; 

// Type definition for Color
type ProductColor = {
  id?: string;
  name: string;      // English Name
  name_de: string;   // ✨ NEW: German Name
  hex_code: string;
  meaning_en: string;
  meaning_de: string;
  // ✨ NEW FIELDS
  feeling_en: string;
  feeling_de: string;
  perfect_for_en: string;
  perfect_for_de: string;
  quote_en: string;
  quote_de: string;
  is_active: boolean;
  sort_order: number;
};

export default function StorefrontSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✨ NEW: Color Manager State
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  const [editingColor, setEditingColor] = useState<ProductColor | null>(null); // If null, list view. If object, edit mode.
  const [isSavingColor, setIsSavingColor] = useState(false);

  // The fixed ID we used in the SQL command
  const SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchSettings();
    fetchColors(); // ✨ Fetch colors on load
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

  // ✨ NEW: Fetch Colors
  const fetchColors = async () => {
    const { data, error } = await supabase
      .from('product_colors')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) setColors(data);
    if (error) console.error("Error fetching colors:", error);
    setIsLoadingColors(false);
  };

  // ✨ IMPROVED: Generic Upload Handler for any image field
  const handleGenericUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `storefront-${fieldKey}-${Date.now()}.${fileExt}`;
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
      setSettings((prev: any) => ({ ...prev, [fieldKey]: `${publicUrl}?t=${Date.now()}` }));
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
        hero_zoom: settings.hero_zoom || '100%', 
        hero_title: settings.hero_title,      
        hero_subtitle: settings.hero_subtitle, 
        show_hero_image: settings.show_hero_image,
        
        is_donation_active: settings.is_donation_active, // Water Well
        is_tip_active: settings.is_tip_active, // ✨ NEW: Tips
        
        // ✨ NEW: Save Vacation Mode Settings
        is_vacation_mode_active: settings.is_vacation_mode_active,
        vacation_start_date: settings.vacation_start_date,
        vacation_end_date: settings.vacation_end_date,
        vacation_message: settings.vacation_message,

        // ✨ NEW: Impact Section Settings (Bilingual Update)
        show_impact_section: settings.show_impact_section,
        
        impact_title_en: settings.impact_title_en,
        impact_title_de: settings.impact_title_de,
        
        impact_subtitle_en: settings.impact_subtitle_en,
        impact_subtitle_de: settings.impact_subtitle_de,
        
        impact_card1_title_en: settings.impact_card1_title_en,
        impact_card1_title_de: settings.impact_card1_title_de,
        
        impact_card1_text_en: settings.impact_card1_text_en,
        impact_card1_text_de: settings.impact_card1_text_de,
        
        impact_card1_image: settings.impact_card1_image, // Images are shared
        
        impact_card2_title_en: settings.impact_card2_title_en,
        impact_card2_title_de: settings.impact_card2_title_de,
        
        impact_card2_text_en: settings.impact_card2_text_en,
        impact_card2_text_de: settings.impact_card2_text_de,
        
        impact_card2_image: settings.impact_card2_image, // Images are shared

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

  // ✨ NEW: Handle Color Save (Create or Update)
  const handleSaveColor = async () => {
      if (!editingColor) return;
      if (!editingColor.name || !editingColor.hex_code) {
          alert("Name and Color Code are required.");
          return;
      }
      setIsSavingColor(true);

      const colorData = {
          name: editingColor.name,
          name_de: editingColor.name_de, // ✨ Save German Name
          hex_code: editingColor.hex_code,
          meaning_en: editingColor.meaning_en,
          meaning_de: editingColor.meaning_de,
          feeling_en: editingColor.feeling_en, // ✨ NEW
          feeling_de: editingColor.feeling_de, // ✨ NEW
          perfect_for_en: editingColor.perfect_for_en, // ✨ NEW
          perfect_for_de: editingColor.perfect_for_de, // ✨ NEW
          quote_en: editingColor.quote_en, // ✨ NEW
          quote_de: editingColor.quote_de, // ✨ NEW
          is_active: editingColor.is_active
      };

      if (editingColor.id) {
          // Update
          const { error } = await supabase.from('product_colors').update(colorData).eq('id', editingColor.id);
          if (error) alert("Error updating color: " + error.message);
      } else {
          // Insert
          const { error } = await supabase.from('product_colors').insert([{
            ...colorData,
            sort_order: colors.length + 1
          }]);
          if (error) alert("Error creating color: " + error.message);
      }

      setEditingColor(null);
      fetchColors();
      setIsSavingColor(false);
  };

  // ✨ NEW: Toggle Color Active Status
  const toggleColorStatus = async (color: ProductColor) => {
      const newStatus = !color.is_active;
      // Optimistic Update
      setColors(colors.map(c => c.id === color.id ? { ...c, is_active: newStatus } : c));
      
      const { error } = await supabase.from('product_colors').update({ is_active: newStatus }).eq('id', color.id);
      if (error) {
          alert("Error updating status");
          fetchColors(); // Revert on error
      }
  };

  // ✨ NEW: Delete Color
  const handleDeleteColor = async (id: string) => {
      if (!confirm("Are you sure you want to delete this color? This cannot be undone.")) return;
      const { error } = await supabase.from('product_colors').delete().eq('id', id);
      if (error) alert("Error deleting: " + error.message);
      else fetchColors();
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
            <h1 className="text-4xl font-bold text-[#1F1F1F]">Storefront Settings</h1>
            <p className="text-[#1F1F1F]/50 mt-1 font-medium">Customize visuals, content, and features.</p>
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

            {/* ✨ NEW: Checkout Configuration (Donations) */}
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4">
               <div className="flex items-center gap-2 mb-2 text-[#C9A24D]">
                   <Droplets size={20} />
                   <h3 className="font-bold text-lg text-[#1F1F1F]">Checkout Features</h3>
               </div>
               
               {/* Water Well Toggle */}
               <div className="flex items-center justify-between p-4 bg-[#F6EFE6] rounded-xl border border-[#C9A24D]/20">
                   <div>
                       <p className="font-bold text-sm text-[#1F1F1F]">Water Well Project</p>
                       <p className="text-[10px] text-[#1F1F1F]/50">Enable water well donation option.</p>
                   </div>
                   <button 
                       onClick={() => setSettings({...settings, is_donation_active: !settings.is_donation_active})}
                       className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${settings.is_donation_active ? 'bg-[#C9A24D] justify-end' : 'bg-gray-300 justify-start'}`}
                   >
                       <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                   </button>
               </div>

               {/* Tips Toggle */}
               <div className="flex items-center justify-between p-4 bg-[#F6EFE6] rounded-xl border border-[#C9A24D]/20">
                   <div className="flex items-center gap-2">
                       <Coffee size={16} className="text-[#C9A24D]"/>
                       <div>
                           <p className="font-bold text-sm text-[#1F1F1F]">Team Support / Tips</p>
                           <p className="text-[10px] text-[#1F1F1F]/50">Enable team tipping option.</p>
                       </div>
                   </div>
                   <button 
                       onClick={() => setSettings({...settings, is_tip_active: !settings.is_tip_active})}
                       className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${settings.is_tip_active ? 'bg-[#1F1F1F] justify-end' : 'bg-gray-300 justify-start'}`}
                   >
                       <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                   </button>
               </div>
            </div>

            {/* ✨ NEW: VACATION MODE SECTION */}
            <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2 text-[#C9A24D]">
                    <Plane size={20} />
                    <h3 className="font-bold text-lg text-[#1F1F1F]">Vacation Mode</h3>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[#F6EFE6] rounded-xl border border-[#C9A24D]/20">
                    <div>
                        <p className="font-bold text-sm text-[#1F1F1F]">Activate Vacation Mode</p>
                        <p className="text-[10px] text-[#1F1F1F]/50">Pauses immediate shipping.</p>
                    </div>
                    <button 
                        onClick={() => setSettings({...settings, is_vacation_mode_active: !settings.is_vacation_mode_active})}
                        className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${settings.is_vacation_mode_active ? 'bg-[#C9A24D] justify-end' : 'bg-gray-300 justify-start'}`}
                    >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                </div>

                {settings.is_vacation_mode_active && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#1F1F1F]/40 uppercase">Start Date</label>
                                <input 
                                    type="date" 
                                    value={settings.vacation_start_date || ''}
                                    onChange={(e) => setSettings({...settings, vacation_start_date: e.target.value})}
                                    className="w-full bg-[#F6EFE6] border border-black/5 rounded-xl px-3 py-2 text-sm font-bold text-[#1F1F1F] focus:outline-none focus:border-[#C9A24D]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[#1F1F1F]/40 uppercase">Resumes On (Important)</label>
                                <input 
                                    type="date" 
                                    value={settings.vacation_end_date || ''}
                                    onChange={(e) => setSettings({...settings, vacation_end_date: e.target.value})}
                                    className="w-full bg-[#F6EFE6] border border-black/5 rounded-xl px-3 py-2 text-sm font-bold text-[#1F1F1F] focus:outline-none focus:border-[#C9A24D]"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#1F1F1F]/40 uppercase">Custom Message</label>
                            <textarea 
                                rows={3}
                                value={settings.vacation_message || ''}
                                onChange={(e) => setSettings({...settings, vacation_message: e.target.value})}
                                placeholder="We are currently on vacation..."
                                className="w-full bg-[#F6EFE6] border border-black/5 rounded-xl px-3 py-2 text-sm font-medium text-[#1F1F1F] focus:outline-none focus:border-[#C9A24D] resize-none"
                            />
                        </div>
                    </div>
                )}
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
              <input type="file" id="hero-file" hidden onChange={(e) => handleGenericUpload(e, 'hero_image_url')} accept="image/*" />
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

          {/* RIGHT: Live Preview & Color Manager */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* HERO PREVIEW */}
            <div className="space-y-4">
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

            {/* ✨ NEW: IMPACT SECTION SETTINGS */}
            <div className="space-y-6 pt-8 border-t border-black/5">
                <div className="flex items-center gap-2 mb-2 text-[#1F1F1F]">
                    <Globe size={20} className="text-[#C9A24D]" />
                    <h2 className="text-2xl font-bold">Impact Section</h2>
                </div>
                
                <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-8">
                    
                    {/* Master Switch */}
                    <div className="flex items-center justify-between p-4 bg-[#F6EFE6] rounded-xl border border-[#C9A24D]/20">
                        <div>
                            <p className="font-bold text-sm text-[#1F1F1F]">Show Impact Section on Homepage</p>
                            <p className="text-[10px] text-[#1F1F1F]/50">Hides the "More Than Just Flowers" block completely.</p>
                        </div>
                        <button 
                            onClick={() => setSettings({...settings, show_impact_section: !settings.show_impact_section})}
                            className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${settings.show_impact_section ? 'bg-[#C9A24D] justify-end' : 'bg-gray-300 justify-start'}`}
                        >
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                    </div>

                    {settings.show_impact_section && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                            
                            {/* Main Title & Text */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm uppercase tracking-wider text-[#1F1F1F]/40">Main Content</h3>
                                
                                {/* Title EN/DE */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#1F1F1F]">Section Title</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <input 
                                            type="text" 
                                            value={settings.impact_title_en || ''}
                                            onChange={(e) => setSettings({...settings, impact_title_en: e.target.value})}
                                            className="w-full bg-[#F6EFE6] rounded-xl px-4 py-3 font-bold text-lg text-[#1F1F1F] focus:ring-2 focus:ring-[#C9A24D]"
                                            placeholder="English Title"
                                        />
                                        <input 
                                            type="text" 
                                            value={settings.impact_title_de || ''}
                                            onChange={(e) => setSettings({...settings, impact_title_de: e.target.value})}
                                            className="w-full bg-[#F6EFE6] rounded-xl px-4 py-3 font-bold text-lg text-[#1F1F1F] focus:ring-2 focus:ring-[#C9A24D]"
                                            placeholder="German Title"
                                        />
                                    </div>
                                </div>
                                
                                {/* Subtitle EN/DE */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#1F1F1F]">Main Description</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <textarea 
                                            rows={3}
                                            value={settings.impact_subtitle_en || ''}
                                            onChange={(e) => setSettings({...settings, impact_subtitle_en: e.target.value})}
                                            className="w-full bg-[#F6EFE6] rounded-xl px-4 py-3 text-sm text-[#1F1F1F] focus:ring-2 focus:ring-[#C9A24D] resize-none"
                                            placeholder="English Description"
                                        />
                                        <textarea 
                                            rows={3}
                                            value={settings.impact_subtitle_de || ''}
                                            onChange={(e) => setSettings({...settings, impact_subtitle_de: e.target.value})}
                                            className="w-full bg-[#F6EFE6] rounded-xl px-4 py-3 text-sm text-[#1F1F1F] focus:ring-2 focus:ring-[#C9A24D] resize-none"
                                            placeholder="German Description"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 1: Water Wells */}
                            <div className="border-t border-dashed border-black/10 pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-[#1F1F1F]/40">Left Card (Water Wells)</h3>
                                    <label htmlFor="card1-upload" className="cursor-pointer text-xs font-bold text-[#C9A24D] hover:underline flex items-center gap-1">
                                        <ImageIcon size={12}/> Change Image
                                    </label>
                                    <input type="file" id="card1-upload" hidden onChange={(e) => handleGenericUpload(e, 'impact_card1_image')} accept="image/*" />
                                </div>
                                
                                <div className="flex gap-4">
                                    {/* Tiny Preview */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                                        {settings.impact_card1_image ? (
                                            <img src={settings.impact_card1_image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {/* Card 1 Title EN/DE */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                type="text" 
                                                value={settings.impact_card1_title_en || ''}
                                                onChange={(e) => setSettings({...settings, impact_card1_title_en: e.target.value})}
                                                className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm font-bold"
                                                placeholder="Card Title (EN)"
                                            />
                                            <input 
                                                type="text" 
                                                value={settings.impact_card1_title_de || ''}
                                                onChange={(e) => setSettings({...settings, impact_card1_title_de: e.target.value})}
                                                className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm font-bold"
                                                placeholder="Card Title (DE)"
                                            />
                                        </div>
                                        {/* Card 1 Text EN/DE */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <textarea 
                                                rows={2}
                                                value={settings.impact_card1_text_en || ''}
                                                onChange={(e) => setSettings({...settings, impact_card1_text_en: e.target.value})}
                                                className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-xs"
                                                placeholder="Card Description (EN)"
                                            />
                                            <textarea 
                                                rows={2}
                                                value={settings.impact_card1_text_de || ''}
                                                onChange={(e) => setSettings({...settings, impact_card1_text_de: e.target.value})}
                                                className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-xs"
                                                placeholder="Card Description (DE)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Community */}
                            <div className="border-t border-dashed border-black/10 pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-[#1F1F1F]/40">Right Card (Community)</h3>
                                    <label htmlFor="card2-upload" className="cursor-pointer text-xs font-bold text-[#C9A24D] hover:underline flex items-center gap-1">
                                        <ImageIcon size={12}/> Change Image
                                    </label>
                                    <input type="file" id="card2-upload" hidden onChange={(e) => handleGenericUpload(e, 'impact_card2_image')} accept="image/*" />
                                </div>
                                
                                <div className="flex gap-4">
                                    {/* Tiny Preview */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                                        {settings.impact_card2_image ? (
                                            <img src={settings.impact_card2_image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                         {/* Card 2 Title EN/DE */}
                                         <div className="grid grid-cols-2 gap-2">
                                            <input 
                                                type="text" 
                                                value={settings.impact_card2_title_en || ''}
                                                onChange={(e) => setSettings({...settings, impact_card2_title_en: e.target.value})}
                                                className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm font-bold"
                                                placeholder="Card Title (EN)"
                                            />
                                            <input 
                                                type="text" 
                                                value={settings.impact_card2_title_de || ''}
                                                onChange={(e) => setSettings({...settings, impact_card2_title_de: e.target.value})}
                                                className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm font-bold"
                                                placeholder="Card Title (DE)"
                                            />
                                        </div>
                                        {/* Card 2 Text EN/DE */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <textarea 
                                                rows={2}
                                                value={settings.impact_card2_text_en || ''}
                                                onChange={(e) => setSettings({...settings, impact_card2_text_en: e.target.value})}
                                                className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-xs"
                                                placeholder="Card Description (EN)"
                                            />
                                            <textarea 
                                                rows={2}
                                                value={settings.impact_card2_text_de || ''}
                                                onChange={(e) => setSettings({...settings, impact_card2_text_de: e.target.value})}
                                                className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-xs"
                                                placeholder="Card Description (DE)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* ✨ NEW: DYNAMIC COLOR MANAGER */}
            <div className="space-y-6 pt-8 border-t border-black/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#1F1F1F] flex items-center gap-2"><Palette className="text-[#C9A24D]" /> Product Color Manager</h2>
                        <p className="text-sm text-[#1F1F1F]/50">Manage seasonal colors, meanings, and visibility.</p>
                    </div>
                    {!editingColor && (
                        <button 
                            onClick={() => setEditingColor({ 
                                name: '', name_de: '', hex_code: '#000000', 
                                meaning_en: '', meaning_de: '', 
                                feeling_en: '', feeling_de: '', 
                                perfect_for_en: '', perfect_for_de: '', 
                                quote_en: '', quote_de: '', 
                                is_active: true, sort_order: colors.length 
                            })}
                            className="bg-[#1F1F1F] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#C9A24D] transition-colors"
                        >
                            <Plus size={16} /> Add Color
                        </button>
                    )}
                </div>

                {editingColor ? (
                    <div className="bg-white p-6 rounded-[2rem] border border-black/5 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-center border-b border-black/5 pb-4 mb-4">
                            <h3 className="font-bold text-lg">{editingColor.id ? "Edit Color" : "New Color"}</h3>
                            <button onClick={() => setEditingColor(null)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><X size={20}/></button>
                        </div>
                        
                        {/* BASIC INFO */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-[#1F1F1F]/40 mb-1 block">Hex Code</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={editingColor.hex_code} onChange={e => setEditingColor({...editingColor, hex_code: e.target.value})} className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent" />
                                    <input type="text" value={editingColor.hex_code} onChange={e => setEditingColor({...editingColor, hex_code: e.target.value})} className="w-full bg-[#F6EFE6] rounded-xl px-4 py-3 font-mono text-sm outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-[#1F1F1F]/40 mb-1 block">Color Name</label>
                                <input type="text" value={editingColor.name} onChange={e => setEditingColor({...editingColor, name: e.target.value})} placeholder="English (e.g. Red)" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C9A24D] mb-2" />
                                <input type="text" value={editingColor.name_de} onChange={e => setEditingColor({...editingColor, name_de: e.target.value})} placeholder="German (z.B. Rot)" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C9A24D]" />
                            </div>
                        </div>

                        {/* MEANING (Previous) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#1F1F1F]/40 flex items-center gap-2"><Palette size={12}/> Meaning</label>
                            <input type="text" value={editingColor.meaning_en} onChange={e => setEditingColor({...editingColor, meaning_en: e.target.value})} placeholder="English (e.g. Passion & Love)" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A24D] mb-2" />
                            <input type="text" value={editingColor.meaning_de} onChange={e => setEditingColor({...editingColor, meaning_de: e.target.value})} placeholder="German (z.B. Leidenschaft & Liebe)" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A24D]" />
                        </div>

                        {/* ✨ NEW FIELDS */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#1F1F1F]/40 flex items-center gap-2"><Heart size={12}/> Feeling</label>
                            <input type="text" value={editingColor.feeling_en} onChange={e => setEditingColor({...editingColor, feeling_en: e.target.value})} placeholder="English (e.g. Warm & Cozy)" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A24D] mb-2" />
                            <input type="text" value={editingColor.feeling_de} onChange={e => setEditingColor({...editingColor, feeling_de: e.target.value})} placeholder="German (z.B. Warm & Gemütlich)" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A24D]" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#1F1F1F]/40 flex items-center gap-2"><Star size={12}/> Perfect For</label>
                            <input type="text" value={editingColor.perfect_for_en} onChange={e => setEditingColor({...editingColor, perfect_for_en: e.target.value})} placeholder="English (e.g. Anniversaries)" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A24D] mb-2" />
                            <input type="text" value={editingColor.perfect_for_de} onChange={e => setEditingColor({...editingColor, perfect_for_de: e.target.value})} placeholder="German (z.B. Jahrestage)" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A24D]" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-[#1F1F1F]/40 flex items-center gap-2"><Quote size={12}/> Quote</label>
                            <input type="text" value={editingColor.quote_en} onChange={e => setEditingColor({...editingColor, quote_en: e.target.value})} placeholder="English Quote" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A24D] mb-2" />
                            <input type="text" value={editingColor.quote_de} onChange={e => setEditingColor({...editingColor, quote_de: e.target.value})} placeholder="German Quote" className="w-full bg-[#F6EFE6] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C9A24D]" />
                        </div>

                        <div className="flex justify-end pt-4 gap-2">
                            <button onClick={() => setEditingColor(null)} className="px-6 py-3 rounded-xl font-bold text-[#1F1F1F]/60 hover:text-[#1F1F1F]">Cancel</button>
                            <button onClick={handleSaveColor} disabled={isSavingColor} className="bg-[#C9A24D] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#b08d45] disabled:opacity-50">
                                {isSavingColor ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Save Color</>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoadingColors ? (
                            <div className="col-span-2 flex justify-center py-10"><Loader2 className="animate-spin text-[#C9A24D]" /></div>
                        ) : colors.map((color) => (
                            <div key={color.id} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${color.is_active ? 'bg-white border-black/5' : 'bg-gray-50 border-black/5 opacity-60'}`}>
                                <div className="w-12 h-12 rounded-full shadow-inner border border-black/5 flex-shrink-0" style={{ backgroundColor: color.hex_code }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-[#1F1F1F] truncate">{color.name}</h4>
                                        <div className={`w-2 h-2 rounded-full ${color.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                                    </div>
                                    <p className="text-xs text-[#1F1F1F]/50 truncate">{color.meaning_en}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => toggleColorStatus(color)} className={`p-2 rounded-lg transition-colors ${color.is_active ? 'hover:bg-red-50 text-green-600 hover:text-red-500' : 'hover:bg-green-50 text-gray-400 hover:text-green-600'}`}>
                                        {color.is_active ? <Eye size={16}/> : <EyeOff size={16}/>}
                                    </button>
                                    <button onClick={() => setEditingColor(color)} className="p-2 hover:bg-[#F6EFE6] text-[#1F1F1F]/60 hover:text-[#1F1F1F] rounded-lg transition-colors">
                                        {/* Edit icon using SVG for simplicity */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    </button>
                                    <button onClick={() => handleDeleteColor(color.id!)} className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

          </div>

        </div>

        {/* ✨ NEW SECTION: Localization & Categories */}
        <div className="border-t border-black/5 pt-8">
            <h2 className="text-2xl font-bold text-[#1F1F1F] mb-6">Localization & Categories</h2>
            <CategoryTranslationManager />
        </div>

      </div>
    </div>
  );
}