// URL base del backend PHP. Todas las llamadas AJAX usan este archivo.
const API_URL = window.location.pathname.includes('/views/')? '../backend/API/api.php': 'backend/API/api.php';

// Estado global de la aplicación. Aquí se guarda la información cargada desde la API.
const state = {
  students: [],
  teachers: [],
  subjects: [],
  courses: [],
  grades: [],
  payments: [],
  inscriptions: [],
  users: [],
  attendance: [],
  schedules: [],
  nextId: 100
};

// ── Capa de transporte ─────────────────────────────────────
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
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!response.ok) {
    const message = data && typeof data === 'object'
      ? data.error || JSON.stringify(data)
      : data || response.statusText;
    throw new Error(`${message}`);
  }
  return data;
}

// ── Carga inicial ──────────────────────────────────────────
async function loadInitialData() {
  const resources = ['students','teachers','subjects','courses','schedule','users','inscriptions','payments','attendance','grades'];
  const results = await Promise.allSettled(resources.map(r => apiFetch(r)));
  const [students, teachers, subjects, courses, schedule, users, inscriptions, payments, attendance, grades] = results.map(r => r.status === 'fulfilled' ? r.value : null);
  if (Array.isArray(students))     state.students     = students;
  if (Array.isArray(teachers))     state.teachers     = teachers;
  if (Array.isArray(subjects))     state.subjects     = subjects;
  if (Array.isArray(courses))      state.courses      = courses;
  if (Array.isArray(schedule))     state.schedules    = schedule;
  if (Array.isArray(users))        state.users        = users;
  if (Array.isArray(inscriptions)) state.inscriptions = inscriptions;
  if (Array.isArray(payments))     state.payments     = payments;
  if (Array.isArray(attendance))   state.attendance   = attendance;
  if (Array.isArray(grades))       state.grades       = grades;
}

// ── Estudiantes ────────────────────────────────────────────
async function deleteStudent(id) {
  const s = state.students.find(x => String(x.id) === String(id));
  if (!s) { toast('Estudiante no encontrado', 'error'); return; }
  confirmDelete(`¿Eliminar al estudiante "${s.name}"? Esta acción no se puede deshacer.`, async () => {
    try {
      await apiFetch('students', 'delete', { id });
      state.students = state.students.filter(x => String(x.id) !== String(id));
      renderStudents(); updateDashboard(); toast('Estudiante eliminado', 'error');
    } catch (e) { toast(`Error: ${e.message}`, 'error'); }
  });
}

async function saveStudent() {
  const user     = document.getElementById('s-user').value.trim();
  const courseId = document.getElementById('s-course').value;
  const shift    = document.getElementById('s-shift').value;
  let ok = true;
  if (!user)     { document.getElementById('s-user').parentElement.classList.add('has-error');   ok = false; } else document.getElementById('s-user').parentElement.classList.remove('has-error');
  if (!courseId) { document.getElementById('s-course').parentElement.classList.add('has-error'); ok = false; } else document.getElementById('s-course').parentElement.classList.remove('has-error');
  if (!shift)    { document.getElementById('s-shift').parentElement.classList.add('has-error');  ok = false; } else document.getElementById('s-shift').parentElement.classList.remove('has-error');
  if (!ok) return;
  const id = document.getElementById('s-id').value;
  if (!id) { toast('Para crear un estudiante, use la sección Inscripciones', 'warning'); return; }
  try {
    await apiFetch('students', 'save', { id, name: user, courseId, shift });
    const updated = await apiFetch('students');
    if (Array.isArray(updated)) state.students = updated;
    closeModal('modal-student'); renderStudents(); updateDashboard(); toast('Estudiante actualizado', 'success');
  } catch (e) { toast(`Error: ${e.message}`, 'error'); }
}

// ── Docentes ───────────────────────────────────────────────
async function deleteTeacher(id) {
  const t = state.teachers.find(x => String(x.id) === String(id));
  if (!t) { toast('Docente no encontrado', 'error'); return; }
  confirmDelete(`¿Eliminar al docente "${t.name}"?`, async () => {
    try {
      await apiFetch('teachers', 'delete', { id });
      state.teachers = state.teachers.filter(x => String(x.id) !== String(id));
      renderTeachers(); updateDashboard(); toast('Docente eliminado', 'error');
    } catch (e) { toast(`Error: ${e.message}`, 'error'); }
  });
}

async function saveTeacher() {
  const user  = document.getElementById('t-user').value.trim();
  const spec  = document.getElementById('t-specialty').value.trim();
  const shift = document.getElementById('t-shift').value;
  const email = document.getElementById('t-email').value.trim();
  const role  = document.getElementById('t-role').value;
  const pass  = document.getElementById('t-pass').value.trim();
  const id    = document.getElementById('t-id').value;
  let ok = true;
  if (!user)                      { document.getElementById('t-user').parentElement.classList.add('has-error');      ok = false; } else document.getElementById('t-user').parentElement.classList.remove('has-error');
  if (!spec)                      { document.getElementById('t-specialty').parentElement.classList.add('has-error'); ok = false; } else document.getElementById('t-specialty').parentElement.classList.remove('has-error');
  if (!email || !email.includes('@')) { document.getElementById('t-email').parentElement.classList.add('has-error'); ok = false; } else document.getElementById('t-email').parentElement.classList.remove('has-error');
  if (!id && !pass)               { document.getElementById('t-pass').parentElement.classList.add('has-error');      ok = false; } else document.getElementById('t-pass').parentElement.classList.remove('has-error');
  if (!shift)                     { document.getElementById('t-shift').parentElement.classList.add('has-error');     ok = false; } else document.getElementById('t-shift').parentElement.classList.remove('has-error');
  if (!ok) return;
  try {
    const payload = { name: `Prof. ${user}`, specialty: spec, shift, email, role };
    if (id)   payload.id = id;
    if (pass) payload.password = pass;
    await apiFetch('teachers', 'save', payload);
    const updated = await apiFetch('teachers');
    if (Array.isArray(updated)) state.teachers = updated;
    closeModal('modal-teacher'); renderTeachers(); updateDashboard();
    toast(id ? 'Docente actualizado' : 'Docente registrado', 'success');
  } catch (e) { toast(`Error: ${e.message}`, 'error'); }
}

// ── Materias ───────────────────────────────────────────────
async function deleteSubject(id) {
  const s = state.subjects.find(x => String(x.id) === String(id));
  if (!s) { toast('Materia no encontrada', 'error'); return; }
  confirmDelete(`¿Eliminar la materia "${s.name}"?`, async () => {
    try {
      await apiFetch('subjects', 'delete', { id });
      state.subjects = state.subjects.filter(x => String(x.id) !== String(id));
      renderSubjects(); toast('Materia eliminada', 'error');
    } catch (e) { toast(`Error: ${e.message}`, 'error'); }
  });
}
async function saveSubject() {
  const name      = document.getElementById('sub-name').value.trim();
  const teacherId = document.getElementById('sub-teacher').value;
  let ok = true;
  if (!name)      { document.getElementById('sub-name').parentElement.classList.add('has-error');    ok = false; } else document.getElementById('sub-name').parentElement.classList.remove('has-error');
  if (!teacherId) { document.getElementById('sub-teacher').parentElement.classList.add('has-error'); ok = false; } else document.getElementById('sub-teacher').parentElement.classList.remove('has-error');
  if (!ok) return;
  const id = document.getElementById('sub-id').value;
  try {
    const payload = { name, teacherId: Number(teacherId) };
    if (id) payload.id = id;
    await apiFetch('subjects', 'save', payload);
    // Recarga subjects Y teachers juntos para garantizar sincronía
    const [updatedSubjects, updatedTeachers] = await Promise.all([
      apiFetch('subjects'),
      apiFetch('teachers')
    ]);
    if (Array.isArray(updatedSubjects)) state.subjects = updatedSubjects;
    if (Array.isArray(updatedTeachers)) state.teachers = updatedTeachers;
    closeModal('modal-subject');
    renderSubjects();
    toast(id ? 'Materia actualizada' : 'Materia registrada', 'success');
  } catch (e) { toast(`Error: ${e.message}`, 'error'); }
}

async function saveCourse() {
  const level    = document.getElementById('c-level').value;
  const parallel = document.getElementById('c-parallel').value.trim();
  const shift    = document.getElementById('c-shift').value;
  if (!parallel) { document.getElementById('c-parallel').parentElement.classList.add('has-error'); return; }
  document.getElementById('c-parallel').parentElement.classList.remove('has-error');
  const id = document.getElementById('c-id').value;
  try {
    const payload = { level, parallel, shift };
    if (id) payload.id = id;
    await apiFetch('courses', 'save', payload);
    const updated = await apiFetch('courses');
    if (Array.isArray(updated)) state.courses = updated;
    closeModal('modal-course'); renderCourses(); updateDashboard();
    toast(id ? 'Curso actualizado' : 'Curso registrado', 'success');
  } catch (e) { toast(`Error: ${e.message}`, 'error'); }
}

// ── Horarios ───────────────────────────────────────────────
async function deleteSchedule(id) {
  const s = state.schedules.find(x => String(x.id) === String(id));
  if (!s) { toast('Clase no encontrada', 'error'); return; }
  confirmDelete(`¿Eliminar la clase de "${s.subject}" (${s.day} ${s.start})?`, async () => {
    try {
      await apiFetch('schedule', 'delete', { id });
      state.schedules = state.schedules.filter(x => String(x.id) !== String(id));
      renderScheduleList(); toast('Clase eliminada', 'error');
    } catch (e) { toast(`Error: ${e.message}`, 'error'); }
  });
}

async function saveSchedule() {
  const start = document.getElementById('sch-start').value;
  const end   = document.getElementById('sch-end').value;
  if (!start || !end)  { toast('Ingrese hora inicio y fin', 'error'); return; }
  if (start >= end)    { toast('La hora de inicio debe ser menor a la de fin', 'error'); return; }
  const id        = document.getElementById('sch-id').value;
  const courseId  = document.getElementById('sch-course-sel').value;
  const subjectId = document.getElementById('sch-subject-sel').value;
  const teacherId = document.getElementById('sch-teacher-sel').value;
  const day       = document.getElementById('sch-day').value;
  const room      = document.getElementById('sch-room')?.value || '';
  if (!courseId || !subjectId || !teacherId) { toast('Complete todos los campos requeridos', 'error'); return; }
  try {
    const payload = { courseId, subjectId, teacherId, day, start, end, room };
    if (id) payload.id = id;
    await apiFetch('schedule', 'save', payload);
    const updated = await apiFetch('schedule');
    if (Array.isArray(updated)) state.schedules = updated;
    closeModal('modal-schedule'); renderScheduleList();
    toast(id ? 'Clase actualizada' : 'Clase registrada', 'success');
  } catch (e) { toast(`Error: ${e.message}`, 'error'); }
}
// ── Usuarios ───────────────────────────────────────────────
async function deleteUser(id) {
  const u = state.users.find(x => String(x.id) === String(id));
  if (!u) { toast('Usuario no encontrado', 'error'); return; }
  confirmDelete(`¿Eliminar al usuario "${u.name}"?`, async () => {
    try {
      await apiFetch('users', 'delete', { id });
      state.users = state.users.filter(x => String(x.id) !== String(id));
      renderUsers(); updateDashboard(); toast('Usuario eliminado', 'error');
    } catch (e) { toast(`Error: ${e.message}`, 'error'); }
  });
}

async function saveUser() {
  const name     = document.getElementById('u-name').value.trim();
  const email    = document.getElementById('u-email').value.trim();
  const password = document.getElementById('u-pass').value.trim();
  const id       = document.getElementById('u-id').value;
  let ok = true;
  if (!name)                        { document.getElementById('u-name').parentElement.classList.add('has-error');  ok = false; } else document.getElementById('u-name').parentElement.classList.remove('has-error');
  if (!email || !email.includes('@')) { document.getElementById('u-email').parentElement.classList.add('has-error'); ok = false; } else document.getElementById('u-email').parentElement.classList.remove('has-error');
  if (!id && !password)             { document.getElementById('u-pass').parentElement.classList.add('has-error');  ok = false; } else document.getElementById('u-pass').parentElement.classList.remove('has-error');
  if (!ok) return;
  try {
    const payload = { name, email, role: document.getElementById('u-role').value };
    if (id)       payload.id       = id;
    if (password) payload.password = password;
    await apiFetch('users', 'save', payload);
    const updated = await apiFetch('users');
    if (Array.isArray(updated)) state.users = updated;
    closeModal('modal-user'); renderUsers(); updateDashboard();
    toast(id ? 'Usuario actualizado' : 'Usuario creado', 'success');
  } catch (e) { toast(`Error: ${e.message}`, 'error'); }
}

// ── Init ───────────────────────────────────────────────────
async function initApp() {
  await loadInitialData();
  renderStudents(); renderTeachers(); renderSubjects(); renderCourses();
  renderUsers(); renderScheduleList(); updateDashboard();
}

if (typeof refreshCaptcha === 'function') refreshCaptcha();
initApp();