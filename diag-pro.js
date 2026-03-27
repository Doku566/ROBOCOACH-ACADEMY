const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env
if (fs.existsSync('.env')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const k in envConfig) { process.env[k] = envConfig[k]; }
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking dokusan566@gmail.com...");
    const { data: profiles, error } = await supabase.from('perfiles').select('*').ilike('email', 'dokusan566@gmail.com');
    if (error) {
        console.error("Error query perfiles:", error);
    } else {
        console.log("Profiles found:", JSON.stringify(profiles, null, 2));
    }
}

check();
