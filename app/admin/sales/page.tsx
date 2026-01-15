"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Loader2, Save, Tag, Percent, AlertCircle, CheckCircle, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function SalesManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>({
    global_discount_percentage: 0,
    is_global_sale_active: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  // Hardcoded ID for settings row
  const SETTINGS_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    // 1. Fetch Global Settings
    const { data: settingsData } = await supabase
      .from('storefront_settings')
      .select('global_discount_percentage, is_global_sale_active')
      .eq('id', SETTINGS_ID)
      .single();

    if (settingsData) setGlobalSettings(settingsData);

    // 2. Fetch Products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (productsData) setProducts(productsData);
    setIsLoading(false);
  };

  const saveGlobalSettings = async () => {
    setIsSavingGlobal(true);
    const { error } = await supabase
      .from('storefront_settings')
      .update({
        global_discount_percentage: globalSettings.global_discount_percentage,
        is_global_sale_active: globalSettings.is_global_sale_active
      })
      .eq('id', SETTINGS_ID);

    if (error) alert("Error saving global settings");
    setIsSavingGlobal(false);
  };

  const saveIndividualProduct = async (product: any) => {
    setSavingProductId(product.id);
    
    // Logic: If on sale, ensure sale price is valid. If not valid, turn sale off.
    let finalSalePrice = parseFloat(product.sale_price);
    let finalIsOnSale = product.is_on_sale;

    if (finalIsOnSale && (!finalSalePrice || finalSalePrice >= product.price)) {
        alert("Sale price must be lower than regular price!");
        setSavingProductId(null);
        return;
    }

    const { error } = await supabase
      .from('products')
      .update({
        sale_price: finalSalePrice,
        is_on_sale: finalIsOnSale
      })
      .eq('id', product.id);

    if (error) alert("Error updating product");
    setSavingProductId(null);
  };

  const handleProductChange = (id: string, field: string, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F6EFE6] p-8 font-sans text-[#1F1F1F]">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <Tag className="text-[#C9A24D]" /> Sales Manager
                </h1>
                <p className="text-[#1F1F1F]/50 mt-2 font-medium">Manage store-wide discounts or individual product offers.</p>
            </div>
            <Link href="/admin/dashboard">
                <button className="flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity">
                    <LayoutDashboard size={16} /> Back to Dashboard
                </button>
            </Link>
        </div>

        {/* 1. GLOBAL SALE CARD */}
        <div className={`p-8 rounded-[2rem] border-2 transition-all ${
            globalSettings.is_global_sale_active ? "bg-[#C9A24D]/10 border-[#C9A24D]" : "bg-white border-black/5"
        }`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Percent size={20} /> Store-Wide Sale
                    </h2>
                    <p className="text-sm opacity-60 mt-1 max-w-md">
                        This will apply a percentage discount to <strong>ALL products</strong> automatically. 
                        (Note: This overrides individual sale prices).
                    </p>
                </div>

                <div className="flex items-end gap-4 bg-white/50 p-4 rounded-xl">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1">Discount %</label>
                        <input 
                            type="number" 
                            min="0" max="99"
                            value={globalSettings.global_discount_percentage}
                            onChange={(e) => setGlobalSettings({...globalSettings, global_discount_percentage: parseInt(e.target.value) || 0})}
                            className="w-24 p-2 rounded-lg border border-black/10 font-bold text-center text-lg outline-none focus:border-[#C9A24D]"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setGlobalSettings({...globalSettings, is_global_sale_active: !globalSettings.is_global_sale_active})}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                                globalSettings.is_global_sale_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                            }`}
                        >
                            {globalSettings.is_global_sale_active ? "ACTIVE" : "INACTIVE"}
                        </button>
                        
                        <button 
                            onClick={saveGlobalSettings}
                            disabled={isSavingGlobal}
                            className="bg-[#1F1F1F] text-white p-3 rounded-lg hover:bg-[#C9A24D] transition-colors disabled:opacity-50"
                        >
                            {isSavingGlobal ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. INDIVIDUAL PRODUCTS LIST */}
        <div className="space-y-4">
            <h3 className="font-bold text-xl">Individual Product Offers</h3>
            
            {globalSettings.is_global_sale_active && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl flex items-center gap-2 text-sm font-bold border border-yellow-200">
                    <AlertCircle size={16} />
                    Note: Global Sale is active. Individual prices below are currently ignored by the storefront.
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-black/5 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-[#F9F9F9] text-xs uppercase tracking-widest font-bold text-[#1F1F1F]/40">
                        <tr>
                            <th className="p-6">Product</th>
                            <th className="p-6 text-center">Regular Price</th>
                            <th className="p-6 text-center">Sale Price</th>
                            <th className="p-6 text-center">Status</th>
                            <th className="p-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6 font-bold">{product.name}</td>
                                <td className="p-6 text-center text-gray-400">€{product.price}</td>
                                <td className="p-6 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-gray-400 font-bold">€</span>
                                        <input 
                                            type="number" 
                                            value={product.sale_price || ''}
                                            onChange={(e) => handleProductChange(product.id, 'sale_price', e.target.value)}
                                            placeholder="--"
                                            className={`w-20 p-2 rounded-lg border text-center font-bold outline-none focus:border-[#C9A24D] ${
                                                product.is_on_sale ? "bg-red-50 text-red-600 border-red-200" : "bg-white border-gray-200"
                                            }`}
                                        />
                                    </div>
                                </td>
                                <td className="p-6 text-center">
                                    <button 
                                        onClick={() => handleProductChange(product.id, 'is_on_sale', !product.is_on_sale)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                            product.is_on_sale 
                                            ? "bg-red-100 text-red-600 shadow-sm scale-105" 
                                            : "bg-gray-100 text-gray-400"
                                        }`}
                                    >
                                        {product.is_on_sale ? "ON SALE" : "OFF"}
                                    </button>
                                </td>
                                <td className="p-6 text-right">
                                    <button 
                                        onClick={() => saveIndividualProduct(product)}
                                        disabled={savingProductId === product.id}
                                        className="text-[#C9A24D] hover:text-[#1F1F1F] p-2 rounded-full hover:bg-black/5 transition-all"
                                    >
                                        {savingProductId === product.id ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}