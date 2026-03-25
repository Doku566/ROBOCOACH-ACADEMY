// =====================================================
//  RoboCoach Academy — Certificate Generator
//  HTML Canvas-based, client-side PDF/PNG generation
// =====================================================

const CERT_COLORS = {
    bg: '#0A0A0A',
    red: '#E31B23',
    gold: '#FFD700',
    silver: '#C0C0C0',
    white: '#FFFFFF',
    muted: '#A0A0A0',
    border: 'rgba(227,27,35,0.5)'
};

// Public API — call this to show the certificate modal
window.showCertificate = function(unitNumber, unitName, studentName, institution) {
    const modal = document.createElement('div');
    modal.id = 'certModal';
    modal.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;
        display:flex;align-items:center;justify-content:center;
        padding:1rem;animation:fadeIn 0.3s ease;
    `;
    modal.innerHTML = `
        <div style="background:#111;border:1px solid rgba(227,27,35,0.3);border-radius:16px;
                    padding:2rem;max-width:680px;width:100%;text-align:center;">
            <h2 style="color:#FFD700;font-size:1.5rem;margin-bottom:0.5rem">
                🏆 ¡Unidad ${unitNumber} Completada!
            </h2>
            <p style="color:#A0A0A0;margin-bottom:1.5rem;font-size:0.95rem">
                Tu certificado está listo. Descárgalo y compártelo en LinkedIn como evidencia de tu nivel técnico en C++ para VEX Robotics V5.
            </p>
            <canvas id="certCanvas" width="1200" height="850"
                style="width:100%;border-radius:8px;border:1px solid rgba(255,255,255,0.1);"></canvas>
            <div style="display:flex;gap:1rem;margin-top:1.5rem;justify-content:center;flex-wrap:wrap;">
                <button onclick="downloadCertificate()" class="btn-primary"
                    style="background:#FFD700;border-color:#FFD700;color:#000;font-weight:800;">
                    ⬇ Descargar PNG
                </button>
                <button onclick="document.getElementById('certModal').remove()"
                    class="btn-secondary">Cerrar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Draw after DOM insertion
    requestAnimationFrame(() =>
        drawCertificate('certCanvas', unitNumber, unitName, studentName, institution)
    );
};

function drawCertificate(canvasId, unitNumber, unitName, studentName, institution) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // ── Background ──────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0A0000');
    bgGrad.addColorStop(0.5, '#0F0F0F');
    bgGrad.addColorStop(1, '#000A00');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── Outer Gold Border ────────────────────────────────
    ctx.strokeStyle = CERT_COLORS.gold;
    ctx.lineWidth = 6;
    roundRect(ctx, 18, 18, W - 36, H - 36, 16);
    ctx.stroke();

    // ── Red Inner Border ─────────────────────────────────
    ctx.strokeStyle = CERT_COLORS.red;
    ctx.lineWidth = 2;
    roundRect(ctx, 32, 32, W - 64, H - 64, 10);
    ctx.stroke();

    // ── Corner Ornaments ────────────────────────────────
    drawCornerOrnament(ctx, 50, 50, 1, 1);
    drawCornerOrnament(ctx, W - 50, 50, -1, 1);
    drawCornerOrnament(ctx, 50, H - 50, 1, -1);
    drawCornerOrnament(ctx, W - 50, H - 50, -1, -1);

    // ── Red Stripe Header ───────────────────────────────
    ctx.fillStyle = CERT_COLORS.red;
    ctx.fillRect(36, 36, W - 72, 110);

    // ── Logo Text in Header ─────────────────────────────
    ctx.fillStyle = CERT_COLORS.white;
    ctx.font = 'bold 38px "Space Grotesk", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROBOCOACH', W / 2 - 60, 107);
    ctx.fillStyle = CERT_COLORS.gold;
    ctx.fillText('ACADEMY', W / 2 + 95, 107);

    ctx.font = '14px "Outfit", "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.letterSpacing = '4px';
    ctx.fillText('ENTRENAMIENTO VEX ROBOTICS V5 • C++ DE COMPETENCIA', W / 2, 128);

    // ── Main Title ──────────────────────────────────────
    ctx.fillStyle = CERT_COLORS.gold;
    ctx.font = 'italic bold 20px "Georgia", serif';
    ctx.fillText('Este certificado de logro académico se otorga a:', W / 2, 210);

    // ── Student Name ────────────────────────────────────
    ctx.fillStyle = CERT_COLORS.white;
    ctx.font = 'bold 60px "Space Grotesk", "Segoe UI", sans-serif';
    ctx.fillText(studentName || 'Alumno VEX', W / 2, 295);

    // ── Decorative underline ─────────────────────────────
    const nameWidth = ctx.measureText(studentName || 'Alumno VEX').width;
    ctx.strokeStyle = CERT_COLORS.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - nameWidth / 2, 310);
    ctx.lineTo(W / 2 + nameWidth / 2, 310);
    ctx.stroke();

    // ── Institution ─────────────────────────────────────
    ctx.fillStyle = CERT_COLORS.muted;
    ctx.font = '22px "Outfit", "Segoe UI", sans-serif';
    ctx.fillText(institution || 'Institución Académica', W / 2, 350);

    // ── By completing text ──────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '18px "Outfit", sans-serif';
    ctx.fillText('ha completado satisfactoriamente', W / 2, 400);

    // ── Unit Block ──────────────────────────────────────
    const blockX = W / 2 - 280;
    const blockY = 415;
    const blockW = 560;
    const blockH = 130;

    // Background block
    ctx.fillStyle = 'rgba(227, 27, 35, 0.08)';
    roundRect(ctx, blockX, blockY, blockW, blockH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(227,27,35,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = CERT_COLORS.red;
    ctx.font = 'bold 16px "Outfit", sans-serif';
    ctx.fillText(`UNIDAD ${unitNumber}`, W / 2, blockY + 35);

    ctx.fillStyle = CERT_COLORS.white;
    ctx.font = 'bold 32px "Space Grotesk", "Segoe UI", sans-serif';
    ctx.fillText(unitName || `Programación C++ VEX V5`, W / 2, blockY + 80);

    ctx.fillStyle = CERT_COLORS.muted;
    ctx.font = '14px "Outfit", sans-serif';
    ctx.fillText('Nivel Técnico de Competencia Mundial', W / 2, blockY + 112);

    // ── Divider ─────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 575);
    ctx.lineTo(W - 80, 575);
    ctx.stroke();

    // ── Footer Info ─────────────────────────────────────
    const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    ctx.fillStyle = CERT_COLORS.muted;
    ctx.font = '15px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Fecha de emisión: ${dateStr}`, 80, 620);

    ctx.textAlign = 'right';
    ctx.fillText('robocoach-academy.vercel.app', W - 80, 620);

    // ── Signature Area ──────────────────────────────────
    ctx.textAlign = 'center';

    // Left signature block
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(180, 720); ctx.lineTo(420, 720); ctx.stroke();
    ctx.fillStyle = CERT_COLORS.white;
    ctx.font = 'bold 16px "Outfit", sans-serif';
    ctx.fillText('Domingo García', 300, 745);
    ctx.fillStyle = CERT_COLORS.muted;
    ctx.font = '13px "Outfit", sans-serif';
    ctx.fillText('Director Académico', 300, 763);
    ctx.fillText('RoboCoach Academy', 300, 779);

    // Right signature block
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.moveTo(780, 720); ctx.lineTo(1020, 720); ctx.stroke();
    ctx.fillStyle = CERT_COLORS.red;
    ctx.font = 'bold 16px "Outfit", sans-serif';
    ctx.fillText('VEX ROBOTICS V5', 900, 745);
    ctx.fillStyle = CERT_COLORS.muted;
    ctx.font = '13px "Outfit", sans-serif';
    ctx.fillText('Currículo Certificado', 900, 763);
    ctx.fillText('Nivel Competencia Mundial', 900, 779);

    // ── Seal Badge ──────────────────────────────────────
    drawSeal(ctx, W / 2, 710, 55);

    // ── Certificate ID Watermark ─────────────────────────
    const certId = `RC-U${unitNumber}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ID: ${certId}`, W / 2, H - 45);
}

function drawSeal(ctx, cx, cy, r) {
    // Outer glow ring
    const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r + 15);
    glow.addColorStop(0, 'rgba(255,215,0,0.15)');
    glow.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 15, 0, Math.PI * 2);
    ctx.fill();

    // Seal ring
    ctx.strokeStyle = CERT_COLORS.gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1A0000';
    ctx.fill();
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = 'rgba(255,215,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Star
    ctx.fillStyle = CERT_COLORS.gold;
    ctx.font = `bold ${r * 0.7}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('★', cx, cy + r * 0.28);
}

function drawCornerOrnament(ctx, x, y, sx, sy) {
    ctx.strokeStyle = CERT_COLORS.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + sy * 30);
    ctx.lineTo(x, y);
    ctx.lineTo(x + sx * 30, y);
    ctx.stroke();

    ctx.fillStyle = CERT_COLORS.gold;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

window.downloadCertificate = function() {
    const canvas = document.getElementById('certCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `RoboCoach_Certificado_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (window.showToast) showToast('¡Certificado descargado! Compártelo en LinkedIn 🏆', 'success');
};

// ─── Auto-check Unit Completion ──────────────────────────
// Called from app.js whenever a module is completed.
// Checks if ALL modules of that unit are done, then triggers the certificate.
window.checkUnitCompletion = function(completedModuleId) {
    const userEmail = localStorage.getItem('userEmail');
    const profileRaw = localStorage.getItem('userProfile');
    if (!userEmail || !window.CURRICULUM) return;

    let profile = null;
    try { profile = JSON.parse(profileRaw); } catch(e) {}

    // Find which unit the completed module belongs to
    const targetModule = window.CURRICULUM.find(m => m.id === completedModuleId);
    if (!targetModule) return;
    const unitNumber = targetModule.unit;

    // Get all modules in that unit
    const unitModules = window.CURRICULUM.filter(m => m.unit === unitNumber);

    // Get user progress from localStorage
    let progress = { completed: [] };
    try { progress = JSON.parse(localStorage.getItem(`progress_${userEmail}`)) || { completed: [] }; } catch(e) {}

    const completedInUnit = unitModules.filter(m => progress.completed.includes(m.id));

    // If all modules in this unit are done — show the certificate!
    if (completedInUnit.length >= unitModules.length) {
        const alreadyShown = localStorage.getItem(`cert_shown_unit_${unitNumber}_${userEmail}`);
        if (alreadyShown) return; // Don't repeat the same certificate
        localStorage.setItem(`cert_shown_unit_${unitNumber}_${userEmail}`, '1');

        const unitNames = {
            1: 'Fundamentos de C++ para VEX',
            2: 'Control de Motores y Sensores',
            3: 'Programación Autónoma',
            4: 'Control PID y Loops de Retroalimentación',
            5: 'Visión y Sensores Avanzados',
            6: 'Odometría y Localización',
            7: 'Comunicación entre Sistemas',
            8: 'Competencia – Estrategias de Campo',
            9: 'Programación de Campo Avanzado',
            10: 'Optimización y Código de Competencia',
            11: 'Jueces, Entrevistas y Libreta de Diseño'
        };

        const name = profile?.nombre || userEmail.split('@')[0];
        const school = profile?.escuela || 'RoboCoach Academy';
        const uName = unitNames[unitNumber] || `Unidad ${unitNumber}`;

        // Small delay for visual feedback after module completion
        setTimeout(() => {
            window.showCertificate(unitNumber, uName, name, school);
        }, 800);
    }
};
