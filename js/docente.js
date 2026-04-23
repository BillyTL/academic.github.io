const API_URL = window.location.pathname.includes('/views/') ? '../backend/API/api.php' : 'backend/API/api.php';

const state = {
  currentTeacherId: 'T-101',
  teachers: [],
  courses: [],
  students: [],
  schedules: [],
  grades: [
    { id: 'G-101', student: 'Ana López', course: '2° A', subject: 'Matemáticas', exam1: 78, exam2: 84, task: 90, participation: 88, period: '1er Trimestre', status: 'Aprobado' },
    { id: 'G-102', student: 'Bruno Castillo', course: '2° A', subject: 'Matemáticas', exam1: 68, exam2: 72, task: 80, participation: 76, period: '1er Trimestre', status: 'Regular' },
    { id: 'G-103', student: 'María Suárez', course: '4° A', subject: 'Matemáticas', exam1: 92, exam2: 95, task: 94, participation: 90, period: '1er Trimestre', status: 'Excelente' },
    { id: 'G-104', student: 'Luis Paredes', course: '4° A', subject: 'Matemáticas', exam1: 60, exam2: 64, task: 70, participation: 68, period: '1er Trimestre', status: 'Aprobado' },
    { id: 'G-105', student: 'Carla Rojas', course: '3° B', subject: 'Matemáticas', exam1: 85, exam2: 80, task: 86, participation: 88, period: '1er Trimestre', status: 'Aprobado' },
    { id: 'G-106', student: 'Diego Chávez', course: '3° B', subject: 'Matemáticas', exam1: 74, exam2: 78, task: 72, participation: 80, period: '1er Trimestre', status: 'Aprobado' }
  ],
  attendance: [
    { id: 'A-101', date: '2026-04-13', student: 'Ana López', course: '2° A', status: 'Presente' },
    { id: 'A-102', date: '2026-04-13', student: 'Bruno Castillo', course: '2° A', status: 'Ausente' },
    { id: 'A-103', date: '2026-04-13', student: 'María Suárez', course: '4° A', status: 'Presente' },
    { id: 'A-104', date: '2026-04-13', student: 'Luis Paredes', course: '4° A', status: 'Tardanza' },
    { id: 'A-105', date: '2026-04-13', student: 'Carla Rojas', course: '3° B', status: 'Presente' },
    { id: 'A-106', date: '2026-04-13', student: 'Diego Chávez', course: '3° B', status: 'Presente' }
  ]
};

// Función genérica para llamar al backend PHP.
// resource: nombre del recurso.
// action: operación a ejecutar ('list', 'save', 'delete', ...).
// payload: datos enviados en POST cuando se necesita guardar o eliminar.
async function apiFetch(resource, action = 'list', payload = null) {
  const url = new URL(API_URL, window.location.href);
  url.searchParams.set('resource', resource);
  url.searchParams.set('action', action);
  const options = { method: payload ? 'POST' : 'GET', headers: {} };
  if (payload) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(payload);
  }
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return await response.json();
}

// Carga inicial de datos desde la API.
// Guarda los recursos en el estado global para usarlos en el panel.
async function loadInitialData() {
  try {
    const [students, teachers, courses, schedules] = await Promise.all([
      apiFetch('students'),
      apiFetch('teachers'),
      apiFetch('courses'),
      apiFetch('schedule')
    ]);
    if (Array.isArray(students)) state.students = students;
    if (Array.isArray(teachers)) state.teachers = teachers;
    if (Array.isArray(courses)) state.courses = courses;
    if (Array.isArray(schedules)) state.schedules = schedules;
    if (!state.teachers.find(t => t.id === state.currentTeacherId) && state.teachers.length) {
      state.currentTeacherId = state.teachers[0].id;
    }
  } catch (error) {
    console.warn('API initial load failed:', error);
  }
}

const dayOrder = {Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sabado: 6};
const teacherName = () => state.teachers.find(t => t.id === state.currentTeacherId)?.name || 'Docente';

function getTeacherCourses() {
  const teacher = state.teachers.find(t => t.id === state.currentTeacherId);
  if (teacher && Array.isArray(teacher.courses) && teacher.courses.length) {
    return teacher.courses;
  }
  return [...new Set(state.schedules.filter(item => item.teacher === teacherName()).map(item => item.course))];
}

// Inicializa la interfaz del docente cuando se carga la página.
async function initDocente() {
  updateClock();
  setInterval(updateClock, 60000);
  await loadInitialData();
  renderUserHeader();
  updateCourseLists();
  renderDashboard();
  renderStudents();
  renderScheduleList();
  renderGrades();
  renderAttendance();
  goTo('dashboard');
}

window.addEventListener('DOMContentLoaded', initDocente);

// Abre el menú lateral del panel docente.
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

// Cambia la sección visible en el contenido principal y marca el elemento activo del menú.
function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const headerTitle = document.getElementById('header-title');
  if (headerTitle) headerTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
  if (el) el.classList.add('active');
  else {
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');
  }
  closeSidebar();
  if (page === 'dashboard') renderDashboard();
  if (page === 'students') renderStudents();
  if (page === 'schedule') renderScheduleList();
  if (page === 'grades') renderGrades();
  if (page === 'attendance') renderAttendance();
}

function updateClock() {
  const now = new Date();
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  document.getElementById('header-clock').textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} — ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function toast(message, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const item = document.createElement('div');
  item.className = 'toast-item' + (type ? ' ' + type : '');
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  item.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(item);
  setTimeout(() => {
    item.style.animation = 'toastOut .25s ease forwards';
    setTimeout(() => item.remove(), 250);
  }, 3000);
}

function renderUserHeader() {
  const teacher = state.teachers.find(t => t.id === state.currentTeacherId);
  if (!teacher) return;
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');
  const avatar = document.getElementById('user-avatar');
  if (userName) userName.textContent = `Hola, ${teacher.name}`;
  if (userRole) userRole.textContent = 'Docente';
  if (avatar) avatar.textContent = teacher.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

function getTeacherCourses() {
  const teacher = state.teachers.find(t => t.id === state.currentTeacherId);
  return teacher ? teacher.courses : [];
}

function emptyRow(cols) {
  return `<tr><td colspan="${cols}"><div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><p>No se encontraron registros</p></div></td></tr>`;
}

function renderDashboard() {
  const teacherCourses = getTeacherCourses();
  const students = state.students.filter(s => teacherCourses.includes(s.course));
  const schedule = state.schedules.filter(s => s.teacher === teacherName());
  const activeStudents = students.filter(s => s.status === 'Activo').length;
  const upcoming = schedule.filter(s => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'].includes(s.day)).length;
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card blue"><div class="stat-icon blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="stat-val">${students.length}</div><div class="stat-label">Estudiantes</div><div class="stat-change">${activeStudents} activos</div></div>
    <div class="stat-card green"><div class="stat-icon green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5 0-8 2-8 4v1h16v-1c0-2-3-4-8-4z"/></svg></div><div class="stat-val">${schedule.length}</div><div class="stat-label">Clases</div><div class="stat-change">Próximas esta semana</div></div>
    <div class="stat-card amber"><div class="stat-icon amber"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2"/></svg></div><div class="stat-val">${teacherCourses.length}</div><div class="stat-label">Cursos asignados</div></div>
  `;
}

function updateCourseLists() {
  const courses = getTeacherCourses();
  const studentFilter = document.getElementById('stu-filter-course');
  const attendanceCourse = document.getElementById('att-course');
  const gradeCourse = document.getElementById('grd-course');
  const scheduleCourse = document.getElementById('sch-filter-course');
  const repCourse = document.getElementById('rep-course-filter');
  const options = ['<option value="">Todos los cursos</option>'].concat(courses.map(course => `<option>${course}</option>`)).join('');
  if (studentFilter) studentFilter.innerHTML = options;
  if (attendanceCourse) attendanceCourse.innerHTML = options;
  if (gradeCourse) gradeCourse.innerHTML = options;
  if (scheduleCourse) scheduleCourse.innerHTML = options;
  if (repCourse) repCourse.innerHTML = options;
}

function renderStudents(q) {
  const filterText = q === undefined ? (document.querySelector('#page-students .search-box input') || {}).value || '' : q;
  const filterCourse = (document.getElementById('stu-filter-course') || {}).value || '';
  const filterStatus = (document.getElementById('stu-filter-status') || {}).value || '';
  const courses = getTeacherCourses();
  const filtered = state.students.filter(student => {
    const matchCourse = courses.includes(student.course);
    const matchFilter = !filterCourse || student.course === filterCourse;
    const matchStatus = !filterStatus || student.status === filterStatus;
    const matchText = !filterText || `${student.name} ${student.course} ${student.ci}`.toLowerCase().includes(filterText.toLowerCase());
    return matchCourse && matchFilter && matchStatus && matchText;
  });
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;
  if (!filtered.length) {
    tbody.innerHTML = emptyRow(8);
    return;
  }
  tbody.innerHTML = filtered.map(student => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${student.id}</td>
      <td><div style="font-weight:500">${student.name}</div></td>
      <td>${student.ci}</td>
      <td>${calcAge(student.birth)}</td>
      <td><span class="badge badge-blue">${student.course}</span></td>
      <td>${student.phone || '—'}</td>
      <td><span class="badge ${student.status === 'Activo' ? 'badge-success' : 'badge-danger'}">${student.status}</span></td>
      <td>—</td>
    </tr>
  `).join('');
}

function calcAge(birth) {
  if (!birth) return '—';
  const dob = new Date(birth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function renderScheduleList(q) {
  const filterText = q === undefined ? (document.querySelector('#page-schedule .search-box input') || {}).value || '' : q;
  const filterCourse = (document.getElementById('sch-filter-course') || {}).value || '';
  const filterDay = (document.getElementById('sch-filter-day') || {}).value || '';
  const teacher = teacherName();
  const filtered = state.schedules.filter(item => {
    const isTeacherSchedule = item.teacher === teacher || getTeacherCourses().includes(item.course);
    const matchCourse = !filterCourse || item.course === filterCourse;
    const matchDay = !filterDay || item.day === filterDay;
    const matchText = !filterText || `${item.subject} ${item.course} ${item.teacher} ${item.room} ${item.day}`.toLowerCase().includes(filterText.toLowerCase());
    return isTeacherSchedule && matchCourse && matchDay && matchText;
  });
  filtered.sort((a, b) => (dayOrder[a.day] || 9) - (dayOrder[b.day] || 9) || a.start.localeCompare(b.start));
  const tbody = document.getElementById('schedule-tbody');
  if (!tbody) return;
  if (!filtered.length) {
    tbody.innerHTML = emptyRow(8);
    return;
  }
  tbody.innerHTML = filtered.map(item => `
    <tr>
      <td style="font-size:11px;color:var(--gray-400)">${item.id}</td>
      <td><div style="font-weight:500">${item.course}</div></td>
      <td><span class="badge badge-blue">${item.day}</span></td>
      <td>${item.start}</td>
      <td>${item.end}</td>
      <td><div style="font-weight:500">${item.subject}</div></td>
      <td>${item.teacher}</td>
      <td>—</td>
    </tr>
  `).join('');
}

function renderGrades(q) {
  const filterText = q === undefined ? (document.querySelector('#page-grades .search-box input') || {}).value || '' : q;
  const filterCourse = (document.getElementById('grd-course') || {}).value || '';
  const filterSubject = (document.getElementById('grd-subject') || {}).value || '';
  const filterPeriod = (document.getElementById('grd-period') || {}).value || '';
  const filterStatus = (document.getElementById('grd-status') || {}).value || '';
  const courses = getTeacherCourses();
  const filtered = state.grades.filter(entry => {
    const matchTeacherCourse = courses.includes(entry.course);
    const matchCourse = !filterCourse || entry.course === filterCourse;
    const matchSubject = !filterSubject || entry.subject === filterSubject;
    const matchPeriod = !filterPeriod || entry.period === filterPeriod;
    const matchStatus = !filterStatus || entry.status === filterStatus;
    const matchText = !filterText || `${entry.student} ${entry.course} ${entry.subject}`.toLowerCase().includes(filterText.toLowerCase());
    return matchTeacherCourse && matchCourse && matchSubject && matchPeriod && matchStatus && matchText;
  });
  const tbody = document.getElementById('grades-tbody');
  if (!tbody) return;
  if (!filtered.length) {
    tbody.innerHTML = emptyRow(9);
    return;
  }
  tbody.innerHTML = filtered.map(entry => {
    const average = Math.round((entry.exam1 + entry.exam2 + entry.task + entry.participation) / 4);
    return `
      <tr>
        <td style="font-weight:500">${entry.student}</td>
        <td>${entry.subject}</td>
        <td>${entry.exam1}</td>
        <td>${entry.exam2}</td>
        <td>${entry.task}</td>
        <td>${entry.participation}</td>
        <td>${average}</td>
        <td><span class="badge ${entry.status === 'Excelente' ? 'badge-success' : entry.status === 'Aprobado' ? 'badge-blue' : entry.status === 'Regular' ? 'badge-warning' : 'badge-danger'}">${entry.status}</span></td>
        <td><button class="btn btn-sm btn-secondary btn-icon" onclick="openGradeModal('${entry.id}')" title="Editar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></td>
      </tr>
    `;
  }).join('');
}

function openGradeModal(id) {
  const modal = document.getElementById('modal-grade');
  if (!modal) return;
  const title = document.getElementById('modal-grade-title');
  const grade = state.grades.find(g => g.id === id);
  if (grade) {
    title.textContent = 'Editar Nota';
    document.getElementById('g-id').value = grade.id;
    document.getElementById('g-student').value = grade.student;
    document.getElementById('g-subject').value = grade.subject;
    document.getElementById('g-e1').value = grade.exam1;
    document.getElementById('g-e2').value = grade.exam2;
    document.getElementById('g-task').value = grade.task;
    document.getElementById('g-part').value = grade.participation;
    document.getElementById('g-obs').value = grade.observations || '';
  } else {
    title.textContent = 'Registrar Nota';
    document.getElementById('g-id').value = '';
    document.getElementById('g-student').value = '';
    document.getElementById('g-subject').value = teacherName();
    document.getElementById('g-e1').value = '';
    document.getElementById('g-e2').value = '';
    document.getElementById('g-task').value = '';
    document.getElementById('g-part').value = '';
    document.getElementById('g-obs').value = '';
  }
  modal.classList.add('open');
}

function saveGrade() {
  const id = document.getElementById('g-id').value;
  const student = document.getElementById('g-student').value.trim();
  const subject = document.getElementById('g-subject').value.trim() || 'Matemáticas';
  const exam1 = Number(document.getElementById('g-e1').value) || 0;
  const exam2 = Number(document.getElementById('g-e2').value) || 0;
  const task = Number(document.getElementById('g-task').value) || 0;
  const participation = Number(document.getElementById('g-part').value) || 0;
  const average = Math.round((exam1 + exam2 + task + participation) / 4);
  const status = average >= 90 ? 'Excelente' : average >= 70 ? 'Aprobado' : average >= 60 ? 'Regular' : 'Reprobado';
  if (!student) {
    toast('Debe ingresar el nombre del estudiante', 'error');
    return;
  }
  if (id) {
    const grade = state.grades.find(g => g.id === id);
    if (grade) {
      grade.student = student;
      grade.subject = subject;
      grade.exam1 = exam1;
      grade.exam2 = exam2;
      grade.task = task;
      grade.participation = participation;
      grade.status = status;
    }
  } else {
    state.grades.push({ id: `G-${Date.now()}`, student, course: getTeacherCourses()[0] || 'Sin curso', subject, exam1, exam2, task, participation, period: '1er Trimestre', status });
  }
  document.getElementById('modal-grade').classList.remove('open');
  renderGrades();
  toast('Nota guardada', 'success');
}

function renderAttendance() {
  const selectedDate = (document.getElementById('att-date') || {}).value || new Date().toISOString().slice(0, 10);
  const selectedCourse = (document.getElementById('att-course') || {}).value || '';
  const teacherCourses = getTeacherCourses();
  const rows = state.students.filter(student => teacherCourses.includes(student.course) && (!selectedCourse || student.course === selectedCourse));
  const attendanceRows = rows.map(student => {
    const record = state.attendance.find(rec => rec.student === student.name && rec.course === student.course && rec.date === selectedDate);
    return { student, status: record ? record.status : 'Presente' };
  });
  const body = document.getElementById('att-list');
  if (!body) return;
  if (!attendanceRows.length) {
    body.innerHTML = '<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><p>No hay estudiantes asignados a este curso</p></div>';
    return;
  }
  body.innerHTML = `
    <table><thead><tr><th>Estudiante</th><th>Curso</th><th>Estado</th></tr></thead><tbody>${attendanceRows.map(row => `
      <tr>
        <td style="font-weight:500">${row.student.name}</td>
        <td>${row.student.course}</td>
        <td>
          <select onchange="updateAttendance('${row.student.name}','${row.student.course}','${selectedDate}', this.value)">
            <option value="Presente" ${row.status === 'Presente' ? 'selected' : ''}>Presente</option>
            <option value="Ausente" ${row.status === 'Ausente' ? 'selected' : ''}>Ausente</option>
            <option value="Tardanza" ${row.status === 'Tardanza' ? 'selected' : ''}>Tardanza</option>
          </select>
        </td>
      </tr>
    `).join('')}</tbody></table>`;
  renderAttendanceCounts(selectedDate, selectedCourse);
}

function updateAttendance(studentName, course, date, status) {
  const record = state.attendance.find(rec => rec.student === studentName && rec.course === course && rec.date === date);
  if (record) {
    record.status = status;
  } else {
    state.attendance.push({ id: `A-${Date.now()}`, date, student: studentName, course, status });
  }
  renderAttendanceCounts(date, course);
}

function renderAttendanceCounts(date, course) {
  const summary = state.attendance.filter(rec => rec.date === date && (!course || rec.course === course));
  const present = summary.filter(r => r.status === 'Presente').length;
  const absent = summary.filter(r => r.status === 'Ausente').length;
  const late = summary.filter(r => r.status === 'Tardanza').length;
  const cntP = document.getElementById('cnt-p');
  const cntA = document.getElementById('cnt-a');
  const cntL = document.getElementById('cnt-l');
  if (cntP) cntP.textContent = present;
  if (cntA) cntA.textContent = absent;
  if (cntL) cntL.textContent = late;
}

function saveAttendance() {
  toast('Asistencia guardada', 'success');
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

function notAvailable() {
  toast('Función disponible solo para administradores', 'warning');
}

function openScheduleModal() {
  notAvailable();
}

function saveSchedule() {
  notAvailable();
}

function openTeacherModal() { notAvailable(); }
function saveTeacher() { notAvailable(); }
function openSubjectModal() { notAvailable(); }
function openCourseModal() { notAvailable(); }
function openPaymentModal() { notAvailable(); }
function openInscriptionModal() { notAvailable(); }
function openUserModal() { notAvailable(); }
function saveStudent() { notAvailable(); }
function saveSubject() { notAvailable(); }
function saveCourse() { notAvailable(); }
function savePayment() { notAvailable(); }
function saveInscription() { notAvailable(); }
function saveUser() { notAvailable(); }
function sendNotification() { notAvailable(); }
function sendRecovery() { notAvailable(); }
function showReport() { notAvailable(); }
function applyReportFilter() { notAvailable(); }
function updateNotifyMsg() { }
function doLogout() { toast('Sesión cerrada', 'success'); window.location.href = '../index.html'; }
