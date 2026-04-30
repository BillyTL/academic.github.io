/**
 * ============================================================
 *  estu.js — Panel del Estudiante · EduCore
 *  Sistema Académico · academy_db
 * ============================================================
 *  Responsabilidades:
 *   1. Comunicación con el backend  (apiFetch)
 *   2. Estado local centralizado    (state)
 *   3. Utilidades UI                (toast, loading, setText)
 *   4. Navegación SPA               (goTo)
 *   5. Sidebar móvil
 *   6. Reloj en tiempo real
 *   7. Carga de datos desde la API  (cargar*)
 *   8. Punto de entrada             (init)
 *
 *  Tablas de BD relacionadas:
 *   Estudiante, Inscripcion, Materia, Calificacion,
 *   Horario, Asistencia, Pago, Factura, Curso
 * ============================================================
 */

'use strict';

/* ─── CONSTANTES ─────────────────────────────────────────── */

/** Nota mínima de aprobación (reglamento académico). */
const NOTA_MIN_APROBACION = 51;

/** Ruta base de la API. */
const API_BASE = '../backend/API/api.php';


/* ─── 1. CAPA DE TRANSPORTE ──────────────────────────────── */

/**
 * Petición autenticada a la API central.
 *
 * @param {string} resource   - Recurso REST ('subjects','grades','schedules','payments','attendance','auth')
 * @param {string} action     - Acción ('my_list','list','logout',…)
 * @param {Object} [payload]  - Body JSON adicional
 * @returns {Promise<any>}
 */
async function apiFetch(resource, action, payload = {}) {
  const url = `${API_BASE}?resource=${encodeURIComponent(resource)}&action=${encodeURIComponent(action)}`;

  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  };

  let response;
  try {
    response = await fetch(url, opts);
  } catch (err) {
    throw new Error(`Error de red (${resource}/${action}): ${err.message}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${resource}/${action}`);
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error(`Respuesta no-JSON de (${resource}/${action})`);
  }

  if (json.success === false) {
    throw new Error(json.message || `API error en ${resource}/${action}`);
  }

  return json.data !== undefined ? json.data : json;
}


/* ─── 2. ESTADO GLOBAL ───────────────────────────────────── */

/**
 * Estado centralizado del panel.
 * Correspondencia con academy_db:
 *   user       → localStorage (sesión)
 *   materias   → Materia JOIN Inscripcion
 *   notas      → Calificacion (Id_calificacion, Id_curso, Id_estudiante, Id_materia, Nota)
 *   horarios   → Horario (Dia, Hora_inicio, Hora_fin, Id_materia, Id_docente, Id_curso)
 *   asistencia → Asistencia (id_asistencia, id_estudiante, estado, id_docente, id_materia)
 *   pagos      → Pago (id_pago, id_estudiante, fecha, metodo, monto) + Factura
 */
const state = {
  /** @type {Object|null} */
  user: null,

  /** @type {Array}  Materias inscritas (Materia + Inscripcion) */
  materias: [],

  /**
   * Calificaciones. Dos formatos posibles:
   *   Agrupado: [{ Id_materia, materia, promedio, bimestres:[{bimestre,nota,observaciones}] }]
   *   Plano:    [{ Id_materia, Nombre, Nota, Bimestre, ... }]
   * @type {Array}
   */
  notas: [],

  /**
   * Horarios. Dos formatos posibles:
   *   Plano:    [{ Dia, Hora_inicio, Hora_fin, Nombre, Aula }]
   *   Agrupado: { Lunes:[...], Martes:[...], ... }
   * @type {Array|Object}
   */
  horarios: [],

  /**
   * Asistencia. [{ id_asistencia, id_materia, materia, estado, fecha }]
   * @type {Array}
   */
  asistencia: [],

  /**
   * Pagos. [{ id_pago, Concepto, Monto, fecha, metodo, Estado }]
   * Relacionado también con Factura (id_factura, id_pago).
   * @type {Array}
   */
  pagos: [],

  /** Página activa en la SPA. */
  currentPage: 'dashboard',

  /** Bimestre activo en el filtro de calificaciones. */
  bimestreFiltro: 'todos',

  /** Indica si hay una carga en curso. */
  loading: false,
};


/* ─── 3. UTILIDADES UI ───────────────────────────────────── */

/**
 * Lee el usuario autenticado desde localStorage.
 * @returns {Object|null}
 */
function getUsuarioLocal() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Muestra u oculta el overlay de carga.
 * @param {boolean} visible
 */
function setLoading(visible) {
  state.loading = visible;
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = visible ? 'flex' : 'none';
}

/**
 * Notificación flotante (toast).
 * @param {string} mensaje
 * @param {'info'|'success'|'error'} tipo
 * @param {number} [ms=3500]
 */
function mostrarToast(mensaje, tipo = 'info', ms = 3500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = mensaje;
  toast.className = `toast--visible toast--${tipo}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.className = ''; }, ms);
}

/**
 * Escribe texto en un elemento por ID, sin fallar si no existe.
 * @param {string} id
 * @param {string|number} texto
 */
function setText(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

/**
 * Genera badge HTML según nota numérica.
 * Umbral: NOTA_MIN_APROBACION (Calificacion.Nota)
 * @param {number|string|null|undefined} nota
 * @returns {string}
 */
function badgeNota(nota) {
  if (nota === null || nota === undefined || nota === '') {
    return '<span class="badge badge--pendiente">Sin nota</span>';
  }
  return Number(nota) >= NOTA_MIN_APROBACION
    ? '<span class="badge badge--aprobado">✓ Aprobado</span>'
    : '<span class="badge badge--reprobado">✗ Reprobado</span>';
}

/**
 * HTML de estado vacío con ícono.
 * @param {string} msg
 * @returns {string}
 */
function emptyState(msg) {
  return `
    <div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="opacity:.3">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>${msg}</p>
    </div>`;
}

/**
 * Construye mapa Id_materia → objeto nota (para correlacionar materias con notas).
 * @returns {Map<string, Object>}
 */
function buildNotasMap() {
  const map = new Map();
  state.notas.forEach(n => {
    if (n.Id_materia) map.set(String(n.Id_materia), n);
  });
  return map;
}


/* ─── 4. NAVEGACIÓN SPA ──────────────────────────────────── */

/**
 * Cambia la sección visible sin recargar.
 * @param {string} pageId - ID de la sección destino
 */
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(sec => {
    sec.classList.remove('page--active', 'active');
  });

  const destino = document.getElementById(pageId);
  if (destino) {
    destino.classList.add('page--active');
    state.currentPage = pageId;
  } else {
    console.warn(`[goTo] Sección no encontrada: "${pageId}"`);
    return;
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    const isActive = item.dataset.page === pageId;
    item.classList.toggle('nav-item--active', isActive);
    item.classList.toggle('active', isActive);
  });

  cerrarSidebar();
}


/* ─── 5. SIDEBAR MÓVIL ───────────────────────────────────── */

function abrirSidebar() {
  document.getElementById('sidebar')?.classList.add('sidebar--open');
  document.getElementById('sidebar-overlay')?.classList.add('sidebar-overlay--visible');
}

function cerrarSidebar() {
  document.getElementById('sidebar')?.classList.remove('sidebar--open');
  document.getElementById('sidebar-overlay')?.classList.remove('sidebar-overlay--visible');
}


/* ─── 6. RELOJ EN TIEMPO REAL ────────────────────────────── */

function iniciarReloj() {
  const reloj = document.getElementById('header-clock');
  if (!reloj) return;

  const dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const tick = () => {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    reloj.textContent =
      `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()} — ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  tick();
  setInterval(tick, 30_000);
}


/* ─── 7. CARGA DE DATOS ──────────────────────────────────── */

/** Payload estándar con el ID del usuario en sesión. */
function payloadUser() {
  return { Id_usuario: state.user?.Id_usuario ?? state.user?.ID };
}

/**
 * Carga materias inscritas.
 * BD: Materia JOIN Inscripcion WHERE Inscripcion.id_estudiante = ?
 * Endpoint: subjects/my_list
 */
async function cargarMaterias() {
  try {
    const res = await apiFetch('subjects', 'my_list', payloadUser());
    state.materias = Array.isArray(res) ? res : (res.data ?? res.materias ?? []);
  } catch (err) {
    console.error('[cargarMaterias]', err.message);
    mostrarToast('No se pudieron cargar las materias.', 'error');
    state.materias = [];
  }
}

/**
 * Carga calificaciones.
 * BD: Calificacion WHERE Id_estudiante = ?
 * Campos esperados: Id_materia, Nombre, Nota (o Parcial1,Parcial2,Exposiciones,Nota_Final)
 * Endpoint: grades/my_list
 */
async function cargarNotas() {
  try {
    const res = await apiFetch('grades', 'my_list', payloadUser());
    state.notas = Array.isArray(res) ? res : (res.data ?? res.notas ?? []);
  } catch (err) {
    console.error('[cargarNotas]', err.message);
    mostrarToast('No se pudieron cargar las calificaciones.', 'error');
    state.notas = [];
  }
}

/**
 * Carga horarios.
 * BD: Horario (Dia, Hora_inicio, Hora_fin, Id_materia, Id_docente, Id_curso)
 * Endpoint: schedules/my_list
 */
async function cargarHorarios() {
  try {
    const res = await apiFetch('schedules', 'my_list', payloadUser());
    state.horarios = res.data ?? res;
  } catch (err) {
    console.error('[cargarHorarios]', err.message);
    mostrarToast('No se pudieron cargar los horarios.', 'error');
    state.horarios = [];
  }
}

/**
 * Carga asistencia.
 * BD: Asistencia (id_asistencia, id_estudiante, estado, id_docente, id_materia)
 * Endpoint: attendance/my_list
 */
async function cargarAsistencia() {
  try {
    const res = await apiFetch('attendance', 'my_list', payloadUser());
    state.asistencia = Array.isArray(res) ? res : (res.data ?? []);
  } catch (err) {
    console.error('[cargarAsistencia]', err.message);
    state.asistencia = [];
  }
}

/**
 * Carga pagos.
 * BD: Pago (id_pago, id_estudiante, fecha, metodo, monto) + Factura (id_factura, id_pago)
 * Endpoint: payments/my_list
 */
async function cargarPagos() {
  try {
    const res = await apiFetch('payments', 'my_list', payloadUser());
    state.pagos = Array.isArray(res) ? res : (res.data ?? res.pagos ?? []);
  } catch (err) {
    console.error('[cargarPagos]', err.message);
    mostrarToast('No se pudieron cargar los pagos.', 'error');
    state.pagos = [];
  }
}

/** Carga todos los datos en paralelo con Promise.allSettled. */
async function cargarTodo() {
  setLoading(true);
  await Promise.allSettled([
    cargarMaterias(),
    cargarNotas(),
    cargarHorarios(),
    cargarAsistencia(),
    cargarPagos(),
  ]);
  setLoading(false);
}


/* ─── 8. RENDERIZADO ─────────────────────────────────────── */

/* ── 8a. Dashboard ── */

/**
 * Actualiza los KPI cards del dashboard.
 * Fuentes: state.materias, state.notas, state.horarios, state.pagos, state.asistencia
 */
function renderDashboard() {
  const nombre = state.user?.Nombre ?? state.user?.nombre ?? 'Estudiante';

  setText('user-name', `Hola, ${nombre.split(' ')[0]}`);

  const avatar = document.getElementById('user-avatar');
  if (avatar) avatar.textContent = nombre.charAt(0).toUpperCase();

  // Materias (Inscripcion + Materia)
  setText('dashboard-total-materias', state.materias.length);

  // Aprobadas / reprobadas (Calificacion.Nota)
  let aprobadas = 0, reprobadas = 0;
  state.notas.forEach(n => {
    const nota = n.promedio ?? n.Nota_Final ?? n.Nota ?? n.nota;
    const num  = Number(nota);
    if (!isNaN(num)) num >= NOTA_MIN_APROBACION ? aprobadas++ : reprobadas++;
  });
  setText('dashboard-aprobadas', aprobadas);
  setText('dashboard-reprobadas', reprobadas);

  // Horarios (clases de la semana)
  const totalClases = Array.isArray(state.horarios)
    ? state.horarios.length
    : Object.values(state.horarios).flat().length;
  setText('dashboard-total-horarios', totalClases);

  // Pagos (Pago)
  setText('dashboard-total-pagos', state.pagos.length);

  // Asistencia % (Asistencia.estado === 'Presente')
  if (state.asistencia.length) {
    const presentes = state.asistencia.filter(a =>
      (a.estado ?? a.Estado ?? '').toLowerCase() === 'presente'
    ).length;
    const pct = Math.round((presentes / state.asistencia.length) * 100);
    setText('dashboard-asistencia', `${pct}%`);
  } else {
    setText('dashboard-asistencia', '—');
  }
}


/* ── 8b. Materias ── */

/**
 * Renderiza tabla de materias inscritas.
 * BD: Materia (Id_materia, Nombre, Creditos) JOIN Inscripcion + Calificacion.Nota
 * Elemento: #tablaMaterias
 */
function renderMaterias() {
  _renderResumenMaterias();

  const tabla = document.getElementById('tablaMaterias');
  if (!tabla) return;

  const notasMap = buildNotasMap();
  const materias = state.materias;

  if (!materias.length) {
    tabla.innerHTML = `
      <thead><tr><th>#</th><th>ID</th><th>Materia</th><th>Docente</th><th>Nota</th><th>Estado</th></tr></thead>
      <tbody><tr><td colspan="6" class="tabla-vacia">No hay materias inscritas.</td></tr></tbody>`;
    return;
  }

  // Filtro de búsqueda
  const buscar = (document.getElementById('buscar-materia')?.value ?? '').toLowerCase();
  const filtroEstado = (document.getElementById('filtro-estado')?.value ?? '').toLowerCase();

  const filas = materias
    .filter(m => {
      const nombre = (m.Nombre ?? m.nombre ?? '').toLowerCase();
      if (buscar && !nombre.includes(buscar)) return false;
      if (filtroEstado) {
        const notaObj  = notasMap.get(String(m.Id_materia));
        const notaVal  = m.nota ?? m.Nota ?? notaObj?.promedio ?? null;
        if (filtroEstado === 'aprobado'  && (notaVal === null || Number(notaVal) < NOTA_MIN_APROBACION)) return false;
        if (filtroEstado === 'reprobado' && (notaVal === null || Number(notaVal) >= NOTA_MIN_APROBACION)) return false;
        if (filtroEstado === 'pendiente' && notaVal !== null) return false;
      }
      return true;
    })
    .map((m, idx) => {
      const nombre   = m.Nombre   ?? m.nombre  ?? 'Sin nombre';
      const docente  = m.docente  ?? m.Docente ?? '—';
      const creditos = m.Creditos ?? m.creditos ?? '';
      const notaObj  = notasMap.get(String(m.Id_materia));
      const notaVal  = m.nota ?? m.Nota ?? notaObj?.promedio ?? null;
      const notaCls  = notaVal === null ? '' : Number(notaVal) >= NOTA_MIN_APROBACION ? 'nota-aprobado' : 'nota-reprobado';

      return `
        <tr>
          <td>${idx + 1}</td>
          <td style="color:var(--text-muted);font-size:12px">${m.Id_materia ?? '—'}</td>
          <td>
            <strong>${nombre}</strong>
            ${creditos ? `<br><small style="color:var(--text-muted)">${creditos} créd.</small>` : ''}
          </td>
          <td>${docente}</td>
          <td class="nota-valor ${notaCls}">${notaVal !== null ? notaVal : '—'}</td>
          <td>${badgeNota(notaVal)}</td>
        </tr>`;
    }).join('');

  tabla.innerHTML = `
    <thead>
      <tr>
        <th>#</th><th>ID</th><th>Materia</th><th>Docente</th><th>Nota</th><th>Estado</th>
      </tr>
    </thead>
    <tbody>${filas || `<tr><td colspan="6" class="tabla-vacia">Sin resultados para el filtro.</td></tr>`}</tbody>`;
}

/** Tarjetas de resumen sobre la tabla de materias. */
function _renderResumenMaterias() {
  const wrap = document.getElementById('materias-resumen');
  if (!wrap) return;

  const total    = state.materias.length;
  const notasMap = buildNotasMap();
  let ap = 0, rep = 0, pen = 0;

  state.materias.forEach(m => {
    const notaObj = notasMap.get(String(m.Id_materia));
    const nota    = m.nota ?? m.Nota ?? notaObj?.promedio ?? null;
    if (nota === null || nota === undefined || nota === '') pen++;
    else Number(nota) >= NOTA_MIN_APROBACION ? ap++ : rep++;
  });

  wrap.innerHTML = [
    { label: 'Total',         value: total, style: '' },
    { label: 'Aprobadas',     value: ap,    style: 'color:#15803d' },
    { label: 'Reprobadas',    value: rep,   style: 'color:#b91c1c' },
    { label: 'Sin calificar', value: pen,   style: 'color:#b45309' },
  ].map(r => `
    <div class="resumen-card">
      <div class="rc-value" style="${r.style}">${r.value}</div>
      <div class="rc-label">${r.label}</div>
    </div>`).join('');
}


/* ── 8c. Notas / Calificaciones ── */

/**
 * Genera filtros de bimestre y renderiza la primera vista.
 * BD: Calificacion (Id_calificacion, Id_curso, Id_estudiante, Id_materia, Nota)
 */
function renderNotas() {
  _generarFiltrosBimestre();
  _renderNotasFiltradas(state.bimestreFiltro ?? 'todos');
}

/** Construye botones de filtro dinámicamente según los bimestres encontrados. */
function _generarFiltrosBimestre() {
  const wrap = document.getElementById('filtros-bimestre');
  if (!wrap) return;

  const bimestres = new Set();
  state.notas.forEach(mat => {
    if (Array.isArray(mat.bimestres)) mat.bimestres.forEach(b => { if (b.bimestre) bimestres.add(b.bimestre); });
    if (mat.Bimestre) bimestres.add(mat.Bimestre);
  });

  const extra = [...bimestres].sort().map(b =>
    `<button class="filtro-btn" data-bimestre="${b}">${b}</button>`
  ).join('');

  wrap.innerHTML = `<button class="filtro-btn filtro-btn--active" data-bimestre="todos">Todos</button>${extra}`;

  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.filtro-btn');
    if (!btn) return;
    wrap.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('filtro-btn--active'));
    btn.classList.add('filtro-btn--active');
    state.bimestreFiltro = btn.dataset.bimestre;
    _renderNotasFiltradas(state.bimestreFiltro);
  });
}

/**
 * Renderiza las calificaciones en #notas-contenido.
 * Compatible con formato agrupado y plano.
 */
function _renderNotasFiltradas(bimestre) {
  const contenido = document.getElementById('notas-contenido');
  if (!contenido) return;

  if (!state.notas.length) {
    contenido.innerHTML = emptyState('No hay calificaciones registradas.');
    return;
  }

  const esAgrupado = Array.isArray(state.notas[0]?.bimestres);
  let html = '';

  if (esAgrupado) {
    html = state.notas.map(mat => {
      const nombre   = mat.materia ?? mat.Nombre ?? 'Materia';
      const promedio = mat.promedio;

      const bimVis = bimestre === 'todos'
        ? (mat.bimestres ?? [])
        : (mat.bimestres ?? []).filter(b => b.bimestre === bimestre);

      if (!bimVis.length) return '';

      const filas = bimVis.map(b => {
        const nota    = b.nota ?? b.Nota;
        const notaNum = nota !== null && nota !== undefined && nota !== '' ? Number(nota) : null;
        const cls     = notaNum === null ? '' : notaNum >= NOTA_MIN_APROBACION ? 'nota-aprobado' : 'nota-reprobado';
        return `
          <tr>
            <td>${b.bimestre ?? '—'}</td>
            <td class="nota-valor ${cls}">${notaNum !== null ? notaNum : '—'}</td>
            <td>${badgeNota(nota)}</td>
            <td>${b.observaciones ?? b.Observaciones ?? '—'}</td>
          </tr>`;
      }).join('');

      const promedioHtml = promedio !== null && promedio !== undefined
        ? `<span class="nota-promedio ${Number(promedio) >= NOTA_MIN_APROBACION ? 'nota-aprobado' : 'nota-reprobado'}">
             Promedio: <strong>${promedio}</strong>
           </span>`
        : '';

      return `
        <div class="card materia-notas-block">
          <div class="materia-notas-titulo">${nombre} ${promedioHtml}</div>
          <div class="card-body">
            <div class="tabla-wrap">
              <table class="tabla">
                <thead><tr><th>Bimestre</th><th>Nota</th><th>Estado</th><th>Observaciones</th></tr></thead>
                <tbody>${filas}</tbody>
              </table>
            </div>
          </div>
        </div>`;
    }).filter(Boolean).join('');

  } else {
    // Formato plano: { Id_materia, Nombre, Nota, Bimestre }
    const filtradas = bimestre === 'todos'
      ? state.notas
      : state.notas.filter(n => (n.Bimestre ?? n.bimestre) === bimestre);

    if (!filtradas.length) {
      contenido.innerHTML = emptyState('Sin calificaciones para el bimestre seleccionado.');
      return;
    }

    const filas = filtradas.map((n, i) => {
      const nota = n.Nota ?? n.nota;
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${n.Nombre ?? n.materia ?? '—'}</td>
          <td>${n.Bimestre ?? n.bimestre ?? '—'}</td>
          <td class="nota-valor">${nota ?? '—'}</td>
          <td>${badgeNota(nota)}</td>
          <td>${n.Observaciones ?? n.observaciones ?? '—'}</td>
        </tr>`;
    }).join('');

    html = `
      <div class="card">
        <div class="card-body">
          <div class="tabla-wrap">
            <table class="tabla">
              <thead><tr><th>#</th><th>Materia</th><th>Bimestre</th><th>Nota</th><th>Estado</th><th>Observaciones</th></tr></thead>
              <tbody>${filas}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  contenido.innerHTML = html || emptyState('Sin calificaciones para el filtro seleccionado.');
}


/* ── 8d. Horarios ── */

/**
 * Renderiza la sección de horarios.
 * BD: Horario (Dia, Hora_inicio, Hora_fin, Id_materia, Id_docente, Id_curso)
 * Dos modos: tarjetas semanales (#horario-semanal) o tabla (#tablaHorario).
 */
function renderHorario() {
  const h = state.horarios;
  const esObjeto = h && !Array.isArray(h) && typeof h === 'object';

  if (esObjeto) {
    _renderHorarioSemanal(h);
  } else {
    _renderHorarioTabla(Array.isArray(h) ? h : []);
  }
}

/** Tarjetas agrupadas por día. */
function _renderHorarioSemanal(porDia) {
  const wrap = document.getElementById('horario-semanal');
  const tablaWrap = document.getElementById('horario-tabla-wrap');

  if (!wrap) {
    if (tablaWrap) tablaWrap.style.display = '';
    _renderHorarioTabla(Object.values(porDia).flat());
    return;
  }

  const dias = Object.keys(porDia);
  if (!dias.length) {
    wrap.innerHTML = emptyState('Sin horario registrado.');
    return;
  }

  const colores = ['#22c55e','#14b8a6','#f59e0b','#3b82f6','#ef4444','#8b5cf6'];

  wrap.innerHTML = dias.map((dia, dIdx) => {
    const clases = porDia[dia];
    const color  = colores[dIdx % colores.length];

    const tarjetas = clases.map(h => {
      const materia = h.materia   ?? h.Nombre     ?? h.Id_materia ?? '—';
      const docente = h.docente   ?? h.Docente    ?? '';
      const aula    = h.aula      ?? h.Aula       ?? '';
      const ini     = h.hora_inicio ?? h.Hora_inicio ?? '';
      const fin     = h.hora_fin    ?? h.Hora_fin    ?? '';
      const horaStr = ini && fin ? `${ini} – ${fin}` : ini || '—';

      return `
        <div class="horario-card" style="border-left-color:${color}">
          <div class="horario-card__time">${horaStr}</div>
          <div class="horario-card__materia">${materia}</div>
          ${docente ? `<div class="horario-card__meta">👨‍🏫 ${docente}</div>` : ''}
          ${aula    ? `<div class="horario-card__meta">🏫 Aula: ${aula}</div>` : ''}
        </div>`;
    }).join('');

    return `
      <div class="horario-dia">
        <h3 class="horario-dia__title" style="border-left:3px solid ${color};">${dia}</h3>
        ${tarjetas}
      </div>`;
  }).join('');
}

/** Tabla clásica de horario. */
function _renderHorarioTabla(horarios) {
  const wrap = document.getElementById('horario-tabla-wrap');
  if (wrap) wrap.style.display = '';

  const tabla = document.getElementById('tablaHorario');
  if (!tabla) return;

  if (!horarios?.length) {
    tabla.innerHTML = `
      <tbody><tr><td colspan="5" class="tabla-vacia">Sin horario registrado.</td></tr></tbody>`;
    return;
  }

  const ORDEN = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const sorted = [...horarios].sort((a, b) => {
    const dA = ORDEN.indexOf(a.Dia ?? a.dia ?? '');
    const dB = ORDEN.indexOf(b.Dia ?? b.dia ?? '');
    if (dA !== dB) return dA - dB;
    return (a.Hora_inicio ?? '').localeCompare(b.Hora_inicio ?? '');
  });

  const filas = sorted.map(h => `
    <tr>
      <td>${h.Dia ?? h.dia ?? '—'}</td>
      <td>${h.Hora_inicio ?? h.hora_inicio ?? '—'}</td>
      <td>${h.Hora_fin ?? h.hora_fin ?? '—'}</td>
      <td>${h.materia ?? h.Nombre ?? h.Id_materia ?? '—'}</td>
      <td>${h.Aula ?? h.aula ?? '—'}</td>
    </tr>`).join('');

  tabla.innerHTML = `
    <thead><tr><th>Día</th><th>Inicio</th><th>Fin</th><th>Materia</th><th>Aula</th></tr></thead>
    <tbody>${filas}</tbody>`;
}


/* ── 8e. Asistencia ── */

/**
 * Renderiza tabla de asistencia.
 * BD: Asistencia (id_asistencia, id_estudiante, estado, id_docente, id_materia)
 * Elemento: #tablaAsistencia
 */
function renderAsistencia() {
  const tabla = document.getElementById('tablaAsistencia');
  if (!tabla) return;

  if (!state.asistencia.length) {
    tabla.innerHTML = `
      <thead><tr><th>#</th><th>Materia</th><th>Fecha</th><th>Estado</th></tr></thead>
      <tbody><tr><td colspan="4" class="tabla-vacia">Sin registros de asistencia.</td></tr></tbody>`;
    return;
  }

  const filas = state.asistencia.map((a, i) => {
    const estado  = a.estado ?? a.Estado ?? '—';
    const cls     = estado.toLowerCase() === 'presente' ? 'badge--aprobado' : 'badge--reprobado';
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${a.materia ?? a.Nombre ?? a.id_materia ?? '—'}</td>
        <td>${a.fecha ?? a.Fecha ?? '—'}</td>
        <td><span class="badge ${cls}">${estado}</span></td>
      </tr>`;
  }).join('');

  tabla.innerHTML = `
    <thead><tr><th>#</th><th>Materia</th><th>Fecha</th><th>Estado</th></tr></thead>
    <tbody>${filas}</tbody>`;
}


/* ── 8f. Pagos ── */

/**
 * Renderiza tabla de pagos y facturas.
 * BD: Pago (id_pago, id_estudiante, fecha, metodo, monto) + Factura (id_factura, id_pago)
 * Elemento: #tablaPagos
 */
function renderPagos() {
  const tabla = document.getElementById('tablaPagos');
  if (!tabla) return;

  if (!state.pagos.length) {
    tabla.innerHTML = `
      <thead><tr><th>#</th><th>Concepto</th><th>Monto</th><th>Fecha</th><th>Método</th><th>Estado</th><th>Factura</th></tr></thead>
      <tbody><tr><td colspan="7" class="tabla-vacia">Sin pagos registrados.</td></tr></tbody>`;
    return;
  }

  const filas = state.pagos.map((p, i) => {
    const monto    = p.Monto ?? p.monto ?? p.amount ?? '—';
    const montoFmt = typeof monto === 'number'
      ? monto.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })
      : monto;
    const estado   = p.Estado ?? p.estado ?? '—';
    const estadoCls = estado.toLowerCase() === 'pagado' ? 'badge--pagado' : 'badge--pendientep';
    // Factura relacionada (Factura.id_factura → Pago.id_pago)
    const factura  = p.id_factura ?? p.Factura ?? '—';

    return `
      <tr>
        <td>${i + 1}</td>
        <td>${p.Concepto ?? p.concepto ?? '—'}</td>
        <td style="font-weight:600">${montoFmt}</td>
        <td>${p.Fecha ?? p.fecha ?? '—'}</td>
        <td>${p.metodo ?? p.Metodo ?? '—'}</td>
        <td><span class="badge ${estadoCls}">${estado}</span></td>
        <td style="color:var(--text-muted);font-size:12px">${factura}</td>
      </tr>`;
  }).join('');

  tabla.innerHTML = `
    <thead><tr><th>#</th><th>Concepto</th><th>Monto</th><th>Fecha</th><th>Método</th><th>Estado</th><th>Factura</th></tr></thead>
    <tbody>${filas}</tbody>`;
}


/* ── 8g. Función maestra ── */

/** Actualiza toda la UI con los datos actuales de state. */
function renderAll() {
  renderDashboard();
  renderMaterias();
  renderNotas();
  renderHorario();
  renderAsistencia();
  renderPagos();
}


/* ─── 9. ENLACE DE EVENTOS ───────────────────────────────── */

function bindEventos() {
  // Hamburguesa (sidebar móvil)
  document.getElementById('btn-menu')
    ?.addEventListener('click', abrirSidebar);

  // Cierre sidebar con el botón X
  document.getElementById('btn-sidebar-close')
    ?.addEventListener('click', cerrarSidebar);

  // Overlay oscuro
  document.getElementById('sidebar-overlay')
    ?.addEventListener('click', cerrarSidebar);

  // Navegación SPA
  document.querySelectorAll('[data-page]').forEach(item => {
    item.addEventListener('click', () => goTo(item.dataset.page));
  });

  // Cerrar sesión
  document.getElementById('btn-logout')
    ?.addEventListener('click', async () => {
      try { await apiFetch('auth', 'logout'); } catch { /* silencioso */ }
      localStorage.removeItem('user');
      window.location.href = '../index.html';
    });

  // Búsqueda en tiempo real (Materias)
  document.getElementById('buscar-materia')
    ?.addEventListener('input', () => renderMaterias());

  // Filtro de estado (Materias)
  document.getElementById('filtro-estado')
    ?.addEventListener('change', () => renderMaterias());
}


/* ─── 10. PUNTO DE ENTRADA ───────────────────────────────── */

/**
 * Inicializa el panel del estudiante.
 * Orden:
 *  1. Verificar sesión (localStorage → Estudiante)
 *  2. Cargar datos de la API en paralelo
 *  3. Renderizar UI
 *  4. Enlazar eventos del DOM
 *  5. Iniciar reloj
 *  6. Navegar a la sección inicial
 */
async function init() {
  state.user = getUsuarioLocal();

  if (!state.user) {
    mostrarToast('Sesión no válida. Redirigiendo…', 'error');
    setTimeout(() => { window.location.href = '../index.html'; }, 1500);
    return;
  }

  // Verificar rol
  if (state.user.rol?.toLowerCase() !== 'estudiante' && state.user.Rol?.toLowerCase() !== 'estudiante') {
    mostrarToast('Acceso denegado para este rol.', 'error');
    setTimeout(() => { window.location.href = '../index.html'; }, 1500);
    return;
  }

  await cargarTodo();
  renderAll();
  bindEventos();
  iniciarReloj();
  goTo('dashboard');
}

document.addEventListener('DOMContentLoaded', init);