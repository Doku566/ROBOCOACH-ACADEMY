// Configuración centralizada de Supabase para RoboCoach Academy
const SUPABASE_URL = 'https://wucixsnybyaiozmykspa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JhJjgWt5ot1wmMJFd4kcLw_p7M13oIH';

// Inicializar el cliente (asume que el script de CDN ya fue cargado en el HTML)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function para verificar conexión
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient.from('licencias_b2b').select('*').limit(1);
        if (error) {
            console.error("Supabase Connection Error:", error.message);
            return false;
        }
        console.log("Supabase Connection Successful! DB is alive.");
        return true;
    } catch (err) {
        console.error("Supabase Init failed:", err);
        return false;
    }
}

// Exportar al objeto global para fácil acceso desde app.js, portal y controles.
window.db = supabaseClient;
