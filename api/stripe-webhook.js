// Vercel Serverless Function — POST /api/stripe-webhook
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports.config = { api: { bodyParser: false } };

async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => (data += chunk));
        req.on('end', () => resolve(Buffer.from(data)));
        req.on('error', reject);
    });
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const meta = session.metadata;

        // ── 1. INDIVIDUAL UPGRADE ──
        if (meta.type === 'individual' || meta.user_email) {
            const email = meta.user_email || session.customer_email;
            await supabase.from('perfiles').update({ rango: 'PRO' }).eq('email', email);
            console.log(`✅ Individual PRO activated: ${email}`);
        } 
        
        // ── 2. B2B INSTITUTIONAL ──
        else if (meta.type === 'b2b' || meta.dominio_email) {
            const { institucion, dominio_email, asientos } = meta;
            const code = `${dominio_email.replace(/[@.]/g, '').substring(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-5)}`;
            
            await supabase.from('licencias_b2b').upsert([{
                codigo: code,
                institucion,
                dominio_email,
                total_asientos: parseInt(asientos),
                asientos_usados: 0,
                activa: true,
                fecha_expiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            }], { onConflict: 'dominio_email' });
            
            console.log(`✅ B2B License activated: ${institucion}`);
        }
    }

    return res.status(200).json({ received: true });
}
