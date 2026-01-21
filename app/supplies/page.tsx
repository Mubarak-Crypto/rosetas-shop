import { supabase } from "../../lib/supabase";
import SuppliesClient from "../../components/SuppliesClient";

// Force dynamic to ensure stock is always real-time
export const dynamic = 'force-dynamic';

export default async function SuppliesPage() {
  
  // 1. Fetch Global Settings
  const { data: settings } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();

  // 2. Fetch Supplies Products (Server Side = Instant)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('category', 'supplies') // Fetch only supplies
    .order('name', { ascending: true });

  return (
    <SuppliesClient 
      initialProducts={products || []} 
      initialSettings={settings} 
    />
  );
}