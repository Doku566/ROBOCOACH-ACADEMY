# Plan Financiero y Estrategia Comercial (RoboCoach Academy)

A continuación, presento el desglose completo para llevar la plataforma de prototipo a un **entorno real, productivo y legal**, seguido por el análisis de tu Opción 2: venderla directamente a ACADEMIA STEM.

---

## OPCIÓN 1: Operar Independientemente y Vender B2B/B2C

Si decides montar esto tú mismo y vender suscripciones a estudiantes y paquetes de 100 licencias a universidades, necesitas esta infraestructura ("Stack de Producción").

### 1. Inversión Tecnológica Mensual Inicial (Hosting y Base de Datos)
La ventaja de esta arquitectura es que el software en la nube escala de manera muy económica:
*   **Alojamiento Web (Frontend Vercel o Netlify):** $0 a $20 USD/mes (Plan Pro recomendado para dominios personalizados rápidos).
*   **Base de Datos Segura y Autenticación (Supabase / Firebase):** $0 a $25 USD/mes (Maneja los accesos, contraseñas encriptadas y el registro en tiempo real del *Teacher Dashboard*).
*   **Almacenamiento de Video Seguro (Cloudflare Stream o AWS S3):** ~$5 a $15 USD/mes (Para evitar que tus cursos sean robados o descargados fácilmente, no se usa YouTube, se usa un CDN privado).
*   **Nombre de Dominio (Ej. robocoach.academy):** ~$15 USD / anuales.
*   **Presupuesto Técnico Total:** **~$30 - $60 USD al mes.**

### 2. Infraestructura Legal, Pasarelas de Pago y Facturación
Las universidades e instituciones **públicas** requieren facturas avaladas por el SAT (si estás en México) u organismos fiscales equivalentes, además de cobrar con tarjeta de crédito.
*   **Pasarela de Pagos (Stripe):** No tiene costo fijo, pero cobra **3.6% + $3 MXN** por cada transacción exitosa. Stripe permite domiciliar las rentas de los alumnos automáticamente.
*   **Facturación Automática (Facturama + Stripe API):** ~$300 MXN mensuales para emitir facturas CDFI automáticamente cuando una escuela (ej. CBTIS, TEC) pague tus $2,000 USD por un lote de licencias. Es requisito para proveedores del sector educativo público.
*   **Constitución Legal Básica (opcional para arrancar):** Si no cuentas con empresa, en México se puede empezar como *Persona Física con Actividad Empresarial (Régimen RESICO)*, con impuestos muy bajos (1-2.5% de ISR). 

**✅ Veredicto Opción 1:** Tu inversión total para tener una academia "nivel Google" operativa es de apenas **~$50 USD mensuales**, pero requiere labor constante de ventas por tu parte.

---

## OPCIÓN 2: El Modelo "Exit" (Venta a ACADEMIA STEM MEX)

Si en lugar de cazar clientes uno a uno, prefieres licenciarle el producto cerrado a **Academia STEM**, una organización que ya tiene cautivas a docenas de universidades y cientos de equipos VEX en el país.

Existen 3 modalidades en las que puedes negociar este "pitch":

### Escenario A: Licenciamiento SaaS (Software as a Service) Exclusivo
**El trato:** Tú mantienes la propiedad del código de RoboCoach, y Academia STEM se convierte en tu único cliente.
*   **Cómo funciona:** Les "rentas" la plataforma. Les das 10 paneles de *Teacher Dashboard* para que ellos se lo ofrezcan a 10 de sus colegios cliente.
*   **Flujo financiero:** Te pagan a ti un "Fee de Tecnología" o retención mensual de, por ejemplo, **$1,500 - $2,500 USD / mes** por usar tu software con su marca.
*   **Ventaja:** Tienes ingreso pasivo asegurado. Ellos manejan el servicio al cliente, tú mantienes el código.

### Escenario B: Revenue Share (Asociación a Porcentaje)
**El trato:** Academia STEM usa la plataforma para hacer "upselling" (venderle más caro) a las universidades a las que hoy solo les venden los robots físicos. 
*   **Cómo funciona:** Si STEM le vende a una Prepa el paquete VEX, además le empuja tu licencia "C++ Academy" por $1,000 USD anuales extras.
*   **Flujo financiero:** Las ganancias de software se parten. **Estándar industrial: 70% para ellos (porque ponen al cliente y cierran la venta), 30% para ti (por licenciar la IP comercial y técnica).**
*   **Ventaja:** Si venden 100 licencias a escuelas en todo México, ganarás $30,000 USD anuales casi libres sin haber hecho marketing.

### Escenario C: "Venta Blanca" o Adquisición Total (Exit Inmediato)
**El trato:** Vendes el código fuente, todos los derechos de autor de los videos, los exámenes y la arquitectura completa (incluyendo los disclaimers).
*   **Cómo funciona:** Academia STEM te compra la plataforma de contado y ellos le cambian el logo a "Academia STEM C++ Pro". Tú dejas el proyecto.
*   **Flujo financiero:** Al ser un producto especializado, maduro y único en el ecosistema latino, puedes valuarlo en base al tiempo e impacto de ingeniería (VEX Worlds Top 3 level code).
*   **Valoración Inicial Razonable:** De **$10,000 USD a $25,000 USD** como pago único "Lump Sum".
*   **Ventaja:** Inyección de fuerte capital sin necesidad de dar soporte al usuario final durante años.

### 🎯 Mi Recomendación para el Pitch
Ve a la reunión con **Academia STEM** mostrando la plataforma, pero no la ofrezcas en venta de inmediato (Escenario C). Presume el Teacher Dashboard y diles: *"He creado la herramienta perfecta para escalar su impacto en programación C++ y asegurar las recertificaciones institucionales de sus colegios sin elevar sus costos de nómina para maestros"*. Y ofrece primero el **Escenario A** o un plan Piloto de 3 meses.
