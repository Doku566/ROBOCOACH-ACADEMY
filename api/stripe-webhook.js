// Vercel Serverless Function — POST /api/stripe-webhook
// Listens for Stripe events. On payment success, activates the B2B license in Supabase.
// Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT: Use the Service Role key here (NOT the anon key) for server-side writes
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://wucixsnybyaiozmykspa.supabase.co',
    process.env.SUPABASE_SERVICE_KEY  // Secret — never expose this on the frontend
);

// Vercel needs to read the raw body for Stripe signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => (data += chunk));
        req.on('end', () => resolve(Buffer.from(data)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // ── Handle checkout.session.completed ────────────────
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { institucion, dominio_email, asientos } = session.metadata;
        const paymentIntentId = session.payment_intent;

        if (!institucion || !dominio_email || !asientos) {
            console.error('Missing metadata in Stripe session:', session.id);
            return res.status(200).end(); // 200 so Stripe doesn't retry
        }

        // Generate a unique license code: INST-XXXXXX
        const code = `${dominio_email.replace(/[@.]/g, '').substring(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-5)}`;

        // Upsert the license in Supabase (create or update if reselling)
        const { error } = await supabase.from('licencias_b2b').upsert([{
            codigo: code,
            institucion: institucion,
            dominio_email: dominio_email,
            total_asientos: parseInt(asientos),
            asientos_usados: 0,
            activa: true,
            stripe_payment_id: paymentIntentId,
            fecha_expiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }], { onConflict: 'dominio_email' });

        if (error) {
            console.error('Supabase upsert error:', error);
            return res.status(500).json({ error: 'DB write failed' });
        }

        console.log(`✅ License activated for ${institucion} (${dominio_email}) — ${asientos} seats`);
    }

    return res.status(200).json({ received: true });
}
