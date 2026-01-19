"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Save, Loader2, Globe, AlertCircle } from "lucide-react";

type Translation = {
  category_key: string;
  name_en: string;
  name_de: string;
};

export default function CategoryTranslationManager() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Get all unique categories currently used in products
      const { data: products } = await supabase.from('products').select('category');
      const usedCategories = Array.from(new Set(products?.map(p => p.category) || [])).filter(Boolean);

      // 2. Get existing saved translations
      const { data: savedTranslations } = await supabase.from('category_translations').select('*');

      // 3. Merge them
      const mergedData = usedCategories.map(catKey => {
        const existing = savedTranslations?.find(t => t.category_key === catKey);
        return {
          category_key: catKey,
          name_en: existing?.name_en || catKey, // Default to key if empty
          name_de: existing?.name_de || catKey, // Default to key if empty
        };
      });

      // Sort alphabetically
      setTranslations(mergedData.sort((a, b) => a.category_key.localeCompare(b.category_key)));

    } catch (error) {
      console.error("Error fetching translations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (index: number, field: 'name_en' | 'name_de', value: string) => {
    const updated = [...translations];
    updated[index][field] = value;
    setTranslations(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('category_translations')
        .upsert(translations, { onConflict: 'category_key' });

      if (error) throw error;
      alert("Translations saved successfully!");
    } catch (error: any) {
      alert("Error saving: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#C9A24D]" /></div>;

  return (
    <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Globe className="text-[#C9A24D]" size={20} />
          Category Translations
        </h3>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#1F1F1F] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#C9A24D] transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          Save All
        </button>
      </div>

      <div className="space-y-4">
        {translations.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                No categories found in your products yet.
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-12 gap-4 text-[10px] font-black uppercase text-gray-400 px-2">
                <div className="col-span-4">Original Key (Database)</div>
                <div className="col-span-4 text-[#C9A24D]">English Display</div>
                <div className="col-span-4 text-[#1F1F1F]">German Display</div>
            </div>
            
            {translations.map((t, idx) => (
                <div key={t.category_key} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 rounded-xl border border-black/5">
                <div className="col-span-4 text-xs font-bold text-gray-500 truncate" title={t.category_key}>
                    {t.category_key}
                </div>
                <div className="col-span-4">
                    <input 
                        type="text" 
                        value={t.name_en}
                        onChange={(e) => handleChange(idx, 'name_en', e.target.value)}
                        className="w-full bg-white border border-[#C9A24D]/20 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#C9A24D] outline-none text-[#C9A24D]"
                        placeholder="English Name"
                    />
                </div>
                <div className="col-span-4">
                    <input 
                        type="text" 
                        value={t.name_de}
                        onChange={(e) => handleChange(idx, 'name_de', e.target.value)}
                        className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs font-medium focus:border-[#1F1F1F] outline-none text-[#1F1F1F]"
                        placeholder="German Name"
                    />
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
      
      <div className="mt-4 flex items-start gap-2 bg-[#F6EFE6] p-3 rounded-xl border border-[#C9A24D]/20">
        <AlertCircle size={16} className="text-[#C9A24D] mt-0.5 shrink-0" />
        <p className="text-[10px] text-[#1F1F1F]/60 font-medium leading-relaxed">
            <strong>How this works:</strong> The "Original Key" is what you saved in the product page (e.g. "Glitter Roses"). 
            The system will use the translations above to display the correct name in the Navbar and Footer based on the user's selected language.
        </p>
      </div>
    </div>
  );
}