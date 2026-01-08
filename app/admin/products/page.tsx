"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Loader2, AlertCircle, ArrowRight, ArrowLeft as ArrowLeftIcon } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your bouquets and prices.</p>
          </div>
          
          <Link href="/admin/products/new">
            <button className="bg-neon-rose hover:bg-[#D8C3A5] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-glow-rose">
              <Plus size={20} />
              Add New Product
            </button>
          </Link>
        </header>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-neon-rose outline-none transition-colors"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden min-h-[300px]">
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-neon-rose">
              <Loader2 className="animate-spin" size={48} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
              <p>No products found in database.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-black/20 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/10" />
                          )}
                        </div>
                        <span className="font-bold text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{product.category}</td>
                    <td className="px-6 py-4 text-sm font-mono text-neon-rose">€{product.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{product.stock} units</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide border ${
                         product.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* EDIT BUTTON (Now Linked) */}
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <Edit size={16} />
                          </button>
                        </Link>

                        {/* DELETE BUTTON (Now Functional) */}
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
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