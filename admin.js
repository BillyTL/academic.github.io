// URL base del backend PHP. Todas las llamadas AJAX usan este archivo.
const API_URL = 'api.php';

const pageTitles = {
  dashboard: 'Dashboard',
  students: 'Estudiantes',
  teachers: 'Docentes',
  subjects: 'Materias',
  courses: 'Cursos',
  schedule: 'Horarios',
  grades: 'Notas',
  attendance: 'Asistencia',
  payments: 'Pagos',
  inscriptions: 'Inscripciones',
  users: 'Usuarios del Sistema',
  reports: 'Reportes'
};

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
  attendance: [],   // FIX: antes era {}, ahora es un arreglo para coincidir con la forma de la API
  schedules: [],
  nextId: 100
};

// Función de ayuda para llamar al backend.
// resource: nombre del recurso (por ejemplo 'students', 'teachers').
// action: operación que se solicita al backend ('list', 'save', 'delete', etc.).
// payload: datos adicionales enviados en POST cuando se necesita guardar o eliminar.
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
    throw new Error(`${message}`);
  }
  return data;
}

// Carga inicial de todos los recursos desde el backend.
// Guarda los datos en el estado global para que el resto de funciones pueda renderizarlos.
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

// ======= SIDEBAR =======
// Controla la apertura y cierre del menú lateral en dispositivos móviles o pantallas pequeñas.
function openSidebar(){
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}
 
// ======= NAVEGACION =======
// Cambia de página dentro del área principal y marca el elemento activo del menú.
function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const pageEl = document.getElementById('page-'+page);
  if (pageEl) pageEl.classList.add('active');
  const headerTitle = document.getElementById('header-title');
  if (headerTitle) headerTitle.textContent = pageTitles[page] || page;
  if(el) el.classList.add('active');
  else {
    const ni=document.querySelector(`.nav-item[data-page="${page}"]`);
    if(ni) ni.classList.add('active');
  }
  closeSidebar();
  if(page==='dashboard') updateDashboard();
}
 
// ======= CLOCK =======
function updateClock(){
  const now=new Date();
  const days=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  document.getElementById('header-clock').textContent=`${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} — ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}
 
// ======= TOAST =======
function toast(msg, type='') {
  const c=document.getElementById('toast-container');
  const el=document.createElement('div');
  el.className='toast-item'+(type?' '+type:'');
  const icons={success:'✓',error:'✕',warning:'⚠'};
  el.innerHTML=`<span>${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(()=>{el.style.animation='toastOut .25s ease forwards';setTimeout(()=>el.remove(),250);},3000);
}
 
// ======= MODAL =======
// Abre o cierra cualquiera de los modales definidos en el HTML.
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-bg').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');}));
 
// Muestra un modal de confirmación con mensaje y callback de eliminación.
function confirmDelete(msg, cb) {
  document.getElementById('confirm-msg').textContent=msg;
  document.getElementById('confirm-ok-btn').onclick=()=>{cb();closeModal('modal-confirm');};
  openModal('modal-confirm');
}
 
// ======= HELPERS =======
// Funciones de utilidades generales para generar ids, badges y HTML repetido.
function genId(prefix){return `${prefix}-${String(++state.nextId).padStart(3,'0')}`;}
function badgeStatus(s){
  const map={Activo:'badge-success',Activa:'badge-success',Pagado:'badge-success',Inactivo:'badge-danger',Baja:'badge-danger',Vencido:'badge-danger',Pendiente:'badge-warning',Suspendido:'badge-warning'};
  return `<span class="badge ${map[s]||'badge-gray'}">${s}</span>`;
}
function calcAge(birth){if(!birth)return '—';const d=new Date(birth),n=new Date();return n.getFullYear()-d.getFullYear()-(n<new Date(n.getFullYear(),d.getMonth(),d.getDate())?1:0);}
// FIX: usar id como value en las opciones para que los selects funcionen correctamente incluso si hay cursos con el mismo nombre.
function teacherOptions(sel){return state.teachers.map(t=>`<option value="${t.id}" ${String(t.id)===String(sel)?'selected':''}>${t.name}</option>`).join('');}
function courseOptions(sel){return state.courses.map(c=>`<option value="${c.id}" ${String(c.id)===String(sel)?'selected':''}>${c.name}</option>`).join('');}
function studentOptions(sel){return state.students.map(s=>`<option value="${s.id}" ${String(s.id)===String(sel)?'selected':''}>${s.name}</option>`).join('');}
function subjectOptions(sel){return state.subjects.map(s=>`<option value="${s.id}" ${String(s.id)===String(sel)?'selected':''}>${s.name}</option>`).join('');}
function actionBtns(editFn, delFn){
  return `<div style="display:flex;gap:5px">
    <button class="btn btn-sm btn-secondary btn-icon" title="Editar" onclick="${editFn}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </button>
    <button class="btn btn-sm btn-danger btn-icon" title="Eliminar" onclick="${delFn}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
    </button>
  </div>`;
}
function emptyRow(cols){return `<tr><td colspan="${cols}"><div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg><p>No se encontraron registros</p></div></td></tr>`;}
 
// ======= DASHBOARD =======
// Actualiza los indicadores y la vista principal del tablero con datos del estado.
function updateDashboard(){
  document.getElementById('nb-students').textContent=state.students.filter(s=>s.status==='Activo').length;
  document.getElementById('dash-stats').innerHTML=`
    <div class="stat-card blue"><div class="stat-icon blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="stat-val">${state.students.length}</div><div class="stat-label">Estudiantes</div><div class="stat-change">↑ ${state.students.filter(s=>s.status==='Activo').length} activos</div></div>
    <div class="stat-card green"><div class="stat-icon green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5 0-8 2-8 4v1h16v-1c0-2-3-4-8-4z"/></svg></div><div class="stat-val">${state.teachers.length}</div><div class="stat-label">Docentes</div><div class="stat-change">${state.teachers.filter(t=>t.status==='Activo').length} activos</div></div>
    <div class="stat-card amber"><div class="stat-icon amber"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div><div class="stat-val">${state.subjects.length}</div><div class="stat-label">Materias</div></div>
    <div class="stat-card purple"><div class="stat-icon purple"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div><div class="stat-val">${state.courses.length}</div><div class="stat-label">Cursos</div></div>
    <div class="stat-card teal"><div class="stat-icon teal"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="stat-val">${state.users.filter(u=>u.status==='Activo').length}</div><div class="stat-label">Usuarios Activos</div></div>
  `;
}
 
// ======= ESTUDIANTES =======
function getStudentFilters(){
  const q=(document.querySelector('#page-students .search-box input')||{}).value||'';
  const course=(document.getElementById('stu-filter-course')||{}).value||'';
  const status=(document.getElementById('stu-filter-status')||{}).value||'';
  return {q,course,status};
}
function renderStudents(q){
  if(q===undefined)q=getStudentFilters().q;
  const course=getStudentFilters().course, status=getStudentFilters().status;
  const filtered=state.students.filter(s=>{
    const inQ=!q||(s.name+s.ci+s.course).toLowerCase().includes(q.toLowerCase());
    const inC=!course||s.course===course;
    const inS=!status||s.status===status;
    return inQ&&inC&&inS;
  });
  const tbody=document.getElementById('students-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(8);return;}
  tbody.innerHTML=filtered.map(s=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${s.id}</td>
    <td><div style="font-weight:500">${s.name}</div></td>
    <td>${s.ci||'—'}</td>
    <td>${calcAge(s.birth)}</td>
    <td><span class="badge badge-blue">${s.course}</span></td>
    <td>${s.phone||'—'}</td>
    <td>${badgeStatus(s.status||'Activo')}</td>
    <td>${actionBtns(`editStudent('${s.id}')`,`deleteStudent('${s.id}')`)}</td>
  </tr>`).join('');
  updateCoursesFilterList();
}
function updateCoursesFilterList(){
  const sel=document.getElementById('stu-filter-course');
  if(!sel) return;
  const cur=sel.value;
  sel.innerHTML='<option value="">Todos los cursos</option>'+state.courses.map(c=>`<option ${c.name===cur?'selected':''}>${c.name}</option>`).join('');
}
function openStudentModal(id){
  document.getElementById('s-id').value=id||'';
  document.getElementById('s-course').innerHTML=courseOptions('');
  document.getElementById('s-user').innerHTML=studentOptions('');
  if(id){
    const s=state.students.find(x=>x.id===id);
    if(!s) return;
    document.getElementById('modal-student-title').textContent='Editar Estudiante';
    document.getElementById('s-user').value=s.name;
    document.getElementById('s-course').value=String(s.courseId||'');
    document.getElementById('s-shift').value=s.turno||s.shift||'Mañana';
  } else {
    document.getElementById('modal-student-title').textContent='Nuevo Estudiante';
    document.getElementById('s-user').value='';
    document.getElementById('s-course').value='';
    document.getElementById('s-shift').value='Mañana';
  }
  document.getElementById('s-user').parentElement.classList.remove('has-error');
  openModal('modal-student');
}
function editStudent(id){openStudentModal(id);}
// FIX: eliminar estudiante ahora llama a la API
async function deleteStudent(id){
  const s=state.students.find(x=>x.id===id);
  confirmDelete(`¿Eliminar al estudiante "${s.name}"? Esta acción no se puede deshacer.`, async ()=>{
    try {
      await apiFetch('students','delete',{id});
      state.students=state.students.filter(x=>x.id!==id);
      renderStudents();updateDashboard();toast('Estudiante eliminado','error');
    } catch(e){ toast(`Error: ${e.message}`,'error'); }
  });
}
// FIX: guardar estudiante ahora llama a la API (solo actualiza; la creación se hace desde Inscripciones)
async function saveStudent(){
  const user=document.getElementById('s-user').value.trim();
  const courseId=document.getElementById('s-course').value;
  const shift=document.getElementById('s-shift').value;
  let ok=true;
  if(!user){document.getElementById('s-user').parentElement.classList.add('has-error');ok=false;}else document.getElementById('s-user').parentElement.classList.remove('has-error');
  if(!courseId){document.getElementById('s-course').parentElement.classList.add('has-error');ok=false;}else document.getElementById('s-course').parentElement.classList.remove('has-error');
  if(!shift){document.getElementById('s-shift').parentElement.classList.add('has-error');ok=false;}else document.getElementById('s-shift').parentElement.classList.remove('has-error');
  if(!ok) return;
  const id=document.getElementById('s-id').value;
  if(!id){ toast('Para crear un estudiante, use la sección Inscripciones','warning'); return; }
  try {
    await apiFetch('students','save',{id,name:user,courseId,shift});
    const updated=await apiFetch('students');
    if(Array.isArray(updated)) state.students=updated;
    closeModal('modal-student');renderStudents();updateDashboard();toast('Estudiante actualizado','success');
  } catch(e){ toast(`Error: ${e.message}`,'error'); }
}
 
// ======= DOCENTES =======
function renderTeachers(q){
  if(q===undefined)q=(document.querySelector('#page-teachers .search-box input')||{}).value||'';
  const status=(document.getElementById('tch-filter-status')||{}).value||'';
  const filtered=state.teachers.filter(t=>{
    const inQ=!q||(t.name+t.specialty+(t.subjects||'')).toLowerCase().includes(q.toLowerCase());
    return inQ&&(!status||t.status===status);
  });
  const tbody=document.getElementById('teachers-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(8);return;}
  tbody.innerHTML=filtered.map(t=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${t.id}</td>
    <td><div style="font-weight:500">${t.name}</div></td>
    <td>${t.specialty}</td><td>${t.subjects||'—'}</td><td>${t.courses||'—'}</td>
    <td style="font-size:12px">${t.email}</td>
    <td>${badgeStatus(t.status||'Activo')}</td>
    <td>${actionBtns(`editTeacher('${t.id}')`,`deleteTeacher('${t.id}')`)}</td>
  </tr>`).join('');
}
function openTeacherModal(id){
  document.getElementById('t-id').value=id||'';
  if(id){
    const t=state.teachers.find(x=>x.id===id);if(!t)return;
    document.getElementById('modal-teacher-title').textContent='Editar Docente';
    document.getElementById('t-user').value=t.name.replace('Prof. ','');
    document.getElementById('t-specialty').value=t.specialty;
    document.getElementById('t-shift').value=t.turno||t.shift||'Mañana';
    document.getElementById('t-email').value=t.email||'';
    document.getElementById('t-role').value=t.role||'Docente';
    document.getElementById('t-pass').value='';
  } else {
    document.getElementById('modal-teacher-title').textContent='Nuevo Docente';
    document.getElementById('t-user').value='';
    document.getElementById('t-specialty').value='';
    document.getElementById('t-shift').value='Mañana';
    document.getElementById('t-email').value='';
    document.getElementById('t-role').value='Docente';
    document.getElementById('t-pass').value='';
  }
  ['t-user','t-specialty','t-email','t-pass','t-shift'].forEach(id=>document.getElementById(id).parentElement.classList.remove('has-error'));
  openModal('modal-teacher');
}
function editTeacher(id){openTeacherModal(id);}
// FIX: eliminar docente ahora llama a la API
async function deleteTeacher(id){
  const t=state.teachers.find(x=>x.id===id);
  confirmDelete(`¿Eliminar al docente "${t.name}"?`, async ()=>{
    try {
      await apiFetch('teachers','delete',{id});
      state.teachers=state.teachers.filter(x=>x.id!==id);
      renderTeachers();updateDashboard();toast('Docente eliminado','error');
    } catch(e){ toast(`Error: ${e.message}`,'error'); }
  });
}
// FIX: guardar docente ahora llama a la API
async function saveTeacher(){
  const user=document.getElementById('t-user').value.trim();
  const spec=document.getElementById('t-specialty').value.trim();
  const shift=document.getElementById('t-shift').value;
  const email=document.getElementById('t-email').value.trim();
  const role=document.getElementById('t-role').value;
  const pass=document.getElementById('t-pass').value.trim();
  const id=document.getElementById('t-id').value;
  let ok=true;
  if(!user){document.getElementById('t-user').parentElement.classList.add('has-error');ok=false;}else document.getElementById('t-user').parentElement.classList.remove('has-error');
  if(!spec){document.getElementById('t-specialty').parentElement.classList.add('has-error');ok=false;}else document.getElementById('t-specialty').parentElement.classList.remove('has-error');
  if(!email||!email.includes('@')){document.getElementById('t-email').parentElement.classList.add('has-error');ok=false;}else document.getElementById('t-email').parentElement.classList.remove('has-error');
  if(!id && !pass){document.getElementById('t-pass').parentElement.classList.add('has-error');ok=false;}else document.getElementById('t-pass').parentElement.classList.remove('has-error');
  if(!shift){document.getElementById('t-shift').parentElement.classList.add('has-error');ok=false;}else document.getElementById('t-shift').parentElement.classList.remove('has-error');
  if(!ok) return;
  try {
    const payload={name:`Prof. ${user}`,specialty:spec,shift,email,role};
    if(id) payload.id=id;
    if(pass) payload.password=pass;
    await apiFetch('teachers','save',payload);
    const updated=await apiFetch('teachers');
    if(Array.isArray(updated)) state.teachers=updated;
    closeModal('modal-teacher');renderTeachers();updateDashboard();
    toast(id?'Docente actualizado':'Docente registrado','success');
  } catch(e){ toast(`Error: ${e.message}`,'error'); }
}
 
// ======= MATERIAS =======
function renderSubjects(q){
  if(q===undefined)q=(document.querySelector('#page-subjects .search-box input')||{}).value||'';
  const filtered=state.subjects.filter(s=>!q||((s.name||'')+(s.teacher||'')).toLowerCase().includes(q.toLowerCase()));
  const tbody=document.getElementById('subjects-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(7);return;}
  tbody.innerHTML = filtered.map((s, index) => {
    const id = s.id || '';
    return `
            <tr>
              <td style="font-size:11px;color:var(--gray-400)">${index + 1}</td>
              <td>${s.name || ''}</td>
              <td>${id || '—'}</td>
              <td>—</td>
              <td>—</td>
              <td>${s.teacher || '—'}</td>
              <td>${actionBtns("editSubject('" + id + "')", "deleteSubject('" + id + "')")}</td>
            </tr>`;
  }).join('');
}
function openSubjectModal(id){
  document.getElementById('sub-id').value=id||'';
  document.getElementById('sub-teacher').innerHTML = '<option value="">Seleccione un docente</option>' + teacherOptions('');
  if(id){
    const s=state.subjects.find(x=>x.id===id);if(!s)return;
    document.getElementById('modal-subject-title').textContent='Editar Materia';
    document.getElementById('sub-name').value=s.name;
    document.getElementById('sub-teacher').value=String(s.teacherId||'');
  } else {
    document.getElementById('modal-subject-title').textContent='Nueva Materia';
    document.getElementById('sub-name').value='';
    document.getElementById('sub-teacher').value='';
  }
  document.getElementById('sub-name').parentElement.classList.remove('has-error');
  document.getElementById('sub-teacher').parentElement.classList.remove('has-error');
  openModal('modal-subject');
}
function editSubject(id){openSubjectModal(id);}
// FIX: eliminar materia ahora llama a la API
async function deleteSubject(id){
  const s=state.subjects.find(x=>x.id===id);
  confirmDelete(`¿Eliminar la materia "${s.name}"?`, async ()=>{
    try {
      await apiFetch('subjects','delete',{id});
      state.subjects=state.subjects.filter(x=>x.id!==id);
      renderSubjects();toast('Materia eliminada','error');
    } catch(e){ toast(`Error: ${e.message}`,'error'); }
  });
}
// FIX: guardar materia ahora llama a la API
async function saveSubject(){
  const name=document.getElementById('sub-name').value.trim();
  const teacherId=document.getElementById('sub-teacher').value;
  let ok=true;
  if(!name){document.getElementById('sub-name').parentElement.classList.add('has-error');ok=false;}else document.getElementById('sub-name').parentElement.classList.remove('has-error');
  if(!teacherId){document.getElementById('sub-teacher').parentElement.classList.add('has-error');ok=false;}else document.getElementById('sub-teacher').parentElement.classList.remove('has-error');
  if(!ok) return;
  const id=document.getElementById('sub-id').value;
  try {
    const payload={name, teacherId:Number(teacherId)};
    if(id) payload.id=id;
    await apiFetch('subjects','save',payload);
    const updated=await apiFetch('subjects');
    if(Array.isArray(updated)) state.subjects=updated;
    closeModal('modal-subject');renderSubjects();
    toast(id?'Materia actualizada':'Materia registrada','success');
  } catch(e){ toast(`Error: ${e.message}`,'error'); }
}
 
// ======= CURSOS =======
function renderCourses(q){
  if(q===undefined)q=(document.querySelector('#page-courses .search-box input')||{}).value||'';
  const level=(document.getElementById('crs-filter-level')||{}).value||'';
  const filtered=state.courses.filter(c=>{
    const inQ=!q||(c.name+c.level+(c.room||'')).toLowerCase().includes(q.toLowerCase());
    return inQ&&(!level||c.level===level);
  });
  const tbody=document.getElementById('courses-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(9);return;}
  tbody.innerHTML=filtered.map(c=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${c.id}</td>
    <td><div style="font-weight:500">${c.name}</div></td>
    <td>${c.level}</td><td>${c.room||'—'}</td><td>${c.tutor||'—'}</td>
    <td><span class="badge badge-blue">${c.students||0}/${c.cap||'—'}</span></td>
    <td>${c.shift}</td>
    <td>${badgeStatus(c.status||'Activo')}</td>
    <td>${actionBtns(`editCourse('${c.id}')`,`deleteCourse('${c.id}')`)}</td>
  </tr>`).join('');
}
function openCourseModal(id){
  document.getElementById('c-id').value=id||'';
  if(id){
    const c=state.courses.find(x=>x.id===id);if(!c)return;
    document.getElementById('modal-course-title').textContent='Editar Curso';
    document.getElementById('c-level').value=c.level;
    document.getElementById('c-parallel').value=c.Paralelo||c.parallel||'';
    document.getElementById('c-shift').value=c.shift||'Mañana';
  } else {
    document.getElementById('modal-course-title').textContent='Nuevo Curso';
    document.getElementById('c-level').value='Primaria';
    document.getElementById('c-parallel').value='';
    document.getElementById('c-shift').value='Mañana';
  }
  document.getElementById('c-parallel').parentElement.classList.remove('has-error');
  openModal('modal-course');
}
function editCourse(id){openCourseModal(id);}
// FIX: eliminar curso ahora llama a la API
async function deleteCourse(id){
  const c=state.courses.find(x=>x.id===id);
  confirmDelete(`¿Eliminar el curso "${c.name}"?`, async ()=>{
    try {
      await apiFetch('courses','delete',{id});
      state.courses=state.courses.filter(x=>x.id!==id);
      renderCourses();updateDashboard();toast('Curso eliminado','error');
    } catch(e){ toast(`Error: ${e.message}`,'error'); }
  });
}
// FIX: guardar curso ahora llama a la API
async function saveCourse(){
  const level=document.getElementById('c-level').value;
  const parallel=document.getElementById('c-parallel').value.trim();
  const shift=document.getElementById('c-shift').value;
  if(!parallel){document.getElementById('c-parallel').parentElement.classList.add('has-error');return;}
  document.getElementById('c-parallel').parentElement.classList.remove('has-error');
  const id=document.getElementById('c-id').value;
  try {
    const payload={level,parallel,shift};
    if(id) payload.id=id;
    await apiFetch('courses','save',payload);
    const updated=await apiFetch('courses');
    if(Array.isArray(updated)) state.courses=updated;
    closeModal('modal-course');renderCourses();updateDashboard();
    toast(id?'Curso actualizado':'Curso registrado','success');
  } catch(e){ toast(`Error: ${e.message}`,'error'); }
}
 
// ======= HORARIOS =======
const dayOrder={Lunes:1,Martes:2,'Miércoles':3,Jueves:4,Viernes:5};
function renderScheduleList(q){
  if(q===undefined)q=(document.querySelector('#page-schedule .search-box input')||{}).value||'';
  const filterCourse=(document.getElementById('sch-filter-course')||{}).value||'';
  const filterDay=(document.getElementById('sch-filter-day')||{}).value||'';
  let filtered=state.schedules.filter(s=>{
    const inQ=!q||(s.subject+s.teacher+s.course).toLowerCase().includes(q.toLowerCase());
    const inC=!filterCourse||s.course===filterCourse;
    const inD=!filterDay||s.day===filterDay;
    return inQ&&inC&&inD;
  });
  filtered.sort((a,b)=>(dayOrder[a.day]||9)-(dayOrder[b.day]||9)||a.start.localeCompare(b.start));
  const dayColors={Lunes:'badge-blue',Martes:'badge-success','Miércoles':'badge-purple',Jueves:'badge-warning',Viernes:'badge-gray'};
  const tbody=document.getElementById('schedule-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(9);return;}
  tbody.innerHTML=filtered.map(s=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${s.id}</td>
    <td><div style="font-weight:500">${s.course}</div></td>
    <td><span class="badge ${dayColors[s.day]||'badge-gray'}">${s.day}</span></td>
    <td>${s.start}</td>
    <td>${s.end}</td>
    <td><div style="font-weight:500">${s.subject}</div></td>
    <td>${s.teacher}</td>
    <td>${s.room||'—'}</td>
    <td>${actionBtns(`editSchedule('${s.id}')`,`deleteSchedule('${s.id}')`)}</td>
  </tr>`).join('');
}
function openScheduleModal(id){
  document.getElementById('sch-subject-sel').innerHTML=subjectOptions('');
  document.getElementById('sch-teacher-sel').innerHTML=teacherOptions('');
  document.getElementById('sch-course-sel').innerHTML=courseOptions('');
  document.getElementById('sch-id').value=id||'';
  if(id){
    const s=state.schedules.find(x=>x.id===id);if(!s)return;
    document.getElementById('modal-schedule-title').textContent='Editar Clase';
    document.getElementById('sch-course-sel').value=String(s.courseId||'');
    document.getElementById('sch-day').value=s.day;
    document.getElementById('sch-start').value=s.start;
    document.getElementById('sch-end').value=s.end;
    document.getElementById('sch-subject-sel').value=String(s.subjectId||'');
    document.getElementById('sch-teacher-sel').value=String(s.teacherId||'');
    if(document.getElementById('sch-room')) document.getElementById('sch-room').value=s.room||'';
  } else {
    document.getElementById('modal-schedule-title').textContent='Nueva Clase';
    document.getElementById('sch-start').value='07:00';
    document.getElementById('sch-end').value='08:00';
  }
  openModal('modal-schedule');
}
function editSchedule(id){openScheduleModal(id);}
// FIX: eliminar clase ahora llama a la API
async function deleteSchedule(id){
  const s=state.schedules.find(x=>x.id===id);
  confirmDelete(`¿Eliminar la clase de "${s.subject}" (${s.day} ${s.start})?`, async ()=>{
    try {
      await apiFetch('schedule','delete',{id});
      state.schedules=state.schedules.filter(x=>x.id!==id);
      renderScheduleList();toast('Clase eliminada','error');
    } catch(e){ toast(`Error: ${e.message}`,'error'); }
  });
}
// FIX: guardar clase ahora llama a la API
async function saveSchedule(){
  const start=document.getElementById('sch-start').value;
  const end=document.getElementById('sch-end').value;
  if(!start||!end){toast('Ingrese hora inicio y fin','error');return;}
  if(start>=end){toast('La hora de inicio debe ser menor a la de fin','error');return;}
  const id=document.getElementById('sch-id').value;
  const courseId=document.getElementById('sch-course-sel').value;
  const subjectId=document.getElementById('sch-subject-sel').value;
  const teacherId=document.getElementById('sch-teacher-sel').value;
  const day=document.getElementById('sch-day').value;
  const room=document.getElementById('sch-room')?.value||'';
  if(!courseId||!subjectId||!teacherId){toast('Complete todos los campos requeridos','error');return;}
  try {
    const payload={courseId,subjectId,teacherId,day,start,end,room};
    if(id) payload.id=id;
    await apiFetch('schedule','save',payload);
    const updated=await apiFetch('schedule');
    if(Array.isArray(updated)) state.schedules=updated;
    closeModal('modal-schedule');renderScheduleList();
    toast(id?'Clase actualizada':'Clase registrada','success');
  } catch(e){ toast(`Error: ${e.message}`,'error'); }
}
 
// ======= NOTAS =======
function renderGrades(q){
  if(q===undefined)q=(document.querySelector('#page-grades .search-box input')||{}).value||'';
  const course=(document.getElementById('grd-course')||{}).value||'';
  const subject=(document.getElementById('grd-subject')||{}).value||'';
  const statusFilter=(document.getElementById('grd-status')||{}).value||'';
  const filtered=state.grades.filter(g=>{
    const nota=typeof g.nota==='number'?g.nota:0;
    const st=nota>=90?'Excelente':nota>=70?'Aprobado':nota>=51?'Regular':'Reprobado';
    const inQ=!q||g.student.toLowerCase().includes(q.toLowerCase());
    const inS=!subject||g.subject===subject;
    const inSt=!statusFilter||st===statusFilter;
    return inQ&&inS&&inSt;
  });
  const tbody=document.getElementById('grades-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(6);return;}
  tbody.innerHTML=filtered.map(g=>{
    const nota=typeof g.nota==='number'?g.nota:0;
    const st=nota>=90?'Excelente':nota>=70?'Aprobado':nota>=51?'Regular':'Reprobado';
    const cls=nota>=90?'badge-success':nota>=70?'badge-blue':nota>=51?'badge-warning':'badge-danger';
    return `<tr>
      <td><div style="font-weight:500">${g.student}</div></td>
      <td>${g.course||'—'}</td>
      <td><span class="badge badge-gray">${g.subject}</span></td>
      <td><strong>${nota}</strong></td>
      <td><span class="badge ${cls}">${st}</span></td>
      <td>${actionBtns(`editGrade('${g.id}')`,`deleteGrade('${g.id}')`)}</td>
    </tr>`;
  }).join('');
}
function openGradeModal(id){
  document.getElementById('g-course').innerHTML=courseOptions('');
  document.getElementById('g-student').innerHTML=studentOptions('');
  document.getElementById('g-subject').innerHTML=subjectOptions('');
  document.getElementById('g-id').value=id||'';
  if(id){
    const g=state.grades.find(x=>x.id===id);if(!g)return;
    document.getElementById('modal-grade-title').textContent='Editar Nota';
    document.getElementById('g-course').value=String(g.courseId||'');
    document.getElementById('g-student').value=String(g.studentId||'');
    document.getElementById('g-subject').value=String(g.subjectId||'');
    document.getElementById('g-grade').value=typeof g.nota==='number'?g.nota:'';
  } else {
    document.getElementById('modal-grade-title').textContent='Registrar Nota';
    document.getElementById('g-course').value='';
    document.getElementById('g-student').value='';
    document.getElementById('g-subject').value=String(state.subjects[0]?.id||'');
    document.getElementById('g-grade').value='';
  }
  openModal('modal-grade');
}
function editGrade(id){openGradeModal(id);}
// FIX: eliminar nota ahora llama a la API
async function deleteGrade(id){
  const g=state.grades.find(x=>x.id===id);
  confirmDelete(`¿Eliminar la nota de "${g.student}"?`, async ()=>{
    try {
      await apiFetch('grades','delete',{id});
      state.grades=state.grades.filter(x=>x.id!==id);
      renderGrades();toast('Nota eliminada','error');
    } catch(e){ toast(`Error: ${e.message}`,'error'); }
  });
}
// FIX: guardar nota ahora llama a la API
async function saveGrade(){
  const studentId=document.getElementById('g-student').value;
  const subjectId=document.getElementById('g-subject').value;
  const nota=parseInt(document.getElementById('g-grade').value)||0;
  if(!studentId){toast('Seleccione un estudiante','error');return;}
  if(!subjectId){toast('Seleccione una materia','error');return;}
  const id=document.getElementById('g-id').value;
  try {
    const payload={studentId,subjectId,nota,periodo:'1er Trimestre'};
    if(id) payload.id=id;
    await apiFetch('grades','save',payload);
    const updated=await apiFetch('grades');
    if(Array.isArray(updated)) state.grades=updated;
    closeModal('modal-grade');renderGrades();
    toast(id?'Nota actualizada':'Nota registrada','success');
  } catch(e){ toast(`Error: ${e.message}`,'error'); }
}
 
// ======= ASISTENCIA =======
// Renderiza la lista de asistencia para la fecha y curso seleccionados.
function renderAttendance(){
  const selectedDate=(document.getElementById('att-date')||{}).value||new Date().toISOString().slice(0,10);
  const selectedCourse=(document.getElementById('att-course')||{}).value||'';
  const rows=state.attendance.filter(rec=>
    rec.date===selectedDate&&(!selectedCourse||rec.course===selectedCourse)
  );
  // También muestra todos los estudiantes del curso seleccionado, aun cuando no haya registro previo.
  const studentsForCourse=state.students.filter(s=>!selectedCourse||s.course===selectedCourse);
  const attList=document.getElementById('att-list');
  if(!attList) return;
  if(!studentsForCourse.length){attList.innerHTML='<p style="color:var(--gray-400);padding:8px">Sin estudiantes para este curso.</p>';updateAttCounts();return;}
  attList.innerHTML=studentsForCourse.map(s=>{
    const rec=rows.find(r=>r.student===s.name)||{status:'Presente'};
    const st=rec.status;
    return `<div class="att-row">
      <div class="att-name">${s.name}</div>
      <div class="att-btns">
        <button class="att-btn ${st==='Presente'?'present':''}" onclick="setAtt('${s.id}','${s.name}','Presente',this.closest('.att-row'))">Presente</button>
        <button class="att-btn ${st==='Ausente'?'absent':''}" onclick="setAtt('${s.id}','${s.name}','Ausente',this.closest('.att-row'))">Ausente</button>
        <button class="att-btn ${st==='Tardanza'?'late':''}" onclick="setAtt('${s.id}','${s.name}','Tardanza',this.closest('.att-row'))">Tardanza</button>
      </div>
    </div>`;
  }).join('');
  updateAttCounts();
}
function setAtt(studentId,studentName,st,row){
  const selectedDate=(document.getElementById('att-date')||{}).value||new Date().toISOString().slice(0,10);
  const selectedCourse=(document.getElementById('att-course')||{}).value||'';
  const existing=state.attendance.find(r=>r.student===studentName&&r.date===selectedDate);
  if(existing) existing.status=st; else state.attendance.push({student:studentName,course:selectedCourse,date:selectedDate,status:st});
  row.querySelectorAll('.att-btn').forEach(b=>b.classList.remove('present','absent','late'));
  const map={Presente:'present',Ausente:'absent',Tardanza:'late'};
  row.querySelectorAll('.att-btn').forEach(b=>{if(b.textContent.trim()===st)b.classList.add(map[st]||'');});
  updateAttCounts();
  // Persist asynchronously
  apiFetch('attendance','save',{studentId,date:selectedDate,status:st}).catch(()=>{});
}
function updateAttCounts(){
  const selectedDate=(document.getElementById('att-date')||{}).value||new Date().toISOString().slice(0,10);
  const rows=state.attendance.filter(r=>r.date===selectedDate);
  document.getElementById('cnt-p').textContent=rows.filter(v=>v.status==='Presente').length;
  document.getElementById('cnt-a').textContent=rows.filter(v=>v.status==='Ausente').length;
  document.getElementById('cnt-l').textContent=rows.filter(v=>v.status==='Tardanza').length;
}
function saveAttendance(){toast('Asistencia guardada','success');}
 
// ======= PAGOS =======
function renderPayments(q){
  if(q===undefined)q=(document.querySelector('#page-payments .search-box input')||{}).value||'';
  const status=(document.getElementById('pay-filter-status')||{}).value||'';
  const filtered=state.payments.filter(p=>{
    const inQ=!q||(p.student+p.concept).toLowerCase().includes(q.toLowerCase());
    return inQ&&(!status||p.status===status);
  });
  const pending=state.payments.filter(p=>p.status==='Pendiente'||p.status==='Vencido').length;
  document.getElementById('nb-pending').textContent=pending;
  document.getElementById('nb-pending').style.display=pending===0?'none':'';
  const tbody=document.getElementById('payments-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(7);return;}
  tbody.innerHTML=filtered.map(p=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${p.id}</td>
    <td><div style="font-weight:500">${p.student}</div></td>
    <td>${p.concept}</td>
    <td><strong>Bs. ${p.amount}</strong></td>
    <td>${badgeStatus(p.status)}</td>
    <td>${p.date||'—'}</td>
    <td><div style="display:flex;gap:4px;flex-wrap:wrap">
      ${p.status!=='Pagado'?`<button class="btn btn-sm btn-success btn-icon" title="Marcar pagado" onclick="markPaid('${p.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></button>`:''}
      ${actionBtns(`editPayment('${p.id}')`,`deletePayment('${p.id}')`)}
    </div></td>
  </tr>`).join('');
}
// FIX: marcar pago como pagado persiste en la API
async function markPaid(id){
  const p=state.payments.find(x=>x.id===id);
  if(!p) return;
  p.status='Pagado';p.date=new Date().toLocaleDateString('es-BO');
  try {
    await apiFetch('payments','save',{id:p.id,studentId:p.studentId,concept:p.concept,amount:p.amount,method:p.method,date:new Date().toISOString().split('T')[0],status:'Pagado'});
  } catch(e){ console.warn('markPaid API error:',e); }
  renderPayments();updateDashboard();toast('Pago confirmado','success');
}
function openPaymentModal(id){
  document.getElementById('p-student').innerHTML=studentOptions('');
  document.getElementById('p-id').value=id||'';
  if(id){
    const p=state.payments.find(x=>x.id===id);if(!p)return;
    document.getElementById('modal-payment-title').textContent='Editar Pago';
    document.getElementById('p-student').value=String(p.studentId||'');
    document.getElementById('p-amount').value=p.amount;
    document.getElementById('p-date').value=p.date?new Date(p.date).toISOString().split('T')[0]:'';
    document.getElementById('p-method').value=p.method||'Efectivo';
    document.getElementById('p-concept').value=p.concept||'';
    document.getElementById('p-status').value=p.status||'Pagado';
  } else {
    document.getElementById('modal-payment-title').textContent='Registrar Pago';
    document.getElementById('p-amount').value='';
    document.getElementById('p-date').value=new Date().toISOString().split('T')[0];
    document.getElementById('p-method').value='Efectivo';
    document.getElementById('p-concept').value='Pago general';
    document.getElementById('p-status').value='Pagado';
  }
  openModal('modal-payment');
}
function editPayment(id){openPaymentModal(id);}
// FIX: Borrar pago ahora llama a la API
async function deletePayment(id){
  const p=state.payments.find(x=>x.id===id);
  confirmDelete(`¿Eliminar el pago de "${p.student}"?`, async ()=>{
    try {
      await apiFetch('payments','delete',{id});
      state.payments=state.payments.filter(x=>x.id!==id);
      renderPayments();updateDashboard();toast('Pago eliminado','error');
    } catch(e){ toast(`Error: ${e.message}`,'error'); }
  });
}
// FIX: GUARDADO DE PAGO ahora llama a la API
async function savePayment(){
  const studentId=document.getElementById('p-student').value;
  const amount=parseFloat(document.getElementById('p-amount').value);
  if(!studentId){toast('Seleccione un estudiante','error');return;}
  if(!amount){toast('Ingrese un monto válido','error');return;}
  const id=document.getElementById('p-id').value;
  const dateVal=document.getElementById('p-date').value;
  const payload={
    studentId,amount,
    method:document.getElementById('p-method').value,
    date:dateVal||new Date().toISOString().split('T')[0],
    concept:document.getElementById('p-concept').value.trim()||'Pago general',
    status:document.getElementById('p-status').value
  };
  if(id) payload.id=id;
  try {
    await apiFetch('payments','save',payload);
    const updated=await apiFetch('payments');
    if(Array.isArray(updated)) state.payments=updated;
    closeModal('modal-payment');renderPayments();updateDashboard();
    toast(id?'Pago actualizado':'Pago registrado','success');
  } catch(e){ toast(`Error: ${e.message}`,'error'); }
}
 
// ======= INSCRIPCIONES =======
function renderInscriptions(q){
  if(q===undefined)q=(document.querySelector('#page-inscriptions .search-box input')||{}).value||'';
  const status=(document.getElementById('ins-filter-status')||{}).value||'';
  const filtered=state.inscriptions.filter(i=>{
    const inQ=!q||(i.student+i.course).toLowerCase().includes(q.toLowerCase());
    return inQ&&(!status||i.status===status);
  });
  const tbody=document.getElementById('inscriptions-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(7);return;}
  tbody.innerHTML=filtered.map(i=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${i.id}</td>
    <td><div style="font-weight:500">${i.student}</div></td>
    <td>${i.course}</td><td>${i.level}</td><td>${i.date}</td>
    <td>${badgeStatus(i.status)}</td>
    <td>${actionBtns(`editInscription('${i.id}')`,`deleteInscription('${i.id}')`)}</td>
  </tr>`).join('');
}
function openInscriptionModal(id){
  const courseEl=document.getElementById('i-course');
  if(courseEl) courseEl.innerHTML=courseOptions('');
  const studentEl=document.getElementById('i-student');
  if(studentEl) studentEl.innerHTML=studentOptions('');
  document.getElementById('i-id').value=id||'';
  if(id){
    const ins=state.inscriptions.find(x=>x.id===id);if(!ins)return;
    document.getElementById('modal-inscription-title').textContent='Editar Inscripción';
    if(studentEl) studentEl.value=String(ins.studentId||'');
    if(courseEl) courseEl.value=String(ins.courseId||'');
    document.getElementById('i-date').value=ins.date?new Date(ins.date).toISOString().split('T')[0]:'';
    document.getElementById('i-status').value=ins.status||'Activa';
  } else {
    document.getElementById('modal-inscription-title').textContent='Nueva Inscripción';
    document.getElementById('i-date').value=new Date().toISOString().split('T')[0];
    document.getElementById('i-status').value='Activa';
  }
  if(document.getElementById('i-student')) document.getElementById('i-student').parentElement.classList.remove('has-error');
  openModal('modal-inscription');
}
function editInscription(id){openInscriptionModal(id);}
function deleteInscription(id){
  const ins=state.inscriptions.find(x=>x.id===id);
  confirmDelete(`¿Eliminar la inscripción de "${ins.student}"?`,()=>{
    state.inscriptions=state.inscriptions.filter(x=>x.id!==id);
    renderInscriptions();updateDashboard();toast('Inscripción eliminada','error');
  });
}
function saveInscription(){
  const student=document.getElementById('i-student')?.value.trim()||'';
  if(!student){document.getElementById('i-student')?.parentElement.classList.add('has-error');return;}
  document.getElementById('i-student')?.parentElement.classList.remove('has-error');
  const id=document.getElementById('i-id').value;
  const course=(document.getElementById('i-course')||{}).value||'';
  const dateVal=document.getElementById('i-date').value;
  const status=document.getElementById('i-status').value;
  const obj={
    id:id||genId('INS'),
    student,
    course,
    level:'',
    date:dateVal?new Date(dateVal).toLocaleDateString('es-BO'):new Date().toLocaleDateString('es-BO'),
    status
  };
  if(id){const i=state.inscriptions.findIndex(x=>x.id===id);state.inscriptions[i]=obj;toast('Inscripción actualizada','success');}
  else{state.inscriptions.push(obj);toast('Estudiante inscrito correctamente','success');}
  closeModal('modal-inscription');renderInscriptions();updateDashboard();
}
 
// ======= USUARIOS =======
const roleColors={Administrador:'badge-purple',Director:'badge-blue',Secretaria:'badge-success',Docente:'badge-blue',Tesorero:'badge-warning'};
function renderUsers(q){
  if(q===undefined)q=(document.querySelector('#page-users .search-box input')||{}).value||'';
  const role=(document.getElementById('usr-filter-role')||{}).value||'';
  const status=(document.getElementById('usr-filter-status')||{}).value||'';
  const filtered=state.users.filter(u=>{
    const inQ=!q||(u.name+u.email+u.role).toLowerCase().includes(q.toLowerCase());
    return inQ&&(!role||u.role===role)&&(!status||u.status===status);
  });
  const tbody=document.getElementById('users-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(7);return;}
  tbody.innerHTML=filtered.map(u=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${u.id}</td>
    <td>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="width:30px;height:30px;border-radius:50%;background:var(--blue-light);color:var(--blue);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${u.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div>
        <div style="font-weight:500">${u.name}</div>
      </div>
    </td>
    <td style="font-size:12px">${u.email}</td>
    <td><span class="badge ${roleColors[u.role]||'badge-gray'}">${u.role}</span></td>
    <td style="font-size:12px;color:var(--gray-400)">${u.lastAccess}</td>
    <td>${badgeStatus(u.status)}</td>
    <td>${actionBtns(`editUser('${u.id}')`,`deleteUser('${u.id}')`)}</td>
  </tr>`).join('');
}
function openUserModal(id){
  document.getElementById('u-id').value=id||'';
  if(id){
    const u=state.users.find(x=>x.id===id);if(!u)return;
    document.getElementById('modal-user-title').textContent='Editar Usuario';
    document.getElementById('u-name').value=u.name;
    document.getElementById('u-email').value=u.email;
    document.getElementById('u-role').value=u.role;
    document.getElementById('u-pass').value='';
  } else {
    document.getElementById('modal-user-title').textContent='Nuevo Usuario';
    document.getElementById('u-name').value='';
    document.getElementById('u-email').value='';
    document.getElementById('u-role').value='Administrador';
    document.getElementById('u-pass').value='';
  }
  document.getElementById('u-name').parentElement.classList.remove('has-error');
  document.getElementById('u-email').parentElement.classList.remove('has-error');
  openModal('modal-user');
}
function editUser(id){openUserModal(id);}
// FIX: eliminar usuario ahora llama a la API
async function deleteUser(id){
  const u=state.users.find(x=>x.id===id);
  confirmDelete(`¿Eliminar al usuario "${u.name}"?`, async ()=>{
    try {
      await apiFetch('users','delete',{id});
      state.users=state.users.filter(x=>x.id!==id);
      renderUsers();updateDashboard();toast('Usuario eliminado','error');
    } catch(e){ toast(`Error: ${e.message}`,'error'); }
  });
}
// FIX: guardar usuario ahora llama a la API
async function saveUser(){
  const name=document.getElementById('u-name').value.trim();
  const email=document.getElementById('u-email').value.trim();
  const password=document.getElementById('u-pass').value.trim();
  const id=document.getElementById('u-id').value;
  let ok=true;
  if(!name){document.getElementById('u-name').parentElement.classList.add('has-error');ok=false;}else document.getElementById('u-name').parentElement.classList.remove('has-error');
  if(!email||!email.includes('@')){document.getElementById('u-email').parentElement.classList.add('has-error');ok=false;}else document.getElementById('u-email').parentElement.classList.remove('has-error');
  if(!id && !password){document.getElementById('u-pass').parentElement.classList.add('has-error');ok=false;}else document.getElementById('u-pass').parentElement.classList.remove('has-error');
  if(!ok) return;
  try {
    const payload={name,email,role:document.getElementById('u-role').value};
    if(id) payload.id=id;
    if(password) payload.password=password;
    await apiFetch('users','save',payload);
    const updated=await apiFetch('users');
    if(Array.isArray(updated)) state.users=updated;
    closeModal('modal-user');renderUsers();updateDashboard();
    toast(id?'Usuario actualizado':'Usuario creado','success');
  } catch(e){ toast(`Error: ${e.message}`,'error'); }
}
 
// ======= REPORTES =======
let currentReport='';
function showReport(type){
  currentReport=type;
  document.getElementById('report-view').style.display='block';
  const titles={notas:'Reporte de Notas — 1er Trimestre 2026',asistencia:'Reporte de Asistencia — Abril 2026',pagos:'Reporte de Pagos — Abril 2026'};
  document.getElementById('rep-title').textContent=titles[type];
  applyReportFilter();
}
function applyReportFilter(){
  if(!currentReport) return;
  let thead='',tbody='';
  if(currentReport==='notas'){
    thead='<tr><th>Estudiante</th><th>Curso</th><th>Materia</th><th>Nota</th><th>Estado</th></tr>';
    tbody=state.grades.map(g=>{
      const nota=typeof g.nota==='number'?g.nota:0;
      const cls=nota>=90?'badge-success':nota>=70?'badge-blue':nota>=51?'badge-warning':'badge-danger';
      const st=nota>=90?'Excelente':nota>=70?'Aprobado':nota>=51?'Regular':'Reprobado';
      return `<tr><td>${g.student}</td><td>${g.course||'—'}</td><td>${g.subject}</td><td><strong>${nota}</strong></td><td><span class="badge ${cls}">${st}</span></td></tr>`;
    }).join('');
  } else if(currentReport==='asistencia'){
    thead='<tr><th>Estudiante</th><th>Presentes</th><th>Ausentes</th><th>Tardanzas</th><th>% Asistencia</th></tr>';
    tbody=state.students.map(s=>{
      const recs=state.attendance.filter(r=>r.student===s.name);
      const p=recs.filter(r=>r.status==='Presente').length;
      const a=recs.filter(r=>r.status==='Ausente').length;
      const l=recs.filter(r=>r.status==='Tardanza').length;
      const tot=p+a+l||1; const pct=Math.round(p/tot*100);
      return `<tr><td>${s.name}</td><td>${p}</td><td>${a}</td><td>${l}</td><td><span class="badge ${pct>=90?'badge-success':pct>=75?'badge-warning':'badge-danger'}">${pct}%</span></td></tr>`;
    }).join('');
  } else {
    thead='<tr><th>Estudiante</th><th>Concepto</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Estado</th></tr>';
    tbody=state.payments.map(p=>`<tr><td>${p.student}</td><td>${p.concept}</td><td><strong>Bs. ${p.amount}</strong></td><td>${p.method||'—'}</td><td>${p.date||'—'}</td><td>${badgeStatus(p.status)}</td></tr>`).join('');
  }
  document.getElementById('rep-thead').innerHTML=thead;
  document.getElementById('rep-tbody').innerHTML=tbody||emptyRow(6);
}
 
function sendNotification(){toast('Función de notificaciones no implementada','warning');}
function updateNotifyMsg(){}
function sendRecovery(){toast('Recuperar contraseña no implementado','warning');}
function doLogout(){window.location.href='index.html';}

// ======= INIT =======
// Inicializa la app: reloj, carga de datos y renderizado de todas las secciones.
async function initApp(){
  updateClock();setInterval(updateClock,1000);
  await loadInitialData();
  renderStudents();renderTeachers();renderSubjects();renderCourses();
  renderUsers();
  renderScheduleList();
  updateDashboard();
}
 
if (typeof refreshCaptcha === 'function') refreshCaptcha();
initApp();