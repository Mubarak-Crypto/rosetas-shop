"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { supabase } from "../../../lib/supabase";
import { DollarSign, ShoppingBag, Package, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch Orders to calculate Revenue & Count
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("total");

        // 2. Fetch Products Count
        const { count: productCount, error: productError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true });

        if (orderError || productError) throw new Error("Failed to fetch data");

        // Calculate Total Revenue
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

        setStats({
          revenue: totalRevenue,
          orders: orders?.length || 0,
          products: productCount || 0,
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back, Boss.</p>
          </header>

          {isLoading ? (
            <div className="flex items-center gap-2 text-neon-purple">
              <Loader2 className="animate-spin" /> Loading live data...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CARD 1: REVENUE */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-neon-purple/50 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign size={100} />
                </div>
                <h3 className="text-gray-400 font-medium mb-2">Total Revenue</h3>
                <p className="text-4xl font-bold text-white">€{stats.revenue.toFixed(2)}</p>
                <div className="mt-4 text-xs text-green-400 font-bold uppercase tracking-wider">
                   Lifetime Sales
                </div>
              </div>

              {/* CARD 2: ORDERS */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-neon-rose/50 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <ShoppingBag size={100} />
                </div>
                <h3 className="text-gray-400 font-medium mb-2">Total Orders</h3>
                <p className="text-4xl font-bold text-white">{stats.orders}</p>
                <div className="mt-4 text-xs text-neon-rose font-bold uppercase tracking-wider">
                   Orders to ship
                </div>
              </div>

              {/* CARD 3: PRODUCTS */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Package size={100} />
                </div>
                <h3 className="text-gray-400 font-medium mb-2">Active Products</h3>
                <p className="text-4xl font-bold text-white">{stats.products}</p>
                <div className="mt-4 text-xs text-blue-400 font-bold uppercase tracking-wider">
                   In your catalog
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}