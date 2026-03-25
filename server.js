require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());

// Validar que las keys de Firebase existan antes de inicializar (evita crasheos si el usuario aún no pone sus keys)
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
    });
    console.log("Firebase Admin Inicializado ✓");
} else {
    console.warn("⚠️ ALERTA: Faltan las llaves de Firebase en el archivo .env.");
}

const db = admin.firestore ? admin.firestore() : null;

// ============================================
// 1. STRIPE: SESIÓN DE CHECKOUT
// ============================================
app.post('/api/create-checkout-session', express.json(), async (req, res) => {
    try {
        const { userEmail } = req.body;
        if (!userEmail) return res.status(400).json({ error: 'Email requerido' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: userEmail,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Suscripción PRO VEX Academy',
                        description: 'Acceso total a los 94 módulos, odometría, PID y preparación para jueces.'
                    },
                    unit_amount: 2900, // $29.00 USD
                },
                quantity: 1,
            }],
            mode: 'payment', // usa 'subscription' si es recurrente
            success_url: `http://localhost:${process.env.PORT || 3000}/#success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:${process.env.PORT || 3000}/#canceled`,
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ============================================
// 2. STRIPE: WEBHOOKS (CUMPLE PCI-DSS)
// ============================================
// El webhook de Stripe NECESITA el body como Raw Buffer para verificar la firma de seguridad
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerEmail = session.customer_details.email;

        console.log(`✅ ¡Pago recibido exitosamente de: ${customerEmail}!`);

        // Upgrade user to PRO in Firebase Database automatically
        if (db) {
            try {
                // Buscamos al usuario por correo crudo (o usando Firebase Auth UID si lo incluimos en el metadata)
                const userRef = db.collection('users').doc(customerEmail);
                await userRef.set({
                    status: 'pro',
                    isSubscribed: true,
                    paymentDate: new Date().toISOString()
                }, { merge: true });
                console.log(`[DB] Rol de ${customerEmail} elevado a PRO.`);
            } catch (dbErr) {
                console.error("[DB ERROR] Error al guardar en Firebase:", dbErr);
            }
        }
    }

    res.json({ received: true });
});

// Servir los archivos estáticos (Frontend)
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 VEX Academy SaaS Backend Corriendo en el puerto ${PORT}`));
