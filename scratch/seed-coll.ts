import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('Fetching...');
  const { data: collections } = await supabase.from('collections').select('id');
  const { data: quotes } = await supabase.from('quotes').select('id').limit(200);
  
  if (!collections || !quotes) {
    console.error('No data found');
    return;
  }

  console.log(`Found ${collections.length} collections and ${quotes.length} quotes.`);

  for (const coll of collections) {
    // pick 12 random quotes
    const shuffled = quotes.sort(() => 0.5 - Math.random()).slice(0, 12);
    let count = 0;
    for (const q of shuffled) {
      const { error } = await supabase.from('collection_quotes').upsert({
        collection_id: coll.id,
        quote_id: q.id
      });
      if (!error) count++;
    }
    console.log(`Inserted ${count} quotes into collection ${coll.id}`);
  }
}
main();
