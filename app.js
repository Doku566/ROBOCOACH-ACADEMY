// VEX Robotics Academy — app.js (Fixed + Full Curriculum Integration)
// Loads curriculum from curriculum.js

// === STATE ===
let courses = window.CURRICULUM || [];
let isSubscribed = localStorage.getItem('isSubscribed') === 'true';
let userEmail = localStorage.getItem('userEmail') || null;
let activeUnit = 1;
let currentLessonId = null;
let examAnswers = {};
let userProgress = {};
let timeInterval = null;

// === SVG ICONS ===
const ICONS = {
    play:     `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    lock:     `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    book:     `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    pencil:   `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`,
    security: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    rocket:   `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--vex-red)" stroke-width="1.5"><path d="M12 2L8 8H4l-2 8 4-1 2 5 4-4 4 4 2-5 4 1-2-8h-4L12 2z"></path><circle cx="12" cy="10" r="2" fill="var(--vex-red)"></circle></svg>`,
    exam:     `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
    check:    `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    user:     `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    message:  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`
};

// === SANITIZE ===
function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// === MODAL CONTROLS ===
function closeModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.innerHTML = '';
    currentLessonId = null;
    if(timeInterval) clearInterval(timeInterval);
}

// Close modal on backdrop click
window.addEventListener('click', function(e) {
    const modal = document.getElementById('checkoutModal');
    if (modal && e.target === modal) closeModal();
});

// Close modal with ESC key
window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// === GET UNITS ===
function getUnits() {
    const units = {};
    courses.forEach(c => {
        if (!units[c.unit]) {
            units[c.unit] = { title: c.unitTitle, lessons: [] };
        }
        units[c.unit].lessons.push(c);
    });
    return units;
}

// === RENDER UNIT TABS ===
function renderUnitTabs() {
    const units = getUnits();
    const tabBar = document.getElementById('unitTabBar');
    if (!tabBar) return;
    tabBar.innerHTML = '';
    Object.keys(units).forEach(unitNum => {
        const btn = document.createElement('button');
        btn.className = `unit-tab ${parseInt(unitNum) === activeUnit ? 'active' : ''}`;
        btn.textContent = `Unidad ${unitNum}: ${units[unitNum].title}`;
        btn.onclick = () => { activeUnit = parseInt(unitNum); renderUnitTabs(); renderCourses(); };
        tabBar.appendChild(btn);
    });
}

// === RENDER COURSES ===
function renderCourses() {
    const grid = document.getElementById('courseGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const filtered = courses.filter(c => c.unit === activeUnit);

    filtered.forEach(course => {
        const accessible = course.free || isSubscribed;
        const card = document.createElement('div');
        card.className = `course-card ${!accessible ? 'locked' : ''} ${course.type === 'exam' ? 'card-exam' : ''}`;

        const icon = course.type === 'exam' ? ICONS.exam : (accessible ? ICONS.play : ICONS.lock);
        const badgeText = course.type === 'exam' ? 'EXAMEN' : (course.free ? 'GRATIS' : 'PRO');
        const badgeClass = course.type === 'exam' ? 'exam' : (course.free ? 'free' : 'premium');

        card.innerHTML = `
            <span class="badge ${badgeClass}" style="z-index:3">${sanitize(badgeText)}</span>
            <div class="course-img-placeholder" style="background-image: url('https://img.youtube.com/vi/${course.video || 'FwwyoFrypyM'}/maxresdefault.jpg'); background-size: cover; background-position: center; position: relative;">
                <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 1; border-radius: 12px 12px 0 0;"></div>
                <span class="card-status-icon ${course.type === 'exam' ? 'icon-exam' : ''}" style="position:relative; z-index:2">${icon}</span>
                <span class="duration-tag" style="position:relative; z-index:2; background: rgba(0,0,0,0.8);">${sanitize(String(course.duration))} min</span>
            </div>
            <h3 style="margin-top:1rem;">${sanitize(String(course.id))}. ${sanitize(course.title)}</h3>
            <p class="card-desc">${sanitize(course.desc)}</p>
            <div class="course-actions">
                ${accessible
                    ? `<button class="btn-primary" style="flex:1;" onclick="openLesson(${course.id})">${course.type === 'exam' ? 'Iniciar Examen' : 'Ver Lección'}</button>`
                    : `<button class="btn-primary" style="width:100%" onclick="showProNudge()">Desbloquear PRO</button>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}

// === OPEN LESSON / EXAM ===
function openLesson(id) {
    if (!userEmail) {
        showLogin();
        return;
    }
    const course = courses.find(c => c.id === id);
    if (!course) return;
    if (!course.free && !isSubscribed) { showProNudge(); return; }
    currentLessonId = id;
    if (course.type === 'exam') { openExam(course); } else { openVideoPlayer(course); }
}

function navigateLesson(id) {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center"><svg width="40" height="40" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="var(--vex-red)" stroke-width="4" stroke-dasharray="31.4 31.4"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></circle></svg></div>';
    }
    setTimeout(() => openLesson(id), 150);
}

// === VIDEO PLAYER ===
function openVideoPlayer(course) {
    markModuleComplete(course.id);
    startStudyTimer();
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    modal.style.padding = '0';
    const prevId = course.id - 1;
    const nextId = course.id + 1;
    const prevCourse = courses.find(c => c.id === prevId);
    const nextCourse = courses.find(c => c.id === nextId);

    modal.innerHTML = `
        <div class="modal-content video-player-content full-screen-course">
            <button onclick="closeModal()" style="position:absolute;top:1.5rem;right:1.5rem;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:1.8rem;cursor:pointer;z-index:100;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;line-height:1;transition:var(--transition);" onmouseover="this.style.background='var(--vex-red)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="video-container">
                <div class="video-placeholder" style="position:relative;overflow:hidden;cursor:pointer;width:85%;max-width:1000px;aspect-ratio:16/9;margin:0 auto;border-radius:12px;box-shadow:0 0 40px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.05);" title="Reproducir Video" onclick="playSimulatedVideo(this)">
                    <img loading="lazy" src="https://img.youtube.com/vi/FwwyoFrypyM/maxresdefault.jpg" alt="Intro ${sanitize(course.title)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.src='https://img.youtube.com/vi/FwwyoFrypyM/hqdefault.jpg'">
                    <div class="play-overlay" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);padding:2rem;text-align:center;">
                        <div style="width:72px;height:72px;border-radius:50%;background:var(--vex-red);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(227,27,35,0.6);">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                        <p style="margin-top:1rem;font-size:0.95rem;color:#fff;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.8)">Módulo ${sanitize(String(course.id))}: ${sanitize(course.title)}</p>
                        <p style="margin-top:0.3rem;font-size:0.78rem;color:rgba(255,255,255,0.6)">Presiona para reproducir la lección</p>
                    </div>
                </div>
            </div>
            <div class="video-info">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                    <span class="badge ${course.free ? 'free' : 'premium'}" style="position:static">${course.free ? 'GRATIS' : 'PRO'}</span>
                    <span style="color:#A0A0A0;font-size:0.85rem">${sanitize(String(course.duration))} minutos • ${sanitize(course.unitTitle)}</span>
                </div>
                <h2 style="margin-bottom:0.5rem;">${sanitize(course.title)}</h2>
                <div class="lesson-theory">${course.theory || ''}</div>
                ${course.code ? `
                <div class="code-block-wrapper">
                    <div class="code-header">
                        <span>C++ — VEXcode Pro</span>
                        <span class="code-ref">${sanitize(course.api_ref)}</span>
                    </div>
                    <pre class="code-block"><code>${sanitize(course.code)}</code></pre>
                </div>` : ''}
                ${course.exercise ? `
                <div class="exercise-box">
                    <strong>${ICONS.pencil} Ejercicio Práctico</strong>
                    <p>${sanitize(course.exercise)}</p>
                </div>` : ''}
                <div class="player-controls">
                    <button class="btn-secondary" onclick="${prevCourse ? `openLesson(${prevCourse.id})` : 'closeModal()'}" ${!prevCourse ? 'style="opacity:0.4"' : ''}>
                        &larr; ${prevCourse ? sanitize(prevCourse.title) : 'Inicio'}
                    </button>
                    <button class="btn-primary" onclick="${nextCourse ? `navigateLesson(${nextCourse.id})` : 'closeModal()'}">
                        ${nextCourse ? sanitize(nextCourse.title) + ' &rarr;' : '¡Finalizar Unidad!'}
                    </button>
                </div>

                <!-- COMENTARIOS DE LA COMUNIDAD -->
                <div class="comments-section" style="margin-top:3rem;padding-top:2rem;border-top:1px solid var(--glass-border)">
                    <h3>${ICONS.message} Comentarios de la Comunidad</h3>
                    <div class="comment-input-box" style="margin-top:1rem;background:rgba(255,255,255,0.03);padding:1rem;border-radius:12px;border:1px solid var(--glass-border)">
                        <textarea style="width:100%;background:transparent;border:none;color:#fff;outline:none;resize:vertical;min-height:60px;" rows="2" placeholder="Comparte tus dudas, soluciones o agradecimientos con otros competidores..."></textarea>
                        <div style="display:flex;justify-content:flex-end;margin-top:0.5rem;">
                            <button class="btn-primary" style="padding:0.5rem 1.5rem;font-size:0.85rem;" onclick="addComment(this)">Comentar</button>
                        </div>
                    </div>
                    <div id="commentsList" style="margin-top:2rem;display:flex;flex-direction:column;gap:1.5rem;">
                        <div class="comment-item" style="display:flex;gap:1rem;">
                            <div style="width:40px;height:40px;border-radius:50%;background:var(--vex-red);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">A</div>
                            <div>
                                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem">
                                    <span style="font-weight:600">Aarón (Equipo 323V)</span>
                                    <span style="color:#A0A0A0;font-size:0.8rem">Hace 2 días</span>
                                </div>
                                <p style="color:#CCC;font-size:0.9rem;line-height:1.5">¡Este módulo es una mina de oro! Había intentado implementar la lógica en mi código antes, pero el robot siempre se desviaba. Ahora funciona perfecto. Mil gracias por la explicación tan detallada.</p>
                            </div>
                        </div>
                        <div class="comment-item" style="display:flex;gap:1rem;">
                            <div style="width:40px;height:40px;border-radius:50%;background:#3B82F6;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">M</div>
                            <div>
                                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem">
                                    <span style="font-weight:600">María (9481A)</span>
                                    <span style="color:#A0A0A0;font-size:0.8rem">Hace 1 semana</span>
                                </div>
                                <p style="color:#CCC;font-size:0.9rem;line-height:1.5">Una pregunta... si estoy usando el cartucho rojo, ¿debo cambiar los valores del tuning o los mantengo igual? Excelente curso, saludos desde México.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function playSimulatedVideo(el) {
    if (el.dataset.playing) return;
    el.dataset.playing = 'true';
    el.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/FwwyoFrypyM?autoplay=1" title="VEX Robotics Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;top:0;left:0;border-radius:12px;"></iframe>`;
}

function addComment(btn) {
    const textarea = btn.parentElement.previousElementSibling;
    const text = textarea.value.trim();
    if (!text) return;
    const list = document.getElementById('commentsList');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.style = 'display:flex;gap:1rem;animation:fadeIn 0.5s ease;';
    newComment.innerHTML = `
        <div style="width:40px;height:40px;border-radius:50%;background:#00C853;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">T</div>
        <div>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem">
                <span style="font-weight:600">Tú (Estudiante)</span>
                <span style="color:#A0A0A0;font-size:0.8rem">Justo ahora</span>
            </div>
            <p style="color:#CCC;font-size:0.9rem;line-height:1.5">${sanitize(text)}</p>
        </div>
    `;
    list.insertBefore(newComment, list.firstChild);
    textarea.value = '';
}

// === EXAM ===
function openExam(course) {
    startStudyTimer();
    examAnswers = {};
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    modal.style.padding = '2rem';
    const questionsHTML = course.exam.map((q, i) => `
        <div class="exam-question">
            <p><strong>${i + 1}. ${sanitize(q.q)}</strong></p>
            ${q.options.map((opt, j) => `
                <label class="exam-option">
                    <input type="radio" name="q${i}" value="${j}" onchange="examAnswers[${i}]=${j}">
                    ${sanitize(opt)}
                </label>
            `).join('')}
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="modal-content" style="max-width:700px;max-height:90vh;overflow-y:auto;">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>${ICONS.exam} ${sanitize(course.title)}</h2>
            <p style="color:#A0A0A0;margin-bottom:2rem">${sanitize(course.desc)}</p>
            <form id="examForm" onsubmit="submitExam(event, ${JSON.stringify(course.exam).replace(/"/g,'&quot;')})">
                ${questionsHTML}
                <button type="submit" class="btn-primary" style="width:100%;margin-top:2rem;">Enviar Respuestas</button>
            </form>
        </div>
    `;
}

function submitExam(e, exam) {
    e.preventDefault();
    let correct = 0;
    exportCourse = exam.courseIdObj; // reference the course passed or we can use currentLessonId
    exam.forEach((q, i) => {
        if (examAnswers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / exam.length) * 100);
    const pass = pct >= 70;
    if (pass && currentLessonId) markModuleComplete(currentLessonId);

    const modal = document.getElementById('checkoutModal');
    modal.innerHTML = `
        <div class="modal-content" style="text-align:center;max-width:500px;">
            <span class="close" onclick="closeModal()">&times;</span>
            <div style="font-size:3rem;margin-bottom:1rem">${pass ? ICONS.check : ICONS.lock}</div>
            <h2>${pass ? '¡Aprobado!' : 'Intenta de Nuevo'}</h2>
            <div style="font-size:3rem;font-weight:800;color:${pass ? '#00C853' : 'var(--vex-red)'};">${pct}%</div>
            <p style="color:#A0A0A0;margin:1rem 0">${correct} de ${exam.length} respuestas correctas. ${pass ? 'Excelente trabajo — avanza al siguiente módulo.' : 'Repasa el material e intenta nuevamente.'}</p>
            <button class="btn-primary" style="width:100%" onclick="closeModal()">Continuar</button>
        </div>
    `;
}

// === NAVIGATE ===
function navigateLesson(id) {
    const c = courses.find(x => x.id === id);
    if (!c) return;
    if (!c.free && !isSubscribed) { showProNudge(); return; }
    openLesson(id);
}

// === PRO NUDGE ===
function showProNudge() {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    modal.style.padding = '2rem';
    modal.innerHTML = `
        <div class="modal-content pro-nudge">
            <span class="close" onclick="closeModal()">&times;</span>
            <div class="nudge-icon">${ICONS.rocket}</div>
            <h2>¡Continúa tu Aprendizaje!</h2>
            <p>Has completado el acceso gratuito. Los siguientes módulos incluyen <strong>PID, Odometría, Redes Neuronales y preparación para jueces.</strong></p>
            <div style="background:rgba(227,27,35,0.1);padding:1.5rem;border-radius:12px;margin:1.5rem 0;border:1px solid var(--vex-red)">
                <p style="font-weight:700;color:var(--vex-red)">ACCESO INDIVIDUAL PRO — $20 USD</p>
                <p>Pago único. Acceso de por vida a todos los módulos, exámenes y certificados.</p>
            </div>
            <button class="btn-primary" style="width:100%" onclick="handleIndividualCheckout()">Mejorar a PRO Individual</button>
            <p style="text-align:center;margin-top:1rem;font-size:0.8rem;color:#A0A0A0;cursor:pointer" onclick="showB2BCheckout()">¿Eres maestro? Ver Planes para Escuelas</p>
        </div>
    `;
}

async function handleIndividualCheckout() {
    if (!userEmail) {
        showToast('Debes iniciar sesión para comprar una suscripción PRO.', 'warning');
        showLogin();
        return;
    }

    const modal = document.getElementById('checkoutModal');
    const originalHTML = modal.innerHTML;
    modal.innerHTML = `<div style="display:flex;height:300px;align-items:center;justify-content:center;flex-direction:column;gap:1.5rem;">
        <div class="spinner"></div>
        <p style="color:var(--accent-blue);font-weight:600">Generando Sesión Segura de Stripe...</p>
    </div>`;

    try {
        const resp = await fetch('/api/stripe-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                type: 'individual',
                contacto_email: userEmail 
            })
        });

        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(text.includes('STRIPE_SECRET_KEY') ? 'Error de Configuración en el Servidor' : 'Error al conectar con Stripe');
        }

        const data = await resp.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'No se pudo generar el enlace de pago.');
        }
    } catch (err) {
        showToast(err.message, 'error');
        modal.innerHTML = originalHTML; // Restore
    }
}

// === CHECKOUT ===
// === B2B CHECKOUT ===
function showB2BCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    modal.style.padding = '2rem';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:600px;">
            <span class="close" onclick="closeModal()">&times;</span>
            <div style="text-align:center;margin-bottom:1.5rem">
                <h2 style="margin-bottom:0.5rem">Licencia Institucional B2B</h2>
                <p style="color:#A0A0A0;font-size:0.9rem">Activa el acceso para toda tu escuela usando el dominio de correo oficial.</p>
            </div>
            
            <form onsubmit="handleStripeB2B(event)">
                <div class="form-group">
                    <label>Nombre de la Institución</label>
                    <input type="text" id="b2bInst" required placeholder="Ej. Universidad Tecnológica de Matamoros">
                </div>
                <div class="form-group">
                    <label>Dominio de Correo Autorizado</label>
                    <input type="text" id="b2bDomain" required placeholder="Ej. @utmatamoros.edu.mx">
                </div>
                <div class="flex-row">
                    <div class="form-group">
                        <label>Cantidad de Asientos (Mínimo 10)</label>
                        <input type="number" id="b2bSeats" value="10" min="10" max="500" required>
                    </div>
                    <div class="form-group">
                        <label>Email de Contacto Administrativo</label>
                        <input type="email" id="b2bEmail" value="${userEmail || ''}" required placeholder="director@escuela.com">
                    </div>
                </div>
                
                <div style="background:rgba(0,180,216,0.1);padding:1rem;border-radius:12px;border:1px solid var(--accent-blue);margin:1rem 0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-weight:600">Total Anual Estimado:</span>
                        <span id="b2bTotal" style="font-size:1.5rem;font-weight:800;color:var(--accent-blue)">$200 USD</span>
                    </div>
                </div>
                <button type="submit" class="btn-primary" style="width:100%;background:var(--accent-blue);border-color:var(--accent-blue)">Ir a Pago Seguro en Stripe</button>
                <p style="text-align:center;margin-top:1rem;font-size:0.8rem;color:#A0A0A0;cursor:pointer" onclick="handleIndividualCheckout()">¿Solo para ti? Comprar Plan Individual PRO</p>
            </form>
        </div>
    `;

    document.getElementById('b2bSeats').addEventListener('input', (e) => {
        const seats = parseInt(e.target.value) || 0;
        document.getElementById('b2bTotal').innerText = `$${seats * 20} USD`;
    });
}
function showCheckout() {
    // Legacy redirect to the new consolidated individual flow
    handleIndividualCheckout();
}
// === PREMIUM UX / TOASTS ===
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px; pointer-events:none;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    const bg = type === 'success' ? '#00C853' : (type === 'error' ? '#ff4444' : '#00B4D8');
    const icon = type === 'success' ? '✔' : (type === 'error' ? '⚠' : 'ℹ️');
    toast.style.cssText = `background:${bg};color:white;padding:12px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.4);font-weight:600;font-size:0.9rem;opacity:0;transform:translateY(20px);transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display:flex; align-items:center; gap:8px;`;
    toast.innerHTML = `<span style="font-size:1.2rem">${icon}</span> <span>${sanitize(message)}</span>`;
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    
    // Animate out
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
};

function handlePayment(e) {
    // This function is now deprecated in favor of Stripe Checkout redirects.
    e.preventDefault();
    handleIndividualCheckout();
}

// === SHOW LOGIN / AUTH GATEWAY ===
function showLogin(emailInputValue = '') {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    modal.style.padding = '2rem';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px;">
            <span class="close" onclick="closeModal()">&times;</span>
            <div style="text-align:center;margin-bottom:2rem;">
                <h2 style="margin-bottom:0.5rem">${ICONS.user} Identificación</h2>
                <p style="color:#A0A0A0;font-size:0.9rem">Ingresa tu correo para iniciar sesión o registrarte paso a paso. Únete a la comunidad técnica VEX.</p>
            </div>
            <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" id="loginEmail" placeholder="alumno@utmatamoros.edu.mx" value="${emailInputValue || userEmail || ''}" onkeydown="if(event.key==='Enter')checkAuthStep()">
            </div>
            <button class="btn-primary" style="width:100%;margin-top:1rem" onclick="checkAuthStep()">Continuar</button>
            <p style="text-align:center;margin-top:1.5rem;font-size:0.8rem;color:#A0A0A0;background:rgba(255,255,255,0.05);padding:1rem;border-radius:8px;">
                💡 Las universidades integradas (ej. <strong>@utmatamoros.edu.mx</strong>) reciben acceso PRO gratuito instantáneamente tras el registro.
            </p>
        </div>
    `;
    setTimeout(()=>document.getElementById('loginEmail')?.focus(), 100);
}

async function checkAuthStep() {
    const emailStr = document.getElementById('loginEmail').value.trim().toLowerCase();
    if (!emailStr || !emailStr.includes('@')) {
        showToast('Por favor ingresa un correo electrónico válido.', 'error');
        return;
    }

    const btn = document.querySelector('#checkoutModal .btn-primary');
    if(btn) { btn.innerText = "Consultando BD Nube..."; btn.disabled = true; }

    try {
        // Step 1: Get Profile
        const { data, error } = await window.db.from('perfiles').select('*').eq('email', emailStr);
        if (error) throw error;

        if (data && data.length > 0) {
            const profile = data[0];
            
            // Step 2: B2B License Check
            if (profile.rango === 'B2B' && profile.licencia_codigo) {
                const { data: lic } = await window.db.from('licencias_b2b').select('*').eq('codigo', profile.licencia_codigo).single();
                if (lic) {
                    const isExpired = new Date(lic.fecha_expiracion) < new Date();
                    if (isExpired || !lic.activa) {
                        profile.rango = 'GRATIS';
                        await window.db.from('perfiles').update({ rango: 'GRATIS' }).eq('id', profile.id);
                        showToast('Licencia institucional expirada. Nivel: GRATIS.', 'warning');
                    }
                }
            }

            // Step 3: Individual PRO Expiry Check
            if (profile.rango === 'PRO' && profile.fecha_expiracion) {
                const isExpired = new Date(profile.fecha_expiracion) < new Date();
                if (isExpired) {
                    profile.rango = 'GRATIS';
                    await window.db.from('perfiles').update({ rango: 'GRATIS' }).eq('id', profile.id);
                    showToast('Tu suscripción PRO ha expirado. Nivel: GRATIS.', 'warning');
                }
            }

            processLoginSuccess(emailStr, profile);
        } else {
            showRegistrationForm(emailStr);
        }
    } catch(err) {

        console.error(err);
        showToast('Error de conexión con Supabase.', 'error');
        if(btn) { btn.innerText = "Continuar"; btn.disabled = false; }
    }
}

function showRegistrationForm(emailStr) {
    const modal = document.getElementById('checkoutModal');
    // Save email in hidden field or dataset
    modal.innerHTML = `
        <div class="modal-content" style="max-width:550px; text-align:left;">
            <span class="close" onclick="closeModal()">&times;</span>
            <div style="text-align:center;margin-bottom:1.5rem;">
                <h2 style="margin-bottom:0.5rem">Inscripción a la Academia</h2>
                <p style="color:#A0A0A0;font-size:0.9rem">Estás a un paso. Completa tu perfil competidor para acceder.</p>
            </div>
            <form onsubmit="handleRegistration(event, '${emailStr}')">
                <div class="form-group">
                    <label>Correo Electrónico (Bloqueado)</label>
                    <input type="email" value="${emailStr}" disabled style="opacity:0.6;background:#111">
                </div>
                <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" id="regName" required placeholder="Ej. Juan Pérez">
                </div>
                <div class="flex-row">
                    <div class="form-group">
                        <label>Universidad / Institución</label>
                        <input type="text" id="regUni" required placeholder="Ej. UT Matamoros">
                    </div>
                    <div class="form-group">
                        <label>Carrera / Grado</label>
                        <input type="text" id="regMajor" required placeholder="Ej. Mecatrónica">
                    </div>
                </div>
                <div class="flex-row">
                    <div class="form-group">
                        <label>Abreviación del Equipo VEX</label>
                        <input type="text" id="regTeam" placeholder="Ej. VEXU 1234A">
                    </div>
                    <div class="form-group">
                        <label>Rol en el Equipo</label>
                        <select id="regRole" style="width:100%;padding:1rem;background:#252525;color:white;border-radius:8px;border:1px solid var(--glass-border);">
                            <option value="Programador C++">Programador C++</option>
                            <option value="Constructor">Constructor / Mecánico</option>
                            <option value="Diseñador CAD">Diseñador CAD</option>
                            <option value="Documentador">Libreta de Diseño</option>
                            <option value="Capitán">Capitán / Driver</option>
                            <option value="Independiente">Aún no tengo equipo</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn-primary" style="width:100%;margin-top:1rem;background:#00C853;border-color:#00C853;">Crear Cuenta y Acceder</button>
            </form>
        </div>
    `;
    setTimeout(()=>document.getElementById('regName')?.focus(), 100);
}

async function handleRegistration(e, emailStr) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const nombre  = document.getElementById('regName').value;
    const escuela = document.getElementById('regUni').value;
    const equipo  = document.getElementById('regTeam').value || 'N/A';
    const major   = document.getElementById('regMajor').value;
    const role    = document.getElementById('regRole').value;

    if(btn) { btn.innerText = "Enviando Código..."; btn.disabled = true; }

    // 1. Send Verification Email
    try {
        const resp = await fetch('/api/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailStr, nombre })
        });
        
        if (!resp.ok) {
            const errData = await resp.json();
            throw new Error(errData.error || 'Error al enviar código.');
        }

        showVerificationModal(emailStr, { nombre, escuela, equipo, major, role });

    } catch(err) {
        showToast(err.message, 'error');
        if(btn) { btn.innerText = "Crear Cuenta y Acceder"; btn.disabled = false; }
    }
}

function showVerificationModal(email, userData) {
    const modal = document.getElementById('checkoutModal');
    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px; text-align:center;">
            <span class="close" onclick="closeModal()">&times;</span>
            <div style="font-size:3rem;margin-bottom:1rem;">✉️</div>
            <h2 style="margin-bottom:0.5rem">Verifica tu Correo</h2>
            <p style="color:#A0A0A0;font-size:0.9rem;margin-bottom:1.5rem;">
                Hemos enviado un código de 6 dígitos a <strong>${email}</strong>.<br>Búscalo en tu bandeja de entrada o spam.
            </p>
            <div class="form-group">
                <input type="text" id="verifyCode" maxlength="6" placeholder="000000" 
                    style="font-size:2rem; letter-spacing:8px; text-align:center; font-weight:800; border:2px solid var(--accent-blue);">
            </div>
            <button class="btn-primary" style="width:100%;margin-top:1rem;background:#00C853;border-color:#00C853;" 
                onclick='verifyAndComplete("${email}", ${JSON.stringify(userData)})'>Validar y Finalizar</button>
            <p style="margin-top:1rem; font-size:0.8rem; color:#666; cursor:pointer;" onclick="showRegistrationForm('${email}')">← Volver / Corregir Correo</p>
        </div>
    `;
    setTimeout(()=>document.getElementById('verifyCode')?.focus(), 100);
}

async function verifyAndComplete(email, userData) {
    const code = document.getElementById('verifyCode').value.trim();
    if (code.length !== 6) {
        showToast('Código inválido. Deben ser 6 dígitos.', 'warning');
        return;
    }

    const btn = document.querySelector('#checkoutModal .btn-primary');
    btn.innerText = "Verificando..."; btn.disabled = true;

    try {
        // 1. Check code in Supabase
        const { data: verif, error: vErr } = await window.db
            .from('verificaciones')
            .select('*')
            .eq('email', email)
            .eq('codigo', code)
            .single();

        if (vErr || !verif) {
            throw new Error('Código incorrecto o expirado.');
        }

        // 2. Clear verification record
        await window.db.from('verificaciones').delete().eq('email', email);

        // 3. Final Registration (Logic moved from handleRegistration)
        const emailDomain = '@' + email.split('@')[1];
        let licenciaCodigo = null;
        let rango = 'GRATIS';

        try {
            const { data: licData } = await window.db.rpc('get_active_license', { p_domain: emailDomain });
            if (licData && licData.length > 0) {
                licenciaCodigo = licData[0].codigo;
                rango = 'B2B';
            }
        } catch(e) {}

        const newProfile = {
            email:           email,
            nombre:          userData.nombre,
            escuela:         userData.escuela,
            equipo:          userData.equipo,
            rango:           rango,
            licencia_codigo: licenciaCodigo,
            contrasena_hash: 'VERIFIED_USER'
        };

        const { data, error } = await window.db.from('perfiles').insert([newProfile]).select();
        if (error) throw error;

        if (licenciaCodigo) {
            await window.db.rpc('increment_asientos', { p_codigo: licenciaCodigo });
        }

        processLoginSuccess(email, { ...data[0], rango: newProfile.rango });
        showToast('¡Cuenta verificada y creada exitosamente!', 'success');

        // Welcome Email
        fetch('/api/send-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: userData.nombre, email, rango: newProfile.rango })
        }).catch(e => console.warn('Welcome email failed:', e));

    } catch(err) {
        showToast(err.message, 'error');
        btn.innerText = "Validar y Finalizar"; btn.disabled = false;
    }
}

function showB2BCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px; text-align:left;">
            <span class="close" onclick="closeModal()">&times;</span>
            <div style="text-align:center;margin-bottom:1.5rem;">
                <h2 style="color:var(--accent-blue)">${ICONS.security} Licencia Institucional</h2>
                <p style="color:#A0A0A0;font-size:0.9rem">Adquiere asientos para tu equipo o universidad. $20 USD por asiento al año.</p>
            </div>
            <form onsubmit="handleStripeB2B(event)">
                <div class="form-group">
                    <label>Nombre de la Institución</label>
                    <input type="text" id="b2bInst" required placeholder="Ej. Universidad Autónoma de Tamaulipas">
                </div>
                <div class="form-group">
                    <label>Dominio de Correo Autorizado</label>
                    <input type="text" id="b2bDomain" required placeholder="Ej. @utmatamoros.edu.mx">
                    <p style="font-size:0.75rem;color:#666;margin-top:0.3rem">Los alumnos con este dominio serán vinculados automáticamente.</p>
                </div>
                <div class="flex-row">
                    <div class="form-group">
                        <label>Número de Asientos</label>
                        <input type="number" id="b2bSeats" min="10" max="500" value="10" required>
                    </div>
                    <div class="form-group">
                        <label>Email de Contacto (Facturación)</label>
                        <input type="email" id="b2bEmail" required value="${userEmail || ''}">
                    </div>
                </div>
                <div style="background:rgba(0,180,216,0.1);padding:1rem;border-radius:8px;margin:1rem 0;border:1px solid rgba(0,180,216,0.2)">
                    <div style="display:flex;justify-content:space-between;font-weight:700;">
                        <span>Inversión Total:</span>
                        <span id="b2bTotal">$200 USD</span>
                    </div>
                    <p style="font-size:0.75rem;margin-top:0.3rem">Pago único anual. Incluye Panel de Maestro y Soporte Técnico.</p>
                </div>
                <button type="submit" class="btn-primary" style="width:100%;background:var(--accent-blue);border-color:var(--accent-blue)">Proceder al Pago Seguro</button>
            </form>
        </div>
    `;

    document.getElementById('b2bSeats').addEventListener('input', (e) => {
        const seats = parseInt(e.target.value) || 0;
        document.getElementById('b2bTotal').innerText = `$${seats * 20} USD`;
    });
}

async function handleStripeB2B(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "Conectando con Servidor...";
    btn.disabled = true;

    const payload = {
        institucion: document.getElementById('b2bInst').value,
        dominio_email: document.getElementById('b2bDomain').value,
        asientos: document.getElementById('b2bSeats').value,
        contacto_email: document.getElementById('b2bEmail').value
    };

    try {
        const resp = await fetch('/api/stripe-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const text = await resp.text();
            let errorMsg = `Error del Servidor (${resp.status})`;
            try {
                const errorData = JSON.parse(text);
                errorMsg = errorData.error || errorMsg;
            } catch(jsonErr) {
                // If it contains Stripe keywords, it's a configuration issue
                if (text.includes('STRIPE_SECRET_KEY')) {
                    errorMsg = "⚠️ Configuración Incompleta: Falta la 'Stripe Secret Key' en tu panel de Vercel.";
                } else {
                    errorMsg = `Error Técnico: ${text.substring(0, 60)}...`;
                }
            }
            throw new Error(errorMsg);
        }

        const data = await resp.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || 'Sesión de pago no generada.');
        }
    } catch (err) {
        showToast(err.message, 'error');
        console.error('Checkout error:', err);
        btn.innerText = "Proceder al Pago Seguro";
        btn.disabled = false;
    }
}



function processLoginSuccess(emailStr, profileData = null) {
    // Save to global frontend state
    userEmail = emailStr;
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    // Domain Check or Profile Check
    const isPremium = profileData && (profileData.rango === 'B2B' || profileData.rango === 'PRO');
    
    if (isPremium) {
        isSubscribed = true;
        localStorage.setItem('isSubscribed', 'true');
        
        const modal = document.getElementById('checkoutModal');
        modal.innerHTML = `
            <div class="modal-content" style="text-align:center;max-width:500px;">
                <span class="close" onclick="closeModal(); renderCourses();">&times;</span>
                <div style="font-size:3rem;color:#00C853;margin-bottom:1rem">${ICONS.check}</div>
                <h2 style="margin-bottom:1rem">Acceso Premium Verificado (Nube)</h2>
                <p style="color:#A0A0A0;margin:1rem 0">Tu perfil en la base de datos está autorizado en nivel <strong>${profileData.rango}</strong>.</p>
                <div style="background:rgba(0,200,83,0.1);padding:1rem;border-radius:8px;border:1px solid rgba(0,200,83,0.3);margin:1.5rem 0;">
                    <span style="color:#00C853;font-weight:600;font-size:0.9rem">✔ Sistema Operando Online (Supabase)</span>
                </div>
                <button class="btn-primary" style="width:100%" onclick="closeModal(); renderCourses();">Comenzar a Aprender</button>
            </div>
        `;
    } else {
        closeModal();
        renderCourses();
    }
    
    // Configurar Perfil y tracking
    userProgress = JSON.parse(localStorage.getItem(`progress_${emailStr}`)) || { completed: [], timeSpent: 0 };
    renderUserNav();
    updatePricingUI(); // Actualizar tarjetas de precios
}

// === PROGRESS && UI HELPERS ===

function markModuleComplete(id) {
    if(userEmail && userProgress) {
        if(!userProgress.completed) userProgress.completed = [];
        if(!userProgress.completed.includes(id)) {
            userProgress.completed.push(id);
            localStorage.setItem(`progress_${userEmail}`, JSON.stringify(userProgress));
        }
    }
}

function startStudyTimer() {
    if(timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        if(userProgress && userEmail) {
            userProgress.timeSpent = (userProgress.timeSpent || 0) + 10;
            localStorage.setItem(`progress_${userEmail}`, JSON.stringify(userProgress));
        }
    }, 10000); // add 10 secs every 10 secs
}

function renderUserNav() {
    const navArea = document.getElementById('userNavArea');
    if (!navArea) return;
    
    if (userEmail) {
        // Obtener perfil de LocalStorage (sincronizado con Supabase)
        const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
        
        let name = profile.nombre || userEmail.split('@')[0];
        const initial = name.charAt(0).toUpperCase();
        const isPro = (profile.rango === 'PRO' || profile.rango === 'B2B' || profile.rango === 'VEX INSTRUCTOR');
        
        navArea.innerHTML = `
            <div class="profile-dropdown-container">
                <div class="avatar-circle" onclick="toggleProfileMenu()">${initial}</div>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="dropdown-header">
                        <span style="font-weight:600;display:block;color:white">${sanitize(name)}</span>
                        <span style="font-size:0.75rem;color:var(--text-muted)">${sanitize(userEmail)}</span>
                    </div>
                    <button class="dropdown-item" onclick="showProfileModal()">${ICONS.user} Ver Perfil Completo</button>
                    ${isPro ? `<div class="dropdown-item" style="color:#00C853;cursor:default">${ICONS.check} PRO Vigente</div>` : `<button class="dropdown-item" style="color:var(--vex-red)" onclick="showCheckout()">${ICONS.rocket} Mejorar a PRO</button>`}
                    <button class="dropdown-item" style="color:#ff4444" onclick="logoutUser()">Cerrar Sesión</button>
                </div>
            </div>
        `;
    } else {
        navArea.innerHTML = `<button class="btn-primary" onclick="showLogin()">Iniciar Sesión</button>`;
    }
}

function toggleProfileMenu() {
    const d = document.getElementById('profileDropdown');
    if (d) d.classList.toggle('active');
}

function logoutUser() {
    userEmail = null;
    isSubscribed = false;
    userProgress = {};
    if(timeInterval) clearInterval(timeInterval);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('userProfile');
    renderUserNav();
    renderCourses();
    updatePricingUI();
}

function showProfileModal() {
    toggleProfileMenu(); 
    const profile = JSON.parse(localStorage.getItem('userProfile')) || {};
    
    const isPro = profile.rango === 'PRO' || profile.rango === 'B2B' || profile.rango === 'VEX INSTRUCTOR';
    const hrs = Math.floor((userProgress.timeSpent || 0) / 3600);
    const mins = Math.floor(((userProgress.timeSpent || 0) % 3600) / 60);
    const comps = (userProgress.completed || []).length;
    
    const totalCourses = courses.length;
    const pct = Math.round((comps / totalCourses) * 100) || 0;
    
    let name = profile.nombre || userEmail.split('@')[0];
    let university = profile.escuela || 'N/A';
    let team = profile.equipo || 'N/A';
    let role = profile.rango || 'Estudiante';

    const modal = document.getElementById('checkoutModal');
    modal.style.display = 'flex';
    modal.style.padding = '2rem';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <span class="close" onclick="closeModal()">&times;</span>
            <div style="text-align:center;margin-bottom:2rem;">
                <div style="width:80px;height:80px;border-radius:50%;background:var(--vex-red);color:white;display:flex;align-items:center;justify-content:center;font-size:3rem;font-weight:800;margin:0 auto 1rem;">
                    ${name.charAt(0).toUpperCase()}
                </div>
                <h2>${sanitize(name)}</h2>
                <p style="color:var(--text-muted)">${sanitize(userEmail)}</p>
                <div style="margin-top:1rem;display:inline-block;padding:0.4rem 1rem;border-radius:20px;font-weight:700;font-size:0.8rem;background:${isPro?'rgba(0,200,83,0.1)':'rgba(227,27,35,0.1)'};color:${isPro?'#00C853':'var(--vex-red)'};border:1px solid ${isPro?'rgba(0,200,83,0.3)':'rgba(227,27,35,0.3)'}">
                    ${isPro ? 'LICENCIA PRO / INSTITUCIONAL ACTIVA' : 'PLAN GRATUITO BÁSICO'}
                </div>
            </div>
            
            <div style="background:#252525;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;border:1px solid var(--glass-border)">
                <h3 style="font-size:1rem;margin-bottom:1rem;color:var(--accent-blue)">Información de Competidor</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
                    <div>
                        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Institución</p>
                        <p style="font-weight:600">${sanitize(university)}</p>
                    </div>
                    <div>
                        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Equipo VEX</p>
                        <p style="font-weight:600">${sanitize(team)}</p>
                    </div>
                    <div>
                        <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase">Rol Principal</p>
                        <p style="font-weight:600">${sanitize(role)}</p>
                    </div>
                </div>
            </div>
            
            <div style="background:#252525;border-radius:12px;padding:1.5rem;border:1px solid var(--glass-border)">
                <h3 style="font-size:1rem;margin-bottom:1rem;color:#00C853">Progreso de Academia</h3>
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                    <span style="font-weight:600;font-size:0.9rem">${comps} de ${totalCourses} Módulos Terminados</span>
                    <span style="color:#00C853;font-weight:700">${pct}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" style="width:${pct}%"></div>
                </div>
                <p style="margin-top:1.5rem;font-size:0.85rem;color:var(--text-muted)">
                    ⏱️ Tiempo concentrado de estudio: <strong style="color:white;font-size:1rem">${hrs}h ${mins}m</strong>
                </p>
                ${!isPro ? `<button class="btn-primary" style="width:100%;margin-top:1.5rem;background:#00B4D8;border:none;" onclick="redeemCode()">Canjear Código Institucional B2B</button>` : ''}
            </div>
            <button class="btn-secondary" style="width:100%;border-color:var(--glass-border);color:white" onclick="closeModal()">Cerrar Perfil</button>
        </div>
    `;
}

async function redeemCode() {
    const code = prompt("Ingresa el código Institucional (Ej. UAT-X93K3):");
    if(!code || code.trim().length < 5) return;
    
    try {
        const { data: lic, error: licErr } = await window.db
            .from('licencias_b2b')
            .select('*')
            .eq('codigo', code.trim())
            .single();
            
        if (licErr || !lic) throw new Error("Código no encontrado o inválido.");
        if (!lic.activa) throw new Error("Esta licencia ya no está activa.");
        
        // Registrar en Supabase
        const { error: updErr } = await window.db
            .from('perfiles')
            .update({ 
                rango: 'B2B', 
                licencia_codigo: code.trim() 
            })
            .eq('email', userEmail);
            
        if (updErr) throw updErr;

        // Incrementar asientos mediante RPC
        await window.db.rpc('increment_asientos', { p_codigo: code.trim() });

        alert(`¡Felicidades! Se ha activado tu Licencia Institucional vinculada a: ${lic.institucion}`);
        
        // Sync local
        const { data: newProfile } = await window.db.from('perfiles').select('*').eq('email', userEmail).single();
        processLoginSuccess(userEmail, newProfile);
        
        closeModal();
    } catch(err) {
        alert("Error al validar código: " + err.message);
    }
}

// === HELPERS ===
function closeModal() {
    const m = document.getElementById('checkoutModal');
    if (m) m.style.display = 'none';
}

function scrollToCursos() {
    document.getElementById('cursos').scrollIntoView({ behavior: 'smooth' });
}

// === INIT ===
function init() {
    if (typeof CURRICULUM !== 'undefined') {
        const customCourses = JSON.parse(localStorage.getItem('vex_courses_custom')) || [];
        const deletedIds = JSON.parse(localStorage.getItem('vex_courses_deleted')) || [];
        const map = new Map();
        CURRICULUM.forEach(c => map.set(c.id, c));
        customCourses.forEach(c => map.set(c.id, c));
        courses = Array.from(map.values()).filter(c => !deletedIds.includes(c.id)).sort((a,b)=>a.id - b.id);
    }
    renderUnitTabs();
    if (document.getElementById('courseGrid')) renderCourses();

    if (userEmail) {
        userProgress = JSON.parse(localStorage.getItem(`progress_${userEmail}`)) || { completed: [], timeSpent: 0 };
        renderUserNav();
    }
    updatePricingUI();
}

init();

// === FORUM (COMUNIDAD) ===
function openForum() {
    renderForumPosts();
    const modal = document.getElementById('forumModal');
    if(modal) modal.style.display = 'flex';
}

function closeForum() {
    const modal = document.getElementById('forumModal');
    if(modal) modal.style.display = 'none';
}

async function renderForumPosts() {
    const container = document.getElementById('forumPosts');
    if(!container) return;
    
    try {
        const { data: posts, error } = await window.db
            .from('foro_comunidad')
            .select('*')
            .order('fecha_publicacion', { ascending: false });
            
        if (error) throw error;
        
        container.innerHTML = posts.map(p => `
            <div style="background:#252525;padding:1rem;border-radius:8px;border:1px solid ${p.autor_rango==='VEX INSTRUCTOR' ? 'var(--accent-blue)' : 'var(--glass-border)'}; ${p.autor_rango==='VEX INSTRUCTOR' ? 'background:rgba(0,180,216,0.05)' : ''}">
                <div style="display:flex;align-items:center;border-bottom:1px solid var(--glass-border);padding-bottom:0.5rem;margin-bottom:0.5rem;">
                    <strong style="${p.autor_rango==='VEX INSTRUCTOR' ? 'color:var(--accent-blue)' : 'color:white'}">${sanitize(p.autor_nombre)}</strong>
                    ${p.autor_rango==='VEX INSTRUCTOR' ? '<span class="status-badge status-pro" style="margin-left:0.5rem;font-size:0.65rem;border-color:var(--accent-blue);color:var(--accent-blue);background:rgba(0,180,216,0.1)">INSTRUCTOR V5</span>' : ''}
                    <span style="color:var(--text-muted);font-size:0.75rem;margin-left:auto">${new Date(p.fecha_publicacion).toLocaleString()}</span>
                </div>
                <p style="margin-top:0.5rem;font-size:0.9rem;white-space:pre-wrap;line-height:1.4">${sanitize(p.mensaje)}</p>
            </div>
        `).join('');
        
        if(posts.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:2rem;">Sé el primero en hacer una pregunta técnica o compartir tu código de competencia.</p>`;
        }
    } catch(err) {
        console.error("Error al cargar foro de Supabase:", err);
        container.innerHTML = `<p style="text-align:center;color:var(--vex-red);padding:2rem;">Error conectando al foro en vivo. Reintentando...</p>`;
    }
}

async function submitForumPost(e) {
    e.preventDefault();
    const textarea = document.getElementById('forumInput');
    const text = textarea.value.trim();
    if(!text) return;
    
    if(!userEmail) {
        alert("Debes iniciar sesión para publicar en la comunidad.");
        closeForum();
        showLogin();
        return;
    }
    
    const btn = e.target.querySelector('button');
    if (btn) { btn.innerText = 'Enviando...'; btn.disabled = true; }
    
    try {
        let userP = {};
        try { userP = JSON.parse(localStorage.getItem('userProfile')) || {}; } catch(e) {}
        
        const authorName = userP.nombre || userEmail.split('@')[0];
        const isMentor = userEmail.includes('domingo') || userEmail.includes('admin') || userP.rango === 'VEX INSTRUCTOR';
        const finalRole = isMentor ? 'VEX INSTRUCTOR' : (userP.rango || 'GRATIS');
        
        const { error } = await window.db.from('foro_comunidad').insert([{
            autor_nombre: authorName,
            autor_rango: finalRole,
            mensaje: text
        }]);
        
        if (error) throw error;
        
        textarea.value = '';
        renderForumPosts();
    } catch(err) {
        console.error(err);
        alert('Error publicando el mensaje.');
    } finally {
        if (btn) { btn.innerText = 'Publicar Sugerencia'; btn.disabled = false; }
    }
}

// INYECCIÓN DE TIEMPO REAL
if (window.db) {
    window.db.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'foro_comunidad' }, payload => {
          if (document.getElementById('forumModal')?.style.display === 'flex') {
              renderForumPosts();
          }
      })
      .subscribe();
}

function updatePricingUI() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    const isPro = userProfile && (userProfile.rango === 'PRO' || userProfile.rango === 'B2B' || userProfile.rango === 'VEX INSTRUCTOR');
    const isExpired = userProfile && userProfile.fecha_expiracion && new Date(userProfile.fecha_expiracion) < new Date();

    const prices = document.querySelectorAll('.price-card');
    prices.forEach(card => {
        const title = card.querySelector('h3').innerText;
        const button = card.querySelector('button');
        if (!button) return;

        if (isPro && !isExpired) {
            if ((title.includes('PRO Individual') && userProfile.rango === 'PRO') || 
                (title.includes('Institucional') && userProfile.rango === 'B2B')) {
                button.innerText = 'Tu Plan Actual';
                button.disabled = true;
                button.className = 'btn-secondary';
                button.style.opacity = '0.7';
                card.style.borderColor = '#00C853';
            }
        } else if (isExpired && isPro) {
            if (title.includes('Individual') || title.includes('Institucional')) {
                button.innerText = 'Renovar Licencia';
                button.disabled = false;
                button.className = 'btn-primary';
                button.style.background = '#FF9800'; 
                button.style.borderColor = '#FF9800';
            }
        } else {
            // Restore defaults
            if (title.includes('PRO Individual')) {
                button.innerText = 'Suscribirse Ahora';
                button.disabled = false;
                button.className = 'btn-primary';
                button.style = '';
            } else if (title.includes('Institucional')) {
                button.innerText = 'Adquirir Licencias';
                button.disabled = false;
                button.className = 'btn-primary';
                button.style = '';
            }
        }
    });
}
