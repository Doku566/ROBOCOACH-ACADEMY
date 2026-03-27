// Comunidad V5 Pro — comunidad.js
const userEmail = localStorage.getItem('userEmail');
const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
let currentPortalFilter = 'All';

// === ICONS (SVG STRICT) ===
const ICONS = {
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    code:  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    support:`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    event: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`,
    chat:  `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`
};

function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function initPortal() {
    if (!userEmail) {
        alert("Debes iniciar sesión en la Academia para participar.");
        window.location.href = "index.html";
        return;
    }
    renderUserBadge();
    renderPortalPosts();
    subscribeRealtime();
}

function renderUserBadge() {
    const card = document.getElementById('portalUserCard');
    if (!card) return;
    const initials = (userProfile.nombre || userEmail.split('@')[0]).substring(0,2).toUpperCase();
    card.innerHTML = `
        <div class="forum-avatar" style="background:var(--vex-red); width:40px; height:40px; font-size:1rem;">${initials}</div>
        <div>
            <div style="font-weight:700; font-size:0.9rem;">${sanitize(userProfile.nombre || userEmail.split('@')[0])}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${userProfile.rango || 'Estudiante'}</div>
        </div>
    `;
}

function setPortalFilter(cat) {
    currentPortalFilter = cat;
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.toggle('active', item.innerText.includes(cat) || (cat === 'All' && item.innerText.includes('Todo')));
    });
    document.getElementById('portalTitle').innerText = cat === 'All' ? 'Feed Comunitario' : `Categoría: ${cat}`;
    renderPortalPosts();
}

async function renderPortalPosts() {
    const feed = document.getElementById('portalFeed');
    if (!feed) return;

    try {
        let query = window.db
            .from('foro_comunidad')
            .select('*')
            .order('destacado', { ascending: false })
            .order('fecha_publicacion', { ascending: false });

        if (currentPortalFilter !== 'All') {
            query = query.eq('categoria', currentPortalFilter);
        }

        const { data: posts, error } = await query;
        if (error) throw error;

        feed.innerHTML = posts.map(p => {
            const initials = p.autor_nombre.substring(0,2).toUpperCase();
            const isVex = p.autor_rango === 'VEX INSTRUCTOR';
            const catIcon = p.categoria === 'Código' ? ICONS.code : (p.categoria === 'Soporte' ? ICONS.support : (p.categoria === 'Competencia' ? ICONS.event : ICONS.chat));
            
            return `
                <div class="forum-card ${isVex ? 'mentor-post' : ''}" style="margin-bottom:1rem;">
                    <div style="display:flex; gap:1rem;">
                        <div class="forum-avatar" style="background:${isVex ? 'var(--accent-blue)' : '#333'}">${initials}</div>
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                                <div style="display:flex; align-items:center; gap:0.5rem;">
                                    <strong style="color:${isVex ? 'var(--accent-blue)' : 'white'}">${sanitize(p.autor_nombre)}</strong>
                                    ${isVex ? '<span class="status-badge status-pro" style="font-size:0.6rem; color:var(--accent-blue); border-color:var(--accent-blue); background:rgba(0,180,216,0.1)">INSTRUCTOR V5</span>' : ''}
                                    <span class="category-badge" style="display:flex; align-items:center; gap:0.3rem;">${catIcon} ${p.categoria || 'General'}</span>
                                </div>
                                <span style="color:var(--text-muted); font-size:0.75rem;">${new Date(p.fecha_publicacion).toLocaleString()}</span>
                            </div>
                            <p style="white-space:pre-wrap; line-height:1.6; color:#ddd; font-size:0.95rem;">${sanitize(p.mensaje)}</p>
                            <div style="margin-top:1rem; display:flex; gap:1rem;">
                                <button class="like-btn" onclick="likePortalPost('${p.id}')">
                                    ${ICONS.heart} <span>${p.likes || 0}</span>
                                </button>
                                ${isVex || userEmail.includes('admin') ? `<button onclick="deletePortalPost('${p.id}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; gap:0.3rem; font-size:0.75rem;">${ICONS.trash} Eliminar</button>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (posts.length === 0) {
            feed.innerHTML = `<div style="text-align:center; padding:4rem; color:var(--text-muted);">
                <div style="margin-bottom:1rem; opacity:0.2;">${ICONS.chat}</div>
                <p>No hay publicaciones aún en esta categoría.<br>¡Comienza la conversación!</p>
            </div>`;
        }
    } catch (err) {
        console.error("Error cargando feed:", err);
    }
}

async function submitPortalPost(e) {
    e.preventDefault();
    const input = document.getElementById('portalInput');
    const category = document.getElementById('portalCategory').value;
    const text = input.value.trim();
    if (!text) return;

    const btn = e.target.querySelector('button');
    btn.innerText = 'Publicando...'; btn.disabled = true;

    try {
        const isMentor = userEmail.includes('domingo') || userEmail.includes('admin') || userProfile.rango === 'VEX INSTRUCTOR';
        const finalRole = isMentor ? 'VEX INSTRUCTOR' : (userProfile.rango || 'GRATIS');

        const { error } = await window.db.from('foro_comunidad').insert([{
            autor_nombre: userProfile.nombre || userEmail.split('@')[0],
            autor_rango: finalRole,
            mensaje: text,
            categoria: category
        }]);

        if (error) throw error;
        input.value = '';
        renderPortalPosts();
    } catch (err) {
        alert("Error al publicar.");
    } finally {
        btn.innerText = 'Publicar'; btn.disabled = false;
    }
}

async function likePortalPost(id) {
    try {
        await window.db.rpc('like_post', { p_id: id });
    } catch (err) { console.error(err); }
}

async function deletePortalPost(id) {
    if (!confirm("¿Eliminar este post definitivamente?")) return;
    try {
        await window.db.from('foro_comunidad').delete().eq('id', id);
        renderPortalPosts();
    } catch (err) { alert("Error al eliminar."); }
}

function subscribeRealtime() {
    window.db.channel('portal-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'foro_comunidad' }, () => renderPortalPosts())
        .subscribe();
}

document.addEventListener('DOMContentLoaded', initPortal);
