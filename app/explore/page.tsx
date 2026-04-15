import Footer from '@/components/layout/Footer';
import ExploreClient from './ExploreClient';
import {
  EXPLORE_QUOTES_PAGE_SIZE,
  getAllCategories,
  getExploreAuthors,
  getExploreQuotesPage,
  type ExploreSort,
} from '@/lib/data';

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function readSingleParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeSort(value: string | null): ExploreSort {
  if (value === 'popular' || value === 'newest' || value === 'az') {
    return value;
  }

  return 'popular';
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedSearchParams = await searchParams;
  const view = readSingleParam(resolvedSearchParams.view) === 'authors' ? 'authors' : 'quotes';
  const category = readSingleParam(resolvedSearchParams.category);
  const sortBy = normalizeSort(readSingleParam(resolvedSearchParams.sort));

  const [categories, authors, quotes] = await Promise.all([
    getAllCategories(),
    view === 'authors' ? getExploreAuthors(sortBy) : Promise.resolve([]),
    view === 'quotes'
      ? getExploreQuotesPage({
          category,
          sortBy,
          limit: EXPLORE_QUOTES_PAGE_SIZE,
          offset: 0,
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      <ExploreClient
        categories={categories}
        initialAuthors={authors}
        initialCategory={category}
        initialHasMore={quotes.length === EXPLORE_QUOTES_PAGE_SIZE}
        initialQuotes={quotes}
        initialSort={sortBy}
        initialView={view}
      />
      <Footer />
    </>
  );
}
