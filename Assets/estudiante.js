/**
 * ============================================================
 *  estudiante.js — Módulo complementario del Panel del Estudiante
 *  Sistema Académico · academy_db · EduCore
 * ============================================================
 *  Este archivo complementa estu.js añadiendo:
 *   1. Alias de compatibilidad para funciones del HTML inline
 *   2. Módulo de búsqueda avanzada en materias
 *   3. Exportación/descarga de datos como CSV
 *   4. Formateo de datos relacionados al diagrama de BD
 *   5. Helpers de UI adicionales
 *
 *  Tablas de BD referenciadas (igual que estu.js):
 *   Estudiante, Inscripcion, Materia, Calificacion,
 *   Horario, Asistencia, Pago, Factura, Curso
 * ============================================================
 */

'use strict';


/* ─── 1. ALIAS DE COMPATIBILIDAD ────────────────────────── */
/*
 * Mantiene compatibilidad con llamadas onclick="" en el HTML legado.
 * En el nuevo HTML estas funciones no se usan desde atributos inline,
 * pero se dejan disponibles para versiones anteriores.
 */

/** @deprecated Usar goTo() de estu.js directamente. */
function cerrarSesion() {
  document.getElementById('btn-logout')?.click();
}

/** @deprecated sidebar manejado por estu.js */
function openSidebar()  { abrirSidebar?.(); }
function closeSidebar() { cerrarSidebar?.(); }


/* ─── 2. MÓDULO DE MATERIA MODAL ─────────────────────────── */
/*
 * Muestra un panel de detalle de materia inscrita.
 * BD relacionada: Materia + Calificacion + Horario
 */

/**
 * Abre el detalle de una materia (si existe el elemento #modal-materia).
 * @param {number|string} idMateria - Materia.Id_materia
 */
function verDetalleMateria(idMateria) {
  if (typeof state === 'undefined') return;

  const materia = state.materias.find(m =>
    String(m.Id_materia ?? m.id_materia) === String(idMateria)
  );
  if (!materia) return;

  const modal = document.getElementById('modal-materia');
  if (!modal) {
    // Sin modal en el HTML, mostrar en toast informativo
    const nombre = materia.Nombre ?? materia.nombre ?? 'Materia';
    mostrarToast?.(`Materia: ${nombre}`, 'info');
    return;
  }

  // Poblar modal con datos de la materia
  const campos = {
    'modal-materia-nombre':   materia.Nombre   ?? materia.nombre   ?? '—',
    'modal-materia-docente':  materia.Docente  ?? materia.docente  ?? '—',
    'modal-materia-creditos': materia.Creditos ?? materia.creditos ?? '—',
    'modal-materia-id':       materia.Id_materia ?? '—',
  };

  Object.entries(campos).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  modal.style.display = 'flex';
}

/** Cierra el modal de materia. */
function cerrarModalMateria() {
  const modal = document.getElementById('modal-materia');
  if (modal) modal.style.display = 'none';
}


/* ─── 3. EXPORTACIÓN CSV ──────────────────────────────────── */
/*
 * Genera archivos CSV descargables desde los datos de state.
 * Útil para que el estudiante exporte sus propios datos.
 */

/**
 * Descarga un CSV desde un array de objetos.
 * @param {Array<Object>} rows     - Filas de datos
 * @param {string[]}      columnas - Claves a incluir
 * @param {string}        filename - Nombre del archivo
 */
function descargarCSV(rows, columnas, filename) {
  if (!rows?.length) {
    mostrarToast?.('No hay datos para exportar.', 'info');
    return;
  }

  const header  = columnas.join(',');
  const cuerpo  = rows.map(r =>
    columnas.map(c => {
      const val = r[c] ?? '';
      // Escapar comillas y envolver si hay comas
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  ).join('\n');

  const blob = new Blob([`${header}\n${cuerpo}`], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href:     url,
    download: filename,
    style:    'display:none',
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  mostrarToast?.(`✓ ${filename} descargado.`, 'success');
}

/**
 * Exporta las materias inscritas del estudiante como CSV.
 * Campos: Materia.Id_materia, Materia.Nombre, Calificacion.Nota, estado
 */
function exportarMaterias() {
  if (typeof state === 'undefined') return;
  const notasMap = typeof buildNotasMap === 'function' ? buildNotasMap() : new Map();

  const rows = state.materias.map(m => {
    const notaObj  = notasMap.get(String(m.Id_materia));
    const notaVal  = m.nota ?? m.Nota ?? notaObj?.promedio ?? '';
    const NOTA_MIN = typeof NOTA_MIN_APROBACION !== 'undefined' ? NOTA_MIN_APROBACION : 51;
    const estado   = notaVal === '' ? 'Sin calificar'
      : Number(notaVal) >= NOTA_MIN ? 'Aprobado' : 'Reprobado';

    return {
      Id_materia: m.Id_materia ?? '',
      Nombre:     m.Nombre ?? m.nombre ?? '',
      Docente:    m.Docente ?? m.docente ?? '',
      Creditos:   m.Creditos ?? m.creditos ?? '',
      Nota:       notaVal,
      Estado:     estado,
    };
  });

  descargarCSV(rows, ['Id_materia','Nombre','Docente','Creditos','Nota','Estado'], 'materias.csv');
}

/**
 * Exporta el historial de pagos como CSV.
 * Campos: Pago.id_pago, Pago.fecha, Pago.metodo, Pago.monto, Pago.Estado, Factura.id_factura
 */
function exportarPagos() {
  if (typeof state === 'undefined') return;

  const rows = state.pagos.map(p => ({
    id_pago:    p.id_pago ?? p.ID_Pago ?? '',
    Concepto:   p.Concepto ?? p.concepto ?? '',
    Monto:      p.Monto ?? p.monto ?? '',
    Fecha:      p.Fecha ?? p.fecha ?? '',
    Metodo:     p.metodo ?? p.Metodo ?? '',
    Estado:     p.Estado ?? p.estado ?? '',
    id_factura: p.id_factura ?? p.Factura ?? '',
  }));

  descargarCSV(rows, ['id_pago','Concepto','Monto','Fecha','Metodo','Estado','id_factura'], 'pagos.csv');
}


/* ─── 4. FORMATEO Y HELPERS BD ───────────────────────────── */

/**
 * Formatea un monto en Bolivianos (Pago.monto → display).
 * @param {number|string} monto
 * @returns {string}
 */
function formatearBOB(monto) {
  const num = Number(monto);
  if (isNaN(num)) return String(monto);
  return num.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' });
}

/**
 * Formatea una fecha ISO a formato legible en español.
 * Útil para: Pago.fecha, Asistencia.fecha
 * @param {string} fechaStr - '2025-04-29' o '2025-04-29T12:00:00'
 * @returns {string}
 */
function formatearFecha(fechaStr) {
  if (!fechaStr) return '—';
  try {
    const d = new Date(fechaStr.includes('T') ? fechaStr : `${fechaStr}T00:00:00`);
    return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return fechaStr;
  }
}

/**
 * Devuelve el texto del turno formateado.
 * BD: Estudiante.turno ('Mañana','Tarde','Noche')
 * @param {string} turno
 * @returns {string}
 */
function labelTurno(turno) {
  const map = { mañana: '🌅 Mañana', tarde: '🌤 Tarde', noche: '🌙 Noche' };
  return map[(turno ?? '').toLowerCase()] ?? turno ?? '—';
}

/**
 * Construye un string de nombre completo del estudiante.
 * BD: Estudiante.nombre + Estudiante.apellido
 * @param {Object} user
 * @returns {string}
 */
function nombreCompleto(user) {
  const nom = user?.nombre ?? user?.Nombre ?? '';
  const ape = user?.apellido ?? user?.Apellido ?? '';
  return [nom, ape].filter(Boolean).join(' ') || 'Estudiante';
}


/* ─── 5. BÚSQUEDA AVANZADA ────────────────────────────────── */

/**
 * Filtra materias en tiempo real con debounce.
 * Usado como listener opcional (estu.js también tiene búsqueda).
 * @param {Event} e
 */
let _buscarTimer;
function onBuscarMateria(e) {
  clearTimeout(_buscarTimer);
  _buscarTimer = setTimeout(() => {
    if (typeof renderMaterias === 'function') renderMaterias();
  }, 220);
}


/* ─── 6. INICIALIZACIÓN DEL MÓDULO ──────────────────────── */

/**
 * Engancha los listeners de este módulo complementario
 * al DOM ya cargado (estu.js se encarga del init principal).
 */
function initComplementario() {
  // Búsqueda avanzada con debounce
  document.getElementById('buscar-materia')
    ?.addEventListener('input', onBuscarMateria);

  // Botones de exportación (si existen en el HTML)
  document.getElementById('btn-exportar-materias')
    ?.addEventListener('click', exportarMaterias);

  document.getElementById('btn-exportar-pagos')
    ?.addEventListener('click', exportarPagos);

  // Modal de materia: cerrar con ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarModalMateria();
  });

  // Cerrar modal al hacer click fuera
  document.getElementById('modal-materia')
    ?.addEventListener('click', e => {
      if (e.target.id === 'modal-materia') cerrarModalMateria();
    });
}

// Se engancha después de que estu.js haya inicializado el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Pequeño delay para que estu.js termine primero
  setTimeout(initComplementario, 50);
});