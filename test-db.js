const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

try {
  const envConfig = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=+#]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
} catch (e) {
  console.warn("Could not read .env.local");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Test insert with a dummy UUID just to see the error message
  const dummyUUID = '00000000-0000-0000-0000-000000000000';
  const { data, error } = await supabase.from('admissions').insert([
    {
      registration_id: dummyUUID,
      entry_date: '2026-06-29'
    }
  ]);
  
  console.log("Insert Error:", error);
}

test();
