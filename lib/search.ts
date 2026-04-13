'use client';

import Fuse from 'fuse.js';
import { Author, Quote } from './data';

export interface SearchResults {
  quotes: Quote[];
  authors: Author[];
}

let quoteFuse: Fuse<Quote> | null = null;
let authorFuse: Fuse<Author> | null = null;

export function initQuoteSearch(quotes: Quote[]) {
  quoteFuse = new Fuse(quotes, {
    keys: [
      { name: 'text', weight: 0.7 },
      { name: 'category', weight: 0.2 },
      { name: 'author.name', weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
  });
}

export function initAuthorSearch(authors: Author[]) {
  authorFuse = new Fuse(authors, {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'profession', weight: 0.2 },
      { name: 'nationality', weight: 0.2 },
    ],
    threshold: 0.3,
    includeScore: true,
  });
}

export function search(query: string): SearchResults {
  if (!query.trim()) {
    return { quotes: [], authors: [] };
  }

  const quoteResults = quoteFuse
    ? quoteFuse.search(query, { limit: 10 }).map((r) => r.item)
    : [];

  const authorResults = authorFuse
    ? authorFuse.search(query, { limit: 5 }).map((r) => r.item)
    : [];

  return { quotes: quoteResults, authors: authorResults };
}
