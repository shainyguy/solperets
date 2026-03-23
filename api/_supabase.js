import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars:', { 
    url: !!supabaseUrl, 
    key: !!supabaseKey 
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
