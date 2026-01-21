import { supabase } from "../../lib/supabase";
import ShopClient from "../../components/ShopClient";

// Force dynamic because we use searchParams (optional, but good for real-time stock)
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  // 1. Fetch All Active Products (We filter on client for instant speed)
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

  return (
    <ShopClient 
      initialProducts={products || []} 
      initialSettings={settings} 
      initialColors={colors || []} 
    />
  );
}