

// ── NAVIGATION ──

function toggleMenu() {
  const menu = document.getElementById('mob-menu');
  const btn = document.getElementById('ham-btn');
  const open = menu.classList.toggle('open');
  btn.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

function closeMenu() {
  document.getElementById('mob-menu').classList.remove('open');
  document.getElementById('ham-btn').classList.remove('open');
  document.body.style.overflow = '';
}

function irLoginCon(rol) {
  sessionStorage.setItem('educore_preselect', rol);
  openLogin(rol);
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
}

function openModal(html) {
  document.getElementById('modal-box').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
const mHead = t => `<div class="modal-head"><span>${t}</span><button class="modal-close" onclick="closeModal()">×</button></div>`;
const mBody = h => `<div class="modal-body">${h}</div>`;
const mFoot = h => `<div class="modal-foot">${h}</div>`;

function modalSoporte() {
  openModal(mHead('Soporte técnico') + mBody(`
    <p style="margin-bottom:14px">Para asistencia técnica, contáctanos por los siguientes medios:</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg2);border-radius:var(--r)">
        <span style="font-size:20px">📧</span>
        <div><div style="font-weight:600;color:var(--text)">Correo</div><div>soporte@educore.edu</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg2);border-radius:var(--r)">
        <span style="font-size:20px">📞</span>
        <div><div style="font-weight:600;color:var(--text)">Teléfono</div><div>+591 3 000-0000 · Lunes a Viernes 8:00–17:00</div></div>
      </div>
    </div>`) + mFoot(`<button class="btn-b" onclick="closeModal()">Entendido</button>`));
}

function modalTerminos() {
  openModal(mHead('Términos de uso') + mBody(`
    <p>EduCore es un sistema de gestión académica de uso exclusivo para personal autorizado por la institución educativa.</p>
    <p style="margin-top:10px">Queda prohibido el acceso con credenciales ajenas, la extracción masiva de datos o el uso del sistema con fines distintos a los académicos y administrativos.</p>
    <p style="margin-top:10px">Al iniciar sesión, el usuario acepta cumplir con las políticas institucionales y la normativa de protección de datos vigente.</p>
  `) + mFoot(`<button class="btn-b" onclick="closeModal()">Entendido</button>`));
}

function modalPrivacidad() {
  openModal(mHead('Política de privacidad') + mBody(`
    <p>Los datos almacenados en EduCore son de carácter confidencial y de uso exclusivo de la institución educativa. No se comparten con terceros sin consentimiento explícito.</p>
    <p style="margin-top:10px">Los estudiantes y docentes tienen derecho a solicitar la revisión y corrección de sus datos personales a través de la Secretaría.</p>
    <p style="margin-top:10px">La información de acceso es encriptada y nunca se almacena en texto plano.</p>
  `) + mFoot(`<button class="btn-b" onclick="closeModal()">Cerrar</button>`));
}

function modalManual() {
  openModal(mHead('Manual de usuario') + mBody(`
    <div style="display:flex;flex-direction:column;gap:8px">
      ${[['🛡️','Administrador','Gestión completa de usuarios, configuración y reportes del sistema.'],
         ['📋','Docente','Registro de notas, control de asistencia y seguimiento de sus cursos.'],
         ['📁','Secretaría','Inscripciones, cobros, expedientes y verificación de documentos.'],
         ['🎓','Estudiante','Consulta de notas propias, horarios y estado de pagos.'],
      ].map(([ico,rol,desc]) => `
        <div style="display:flex;gap:12px;padding:10px;background:var(--bg2);border-radius:var(--r)">
          <span style="font-size:18px">${ico}</span>
          <div><div style="font-weight:600;color:var(--text);margin-bottom:2px">${rol}</div><div>${desc}</div></div>
        </div>`).join('')}
    </div>
  `) + mFoot(`<button class="btn-b" onclick="closeModal()">Cerrar</button>`));
}

// ═══════════════════════════════════════════════════════
//  LOGIN — lógica integrada
// ═══════════════════════════════════════════════════════

// ── Usuarios demo ──
const DEMO_USERS = [
  { email:'admin@educore.com',      password:'123456', role:'admin'      },
  { email:'docente@educore.com',    password:'123456', role:'docente'    },
  { email:'secretaria@educore.com', password:'123456', role:'secretaria' },
  { email:'alumno@educore.com',     password:'123456', role:'estudiante' },
];

const ROLES_LABEL = {
  admin:'Administrador', docente:'Docente',
  estudiante:'Estudiante', secretaria:'Personal'
};

let selRole = 'admin';

// ── Abrir / cerrar overlay ──
function irLogin() { openLogin(); }

function openLogin(preselect) {
  const role = preselect || sessionStorage.getItem('educore_preselect') || 'admin';
  const idMap = { admin:'rs-admin', docente:'rs-docente', estudiante:'rs-est', secretaria:'rs-sec' };
  pickRole(role, idMap[role]);
  // Limpiar login
  document.getElementById('l-email').value = '';
  document.getElementById('l-pwd').value   = '';
  document.getElementById('l-captcha').value = '';
  document.getElementById('l-err').classList.remove('show');
  ['lf-email','lf-pass','lf-captcha'].forEach(clearErr);
  refreshCaptcha();
  // Asegurarse que empieza en tab login
  switchLoginTab('login');
  document.getElementById('login-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLogin() {
  document.getElementById('login-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Selector de rol ──
function pickRole(role, id) {
  selRole = role;
  document.querySelectorAll('.rso').forEach(o => o.classList.remove('on'));
  const el = document.getElementById(id);
  if (el) el.classList.add('on');
}

// ── Tabs login / registro ──
function switchLoginTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('lfrm-login').style.display    = isLogin ? 'block' : 'none';
  document.getElementById('lfrm-register').style.display = isLogin ? 'none'  : 'block';
  document.getElementById('ltab-login').classList.toggle('active', isLogin);
  document.getElementById('ltab-register').classList.toggle('active', !isLogin);
}

// ── CAPTCHA ──
let currentCaptcha = '';

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function refreshCaptcha() {
  currentCaptcha = generateCaptcha();
  const el = document.getElementById('captcha-text');
  if (el) el.textContent = currentCaptcha;
  const inp = document.getElementById('l-captcha');
  if (inp) inp.value = '';
  clearErr('lf-captcha');
}

// ── Helpers de validación ──
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function setErr(fieldId, show) {
  const el = document.getElementById(fieldId);
  if (el) el.classList.toggle('has-err', show);
}
function clearErr(fieldId) { setErr(fieldId, false); }

// ── doLogin ──
function doLogin() {
  const email   = document.getElementById('l-email').value.trim();
  const pass    = document.getElementById('l-pwd').value;
  const captcha = document.getElementById('l-captcha').value.trim().toUpperCase();

  let valid = true;

  const emailOk = isValidEmail(email);
  setErr('lf-email', !emailOk);
  if (!emailOk) valid = false;

  const passOk = pass.length >= 6;
  setErr('lf-pass', !passOk);
  if (!passOk) valid = false;

  const captchaOk = captcha === currentCaptcha;
  setErr('lf-captcha', !captchaOk);
  if (!captchaOk) valid = false;

  if (!valid) return;

  // Verificar credenciales
  const user = DEMO_USERS.find(u => u.email === email && u.password === pass);
  if (!user) {
    document.getElementById('l-err').classList.add('show');
    refreshCaptcha();
    return;
  }

  document.getElementById('l-err').classList.remove('show');
  sessionStorage.setItem('educore_role',  user.role);
  sessionStorage.setItem('educore_email', email);
  // Redirección según rol
  if (user.role === 'admin') {
    window.location.href = 'Admin.html';
  } else if (user.role === 'docente') {
    window.location.href = 'docente.html';
  } else if (user.role === 'estudiante') {
    window.location.href = 'estudiante.html';
  } else if (user.role === 'secretaria') {
    window.location.href = 'secretaria.html';
  }
}

// ── doRegister ──
function doRegister() {
  const name  = document.getElementById('r-name').value.trim();
  const last  = document.getElementById('r-last').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const pass  = document.getElementById('r-pass').value;
  const pass2 = document.getElementById('r-pass2').value;

  let valid = true;

  setErr('lf-r-name', !name);  if (!name)  valid = false;
  setErr('lf-r-last', !last);  if (!last)  valid = false;

  const emailOk = isValidEmail(email);
  setErr('lf-r-email', !emailOk); if (!emailOk) valid = false;

  const passOk = pass.length >= 6;
  setErr('lf-r-pass', !passOk); if (!passOk) valid = false;

  const pass2Ok = pass === pass2;
  setErr('lf-r-pass2', !pass2Ok); if (!pass2Ok) valid = false;

  const rerr = document.getElementById('r-err');
  const rok  = document.getElementById('r-ok');

  if (!valid) { rerr.classList.add('show'); return; }

  rerr.classList.remove('show');
  rok.textContent = `✓ Solicitud enviada para ${name} ${last}. Un administrador aprobará tu acceso.`;
  rok.classList.add('show');

  // Resetear formulario y volver a login tras 2.5s
  setTimeout(() => {
    rok.classList.remove('show');
    ['r-name','r-last','r-email','r-pass','r-pass2'].forEach(id => document.getElementById(id).value = '');
    switchLoginTab('login');
    document.getElementById('l-email').value = email;
  }, 2500);
}

// ── Recuperar contraseña ──
function openRecoverModal() {
  document.getElementById('rec-email').value = '';
  document.getElementById('rec-ok').classList.remove('show');
  clearErr('lf-rec-email');
  document.getElementById('recover-overlay').classList.add('open');
}

function closeRecoverModal() {
  document.getElementById('recover-overlay').classList.remove('open');
}

function doRecover() {
  const email = document.getElementById('rec-email').value.trim();
  const ok = isValidEmail(email);
  setErr('lf-rec-email', !ok);
  if (!ok) return;
  document.getElementById('rec-ok').classList.add('show');
  setTimeout(closeRecoverModal, 2500);
}

// ── Teclado ──
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeRecoverModal();
    closeLogin();
  }
  if (e.key === 'Enter') {
    if (document.getElementById('recover-overlay').classList.contains('open')) { doRecover(); return; }
    if (document.getElementById('login-overlay').classList.contains('open')) {
      if (document.getElementById('lfrm-register').style.display !== 'none') doRegister();
      else doLogin();
    }
  }
});

// Generar captcha inicial al cargar la página
refreshCaptcha();

