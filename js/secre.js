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
//funcion para inscribir estudiante al presionar el boton de inscribir
// Guarda una inscripcion nueva en el backend.
// Valida todos los campos del modal antes de enviar.
// Crea el estudiante y la inscripcion en una sola operacion.
// Refresca estudiantes e inscripciones en el estado y en la UI al finalizar.
async function saveInscription() {
  const name     = document.getElementById('i-name').value.trim();
  const email    = document.getElementById('i-email').value.trim();
  const ci       = document.getElementById('i-ci').value.trim();
  const password = document.getElementById('i-pass').value.trim();
  const courseId = document.getElementById('i-course').value;
  const date     = document.getElementById('i-date').value;
  const celular  = document.getElementById('i-celular')?.value.trim() || '';
  const status   = document.getElementById('i-status').value;

  // Valida cada campo y marca visualmente los que esten vacios o invalidos.
  const emailValido = /^\S+@\S+\.\S+$/.test(email);
  document.getElementById('i-name').parentElement.classList.toggle('has-error', !name);
  document.getElementById('i-email').parentElement.classList.toggle('has-error', !email || !emailValido);
  document.getElementById('i-ci').parentElement.classList.toggle('has-error', !ci);
  document.getElementById('i-pass').parentElement.classList.toggle('has-error', !password);

  if (!name || !email || !emailValido || !ci || !password || !courseId || !date) {
    toast('Complete todos los campos obligatorios.', 'error');
    return;
  }

  try {
    const payload = { name, email, ci, password, courseId, date, status, celular };
    const result  = await apiFetch('inscriptions', 'save', payload);

    // El backend debe devolver el estudiante y la inscripcion creados.
    if (!result || !result.student || !result.inscription) {
      throw new Error('Respuesta invalida del servidor');
    }

    // Refresca estudiantes e inscripciones en paralelo.
    const [students, inscriptions] = await Promise.all([
      apiFetch('students'),
      apiFetch('inscriptions')
    ]);
    if (Array.isArray(students))     state.students     = students;
    if (Array.isArray(inscriptions)) state.inscriptions = inscriptions;

    closeModal('modal-inscription');
    renderStudents();
    renderInscriptions();
    renderDashboard();
    toast('Estudiante inscrito correctamente', 'success');
  } catch (error) {
    toast(error?.message || 'Ocurrio un error al guardar la inscripcion', 'error');
  }
}

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
    const updated = await apiFetch('subjects');
    if (Array.isArray(updated)) state.subjects = updated;
    closeModal('modal-subject'); renderSubjects();
    toast(id ? 'Materia actualizada' : 'Materia registrada', 'success');
  } catch (e) { toast(`Error: ${e.message}`, 'error'); }
}

// ── Cursos ─────────────────────────────────────────────────
async function deleteCourse(id) {
  const c = state.courses.find(x => String(x.id) === String(id));
  if (!c) { toast('Curso no encontrado', 'error'); return; }
  confirmDelete(`¿Eliminar el curso "${c.name}"?`, async () => {
    try {
      await apiFetch('courses', 'delete', { id });
      state.courses = state.courses.filter(x => String(x.id) !== String(id));
      renderCourses(); updateDashboard(); toast('Curso eliminado', 'error');
    } catch (e) { toast(`Error: ${e.message}`, 'error'); }
  });
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
// ── Pagos ──────────────────────────────────────────────────
async function markPaid(id) {
  const p = state.payments.find(x => String(x.id) === String(id));
  if (!p) return;
  p.status = 'Pagado';
  p.date   = new Date().toLocaleDateString('es-BO');
  try {
    await apiFetch('payments', 'save', {
      id: p.id, studentId: p.studentId, concept: p.concept,
      amount: p.amount, method: p.method,
      date: new Date().toISOString().split('T')[0], status: 'Pagado'
    });
  } catch (e) { console.warn('markPaid API error:', e); }
  renderPayments(); updateDashboard(); toast('Pago confirmado', 'success');
}

async function deletePayment(id) {
  const p = state.payments.find(x => String(x.id) === String(id));
  if (!p) { toast('Pago no encontrado', 'error'); return; }
  confirmDelete(`¿Eliminar el pago de "${p.student}"?`, async () => {
    try {
      await apiFetch('payments', 'delete', { id });
      state.payments = state.payments.filter(x => String(x.id) !== String(id));
      renderPayments(); updateDashboard(); toast('Pago eliminado', 'error');
    } catch (e) { toast(`Error: ${e.message}`, 'error'); }
  });
}

async function savePayment() {
  const studentId = document.getElementById('p-student').value;
  const amount    = parseFloat(document.getElementById('p-amount').value);
  if (!studentId) { toast('Seleccione un estudiante', 'error'); return; }
  if (!amount)    { toast('Ingrese un monto válido',   'error'); return; }
  const id      = document.getElementById('p-id').value;
  const dateVal = document.getElementById('p-date').value;
  const payload = {
    studentId, amount,
    method:  document.getElementById('p-method').value,
    date:    dateVal || new Date().toISOString().split('T')[0],
    concept: document.getElementById('p-concept').value.trim() || 'Pago general',
    status:  document.getElementById('p-status').value
  };
  if (id) payload.id = id;
  try {
    await apiFetch('payments', 'save', payload);
    const updated = await apiFetch('payments');
    if (Array.isArray(updated)) state.payments = updated;
    closeModal('modal-payment'); renderPayments(); updateDashboard();
    toast(id ? 'Pago actualizado' : 'Pago registrado', 'success');
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