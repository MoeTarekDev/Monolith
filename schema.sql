-- Authors table
CREATE TABLE authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  born TEXT,
  died TEXT,
  profession TEXT,
  nationality TEXT,
  bio TEXT,
  image_url TEXT,
  cover_image_url TEXT,
  quote_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quotes table
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  text TEXT NOT NULL,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collections table
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collection-Quote junction
CREATE TABLE collection_quotes (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, quote_id)
);

-- Indexes for performance
CREATE INDEX idx_quotes_author ON quotes(author_id);
CREATE INDEX idx_quotes_category ON quotes(category);
CREATE INDEX idx_authors_slug ON authors(slug);
CREATE INDEX idx_quotes_slug ON quotes(slug);
