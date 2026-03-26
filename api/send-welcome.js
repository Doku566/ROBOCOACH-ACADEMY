// Vercel Serverless Function — POST /api/send-welcome
// Sends a branded HTML welcome email via Resend API
// Environment Variable required: RESEND_API_KEY (set in Vercel project settings)

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { nombre, email, rango } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ error: 'Missing required fields: nombre, email' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY not set');
        return res.status(500).json({ error: 'Email service not configured' });
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#0F0F0F; font-family:'Segoe UI',Arial,sans-serif; color:#ffffff; }
  .container { max-width:600px; margin:0 auto; padding:0 20px; }
  .header { background:linear-gradient(135deg,#1a0000 0%,#2d0000 100%); padding:40px 40px 30px; text-align:center; border-bottom:3px solid #E31B23; }
  .logo { color:#E31B23; font-size:28px; font-weight:900; letter-spacing:2px; margin-bottom:6px; }
  .logo span { color:#ffffff; }
  .tagline { color:#A0A0A0; font-size:12px; letter-spacing:3px; text-transform:uppercase; }
  .body { background:#141414; padding:40px; }
  .greeting { font-size:22px; font-weight:700; margin-bottom:12px; }
  .text { color:#C0C0C0; line-height:1.7; margin-bottom:20px; }
  .badge { display:inline-block; background:#E31B23; color:white; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700; letter-spacing:1px; }
  .cta { display:block; background:#E31B23; color:#ffffff; text-decoration:none; text-align:center; padding:16px 32px; border-radius:8px; font-weight:700; font-size:16px; margin:30px 0; letter-spacing:1px; }
  .features { background:#1a1a1a; border-radius:10px; padding:24px; margin:24px 0; border:1px solid rgba(255,255,255,0.08); }
  .feature { display:flex; align-items:flex-start; gap:12px; margin-bottom:16px; }
  .feature:last-child { margin-bottom:0; }
  .feature-icon { font-size:20px; flex-shrink:0; }
  .feature-text { color:#C0C0C0; font-size:14px; line-height:1.5; }
  .feature-title { color:#ffffff; font-weight:600; font-size:15px; }
  .footer { background:#0A0A0A; padding:24px 40px; text-align:center; color:#555; font-size:12px; border-top:1px solid rgba(255,255,255,0.05); }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">ROBOCOACH <span>ACADEMY</span></div>
    <div class="tagline">Entrenamiento C++ de Competencia Mundial</div>
  </div>
  <div class="body">
    <div class="greeting">¡Bienvenido, ${nombre}! 🎉</div>
    <span class="badge">${rango || 'GRATIS'}</span>
    <p class="text" style="margin-top:16px">
      Tu cuenta ha sido creada exitosamente en <strong>RoboCoach Academy</strong>. 
      Ahora formas parte de la comunidad de programadores C++ para VEX Robotics V5 
      más seria de Latinoamérica.
    </p>
    <div class="features">
      <div class="feature">
        <div class="feature-icon">🤖</div>
        <div class="feature-text">
          <div class="feature-title">94+ Módulos de Robótica</div>
          Desde configuración de VS Code hasta control PID y odometría de competencia.
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">🏆</div>
        <div class="feature-text">
          <div class="feature-title">Certificados por Unidad</div>
          Al completar cada Unidad recibirás un Certificado digital descargable.
        </div>
      </div>
      <div class="feature">
        <div class="feature-icon">🌎</div>
        <div class="feature-text">
          <div class="feature-title">Comunidad V5 en Tiempo Real</div>
          Conecta con alumnos de todo México y Latinoamérica en el foro.
        </div>
      </div>
    </div>
    <a class="cta" href="https://robocoach-academy.vercel.app" target="_blank">→ IR A MI ACADEMIA</a>
    <p class="text" style="font-size:13px;color:#666;">
      Si no creaste esta cuenta, ignora este correo. Tu bandeja de entrada está protegida.
    </p>
  </div>
  <div class="footer">
    © 2026 RoboCoach Learning Systems · Matamoros, Tamaulipas, México<br>
    <a href="https://robocoach-academy.vercel.app" style="color:#E31B23;text-decoration:none;">robocoach-academy.vercel.app</a>
  </div>
</div>
</body>
</html>
`;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'RoboCoach Academy <bienvenida@robocoach-academy.vercel.app>',
                to: [email],
                subject: `¡Bienvenido a RoboCoach Academy, ${nombre}! 🤖`,
                html: emailHtml
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', data);
            return res.status(502).json({ error: 'Email delivery failed', detail: data });
        }

        return res.status(200).json({ success: true, id: data.id });
    } catch (err) {
        console.error('Serverless function error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
