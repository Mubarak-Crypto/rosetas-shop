"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader2, Video, Globe, Bookmark } from "lucide-react"; // ✨ Added Bookmark icon for Ribbon status
import Link from "next/link";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching products:", error);
    else setProducts(data || []);
    
    setIsLoading(false);
  };

  // --- NEW: DELETE FUNCTION ---
  const handleDelete = async (id: number) => {
    // 1. Confirm with user
    if (!window.confirm("Are you sure you want to delete this product? This cannot be undone.")) {
      return;
    }

    // 2. Delete from Supabase
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      // 3. Remove from local screen immediately
      setProducts(products.filter(p => p.id !== id));
      alert("Product deleted.");
    }
  };

  /**
   * ✨ NEW HELPER: Calculate Total Stock
   * Since Rosetta wants individual stock per combination, the main table 
   * should now show the SUM of all those combination stocks.
   */
  const calculateTotalStock = (product: any) => {
    if (product.variants && Array.isArray(product.variants)) {
      return product.variants.reduce((acc: number, variant: any) => acc + (Number(variant.stock) || 0), 0);
    }
    return product.stock || 0; // Fallback to legacy stock field
  };

  return (
    /* ✅ FIXED: Theme Colors Updated to Cream & Ink */
    <div className="min-h-screen bg-[#F6EFE6] text-[#1F1F1F] flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[#1F1F1F]">Products</h1>
            <p className="text-[#1F1F1F]/60 text-sm mt-1 font-medium">Manage your bouquets and prices.</p>
          </div>
          
          <Link href="/admin/products/new">
            {/* ✅ FIXED: Button forced to Ink Black with Gold hover */}
            <button className="bg-[#1F1F1F] hover:bg-[#C9A24D] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg">
              <Plus size={20} />
              Add New Product
            </button>
          </Link>
        </header>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1F1F1F]/30" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-white border border-black/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#C9A24D] outline-none transition-colors text-[#1F1F1F]"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-black/5 rounded-2xl overflow-hidden min-h-[300px] shadow-sm">
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-[#C9A24D]">
              <Loader2 className="animate-spin" size={48} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-10 text-[#1F1F1F]/40 font-medium">
              <p>No products found in database.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase text-[#1F1F1F]/50 font-bold tracking-widest border-b border-black/5">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Bilingual</th>
                  <th className="px-6 py-4">Ribbon {/* ✨ NEW: Ribbon Mandatory Column */}</th> 
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Total Stock {/* Updated label */}</th> 
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-black/5 bg-gray-100 relative">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-black/5" />
                          )}
                          {product.video_url && (
                            <div className="absolute top-0 right-0 bg-[#C9A24D] p-0.5 rounded-bl">
                              <Video size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-sm text-[#1F1F1F]">{product.name}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${product.name ? 'bg-black text-white' : 'bg-gray-100 text-gray-300'}`}>DE</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${product.name_en ? 'bg-[#C9A24D] text-white' : 'bg-gray-100 text-gray-300'}`}>EN</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {/* ✨ NEW: Ribbon Status Indicator */}
                      <div className="flex items-center gap-2">
                        {product.needs_ribbon ? (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-[#C9A24D] bg-[#C9A24D]/10 px-2 py-1 rounded">
                             <Bookmark size={10} fill="currentColor" /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase">Disabled</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-[#1F1F1F]/60 font-medium">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-mono font-bold text-[#C9A24D]">€{product.price}</td>
                    
                    <td className="px-6 py-4 text-sm text-[#1F1F1F]/60 font-medium">
                      {/* ✨ UPDATED: Logic to show combined stock from all variants */}
                      {calculateTotalStock(product)} units
                    </td>

                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tight border ${
                         product.status === 'active' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <button className="p-2 hover:bg-black/5 rounded-lg text-[#1F1F1F]/40 hover:text-[#C9A24D] transition-colors">
                            <Edit size={16} />
                          </button>
                        </Link>

                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-[#1F1F1F]/40 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}