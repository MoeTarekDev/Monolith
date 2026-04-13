import { supabase } from './supabase';

/* ============================================
   Type Definitions
   ============================================ */

export interface Author {
  id: string;
  slug: string;
  name: string;
  born: string | null;
  died: string | null;
  profession: string | null;
  nationality: string | null;
  bio: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  quote_count: number;
  is_featured: boolean;
  created_at: string;
}

export interface Quote {
  id: string;
  slug: string;
  text: string;
  author_id: string;
  category: string | null;
  is_featured: boolean;
  created_at: string;
  // Joined fields
  author?: Author;
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  created_at: string;
}

/* ============================================
   Author Queries
   ============================================ */

export async function getAllAuthors(limit = 300): Promise<Author[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('quote_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
  return data || [];
}

export async function getFeaturedAuthors(limit = 10): Promise<Author[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('is_featured', true)
    .order('quote_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured authors:', error);
    return [];
  }
  return data || [];
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching author:', error);
    return null;
  }
  return data;
}

export async function getAuthorSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('slug');

  if (error) {
    console.error('Error fetching author slugs:', error);
    return [];
  }
  return (data || []).map((a) => a.slug);
}

/* ============================================
   Quote Queries
   ============================================ */

export async function getAllQuotes(limit = 100, offset = 0): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, author:authors(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
  return data || [];
}

export async function getQuotesByAuthor(authorId: string): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, author:authors(*)')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes by author:', error);
    return [];
  }
  return data || [];
}

export async function getQuoteBySlug(slug: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, author:authors(*)')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
  return data;
}

export async function getQuoteSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('slug');

  if (error) {
    console.error('Error fetching quote slugs:', error);
    return [];
  }
  return (data || []).map((q) => q.slug);
}

export async function getFeaturedQuotes(limit = 20): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, author:authors(*)')
    .eq('is_featured', true)
    .limit(limit);

  if (error) {
    console.error('Error fetching featured quotes:', error);
    return [];
  }
  return data || [];
}

export async function getQuotesByCategory(category: string, limit = 50): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, author:authors(*)')
    .eq('category', category)
    .limit(limit);

  if (error) {
    console.error('Error fetching quotes by category:', error);
    return [];
  }
  return data || [];
}

export async function getQuoteOfTheDay(): Promise<Quote | null> {
  // Use daily index to get a consistent quote for the day
  const { data: countData } = await supabase
    .from('quotes')
    .select('id', { count: 'exact', head: true });

  const total = countData?.length || 100;
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const offset = dayOfYear % total;

  const { data, error } = await supabase
    .from('quotes')
    .select('*, author:authors(*)')
    .range(offset, offset)
    .single();

  if (error) {
    // Fallback: get first featured quote
    const { data: fallback } = await supabase
      .from('quotes')
      .select('*, author:authors(*)')
      .eq('is_featured', true)
      .limit(1)
      .single();
    return fallback;
  }
  return data;
}

export async function getRandomQuote(): Promise<Quote | null> {
  // Supabase doesn't have random(), so we count and pick a random offset
  const { count } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true });

  if (!count) return null;

  const randomOffset = Math.floor(Math.random() * count);
  const { data, error } = await supabase
    .from('quotes')
    .select('*, author:authors(*)')
    .range(randomOffset, randomOffset)
    .single();

  if (error) return null;
  return data;
}

export async function getAllCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('category')
    .not('category', 'is', null);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categories = [...new Set((data || []).map((q) => q.category).filter(Boolean))] as string[];
  return categories.sort();
}

export async function getRelatedAuthors(currentSlug: string, limit = 6): Promise<Author[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .neq('slug', currentSlug)
    .order('quote_count', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

export async function getRelatedQuotes(currentSlug: string, category: string | null, limit = 6): Promise<Quote[]> {
  let query = supabase
    .from('quotes')
    .select('*, author:authors(*)')
    .neq('slug', currentSlug);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.limit(limit);

  if (error) return [];
  return data || [];
}

/* ============================================
   Collection Queries
   ============================================ */

export async function getAllCollections(): Promise<(Collection & { quote_count: number })[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('title');

  if (error || !data) return [];
  
  const collectionsWithCounts = await Promise.all(
    data.map(async (collection) => {
      const { count } = await supabase
        .from('collection_quotes')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collection.id);
      return { ...collection, quote_count: count || 0 };
    })
  );

  return collectionsWithCounts;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getCollectionQuotes(collectionId: string): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('collection_quotes')
    .select('quote:quotes(*, author:authors(*))')
    .eq('collection_id', collectionId);

  if (error) return [];
  return (data || []).map((item: Record<string, unknown>) => item.quote as unknown as Quote);
}

export async function getCollectionSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('slug');

  if (error) return [];
  return (data || []).map((c) => c.slug);
}

/* ============================================
   Search / Count helpers
   ============================================ */

export async function getTotalQuoteCount(): Promise<number> {
  const { count } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getTotalAuthorCount(): Promise<number> {
  const { count } = await supabase
    .from('authors')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}
