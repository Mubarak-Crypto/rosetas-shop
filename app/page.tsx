import { supabase } from "../lib/supabase";
import HomeClient from "../components/HomeClient";

// ✨ SPEED BOOST: This enables the "Cache Reload" logic.
// The page will be generated on the server and refreshed every 60 seconds.
export const revalidate = 60;

export default async function HomePage() {
  // 1. Fetch Products (Limit to 3 best sellers, just like your old code)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active') 
    .neq('category', 'supplies') 
    .order('created_at', { ascending: false })
    .limit(3); 

  // 2. Fetch Settings
  const { data: settings } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();

  // 3. Render the Client Component with the data
  return (
    <HomeClient 
      products={products || []} 
      settings={settings} 
    />
  );
}