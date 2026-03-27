const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async function handler(req, res) {
    const { email } = req.query;
    if (!email) return res.status(400).send("Falta email");

    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);

    const { data, error } = await supabase.from('perfiles')
        .update({ rango: 'PRO', fecha_expiracion: expDate.toISOString() })
        .ilike('email', email.trim());

    if (error) return res.status(500).json(error);
    return res.status(200).send(`✅ Usuario ${email} forzado a PRO exitosamente.`);
};
