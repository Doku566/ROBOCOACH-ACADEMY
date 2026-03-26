// Vercel Serverless Function — POST /api/stripe-checkout
// Handles both B2B Institutional licenses and Individual PRO upgrades.

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { type, institucion, dominio_email, asientos, contacto_email } = req.body;
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://robocoach-academy.vercel.app';

    // ── 1. INDIVIDUAL PRO FLOW ──
    if (type === 'individual') {
        if (!contacto_email) return res.status(400).json({ error: 'Debes estar logeado para comprar PRO.' });
        
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                customer_email: contacto_email,
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'RoboCoach Academy — Acceso Individual PRO',
                            description: 'Desbloquea todos los módulos técnicos, certificados y foro de por vida.',
                            images: [`${baseUrl}/vex_academy_hero.png`]
                        },
                        unit_amount: 2000, // $20.00
                    },
                    quantity: 1,
                }],
                metadata: { type: 'individual', user_email: contacto_email },
                success_url: `${baseUrl}/pago-exitoso.html?session_id={CHECKOUT_SESSION_ID}&type=pro`,
                cancel_url: `${baseUrl}/#precios`,
            });
            return res.status(200).json({ url: session.url });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    // ── 2. B2B INSTITUTIONAL FLOW ──
    if (!institucion || !dominio_email || !asientos || !contacto_email) {
        return res.status(400).json({ error: 'Faltan campos para licencia B2B.' });
    }

    const seats = parseInt(asientos);
    if (seats < 10) return res.status(400).json({ error: 'Mínimo 10 asientos.' });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: contacto_email,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `RoboCoach Academy — Licencia B2B (${institucion})`,
                        description: `${seats} asientos para alumnos con dominio ${dominio_email}`,
                    },
                    unit_amount: seats * 2000, // $20/seat
                },
                quantity: 1,
            }],
            metadata: { type: 'b2b', institucion, dominio_email, asientos: String(seats), contacto_email },
            success_url: `${baseUrl}/pago-exitoso.html?session_id={CHECKOUT_SESSION_ID}&type=b2b&inst=${encodeURIComponent(institucion)}`,
            cancel_url: `${baseUrl}/#precios`,
            invoice_creation: { enabled: true },
        });
        return res.status(200).json({ url: session.url });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
