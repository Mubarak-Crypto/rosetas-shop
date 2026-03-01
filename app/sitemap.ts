import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.rosetasbouquets.com';

  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/supplies`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  // 2. Fetch all live products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('id'); 

  if (error || !products) {
    return staticPages; // Failsafe
  }

  // 3. Generate links for every single flower arrangement
  const dynamicProductPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`, 
    lastModified: new Date(), 
    changeFrequency: 'monthly',
    priority: 0.7, 
  }));

  return [...staticPages, ...dynamicProductPages];
}