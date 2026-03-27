const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://wucixsnybyaiozmykspa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhYmFzZSIsInJlZiI6Ind1Y2l4c255YnlhaW96bXlrc3BhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MTY5NiwiZXhwIjoyMDkwMDQ3Njk2fQ.3a-w4CNdC9N0Y6uHG2dlxqSqit-8UGhzUAd_TMWQBpQ";

const supabase = createClient(supabaseUrl, supabaseKey);

async function forcePro() {
    const email = 'dokusan566@gmail.com';
    console.log(`Forzando status PRO para ${email}...`);
    
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);
    
    const { data, error } = await supabase.from('perfiles')
        .update({ 
            rango: 'PRO', 
            fecha_expiracion: expDate.toISOString() 
        })
        .ilike('email', email);
        
    if (error) {
        console.error("Error al forzar PRO:", error);
    } else {
        console.log("✅ Actualización exitosa en Supabase.");
    }
}

forcePro();
