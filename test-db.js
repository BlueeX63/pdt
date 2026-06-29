const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://edxmalchjmimqjspukkz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeG1hbGNoam1pbXFqc3B1a2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzEyODQsImV4cCI6MjA5ODI0NzI4NH0.BpIU1S2BmF6_8jJRQvgaS8efG0Qxc3RBCIpOBF8wyqE';
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
