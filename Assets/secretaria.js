function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

// Cambia la sección activa en el panel de secretaría.
function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  if (el) el.classList.add('active');
  else {
    const current = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (current) current.classList.add('active');
  }
  closeSidebar();
  if (page === 'dashboard') renderDashboard();
  if (page === 'students') renderStudents();
  if (page === 'teachers') renderTeachers();
  if (page === 'subjects') renderSubjects();
  if (page === 'courses') renderCourses();
  if (page === 'schedule') renderScheduleList();
  if (page === 'grades') renderGrades();
  if (page === 'attendance') renderAttendance();
  if (page === 'payments') renderPayments();
  if (page === 'inscriptions') renderInscriptions();
  if (page === 'users') renderUsers();
}

function updateClock() {
  const now = new Date();
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  document.getElementById('header-clock').textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} — ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function toast(msg, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const item = document.createElement('div');
  item.className = 'toast-item' + (type ? ' ' + type : '');
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  item.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(item);
  setTimeout(() => {
    item.style.animation = 'toastOut .25s ease forwards';
    setTimeout(() => item.remove(), 250);
  }, 3000);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function badgeStatus(status) {
  const map = {
    Activo: 'badge-success',
    Activa: 'badge-success',
    Pagado: 'badge-success',
    Excelente: 'badge-success',
    Aprobado: 'badge-blue',
    Regular: 'badge-warning',
    Ausente: 'badge-danger',
    Vencido: 'badge-danger',
    Pendiente: 'badge-warning',
    Baja: 'badge-danger'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

function badgeStatus(status) {
  const map = {
    Activo: 'badge-success',
    Activa: 'badge-success',
    Pagado: 'badge-success',
    Excelente: 'badge-success',
    Aprobado: 'badge-blue',
    Regular: 'badge-warning',
    Ausente: 'badge-danger',
    Vencido: 'badge-danger',
    Pendiente: 'badge-warning',
    Baja: 'badge-danger'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

function emptyRow(cols) {
  return `<tr><td colspan="${cols}"><div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><p>No se encontraron registros</p></div></td></tr>`;
}

function actionBtns(editFn) {
  return `<div style="display:flex;gap:5px;justify-content:center"><button class="btn btn-sm btn-secondary btn-icon" title="Editar" onclick="${editFn}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></div>`;
}

// FIX: las opciones ahora usan id como value para evitar ambigüedades cuando hay nombres iguales.
function userOptions(selected = '') {
  return state.users.map(u => `<option value="${u.id}" ${String(u.id) === String(selected) ? 'selected' : ''}>${u.name || ''}</option>`).join('');
}
function teacherOptions(selected = '') {
  return state.teachers.map(t => `<option value="${t.id}" ${String(t.id) === String(selected) ? 'selected' : ''}>${t.name || ''}</option>`).join('');
}
function courseOptions(selected = '') {
  return state.courses.map(c => {
    const label = c.name || `${c.Nivel || ''} ${c.Paralelo || ''}`.trim();
    return `<option value="${c.id}" ${String(c.id) === String(selected) ? 'selected' : ''}>${label}</option>`;
  }).join('');
}
function subjectOptions(selected = '') {
  return state.subjects.map(s => `<option value="${s.id}" ${String(s.id) === String(selected) ? 'selected' : ''}>${s.name || ''}</option>`).join('');
}
function studentOptions(selected = '') {
  return state.students.map(s => `<option value="${s.id}" ${String(s.id) === String(selected) ? 'selected' : ''}>${s.name || ''}</option>`).join('');
}

function renderDashboard() {
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card blue"><div class="stat-icon blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="stat-val">${state.students.length}</div><div class="stat-label">Estudiantes</div></div>
    <div class="stat-card green"><div class="stat-icon green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5 0-8 2-8 4v1h16v-1c0-2-3-4-8-4z"/></svg></div><div class="stat-val">${state.teachers.length}</div><div class="stat-label">Docentes</div></div>
    <div class="stat-card amber"><div class="stat-icon amber"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2"/></svg></div><div class="stat-val">${state.courses.length}</div><div class="stat-label">Cursos</div></div>
    <div class="stat-card purple"><div class="stat-icon purple"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div><div class="stat-val">${state.schedules.length}</div><div class="stat-label">Horarios</div></div>
  `;
}

function renderStudents(q) {
  if (q === undefined) q = (document.querySelector('#page-students .search-box input') || {}).value || '';
  const course = (document.getElementById('stu-filter-course') || {}).value || '';
  const status = (document.getElementById('stu-filter-status') || {}).value || '';
  const filtered = state.students.filter(s => {
    const fullName = s.name || '';
    const matchCourse = !course || s.course === course;
    const matchStatus = !status || s.status === status;
    const matchText = !q || fullName.toLowerCase().includes(q.toLowerCase()) || (s.email || '').toLowerCase().includes(q.toLowerCase());
    return matchCourse && matchStatus && matchText;
  });
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(7); return; }
  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${s.id || '—'}</td>
      <td><div style="font-weight:500">${s.name || ''}</div></td>
      <td>${s.email || ''}</td>
      <td>${s.course || '—'}</td>
      <td>${s.turno || '—'}</td>
      <td>${badgeStatus(s.status || 'Activo')}</td>
      <td>${actionBtns(`editStudent('${s.id || ''}')`, `deleteStudent('${s.id || ''}')`)}</td>
    </tr>`).join('');
  updateStudentCourseFilter();
}

function updateStudentCourseFilter() {
  const sel = document.getElementById('stu-filter-course');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = ['<option value="">Todos los cursos</option>'].concat(state.courses.map(c => {
    const name = c.name || `${c.Nivel || ''} ${c.Paralelo || ''}`.trim();
    return `<option value="${name}" ${name === current ? 'selected' : ''}>${name}</option>`;
  })).join('');
}

function populateFormSelects() {
  const sCourse = document.getElementById('s-course');
  const iCourse = document.getElementById('i-course');
  const gStudent = document.getElementById('g-student');
  const gSubject = document.getElementById('g-subject');
  const gCourse = document.getElementById('g-course');
  const subTeacher = document.getElementById('sub-teacher');

  if (sCourse) sCourse.innerHTML = courseOptions();
  if (iCourse) iCourse.innerHTML = courseOptions();
  if (gStudent) gStudent.innerHTML = studentOptions();
  if (gSubject) gSubject.innerHTML = subjectOptions();
  if (gCourse) gCourse.innerHTML = courseOptions();
  if (subTeacher) subTeacher.innerHTML = teacherOptions();
}

// Funciones de abrir formularios
function openTeacherModal() { openModal('modal-teacher'); }
function openSubjectModal() { openModal('modal-subject'); }
function openPaymentModal() { populateFormSelects(); openModal('modal-payment'); }
function openCourseModal(id) {
  const modalTitle = document.getElementById('modal-course-title');
  const courseId = document.getElementById('c-id');
  const courseLevel = document.getElementById('c-level');
  const courseParallel = document.getElementById('c-parallel');
  const courseShift = document.getElementById('c-shift');

  courseId.value = id || '';
  courseParallel.parentElement.classList.remove('has-error');

  if (id) {
    const course = state.courses.find(c => String(c.id || c.ID_Curso) === String(id));
    if (course) {
      modalTitle.textContent = 'Editar Curso';
      courseLevel.value = course.level || course.Nivel || 'Primaria';
      courseParallel.value = course.Paralelo || course.parallel || '';
      courseShift.value = course.shift || course.Turno || 'Mañana';
    }
  } else {
    modalTitle.textContent = 'Nuevo Curso';
    courseLevel.value = 'Primaria';
    courseParallel.value = '';
    courseShift.value = 'Mañana';
  }
  openModal('modal-course');
}

function openScheduleModal() { openModal('modal-schedule'); }
function openGradeModal() { populateFormSelects(); openModal('modal-grade'); }
function openInscriptionModal() { populateFormSelects(); openModal('modal-inscription'); }

function renderTeachers(q) {
  if (q === undefined) q = (document.querySelector('#page-teachers .search-box input') || {}).value || '';
  const status = (document.getElementById('tch-filter-status') || {}).value || '';
  const filtered = state.teachers.filter(t => {
    const matchStatus = !status || t.status === status;
    const matchText = !q || `${t.name || ''}`.toLowerCase().includes(q.toLowerCase()) || (t.email || '').toLowerCase().includes(q.toLowerCase());
    return matchStatus && matchText;
  });
  const tbody = document.getElementById('teachers-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(7); return; }
  tbody.innerHTML = filtered.map(t => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${t.id || '—'}</td>
      <td><div style="font-weight:500">${t.name || ''}</div></td>
      <td>${t.specialty || '—'}</td>
      <td>${t.email || '—'}</td>
      <td>${t.turno || '—'}</td>
      <td>${badgeStatus(t.status || 'Activo')}</td>
      <td>${actionBtns(`editTeacher('${t.id || ''}')`, `deleteTeacher('${t.id || ''}')`)}</td>
    </tr>`).join('');
}

function renderSubjects(q) {
  if (q === undefined) q = (document.querySelector('#page-subjects .search-box input') || {}).value || '';
  const filtered = state.subjects.filter(s => !q || (s.name || '').toLowerCase().includes(q.toLowerCase()));
  const tbody = document.getElementById('subjects-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(7); return; }
  tbody.innerHTML = filtered.map((s, index) => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${index + 1}</td>
      <td>${s.name || ''}</td>
      <td>—</td><td>—</td><td>—</td><td>—</td>
      <td>${actionBtns(`editSubject('${s.id || ''}')`, `deleteSubject('${s.id || ''}')`)}</td>
    </tr>`).join('');
}

function renderCourses(q) {
  if (q === undefined) q = (document.querySelector('#page-courses .search-box input') || {}).value || '';
  const level = (document.getElementById('crs-filter-level') || {}).value || '';
  const filtered = state.courses.filter(c => {
    const name = c.name || `${c.Nivel || ''} ${c.Paralelo || ''}`.trim();
    const matchLevel = !level || c.Nivel === level || c.level === level;
    const matchText = !q || name.toLowerCase().includes(q.toLowerCase());
    return matchLevel && matchText;
  });
  const tbody = document.getElementById('courses-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(9); return; }
  tbody.innerHTML = filtered.map(c => {
    const name = c.name || `${c.Nivel || ''} ${c.Paralelo || ''}`.trim();
    return `
      <tr>
        <td style="font-size:11px;color:var(--gray-400)">${c.id || c.ID_Curso || '—'}</td>
        <td><div style="font-weight:500">${name}</div></td>
        <td>${c.Nivel || c.level || ''}</td>
        <td>—</td><td>—</td>
        <td>${c.students || '—'}</td>
        <td>${c.Turno || c.shift || '—'}</td>
        <td>—</td>
        <td>${actionBtns(`editCourse('${c.id || c.ID_Curso || ''}')`, `deleteCourse('${c.id || c.ID_Curso || ''}')`)}</td>
      </tr>`;
  }).join('');
}

function renderScheduleList(q) {
  if (q === undefined) q = (document.querySelector('#page-schedule .search-box input') || {}).value || '';
  const course = (document.getElementById('sch-filter-course') || {}).value || '';
  const day = (document.getElementById('sch-filter-day') || {}).value || '';
  const filtered = state.schedules.filter(item => {
    const matchCourse = !course || item.course === course;
    const matchDay = !day || item.day === day;
    const text = `${item.subject || ''} ${item.course || ''} ${item.teacher || ''}`;
    const matchText = !q || text.toLowerCase().includes(q.toLowerCase());
    return matchCourse && matchDay && matchText;
  });
  const tbody = document.getElementById('schedule-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(9); return; }
  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${item.id || '—'}</td>
      <td><div style="font-weight:500">${item.course || '—'}</div></td>
      <td><span class="badge badge-blue">${item.day || '—'}</span></td>
      <td>${item.start || '—'}</td>
      <td>${item.end || '—'}</td>
      <td><div style="font-weight:500">${item.subject || '—'}</div></td>
      <td>${item.teacher || '—'}</td>
      <td>${item.room || '—'}</td>
      <td>${actionBtns(`editSchedule('${item.id || ''}')`, `deleteSchedule('${item.id || ''}')`)}</td>
    </tr>`).join('');
}

function renderGrades(q) {
  if (q === undefined) q = (document.querySelector('#page-grades .search-box input') || {}).value || '';
  const course = (document.getElementById('grd-course') || {}).value || '';
  const subject = (document.getElementById('grd-subject') || {}).value || '';
  const filtered = state.grades.filter(entry => {
    const matchCourse = !course || entry.course === course;
    const matchSubject = !subject || entry.subject === subject;
    const matchText = !q || `${entry.student || ''} ${entry.course || ''} ${entry.subject || ''}`.toLowerCase().includes(q.toLowerCase());
    return matchCourse && matchSubject && matchText;
  });
  const tbody = document.getElementById('grades-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(4); return; }
  tbody.innerHTML = filtered.map(entry => {
    const nota = entry.nota || 0;
    const cls = nota >= 90 ? 'badge-success' : nota >= 70 ? 'badge-blue' : nota >= 51 ? 'badge-warning' : 'badge-danger';
    const st = nota >= 90 ? 'Excelente' : nota >= 70 ? 'Aprobado' : nota >= 51 ? 'Regular' : 'Reprobado';
    return `
      <tr>
        <td style="font-weight:500">${entry.student || '—'}</td>
        <td>${entry.subject || '—'}</td>
        <td><strong>${nota}</strong></td>
        <td><span class="badge ${cls}">${st}</span></td>
        <td>${actionBtns(`editGrade('${entry.id || ''}')`, `deleteGrade('${entry.id || ''}')`)}</td>
      </tr>`;
  }).join('');
}

function renderAttendance() {
  const selectedCourse = (document.getElementById('att-course') || {}).value || '';
  const rows = state.attendance.filter(rec => !selectedCourse || rec.course === selectedCourse);
  const body = document.getElementById('att-list');
  if (!body) return;
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="3"><div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><p>No hay registros de asistencia</p></div></td></tr>`;
    return;
  }
  body.innerHTML = `<table><thead><tr><th>Estudiante</th><th>Curso</th><th>Estado</th></tr></thead><tbody>${rows.map(rec => `
    <tr><td>${rec.student}</td><td>${rec.course}</td><td>${badgeStatus(rec.status)}</td></tr>
  `).join('')}</tbody></table>`;
}

function renderPayments(q) {
  const status = (document.getElementById('pay-filter-status') || {}).value || '';
  const filtered = state.payments.filter(p => !status || p.Estado === status || p.status === status);
  const tbody = document.getElementById('payments-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(7); return; }
  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${p.id || '—'}</td>
      <td>${p.student || '—'}</td>
      <td>${p.concept || p.Concepto || '—'}</td>
      <td>${p.amount || p.Monto || '—'}</td>
      <td>${badgeStatus(p.status || p.Estado || 'Pendiente')}</td>
      <td>${p.date || p.Fecha || '—'}</td>
      <td>${actionBtns(`editPayment('${p.id || ''}')`, `deletePayment('${p.id || ''}')`)}</td>
    </tr>`).join('');
}

function renderInscriptions(q) {
  const status = (document.getElementById('ins-filter-status') || {}).value || '';
  const filtered = state.inscriptions.filter(i => !status || i.Estado === status || i.status === status);
  const tbody = document.getElementById('inscriptions-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(7); return; }
  tbody.innerHTML = filtered.map(i => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${i.id || i.ID_inscripcion || '—'}</td>
      <td>${i.student || '—'}</td>
      <td>${i.course || '—'}</td>
      <td>${i.level || '—'}</td>
      <td>${i.Fecha || i.date || '—'}</td>
      <td>${badgeStatus(i.Estado || i.status || 'Activa')}</td>
      <td>${actionBtns(`editInscription('${i.id || i.ID_inscripcion || ''}')`, `deleteInscription('${i.id || i.ID_inscripcion || ''}')`)}</td>
    </tr>`).join('');
}

function renderUsers(q) {
  if (q === undefined) q = (document.querySelector('#page-users .search-box input') || {}).value || '';
  const role = (document.getElementById('usr-filter-role') || {}).value || '';
  const status = (document.getElementById('usr-filter-status') || {}).value || '';
  const filtered = state.users.filter(u => {
    const matchRole = !role || u.role === role;
    const matchStatus = !status || u.status === status;
    const matchText = !q || (u.name || '').toLowerCase().includes(q.toLowerCase()) || (u.email || '').toLowerCase().includes(q.toLowerCase());
    return matchRole && matchStatus && matchText;
  });
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  if (!filtered.length) { tbody.innerHTML = emptyRow(7); return; }
  tbody.innerHTML = filtered.map(u => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${u.id || '—'}</td>
      <td><div style="font-weight:500">${u.name || ''}</div></td>
      <td>${u.email || ''}</td>
      <td>${u.role || ''}</td>
      <td>${u.lastAccess || '—'}</td>
      <td>${badgeStatus(u.status || 'Activo')}</td>
      <td>${actionBtns(`editUser('${u.id || ''}')`, `deleteUser('${u.id || ''}')`)}</td>
    </tr>`).join('');
}

function initSecretaria() {
  updateClock();
  setInterval(updateClock, 60000);
  loadInitialData().then(() => {
    populateFormSelects();
    renderDashboard();
    renderStudents();
    renderTeachers();
    renderSubjects();
    renderCourses();
    renderScheduleList();
    renderGrades();
    renderAttendance();
    renderPayments();
    renderInscriptions();
    renderUsers();
    goTo('dashboard');
  });
}