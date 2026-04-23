const API_URL = window.location.pathname.includes('/views/') ? '../backend/API/api.php' : 'backend/API/api.php';

// Estado global de la aplicación de secretaría.
// Aquí se cargan los datos desde el backend para usar en todas las secciones.
const state = {
  students: [],
  teachers: [],
  subjects: [],
  courses: [],
  schedules: [],
  users: [],
  payments: [],
  inscriptions: [],
  attendance: [],
  grades: []
};

// Función genérica para llamar al backend PHP desde el panel de secretaría.
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
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!response.ok) {
    const message = data && typeof data === 'object' ? data.error || JSON.stringify(data) : data || response.statusText;
    throw new Error(`API request failed: ${response.status} - ${message}`);
  }
  return data;
}

// FIX: usa Promise.allSettled para que un recurso fallido no afecte a los demás.
// FIX: se eliminó la condición && x.length — un arreglo vacío de la API es una respuesta válida.
// Carga inicial de todos los recursos desde el backend.
// Si alguno falla, los demás siguen cargando gracias a Promise.allSettled.
async function loadInitialData() {
  const resources = ['students','teachers','subjects','courses','schedule','users','payments','inscriptions','attendance','grades'];
  const results = await Promise.allSettled(resources.map(r => apiFetch(r)));
  const [students, teachers, subjects, courses, schedules, users, payments, inscriptions, attendance, grades] = results.map(r => r.status === 'fulfilled' ? r.value : null);
  if (Array.isArray(students))     state.students     = students;
  if (Array.isArray(teachers))     state.teachers     = teachers;
  if (Array.isArray(subjects))     state.subjects     = subjects;
  if (Array.isArray(courses))      state.courses      = courses;
  if (Array.isArray(schedules))    state.schedules    = schedules;
  if (Array.isArray(users))        state.users        = users;
  if (Array.isArray(payments))     state.payments     = payments;
  if (Array.isArray(inscriptions)) state.inscriptions = inscriptions;
  if (Array.isArray(attendance))   state.attendance   = attendance;
  if (Array.isArray(grades))       state.grades       = grades;
}

window.addEventListener('DOMContentLoaded', initSecretaria);

// ── Stub actions that are read-only for secretary ────────────────────────────
function editStudent(id) { toast('Edición de estudiante no implementada', 'warning'); }
function deleteStudent(id) { toast('Eliminación de estudiante no implementada', 'warning'); }
function editTeacher(id) { toast('Edición de docente no implementada', 'warning'); }
function deleteTeacher(id) { toast('Eliminación de docente no implementada', 'warning'); }
function editSubject(id) { toast('Edición de materia no implementada', 'warning'); }
function deleteSubject(id) { toast('Eliminación de materia no implementada', 'warning'); }
function editCourse(id) { openCourseModal(id); }
async function deleteCourse(id) {
  if (!id || !confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return;
  try {
    await apiFetch('courses', 'delete', { id });
    const updatedCourses = await apiFetch('courses');
    if (Array.isArray(updatedCourses)) state.courses = updatedCourses;
    renderCourses();
    renderDashboard();
    populateFormSelects();
    toast('Curso eliminado', 'error');
  } catch (error) {
    toast(`No se pudo eliminar el curso: ${error.message}`, 'error');
  }
}
function editSchedule(id) { toast('Edición de horario no implementada', 'warning'); }
function deleteSchedule(id) { toast('Eliminación de horario no implementada', 'warning'); }
function editGrade(id) { toast('Edición de nota no implementada', 'warning'); }
function deleteGrade(id) { toast('Eliminación de nota no implementada', 'warning'); }
function editPayment(id) { toast('Edición de pago no implementada', 'warning'); }
function deletePayment(id) { toast('Eliminación de pago no implementada', 'warning'); }
function editInscription(id) { toast('Edición de inscripción no implementada', 'warning'); }
function deleteInscription(id) { toast('Eliminación de inscripción no implementada', 'warning'); }
function editUser(id) { toast('Edición de usuario no implementada', 'warning'); }
function deleteUser(id) { toast('Eliminación de usuario no implementada', 'warning'); }

function saveStudent() { toast('Guardar estudiante no implementado', 'warning'); }
function saveTeacher() { toast('Guardar docente no implementado', 'warning'); }
function saveSubject() { toast('Guardar materia no implementado', 'warning'); }
async function saveCourse() {
  const id = document.getElementById('c-id').value;
  const level = document.getElementById('c-level').value.trim();
  const parallel = document.getElementById('c-parallel').value.trim();
  const shift = document.getElementById('c-shift').value.trim();
  const parallelEl = document.getElementById('c-parallel').parentElement;

  parallelEl.classList.toggle('has-error', !parallel);
  if (!level || !parallel || !shift) { toast('Complete todos los campos del curso.', 'error'); return; }

  try {
    const payload = { level, parallel, shift };
    if (id) payload.id = id;
    const result = await apiFetch('courses', 'save', payload);
    const course = result.course || result;
    if (!course || !course.id) { toast('No se pudo guardar el curso.', 'error'); return; }
    const updatedCourses = await apiFetch('courses');
    if (Array.isArray(updatedCourses)) state.courses = updatedCourses;
    closeModal('modal-course');
    renderCourses();
    renderDashboard();
    populateFormSelects();
    toast(id ? 'Curso actualizado' : 'Curso registrado', 'success');
  } catch (error) {
    toast(`Error guardando curso: ${error.message}`, 'error');
  }
}
function saveSchedule() { toast('Guardar horario no implementado', 'warning'); }
function saveGrade() { toast('Guardar nota no implementado', 'warning'); }
function savePayment() { toast('Guardar pago no implementado', 'warning'); }
async function saveInscription() {
  const name = document.getElementById('i-name').value.trim();
  const email = document.getElementById('i-email').value.trim();
  const password = document.getElementById('i-pass').value.trim();
  const courseId = document.getElementById('i-course').value;
  const date = document.getElementById('i-date').value;
  const status = document.getElementById('i-status').value;

  document.getElementById('i-name').parentElement.classList.toggle('has-error', !name);
  document.getElementById('i-email').parentElement.classList.toggle('has-error', !email || !/^\S+@\S+\.\S+$/.test(email));
  document.getElementById('i-pass').parentElement.classList.toggle('has-error', !password);

  if (!name || !email || !password || !courseId || !date) {
    toast('Complete todos los datos del estudiante y selección de curso.', 'error');
    return;
  }

  try {
    const payload = { name, email, password, courseId, date, status };
    const result = await apiFetch('inscriptions', 'save', payload);
    if (!result || !result.student || !result.inscription) throw new Error('Respuesta inválida del servidor');

    const [students, inscriptions] = await Promise.all([apiFetch('students'), apiFetch('inscriptions')]);
    if (Array.isArray(students)) state.students = students;
    if (Array.isArray(inscriptions)) state.inscriptions = inscriptions;

    closeModal('modal-inscription');
    renderStudents();
    renderInscriptions();
    renderDashboard();
    toast('Estudiante inscrito correctamente', 'success');
  } catch (error) {
    toast(error?.message || 'Ocurrió un error al guardar la inscripción', 'error');
  }
}
function saveUser() { toast('Guardar usuario no implementado', 'warning'); }
function sendNotification() { toast('Enviar notificación no implementado', 'warning'); }
function updateNotifyMsg() {}
function sendRecovery() { toast('Recuperar contraseña no implementado', 'warning'); }
function showReport() { toast('Reportes no implementado', 'warning'); }
function applyReportFilter() { toast('Filtro de reporte no implementado', 'warning'); }
function doLogout() { window.location.href = '../index.html'; }

async function saveCourse() {
  const id = document.getElementById('c-id').value;
  const level = document.getElementById('c-level').value.trim();
  const parallel = document.getElementById('c-parallel').value.trim();
  const shift = document.getElementById('c-shift').value.trim();
  const parallelEl = document.getElementById('c-parallel').parentElement;

  parallelEl.classList.toggle('has-error', !parallel);
  if (!level || !parallel || !shift) { toast('Complete todos los campos del curso.', 'error'); return; }

  try {
    const payload = { level, parallel, shift };
    if (id) payload.id = id;
    const result = await apiFetch('courses', 'save', payload);
    const course = result.course || result;
    if (!course || !course.id) { toast('No se pudo guardar el curso.', 'error'); return; }
    const updatedCourses = await apiFetch('courses');
    if (Array.isArray(updatedCourses)) state.courses = updatedCourses;
    closeModal('modal-course');
    renderCourses();
    renderDashboard();
    populateFormSelects();
    toast(id ? 'Curso actualizado' : 'Curso registrado', 'success');
  } catch (error) {
    toast(`Error guardando curso: ${error.message}`, 'error');}
}