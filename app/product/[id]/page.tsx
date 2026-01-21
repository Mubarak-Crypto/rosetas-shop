import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase"; 
import ProductClient from "../../../components/ProductClient"; 

// 1. Generate Metadata (SEO)
export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params; // ⚠️ Await the params here
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('id', params.id)
    .single();

  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: product.name,
    description: product.description,
  };
}

// 2. The Server Component
export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  
  // ⚠️ CRITICAL FIX: Await the params before using them
  const params = await props.params;
  const { id } = params;

  console.log("🔍 Attempting to fetch product with ID:", id); 

  // A. Fetch Product Data using the awaited 'id'
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id) // Use 'id' variable, not params.id
    .single();

  if (error) {
      console.error("❌ Supabase Error:", error.message);
  }

  if (!product) {
    console.error("❌ Product not found in DB.");
    return notFound();
  }

  // B. Fetch Global Settings
  const { data: settings } = await supabase
    .from('storefront_settings')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .single();

  // C. Fetch Approved Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', id) // Use 'id' variable
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  // 3. Hand over data to Client Component
  return (
    <ProductClient 
      initialProduct={product} 
      initialSettings={settings} 
      initialReviews={reviews || []} 
    />
  );
}