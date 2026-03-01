import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api'], // Keeps Google out of your backend code
    },
    sitemap: 'https://www.rosetasbouquets.com/sitemap.xml',
  };
}