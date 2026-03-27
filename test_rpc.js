const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function testRPC() {
    try {
        const { data, error } = await supabase.rpc('get_active_license', { p_domain: '@google.com' });
        console.log('RPC Result:', data, 'Error:', error);
    } catch (e) {
        console.error('RPC Exception:', e);
    }
}
testRPC();
