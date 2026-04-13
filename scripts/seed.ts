import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import request from 'request';
import unzipper from 'unzipper';
import { pipeline } from 'stream/promises';
import { execSync } from 'child_process';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function slugify(text: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

async function fetchWikiInfo(authorName: string): Promise<{ bio: string | null; image_url: string | null }> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(authorName)}`;
    const response = await fetch(url);
    if (!response.ok) return { bio: null, image_url: null };
    const data = await response.json();
    return {
      bio: data.extract || null,
      image_url: data.originalimage?.source || data.thumbnail?.source || null
    };
  } catch (error) {
    return { bio: null, image_url: null };
  }
}

async function downloadKaggleDataset(kaggleUser: string, kaggleKey: string) {
  const datasetId = 'manchunhui/quotes-500k';
  const dataDir = path.join(process.cwd(), 'data');
  const csvPath = path.join(dataDir, 'quotes.csv');

  if (fs.existsSync(csvPath)) {
    console.log('Dataset already downloaded.');
    return csvPath;
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  console.log('Downloading dataset from Kaggle via REST API...');
  
  const auth = Buffer.from(`${kaggleUser}:${kaggleKey}`).toString('base64');
  const response = await fetch(`https://www.kaggle.com/api/v1/datasets/download/${datasetId}`, {
    headers: { Authorization: `Basic ${auth}` },
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`Failed to download from Kaggle: ${response.status} ${response.statusText}`);
  }

  console.log('Extracting zip...');
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const zipDir = await unzipper.Open.buffer(buffer);
  
  // Find the quotes csv inside the zip
  const csvEntry = zipDir.files.find((d: any) => d.path.endsWith('.csv'));
  if (!csvEntry) {
    throw new Error('CSV not found inside the downloaded zip');
  }

  const writeStream = fs.createWriteStream(csvPath);
  await pipeline(csvEntry.stream(), writeStream);
  
  console.log('Dataset downloaded and extracted to', csvPath);
  return csvPath;
}

async function seedDatabase() {
  console.log('Seeding Collections...');
  const collections = [
    { title: 'Quotes for Bad Days', slug: 'bad-days', description: 'When nothing seems to go right, read these.' },
    { title: 'Hustle & Grind', slug: 'hustle', description: 'Fire up your motivation.' },
    { title: 'Philosophy 101', slug: 'philosophy', description: 'Deep thoughts from the ancient sages.' },
    { title: 'Love & Heartbreak', slug: 'love-heartbreak', description: 'Words for romance and melancholy.' }
  ];
  
  for (const coll of collections) {
    await supabase.from('collections').upsert(coll, { onConflict: 'slug' });
  }

  let csvPath: string | null = null;
  try {
    csvPath = await downloadKaggleDataset(process.env.KAGGLE_USERNAME!, process.env.KAGGLE_KEY!);
  } catch (err) {
    console.error('Kaggle download failed, using fallback data:', err);
  }

  let quotesData: { quote: string, author: string, category: string }[] = [];

  if (csvPath && fs.existsSync(csvPath)) {
    console.log('Parsing quotes...');
    await new Promise((resolve) => {
      fs.createReadStream(csvPath!)
        .pipe(csv())
        .on('data', (data) => quotesData.push(data))
        .on('end', resolve);
    });
  } else {
    console.log('Using synthetic fallback data...');
    quotesData = [
      { quote: "Imagination is more important than knowledge.", author: "Albert Einstein", category: "imagination" },
      { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "life" },
      { quote: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt", category: "motivation" },
      { quote: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats", category: "hustle" },
      { quote: "I can resist everything except temptation.", author: "Oscar Wilde", category: "humor" },
      { quote: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln", category: "life" },
      { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
      { quote: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi", category: "philosophy" }
    ];
  }

  // Aggregate by author
  const authorMap = new Map<string, any[]>();
  for (const q of quotesData) {
    if (!q.author || !q.quote) continue;
    const author = q.author.trim();
    if (!authorMap.has(author)) authorMap.set(author, []);
    authorMap.get(author)?.push(q);
  }

  const sortedAuthors = Array.from(authorMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 300); // Top 300 authors

  console.log(`Processing top ${sortedAuthors.length} authors...`);

  for (const [authorName, authorQuotes] of sortedAuthors) {
    const slug = slugify(authorName);
    
    // Check if author exists to avoid redundant wiki calls
    const { data: existingAuthor } = await supabase.from('authors').select('id, quote_count').eq('slug', slug).single();
    let authorId = existingAuthor?.id;

    if (!authorId) {
      console.log(`Fetching wiki for ${authorName}...`);
      const wiki = await fetchWikiInfo(authorName);
      
      const { data: newAuthor, error: authErr } = await supabase.from('authors').upsert({
        name: authorName,
        slug: slug,
        bio: wiki.bio,
        image_url: wiki.image_url,
        quote_count: Math.min(authorQuotes.length, 15),
        is_featured: authorQuotes.length > 50
      }, { onConflict: 'slug' }).select('id').single();

      if (authErr) {
        console.error('Author insert error:', authErr);
        continue;
      }
      authorId = newAuthor?.id;
    } else {
        if(existingAuthor && existingAuthor.quote_count >= 15) continue; // Skip if we already seeded quotes for this author
    }

    // Insert top 15 quotes for this author
    const topQuotes = authorQuotes.slice(0, 15);
    for (const q of topQuotes) {
      const qSlug = slugify(q.quote.slice(0, 50));
      await supabase.from('quotes').upsert({
        slug: qSlug,
        text: q.quote.trim(),
        author_id: authorId,
        category: q.category?.split(',')[0]?.trim() || 'thoughts',
        is_featured: q.quote.length < 80 
      }, { onConflict: 'slug' });
    }
  }

  console.log('Seed complete!');
}

seedDatabase().catch(console.error);
