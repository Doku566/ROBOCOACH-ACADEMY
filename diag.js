const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function diag() {
    console.log('--- DIAGNOSTIC START ---');
    const { data, error } = await supabase.from('perfiles').select('*').eq('email', 'dokusan566@gmail.com');
    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('User Profile in DB:', JSON.stringify(data, null, 2));
    }
    
    // Check RPC existence
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_active_license', { p_domain: '@test.com' });
    console.log('RPC Test (@test.com):', rpcData, rpcError ? rpcError.message : 'SUCCESS');
    
    console.log('--- DIAGNOSTIC END ---');
}
diag();
