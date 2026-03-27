// Vercel Serverless Function — POST /api/send-verification
// Generates and sends a 6-digit code via Resend
// Stores it in Supabase 'verificaciones' table for validation

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { email, nombre } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });

    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // 2. Upsert into Supabase 'verificaciones'
        const { error: dbError } = await supabase
            .from('verificaciones')
            .upsert({ email, codigo: code, created_at: new Date().toISOString() });

        if (dbError) throw new Error('Error saving code: ' + dbError.message);

        // 3. Send Email via Resend
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const emailHtml = `
        <div style="font-family:sans-serif; background:#0a0a0a; color:white; padding:40px; border-radius:12px; border:1px solid #333;">
            <h2 style="color:#E31B23">Código de Verificación - RoboCoach Academy</h2>
            <p>Hola <strong>${nombre || 'Competidor'}</strong>,</p>
            <p>Tu código para validar tu cuenta es:</p>
            <div style="font-size:32px; font-weight:800; background:#1a1a1a; padding:20px; text-align:center; border:2px dashed #E31B23; margin:20px 0; color:#E31B23; letter-spacing:10px;">
                ${code}
            </div>
            <p style="color:#888; font-size:12px;">Este código expirará pronto. Si no solicitaste este registro, ignora este correo.</p>
        </div>
        `;

        const mailResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'RoboCoach <onboarding@resend.dev>',
                to: [email],
                subject: `${code} es tu código de RoboCoach Academy`,
                html: emailHtml
            })
        });

        const mailData = await mailResp.json();
        if (!mailResp.ok) throw new Error('Resend error: ' + JSON.stringify(mailData));

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
