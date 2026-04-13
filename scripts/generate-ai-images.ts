import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hfToken = process.env.HF_TOKEN;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

if (!hfToken) {
  console.error('Missing HF_TOKEN in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateImageWithHF(prompt: string): Promise<Buffer | null> {
  try {
    const response = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`HF API Error: ${response.status} - ${errText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Fetch error:`, error);
    return null;
  }
}

async function uploadToStorage(buffer: Buffer, fileName: string): Promise<string | null> {
  const { data: uploadData, error: uploadError } = await supabase.storage
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

async function processAuthors() {
  console.log('Fetching authors missing AI portrait or cover images...');
  
  const { data: authors, error } = await supabase
    .from('authors')
    .select('id, name, slug, image_url, cover_image_url')
    .or('image_url.like.%wikipedia%,image_url.is.null,cover_image_url.is.null')
    .limit(5); // Process fewer at a time since we generate 2 images each

  if (error) {
    console.error('Error fetching authors:', error);
    return;
  }

  if (!authors || authors.length === 0) {
    console.log('No eligible authors found. You are all done!');
    return;
  }

  console.log(`Found ${authors.length} authors to process. Generating 2 images per author...`);

  for (const author of authors) {
    console.log(`\n--- Processing ${author.name} ---`);
    let newImageUrl = author.image_url;
    let newCoverUrl = author.cover_image_url;

    // 1. Generate & Upload Portrait Image (if missing or wikipedia)
    if (!newImageUrl || newImageUrl.includes('wikipedia')) {
      console.log(`Generating Portrait for ${author.name}...`);
      const portraitPrompt = `A profound, hyper-realistic cinematic portrait of the historical figure ${author.name}. Shot on 35mm film, dark and moody aesthetic, heavy shadows, elegant dramatic studio lighting. Deep charcoal and black tones, professional editorial photography.`;
      const portraitBuffer = await generateImageWithHF(portraitPrompt);
      
      if (portraitBuffer) {
        newImageUrl = await uploadToStorage(portraitBuffer, `${author.slug}-portrait.jpg`) || newImageUrl;
        console.log(`Portrait uploaded! Waiting 10s...`);
        await sleep(10000); // rate limits
      }
    }

    // 2. Generate & Upload Cover Image (if missing)
    if (!newCoverUrl) {
      console.log(`Generating Cover Background for ${author.name}...`);
      const coverPrompt = `A highly sophisticated, dark, minimalist hero background representing ${author.name}. An atmospheric scene, architectural elements, or symbolic objects directly related to ${author.name}'s life and era. Deep black and charcoal tones, elegant cinematic lighting, negative space. Noir editorial photography style.`;
      const coverBuffer = await generateImageWithHF(coverPrompt);
      
      if (coverBuffer) {
        newCoverUrl = await uploadToStorage(coverBuffer, `${author.slug}-cover.jpg`) || newCoverUrl;
        console.log(`Cover uploaded! Waiting 10s...`);
        await sleep(10000); // rate limits
      }
    }

    // Update the database
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
        console.log(`✅ Successfully updated both images for ${author.name}!`);
      }
    }
  }

  console.log('\nBatch complete! Run the script again to process the next set.');
}

processAuthors().catch(console.error);
