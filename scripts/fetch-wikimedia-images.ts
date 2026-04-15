import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
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

interface WikimediaSummary {
  originalimage?: { source?: string };
  thumbnail?: { source?: string };
}

interface WikimediaMediaSrc {
  scale: string;
  src: string;
}

interface WikimediaMediaItem {
  type?: string;
  srcset?: WikimediaMediaSrc[];
}

interface WikimediaMediaList {
  items?: WikimediaMediaItem[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const USER_AGENT = 'MonolithQuoteBot/1.0 (https://monolith.moetarek.dev/; hello@moetarek.dev)';

async function fetchBufferFromUrl(url: string): Promise<Buffer | null> {
  try {
    // MediaWiki image URLs might lack protocol
    if (url.startsWith('//')) {
      url = 'https:' + url;
    }
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} - ${response.statusText}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Fetch buffer error:`, error);
    return null;
  }
}

async function uploadToStorage(buffer: Buffer, fileName: string): Promise<string | null> {
  const { error: uploadError } = await supabase.storage
    .from('author-images')
    .upload(`public/${fileName}`, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (uploadError) {
    console.error(`Failed to upload ${fileName}:`, uploadError);
    return null;
  }

  const { data } = supabase.storage.from('author-images').getPublicUrl(`public/${fileName}`);
  return data.publicUrl;
}

async function getWikimediaImages(authorName: string): Promise<{ portraitUrl: string | null, coverUrl: string | null }> {
  try {
    let portraitUrl = null;
    let coverUrl = null;

    // 1. Fetch from summary API for the primary portrait
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(authorName)}`;
    const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (summaryRes.ok) {
      const summaryData = (await summaryRes.json()) as WikimediaSummary;
      portraitUrl = summaryData.originalimage?.source || summaryData.thumbnail?.source || null;
    }

    // 2. Fetch media list to find an alternative image (second portrait)
    const mediaUrl = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(authorName)}`;
    const mediaRes = await fetch(mediaUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (mediaRes.ok) {
      const mediaData = (await mediaRes.json()) as WikimediaMediaList;
      const items = mediaData.items || [];
      
      // Filter out icons, audio, and get images
      const images = items.filter((item) => item.type === 'image');
      
      // Look for a secondary image. Usually, images[0] is the same as the summary image.
      // So we pick images[1] as the secondary portrait if it exists.
      const secondaryItem = images.length > 1 ? images[1] : images[0];
      
      if (secondaryItem && secondaryItem.srcset && secondaryItem.srcset.length > 0) {
        // Get highest scale image from srcset
        const bestImage = secondaryItem.srcset.reduce((prev, current) =>
          parseInt(current.scale, 10) > parseInt(prev.scale, 10) ? current : prev
        , secondaryItem.srcset[0]);
        
        coverUrl = bestImage.src;
      }
    }

    // If we have a portrait but no cover/secondary, just fallback to the same portrait
    if (portraitUrl && !coverUrl) {
      coverUrl = portraitUrl;
    }

    return { portraitUrl, coverUrl };
  } catch (error) {
    console.error('Error fetching from Wikimedia API:', error);
    return { portraitUrl: null, coverUrl: null };
  }
}

async function processAuthors() {
  console.log('Fetching authors to process images using Wikimedia APIs...');
  
  let totalProcessed = 0;
  
  while (true) {
    const { data: authors, error } = await supabase
      .from('authors')
      .select('id, name, slug, image_url, cover_image_url')
      .or('image_url.is.null,cover_image_url.is.null,image_url.like.%wikipedia.org%')
      .limit(10);

    if (error) {
      console.error('Error fetching authors:', error);
      return;
    }

    if (!authors || authors.length === 0) {
      console.log(`\n🎉 All done! Processed ${totalProcessed} authors total.`);
      return;
    }

    console.log(`\nFound batch of ${authors.length} authors to process...`);

    for (const author of authors) {
      console.log(`\n--- Processing ${author.name} ---`);
      let newImageUrl = author.image_url;
      let newCoverUrl = author.cover_image_url;

      console.log(`Fetching from Wikimedia API...`);
      const { portraitUrl, coverUrl } = await getWikimediaImages(author.name);

      if (portraitUrl && (!newImageUrl || newImageUrl.includes('wikipedia.org'))) {
        console.log(`Downloading Primary Portrait from: ${portraitUrl}`);
        const buffer = await fetchBufferFromUrl(portraitUrl);
        if (buffer) {
          newImageUrl = await uploadToStorage(buffer, `${author.slug}-portrait.jpg`) || newImageUrl;
          console.log(`Primary Portrait uploaded to Supabase Storage!`);
        }
      }

      if (coverUrl && !newCoverUrl) {
        console.log(`Downloading Secondary Portrait from: ${coverUrl}`);
        const buffer = await fetchBufferFromUrl(coverUrl);
        if (buffer) {
          newCoverUrl = await uploadToStorage(buffer, `${author.slug}-cover.jpg`) || newCoverUrl;
          console.log(`Secondary Portrait uploaded to Supabase Storage!`);
        }
      }

      // Update the database if anything changed
      if (newImageUrl !== author.image_url || newCoverUrl !== author.cover_image_url) {
        const { error: updateError } = await supabase
          .from('authors')
          .update({ 
            image_url: newImageUrl, 
            cover_image_url: newCoverUrl 
          })
          .eq('id', author.id);

        if (updateError) {
          console.error(`Failed to update DB for ${author.name}:`, updateError);
        } else {
          console.log(`✅ Successfully updated images for ${author.name}!`);
        }
      } else {
        console.log(`No updates made for ${author.name}.`);
      }

      totalProcessed++;
      // Rate limiting for Wikipedia APIs (they request < 200 req/s, but good practice to pause slightly)
      await sleep(1000);
    }
  }
}

processAuthors().catch(console.error);
