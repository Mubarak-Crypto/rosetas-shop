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
    .eq('is_featured', true) // ✅ PHASE 2 CHANGE: Only fetch Rosetta's chosen featured products
    .neq('category', 'supplies') 
    // ✨ ADDED: Ensure makeup add-ons do not accidentally appear in the main bouquet grid
    .not('is_addon', 'eq', true)
    .order('created_at', { ascending: false })
  // 🚀 PHASE 2 CHANGE: Increased limit to 4 products per Rosetta's request
    .limit(4); 

  // ✨ ADDED: Fetch Makeup Products for the new "Elevate Your Gift" section
  // We limit to 3 items so they fit perfectly in a stylish row on desktop
  const { data: makeupProducts } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('is_addon', true)
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
      // ✨ ADDED: Pass the newly fetched makeup items down to the client component
      makeupProducts={makeupProducts || []}
      settings={settings} 
    />
  );
}