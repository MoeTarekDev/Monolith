import { MetadataRoute } from 'next';
import { getAuthorSlugs, getQuoteSlugs, getCollectionSlugs } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://monolith.quotes';

  // Core pages
  const routes = ['', '/explore', '/about', '/collections'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Author pages
  const authorSlugs = await getAuthorSlugs();
  const authorRoutes = authorSlugs.map((slug) => ({
    url: `${baseUrl}/author/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Quote pages
  const quoteSlugs = await getQuoteSlugs();
  const quoteRoutes = quoteSlugs.map((slug) => ({
    url: `${baseUrl}/quote/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Collection pages
  const collectionSlugs = await getCollectionSlugs();
  const collectionRoutes = collectionSlugs.map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...authorRoutes, ...quoteRoutes, ...collectionRoutes];
}
