import { supabase } from "../../../lib/supabase";
import MakeupClient from "../../../components/MakeupClient";

export const revalidate = 60;

export default async function MakeupShopPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq('status', 'active')
    .eq('is_addon', true)
    .order('created_at', { ascending: false });

  const { data: settings } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();

  return (
    <MakeupClient 
      products={products || []} 
      settings={settings} 
    />
  );
}