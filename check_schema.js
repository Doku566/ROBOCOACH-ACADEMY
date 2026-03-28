require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Checking foro_comunidad schema...");
    const { data, error } = await supabase.from('foro_comunidad').select('*').limit(1);
    if (error) {
        console.error("Error reading table:", error);
    } else {
        console.log("Table columns detected:", Object.keys(data[0] || {}));
    }
}

checkSchema();
