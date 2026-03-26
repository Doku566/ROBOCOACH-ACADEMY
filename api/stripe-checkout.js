// Vercel Serverless Function — POST /api/stripe-checkout
// Creates a Stripe Checkout Session for B2B institutional license purchases.
// Required env vars: STRIPE_SECRET_KEY, NEXT_PUBLIC_URL

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pricing config — adjust as needed
const PRICE_PER_SEAT_USD = 20; // $20 per seat/year
const MIN_SEATS = 10;
const MAX_SEATS = 500;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { institucion, dominio_email, asientos, contacto_email } = req.body;

    if (!institucion || !dominio_email || !asientos || !contacto_email) {
        return res.status(400).json({ error: 'Faltan campos: institucion, dominio_email, asientos, contacto_email' });
    }

    const seats = parseInt(asientos);
    if (seats < MIN_SEATS || seats > MAX_SEATS) {
        return res.status(400).json({ error: `Los asientos deben estar entre ${MIN_SEATS} y ${MAX_SEATS}.` });
    }

    const totalUSD = seats * PRICE_PER_SEAT_USD;
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://robocoach-academy.vercel.app';

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: contacto_email,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `RoboCoach Academy — Licencia B2B Anual`,
                        description: `${seats} asientos para ${institucion} (${dominio_email}) · Acceso 1 año`,
                        images: [`${baseUrl}/vex_academy_hero.png`],
                        metadata: {
                            institucion,
                            dominio_email,
                            asientos: String(seats)
                        }
                    },
                    unit_amount: totalUSD * 100, // Stripe uses cents
                },
                quantity: 1,
            }],
            metadata: {
                institucion,
                dominio_email,
                asientos: String(seats),
                contacto_email
            },
            success_url: `${baseUrl}/pago-exitoso.html?session_id={CHECKOUT_SESSION_ID}&inst=${encodeURIComponent(institucion)}`,
            cancel_url: `${baseUrl}/#suscripcion`,
            invoice_creation: { enabled: true }, // Auto-generate invoice
        });

        return res.status(200).json({ url: session.url, session_id: session.id });

    } catch (err) {
        console.error('Stripe Checkout error:', err);
        return res.status(500).json({ error: err.message });
    }
}
