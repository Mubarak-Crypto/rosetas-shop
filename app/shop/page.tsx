import { supabase } from "../../lib/supabase";
import ShopClient from "../../components/ShopClient";

// ✨ UPDATE: Switched to ISR (Incremental Static Regeneration) for instant loading
// This refreshes the product data every 60 seconds instead of every single request.
export const revalidate = 60;

export default async function ShopPage() {
  // 1. Fetch All Active Products (We filter on client for instant speed)
  // ✅ PHASE 2: Fetching all active products including the new 'is_featured' column
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // 2. Fetch Global Settings
  const { data: settings } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();

  // 3. Fetch Active Colors for "Let Roses Speak"
  const { data: colors } = await supabase
    .from('product_colors')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // 🚀 PHASE 2 NOTE: The 2-column layout change happens inside the ShopClient component.
  return (
    <ShopClient 
      initialProducts={products || []} 
      initialSettings={settings} 
      initialColors={colors || []} 
    />
  );
}