const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data, error } = await supabase.from('perfiles').update({
        rango: 'PRO',
        fecha_expiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }).eq('email', 'dokusan566@gmail.com');
    console.log(data, error);
}
run();
