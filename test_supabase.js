const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wucixsnybyaiozmykspa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JhJjgWt5ot1wmMJFd4kcLw_p7M13oIH';

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    console.log("Testing connection...");
    const { data, error } = await db.from('perfiles').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
