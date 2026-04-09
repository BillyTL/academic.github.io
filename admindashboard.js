// ======= STATE =======
let state = {
  students: [
    {id:'EST-001',name:'Ana García Ríos',ci:'7654321',birth:'2012-03-15',gender:'Femenino',course:'3° Secundaria A',address:'Av. Busch 123',phone:'+591 70123456',status:'Activo'},
    {id:'EST-002',name:'Luis Mendoza Vaca',ci:'7234567',birth:'2014-07-22',gender:'Masculino',course:'1° Primaria A',address:'Calle Sucre 45',phone:'+591 76543210',status:'Activo'},
    {id:'EST-003',name:'María Torres López',ci:'8123456',birth:'2010-11-05',gender:'Femenino',course:'5° Bachillerato A',address:'Barrio Norte 78',phone:'+591 72345678',status:'Activo'},
    {id:'EST-004',name:'Carlos Ruiz Suárez',ci:'7891234',birth:'2013-01-30',gender:'Masculino',course:'2° Primaria B',address:'Calle 6 de Agosto',phone:'+591 78901234',status:'Activo'},
    {id:'EST-005',name:'Sofía Vega Montero',ci:'6543210',birth:'2011-09-14',gender:'Femenino',course:'4° Bachillerato A',address:'Villa Verde 22',phone:'+591 65432100',status:'Inactivo'},
    {id:'EST-006',name:'Diego Flores Prado',ci:'9012345',birth:'2015-04-08',gender:'Masculino',course:'1° Primaria A',address:'Urb. Las Palmas',phone:'+591 90123450',status:'Activo'},
    {id:'EST-007',name:'Valentina Cruz Soto',ci:'8765432',birth:'2012-06-20',gender:'Femenino',course:'3° Secundaria A',address:'Av. Roca 99',phone:'+591 87654320',status:'Activo'},
    {id:'EST-008',name:'Rodrigo Mamani Quispe',ci:'5678901',birth:'2009-12-11',gender:'Masculino',course:'5° Bachillerato A',address:'Calle Junín 200',phone:'+591 56789010',status:'Activo'},
  ],
  teachers: [
    {id:'DOC-001',name:'Prof. Carlos Mamani',ci:'4567890',specialty:'Matemáticas',subjects:'Matemáticas, Física',courses:'3°A, 5°A',email:'c.mamani@educore.com',status:'Activo'},
    {id:'DOC-002',name:'Prof. Laura Flores',ci:'3456789',specialty:'Letras',subjects:'Lenguaje, Literatura',courses:'1°A, 2°B',email:'l.flores@educore.com',status:'Activo'},
    {id:'DOC-003',name:'Prof. René Vargas',ci:'5678901',specialty:'Ciencias',subjects:'Biología, Química',courses:'3°A, 4°A',email:'r.vargas@educore.com',status:'Activo'},
    {id:'DOC-004',name:'Prof. Patricia Solís',ci:'6789012',specialty:'Sociales',subjects:'Historia, Geografía',courses:'2°B, 5°A',email:'p.solis@educore.com',status:'Activo'},
    {id:'DOC-005',name:'Prof. Eduardo Peña',ci:'7890123',specialty:'Idiomas',subjects:'Inglés, Francés',courses:'3°A, 4°A',email:'e.pena@educore.com',status:'Inactivo'},
  ],
  subjects: [
    {id:'SUB-001',name:'Matemáticas',code:'MAT-001',area:'Ciencias Exactas',hours:6,teacher:'Prof. Carlos Mamani',desc:''},
    {id:'SUB-002',name:'Lenguaje y Literatura',code:'LEN-001',area:'Letras',hours:5,teacher:'Prof. Laura Flores',desc:''},
    {id:'SUB-003',name:'Ciencias Naturales',code:'CNA-001',area:'Ciencias',hours:4,teacher:'Prof. René Vargas',desc:''},
    {id:'SUB-004',name:'Historia y Geografía',code:'HIS-001',area:'Sociales',hours:3,teacher:'Prof. Patricia Solís',desc:''},
    {id:'SUB-005',name:'Inglés',code:'ING-001',area:'Idiomas',hours:3,teacher:'Prof. Eduardo Peña',desc:''},
    {id:'SUB-006',name:'Educación Física',code:'EDF-001',area:'Deportes',hours:2,teacher:'Prof. Jorge Lima',desc:''},
  ],
  courses: [
    {id:'CUR-001',name:'1° Primaria A',level:'Primaria',room:'Aula 101',cap:30,tutor:'Prof. Laura Flores',shift:'Mañana',students:28,status:'Activo'},
    {id:'CUR-002',name:'2° Primaria B',level:'Primaria',room:'Aula 102',cap:30,tutor:'Prof. Patricia Solís',shift:'Mañana',students:30,status:'Activo'},
    {id:'CUR-003',name:'3° Secundaria A',level:'Secundaria',room:'Aula 201',cap:35,tutor:'Prof. Carlos Mamani',shift:'Mañana',students:32,status:'Activo'},
    {id:'CUR-004',name:'4° Bachillerato A',level:'Bachillerato',room:'Aula 301',cap:30,tutor:'Prof. René Vargas',shift:'Tarde',students:25,status:'Activo'},
    {id:'CUR-005',name:'5° Bachillerato A',level:'Bachillerato',room:'Aula 302',cap:28,tutor:'Prof. Carlos Mamani',shift:'Tarde',students:22,status:'Activo'},
  ],
  grades: [
    {id:'GRD-001',student:'Ana García',subject:'Matemáticas',e1:85,e2:90,task:88,part:92,obs:''},
    {id:'GRD-002',student:'Luis Mendoza',subject:'Matemáticas',e1:70,e2:75,task:80,part:78,obs:''},
    {id:'GRD-003',student:'María Torres',subject:'Matemáticas',e1:95,e2:92,task:98,part:95,obs:'Excelente'},
    {id:'GRD-004',student:'Carlos Ruiz',subject:'Matemáticas',e1:60,e2:65,task:70,part:72,obs:'Necesita apoyo'},
    {id:'GRD-005',student:'Sofía Vega',subject:'Matemáticas',e1:78,e2:82,task:75,part:80,obs:''},
    {id:'GRD-006',student:'Diego Flores',subject:'Matemáticas',e1:88,e2:85,task:90,part:87,obs:''},
  ],
  payments: [
    {id:'PAG-001',student:'Ana García',concept:'Mensualidad Abril',amount:500,method:'Efectivo',ref:'REC-001',date:'05/04/2026',status:'Pagado'},
    {id:'PAG-002',student:'Luis Mendoza',concept:'Mensualidad Abril',amount:500,method:'',ref:'',date:'',status:'Pendiente'},
    {id:'PAG-003',student:'María Torres',concept:'Inscripción 2026',amount:200,method:'Transferencia',ref:'TRF-045',date:'03/04/2026',status:'Pagado'},
    {id:'PAG-004',student:'Carlos Ruiz',concept:'Mensualidad Marzo',amount:500,method:'',ref:'',date:'',status:'Vencido'},
    {id:'PAG-005',student:'Sofía Vega',concept:'Material Didáctico',amount:150,method:'Efectivo',ref:'REC-005',date:'01/04/2026',status:'Pagado'},
    {id:'PAG-006',student:'Diego Flores',concept:'Mensualidad Abril',amount:500,method:'',ref:'',date:'',status:'Pendiente'},
  ],
  inscriptions: [
    {id:'INS-001',student:'Ana García Ríos',ci:'7654321',course:'3° Secundaria A',level:'Secundaria',year:'2026',date:'05/04/2026',status:'Activa'},
    {id:'INS-002',student:'Luis Mendoza Vaca',ci:'7234567',course:'1° Primaria A',level:'Primaria',year:'2026',date:'04/04/2026',status:'Activa'},
    {id:'INS-003',student:'María Torres López',ci:'8123456',course:'5° Bachillerato A',level:'Bachillerato',year:'2026',date:'03/04/2026',status:'Pendiente'},
    {id:'INS-004',student:'Carlos Ruiz Suárez',ci:'7891234',course:'2° Primaria B',level:'Primaria',year:'2026',date:'02/04/2026',status:'Activa'},
    {id:'INS-005',student:'Sofía Vega Montero',ci:'6543210',course:'4° Bachillerato A',level:'Bachillerato',year:'2026',date:'01/04/2026',status:'Baja'},
  ],
  users: [
    {id:'USR-001',name:'Admin Principal',email:'admin@educore.com',role:'Administrador',lastAccess:'06/04/2026 08:30',status:'Activo',phone:'+591 70000001'},
    {id:'USR-002',name:'María Secretaria',email:'secretaria@educore.com',role:'Secretaria',lastAccess:'06/04/2026 07:45',status:'Activo',phone:'+591 70000002'},
    {id:'USR-003',name:'Lic. Jorge Director',email:'director@educore.com',role:'Director',lastAccess:'05/04/2026 14:00',status:'Activo',phone:'+591 70000003'},
    {id:'USR-004',name:'Prof. Carlos Mamani',email:'c.mamani@educore.com',role:'Docente',lastAccess:'06/04/2026 09:00',status:'Activo',phone:'+591 70000004'},
    {id:'USR-005',name:'Rosa Tesorera',email:'tesoreria@educore.com',role:'Tesorero',lastAccess:'04/04/2026 16:20',status:'Inactivo',phone:'+591 70000005'},
    {id:'USR-006',name:'Luis Suárez',email:'lsuarez@educore.com',role:'Secretaria',lastAccess:'01/04/2026 10:00',status:'Suspendido',phone:'+591 70000006'},
  ],
  attendance: {},
  nextId: 100
};
 
const attendanceStudents = ['Ana García','Luis Mendoza','María Torres','Carlos Ruiz','Sofía Vega','Diego Flores','Valentina Cruz','Rodrigo Mamani'];
 
 
// ======= SIDEBAR =======
function openSidebar(){
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}
 
// ======= NAVIGATION =======

function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.getElementById('header-title').textContent=pageTitles[page]||page;
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
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-bg').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open');}));
 
function confirmDelete(msg, cb) {
  document.getElementById('confirm-msg').textContent=msg;
  document.getElementById('confirm-ok-btn').onclick=()=>{cb();closeModal('modal-confirm');};
  openModal('modal-confirm');
}
 
// ======= HELPERS =======
function genId(prefix){return `${prefix}-${String(++state.nextId).padStart(3,'0')}`;}
function badgeStatus(s){
  const map={Activo:'badge-success',Activa:'badge-success',Pagado:'badge-success',Inactivo:'badge-danger',Baja:'badge-danger',Vencido:'badge-danger',Pendiente:'badge-warning',Suspendido:'badge-warning'};
  return `<span class="badge ${map[s]||'badge-gray'}">${s}</span>`;
}
function calcAge(birth){if(!birth)return '—';const d=new Date(birth),n=new Date();return n.getFullYear()-d.getFullYear()-(n<new Date(n.getFullYear(),d.getMonth(),d.getDate())?1:0);}
function teacherOptions(sel){return state.teachers.map(t=>`<option ${t.name===sel?'selected':''}>${t.name}</option>`).join('');}
function courseOptions(sel){return state.courses.map(c=>`<option ${c.name===sel?'selected':''}>${c.name}</option>`).join('');}
function studentOptions(sel){return state.students.map(s=>`<option ${s.name.split(' ').slice(0,2).join(' ')===sel?'selected':''}>${s.name.split(' ').slice(0,2).join(' ')}</option>`).join('');}
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
function updateDashboard(){
  const pending=state.payments.filter(p=>p.status==='Pendiente'||p.status==='Vencido').length;
  document.getElementById('nb-students').textContent=state.students.filter(s=>s.status==='Activo').length;
  document.getElementById('nb-pending').textContent=pending;
  if(pending===0) document.getElementById('nb-pending').style.display='none';
  else document.getElementById('nb-pending').style.display='';
 
  document.getElementById('dash-stats').innerHTML=`
    <div class="stat-card blue"><div class="stat-icon blue"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="stat-val">${state.students.length}</div><div class="stat-label">Estudiantes</div><div class="stat-change">↑ ${state.students.filter(s=>s.status==='Activo').length} activos</div></div>
    <div class="stat-card green"><div class="stat-icon green"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M12 14c-5 0-8 2-8 4v1h16v-1c0-2-3-4-8-4z"/></svg></div><div class="stat-val">${state.teachers.length}</div><div class="stat-label">Docentes</div><div class="stat-change">${state.teachers.filter(t=>t.status==='Activo').length} activos</div></div>
    <div class="stat-card amber"><div class="stat-icon amber"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div><div class="stat-val">${state.subjects.length}</div><div class="stat-label">Materias</div></div>
    <div class="stat-card purple"><div class="stat-icon purple"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div><div class="stat-val">${state.courses.length}</div><div class="stat-label">Cursos</div></div>
    <div class="stat-card red"><div class="stat-icon red"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div><div class="stat-val">${pending}</div><div class="stat-label">Pagos Pendientes</div></div>
    <div class="stat-card teal"><div class="stat-icon teal"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div class="stat-val">${state.users.filter(u=>u.status==='Activo').length}</div><div class="stat-label">Usuarios Activos</div></div>
  `;
 
  const pcts=[[95,state.courses[0]?.name||'1° Primaria A'],[88,state.courses[2]?.name||'3° Secundaria A'],[72,state.courses[3]?.name||'4° Bachillerato A'],[91,state.courses[1]?.name||'2° Primaria B'],[65,state.courses[4]?.name||'5° Bachillerato A']];
  document.getElementById('dash-attendance').innerHTML=pcts.map(([p,n])=>`<div class="pb-wrap"><div class="pb-label"><span>${n}</span><span>${p}%</span></div><div class="pb"><div class="pb-fill" style="width:${p}%;background:${p>=90?'var(--success)':p>=75?'var(--blue)':p>=60?'#e6a020':'var(--danger)'}"></div></div></div>`).join('');
 
  const last5=state.inscriptions.slice(-5).reverse();
  document.getElementById('dash-inscriptions').innerHTML=last5.length?last5.map(i=>`<tr><td style="font-weight:500">${i.student}</td><td>${i.course}</td><td>${badgeStatus(i.status)}</td></tr>`).join(''):emptyRow(3);
}
 
// ======= STUDENTS =======
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
    <td>${s.ci}</td>
    <td>${calcAge(s.birth)}</td>
    <td><span class="badge badge-blue">${s.course}</span></td>
    <td>${s.phone||'—'}</td>
    <td>${badgeStatus(s.status)}</td>
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
  if(id){
    const s=state.students.find(x=>x.id===id);
    if(!s)return;
    document.getElementById('modal-student-title').textContent='Editar Estudiante';
    document.getElementById('s-name').value=s.name.split(' ')[0];
    document.getElementById('s-last').value=s.name.split(' ').slice(1).join(' ');
    document.getElementById('s-ci').value=s.ci;
    document.getElementById('s-birth').value=s.birth||'';
    document.getElementById('s-gender').value=s.gender;
    document.getElementById('s-course').value=s.course;
    document.getElementById('s-address').value=s.address||'';
    document.getElementById('s-phone').value=s.phone||'';
    document.getElementById('s-status').value=s.status;
  } else {
    document.getElementById('modal-student-title').textContent='Nuevo Estudiante';
    ['s-name','s-last','s-ci','s-address','s-phone'].forEach(f=>document.getElementById(f).value='');
    document.getElementById('s-birth').value='';
    document.getElementById('s-status').value='Activo';
  }
  ['s-name','s-last','s-ci'].forEach(f=>document.getElementById(f).parentElement.classList.remove('has-error'));
  openModal('modal-student');
}
function editStudent(id){openStudentModal(id);}
function deleteStudent(id){
  const s=state.students.find(x=>x.id===id);
  confirmDelete(`¿Eliminar al estudiante "${s.name}"? Esta acción no se puede deshacer.`,()=>{
    state.students=state.students.filter(x=>x.id!==id);
    renderStudents();updateDashboard();toast(`Estudiante eliminado`,'error');
  });
}
function saveStudent(){
  const name=document.getElementById('s-name').value.trim();
  const last=document.getElementById('s-last').value.trim();
  const ci=document.getElementById('s-ci').value.trim();
  let ok=true;
  if(!name){document.getElementById('s-name').parentElement.classList.add('has-error');ok=false;}else document.getElementById('s-name').parentElement.classList.remove('has-error');
  if(!last){document.getElementById('s-last').parentElement.classList.add('has-error');ok=false;}else document.getElementById('s-last').parentElement.classList.remove('has-error');
  if(!ci){document.getElementById('s-ci').parentElement.classList.add('has-error');ok=false;}else document.getElementById('s-ci').parentElement.classList.remove('has-error');
  if(!ok) return;
  const id=document.getElementById('s-id').value;
  const obj={
    id:id||genId('EST'),name:`${name} ${last}`,ci,birth:document.getElementById('s-birth').value,
    gender:document.getElementById('s-gender').value,course:document.getElementById('s-course').value,
    address:document.getElementById('s-address').value,phone:document.getElementById('s-phone').value,
    status:document.getElementById('s-status').value
  };
  if(id){const i=state.students.findIndex(x=>x.id===id);state.students[i]=obj;toast('Estudiante actualizado','success');}
  else{state.students.push(obj);toast('Estudiante registrado','success');}
  closeModal('modal-student');renderStudents();updateDashboard();
}
 
// ======= TEACHERS =======
function renderTeachers(q){
  if(q===undefined)q=(document.querySelector('#page-teachers .search-box input')||{}).value||'';
  const status=(document.getElementById('tch-filter-status')||{}).value||'';
  const filtered=state.teachers.filter(t=>{
    const inQ=!q||(t.name+t.specialty+t.subjects).toLowerCase().includes(q.toLowerCase());
    return inQ&&(!status||t.status===status);
  });
  const tbody=document.getElementById('teachers-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(8);return;}
  tbody.innerHTML=filtered.map(t=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${t.id}</td>
    <td><div style="font-weight:500">${t.name}</div></td>
    <td>${t.specialty}</td><td>${t.subjects}</td><td>${t.courses}</td>
    <td style="font-size:12px">${t.email}</td>
    <td>${badgeStatus(t.status)}</td>
    <td>${actionBtns(`editTeacher('${t.id}')`,`deleteTeacher('${t.id}')`)}</td>
  </tr>`).join('');
}
function openTeacherModal(id){
  document.getElementById('t-id').value=id||'';
  if(id){
    const t=state.teachers.find(x=>x.id===id);if(!t)return;
    document.getElementById('modal-teacher-title').textContent='Editar Docente';
    const parts=t.name.replace('Prof. ','').split(' ');
    document.getElementById('t-name').value=parts[0]||'';
    document.getElementById('t-last').value=parts.slice(1).join(' ')||'';
    document.getElementById('t-ci').value=t.ci||'';
    document.getElementById('t-specialty').value=t.specialty;
    document.getElementById('t-subjects').value=t.subjects;
    document.getElementById('t-courses').value=t.courses;
    document.getElementById('t-email').value=t.email;
    document.getElementById('t-status').value=t.status;
  } else {
    document.getElementById('modal-teacher-title').textContent='Nuevo Docente';
    ['t-name','t-last','t-ci','t-specialty','t-subjects','t-courses','t-email'].forEach(f=>document.getElementById(f).value='');
    document.getElementById('t-status').value='Activo';
  }
  ['t-name','t-last','t-specialty'].forEach(f=>document.getElementById(f).parentElement.classList.remove('has-error'));
  openModal('modal-teacher');
}
function editTeacher(id){openTeacherModal(id);}
function deleteTeacher(id){
  const t=state.teachers.find(x=>x.id===id);
  confirmDelete(`¿Eliminar al docente "${t.name}"?`,()=>{
    state.teachers=state.teachers.filter(x=>x.id!==id);
    renderTeachers();updateDashboard();toast('Docente eliminado','error');
  });
}
function saveTeacher(){
  const name=document.getElementById('t-name').value.trim();
  const last=document.getElementById('t-last').value.trim();
  const spec=document.getElementById('t-specialty').value.trim();
  let ok=true;
  if(!name){document.getElementById('t-name').parentElement.classList.add('has-error');ok=false;}else document.getElementById('t-name').parentElement.classList.remove('has-error');
  if(!last){document.getElementById('t-last').parentElement.classList.add('has-error');ok=false;}else document.getElementById('t-last').parentElement.classList.remove('has-error');
  if(!spec){document.getElementById('t-specialty').parentElement.classList.add('has-error');ok=false;}else document.getElementById('t-specialty').parentElement.classList.remove('has-error');
  if(!ok) return;
  const id=document.getElementById('t-id').value;
  const obj={id:id||genId('DOC'),name:`Prof. ${name} ${last}`,ci:document.getElementById('t-ci').value,specialty:spec,subjects:document.getElementById('t-subjects').value,courses:document.getElementById('t-courses').value,email:document.getElementById('t-email').value,status:document.getElementById('t-status').value};
  if(id){const i=state.teachers.findIndex(x=>x.id===id);state.teachers[i]=obj;toast('Docente actualizado','success');}
  else{state.teachers.push(obj);toast('Docente registrado','success');}
  closeModal('modal-teacher');renderTeachers();updateDashboard();
}
 
// ======= SUBJECTS =======
function renderSubjects(q){
  if(q===undefined)q=(document.querySelector('#page-subjects .search-box input')||{}).value||'';
  const filtered=state.subjects.filter(s=>!q||(s.name+s.code+s.area).toLowerCase().includes(q.toLowerCase()));
  const tbody=document.getElementById('subjects-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(7);return;}
  tbody.innerHTML=filtered.map((s,i)=>`<tr>
    <td>${i+1}</td>
    <td><div style="font-weight:500">${s.name}</div></td>
    <td><code style="background:var(--gray-100);padding:2px 7px;border-radius:4px;font-size:11px">${s.code}</code></td>
    <td><span class="badge badge-blue">${s.area}</span></td>
    <td>${s.hours}h</td>
    <td>${s.teacher}</td>
    <td>${actionBtns(`editSubject('${s.id}')`,`deleteSubject('${s.id}')`)}</td>
  </tr>`).join('');
}
function openSubjectModal(id){
  document.getElementById('sub-teacher').innerHTML=teacherOptions('');
  document.getElementById('sub-id').value=id||'';
  if(id){
    const s=state.subjects.find(x=>x.id===id);if(!s)return;
    document.getElementById('modal-subject-title').textContent='Editar Materia';
    document.getElementById('sub-name').value=s.name;
    document.getElementById('sub-code').value=s.code;
    document.getElementById('sub-area').value=s.area;
    document.getElementById('sub-hours').value=s.hours;
    document.getElementById('sub-teacher').value=s.teacher;
    document.getElementById('sub-desc').value=s.desc||'';
  } else {
    document.getElementById('modal-subject-title').textContent='Nueva Materia';
    ['sub-name','sub-code','sub-hours','sub-desc'].forEach(f=>document.getElementById(f).value='');
  }
  ['sub-name','sub-code'].forEach(f=>document.getElementById(f).parentElement.classList.remove('has-error'));
  openModal('modal-subject');
}
function editSubject(id){openSubjectModal(id);}
function deleteSubject(id){
  const s=state.subjects.find(x=>x.id===id);
  confirmDelete(`¿Eliminar la materia "${s.name}"?`,()=>{state.subjects=state.subjects.filter(x=>x.id!==id);renderSubjects();toast('Materia eliminada','error');});
}
function saveSubject(){
  const name=document.getElementById('sub-name').value.trim();
  const code=document.getElementById('sub-code').value.trim();
  let ok=true;
  if(!name){document.getElementById('sub-name').parentElement.classList.add('has-error');ok=false;}else document.getElementById('sub-name').parentElement.classList.remove('has-error');
  if(!code){document.getElementById('sub-code').parentElement.classList.add('has-error');ok=false;}else document.getElementById('sub-code').parentElement.classList.remove('has-error');
  if(!ok) return;
  const id=document.getElementById('sub-id').value;
  const obj={id:id||genId('SUB'),name,code,area:document.getElementById('sub-area').value,hours:parseInt(document.getElementById('sub-hours').value)||0,teacher:document.getElementById('sub-teacher').value,desc:document.getElementById('sub-desc').value};
  if(id){const i=state.subjects.findIndex(x=>x.id===id);state.subjects[i]=obj;toast('Materia actualizada','success');}
  else{state.subjects.push(obj);toast('Materia registrada','success');}
  closeModal('modal-subject');renderSubjects();
}
 
// ======= COURSES =======
function renderCourses(q){
  if(q===undefined)q=(document.querySelector('#page-courses .search-box input')||{}).value||'';
  const level=(document.getElementById('crs-filter-level')||{}).value||'';
  const filtered=state.courses.filter(c=>{
    const inQ=!q||(c.name+c.level+c.room).toLowerCase().includes(q.toLowerCase());
    return inQ&&(!level||c.level===level);
  });
  const tbody=document.getElementById('courses-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(9);return;}
  tbody.innerHTML=filtered.map(c=>`<tr>
    <td style="font-size:11px;color:var(--gray-400)">${c.id}</td>
    <td><div style="font-weight:500">${c.name}</div></td>
    <td>${c.level}</td><td>${c.room}</td><td>${c.tutor}</td>
    <td><span class="badge badge-blue">${c.students||0}/${c.cap}</span></td>
    <td>${c.shift}</td>
    <td>${badgeStatus(c.status)}</td>
    <td>${actionBtns(`editCourse('${c.id}')`,`deleteCourse('${c.id}')`)}</td>
  </tr>`).join('');
}
function openCourseModal(id){
  document.getElementById('c-tutor').innerHTML=teacherOptions('');
  document.getElementById('c-id').value=id||'';
  if(id){
    const c=state.courses.find(x=>x.id===id);if(!c)return;
    document.getElementById('modal-course-title').textContent='Editar Curso';
    document.getElementById('c-name').value=c.name;
    document.getElementById('c-level').value=c.level;
    document.getElementById('c-room').value=c.room;
    document.getElementById('c-cap').value=c.cap;
    document.getElementById('c-tutor').value=c.tutor;
    document.getElementById('c-shift').value=c.shift;
    document.getElementById('c-status').value=c.status;
  } else {
    document.getElementById('modal-course-title').textContent='Nuevo Curso';
    ['c-name','c-room','c-cap'].forEach(f=>document.getElementById(f).value='');
    document.getElementById('c-status').value='Activo';
  }
  document.getElementById('c-name').parentElement.classList.remove('has-error');
  openModal('modal-course');
}
function editCourse(id){openCourseModal(id);}
function deleteCourse(id){
  const c=state.courses.find(x=>x.id===id);
  confirmDelete(`¿Eliminar el curso "${c.name}"?`,()=>{state.courses=state.courses.filter(x=>x.id!==id);renderCourses();updateDashboard();toast('Curso eliminado','error');});
}
function saveCourse(){
  const name=document.getElementById('c-name').value.trim();
  if(!name){document.getElementById('c-name').parentElement.classList.add('has-error');return;}
  document.getElementById('c-name').parentElement.classList.remove('has-error');
  const id=document.getElementById('c-id').value;
  const obj={id:id||genId('CUR'),name,level:document.getElementById('c-level').value,room:document.getElementById('c-room').value,cap:parseInt(document.getElementById('c-cap').value)||30,tutor:document.getElementById('c-tutor').value,shift:document.getElementById('c-shift').value,students:0,status:document.getElementById('c-status').value};
  if(id){const i=state.courses.findIndex(x=>x.id===id);const prev=state.courses[i];obj.students=prev.students;state.courses[i]=obj;toast('Curso actualizado','success');}
  else{state.courses.push(obj);toast('Curso registrado','success');}
  closeModal('modal-course');renderCourses();updateDashboard();
}
 
 
// ======= SCHEDULE =======
// Seed schedule data as list
if(!state.schedules){
  state.schedules=[
    {id:'SCH-001',course:'3° Secundaria A',day:'Lunes',start:'07:00',end:'08:00',subject:'Matemáticas',teacher:'Prof. Carlos Mamani',room:'Aula 201'},
    {id:'SCH-002',course:'3° Secundaria A',day:'Lunes',start:'09:00',end:'10:00',subject:'Lenguaje y Literatura',teacher:'Prof. Laura Flores',room:'Aula 201'},
    {id:'SCH-003',course:'3° Secundaria A',day:'Martes',start:'07:00',end:'08:00',subject:'Historia y Geografía',teacher:'Prof. Patricia Solís',room:'Aula 201'},
    {id:'SCH-004',course:'3° Secundaria A',day:'Miércoles',start:'07:00',end:'08:00',subject:'Ciencias Naturales',teacher:'Prof. René Vargas',room:'Lab. Ciencias'},
    {id:'SCH-005',course:'3° Secundaria A',day:'Jueves',start:'10:00',end:'11:00',subject:'Inglés',teacher:'Prof. Eduardo Peña',room:'Aula 201'},
    {id:'SCH-006',course:'3° Secundaria A',day:'Viernes',start:'11:00',end:'12:00',subject:'Educación Física',teacher:'Prof. Jorge Lima',room:'Cancha'},
    {id:'SCH-007',course:'1° Primaria A',day:'Lunes',start:'07:00',end:'08:00',subject:'Matemáticas',teacher:'Prof. Carlos Mamani',room:'Aula 101'},
    {id:'SCH-008',course:'1° Primaria A',day:'Martes',start:'08:00',end:'09:00',subject:'Lenguaje y Literatura',teacher:'Prof. Laura Flores',room:'Aula 101'},
    {id:'SCH-009',course:'5° Bachillerato A',day:'Lunes',start:'14:00',end:'15:00',subject:'Matemáticas',teacher:'Prof. Carlos Mamani',room:'Aula 302'},
    {id:'SCH-010',course:'5° Bachillerato A',day:'Miércoles',start:'15:00',end:'16:00',subject:'Historia y Geografía',teacher:'Prof. Patricia Solís',room:'Aula 302'},
  ];
}
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
  const dayColors={Lunes:'badge-blue',Martes:'badge-success',Miércoles:'badge-purple',Jueves:'badge-warning',Viernes:'badge-gray'};
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
  document.getElementById('sch-subject-sel').innerHTML=state.subjects.map(s=>`<option>${s.name}</option>`).join('');
  document.getElementById('sch-teacher-sel').innerHTML=teacherOptions('');
  document.getElementById('sch-id').value=id||'';
  if(id){
    const s=state.schedules.find(x=>x.id===id);if(!s)return;
    document.getElementById('modal-schedule-title').textContent='Editar Clase';
    document.getElementById('sch-course').value=s.course;
    document.getElementById('sch-day').value=s.day;
    document.getElementById('sch-start').value=s.start;
    document.getElementById('sch-end').value=s.end;
    document.getElementById('sch-subject-sel').value=s.subject;
    document.getElementById('sch-teacher-sel').value=s.teacher;
    document.getElementById('sch-room').value=s.room||'';
  } else {
    document.getElementById('modal-schedule-title').textContent='Nueva Clase';
    document.getElementById('sch-start').value='07:00';
    document.getElementById('sch-end').value='08:00';
    document.getElementById('sch-room').value='';
  }
  openModal('modal-schedule');
}
function editSchedule(id){openScheduleModal(id);}
function deleteSchedule(id){
  const s=state.schedules.find(x=>x.id===id);
  confirmDelete(`¿Eliminar la clase de "${s.subject}" (${s.day} ${s.start})?`,()=>{
    state.schedules=state.schedules.filter(x=>x.id!==id);
    renderScheduleList();toast('Clase eliminada','error');
  });
}
function saveSchedule(){
  const start=document.getElementById('sch-start').value;
  const end=document.getElementById('sch-end').value;
  if(!start||!end){toast('Ingrese hora inicio y fin','error');return;}
  if(start>=end){toast('La hora de inicio debe ser menor a la de fin','error');return;}
  const id=document.getElementById('sch-id').value;
  const obj={
    id:id||genId('SCH'),
    course:document.getElementById('sch-course').value,
    day:document.getElementById('sch-day').value,
    start,end,
    subject:document.getElementById('sch-subject-sel').value,
    teacher:document.getElementById('sch-teacher-sel').value,
    room:document.getElementById('sch-room').value
  };
  if(id){const i=state.schedules.findIndex(x=>x.id===id);state.schedules[i]=obj;toast('Clase actualizada','success');}
  else{state.schedules.push(obj);toast('Clase registrada','success');}
  closeModal('modal-schedule');renderScheduleList();
}
 
 
// ======= GRADES =======
function renderGrades(q){
  if(q===undefined)q=(document.querySelector('#page-grades .search-box input')||{}).value||'';
  const course=(document.getElementById('grd-course')||{}).value||'';
  const subject=(document.getElementById('grd-subject')||{}).value||'';
  const period=(document.getElementById('grd-period')||{}).value||'';
  const statusFilter=(document.getElementById('grd-status')||{}).value||'';
  const filtered=state.grades.filter(g=>{
    const avg=Math.round((g.e1+g.e2+g.task+g.part)/4);
    const st=avg>=90?'Excelente':avg>=70?'Aprobado':avg>=51?'Regular':'Reprobado';
    const inQ=!q||g.student.toLowerCase().includes(q.toLowerCase());
    const inS=!subject||g.subject===subject;
    const inSt=!statusFilter||st===statusFilter;
    return inQ&&inS&&inSt;
  });
  const tbody=document.getElementById('grades-tbody');
  if(!filtered.length){tbody.innerHTML=emptyRow(9);return;}
  tbody.innerHTML=filtered.map(g=>{
    const avg=Math.round((g.e1+g.e2+g.task+g.part)/4);
    const st=avg>=90?'Excelente':avg>=70?'Aprobado':avg>=51?'Regular':'Reprobado';
    const cls=avg>=90?'badge-success':avg>=70?'badge-blue':avg>=51?'badge-warning':'badge-danger';
    return `<tr>
      <td><div style="font-weight:500">${g.student}</div></td>
      <td><span class="badge badge-gray">${g.subject}</span></td>
      <td>${g.e1}</td><td>${g.e2}</td><td>${g.task}</td><td>${g.part}</td>
      <td><strong style="font-size:16px;color:${avg>=70?'var(--success)':'var(--danger)'}">${avg}</strong></td>
      <td><span class="badge ${cls}">${st}</span></td>
      <td>${actionBtns(`editGrade('${g.id}')`,`deleteGrade('${g.id}')`)}</td>
    </tr>`;
  }).join('');
}
function openGradeModal(id){
  document.getElementById('g-id').value=id||'';
  if(id){
    const g=state.grades.find(x=>x.id===id);if(!g)return;
    document.getElementById('modal-grade-title').textContent='Editar Nota';
    document.getElementById('g-student').value=g.student;
    document.getElementById('g-subject').value=g.subject;
    document.getElementById('g-e1').value=g.e1;
    document.getElementById('g-e2').value=g.e2;
    document.getElementById('g-task').value=g.task;
    document.getElementById('g-part').value=g.part;
    document.getElementById('g-obs').value=g.obs||'';
  } else {
    document.getElementById('modal-grade-title').textContent='Registrar Nota';
    ['g-student','g-e1','g-e2','g-task','g-part','g-obs'].forEach(f=>document.getElementById(f).value='');
  }
  openModal('modal-grade');
}
function editGrade(id){openGradeModal(id);}
function deleteGrade(id){
  const g=state.grades.find(x=>x.id===id);
  confirmDelete(`¿Eliminar la nota de "${g.student}"?`,()=>{state.grades=state.grades.filter(x=>x.id!==id);renderGrades();toast('Nota eliminada','error');});
}
function saveGrade(){
  const student=document.getElementById('g-student').value.trim();
  if(!student){toast('Ingrese el nombre del estudiante','error');return;}
  const id=document.getElementById('g-id').value;
  const obj={id:id||genId('GRD'),student,subject:document.getElementById('g-subject').value,e1:parseInt(document.getElementById('g-e1').value)||0,e2:parseInt(document.getElementById('g-e2').value)||0,task:parseInt(document.getElementById('g-task').value)||0,part:parseInt(document.getElementById('g-part').value)||0,obs:document.getElementById('g-obs').value};
  if(id){const i=state.grades.findIndex(x=>x.id===id);state.grades[i]=obj;toast('Nota actualizada','success');}
  else{state.grades.push(obj);toast('Nota registrada','success');}
  closeModal('modal-grade');renderGrades();
}
 
// ======= ATTENDANCE =======
function renderAttendance(){
  attendanceStudents.forEach(s=>{if(!state.attendance[s])state.attendance[s]='present';});
  document.getElementById('att-list').innerHTML=attendanceStudents.map(s=>`
    <div class="att-row">
      <div class="att-name">${s}</div>
      <div class="att-btns">
        <button class="att-btn ${state.attendance[s]==='present'?'present':''}" onclick="setAtt('${s}','present',this.closest('.att-row'))">Presente</button>
        <button class="att-btn ${state.attendance[s]==='absent'?'absent':''}" onclick="setAtt('${s}','absent',this.closest('.att-row'))">Ausente</button>
        <button class="att-btn ${state.attendance[s]==='late'?'late':''}" onclick="setAtt('${s}','late',this.closest('.att-row'))">Tardanza</button>
      </div>
    </div>`).join('');
  updateAttCounts();
}
function setAtt(student,st,row){
  state.attendance[student]=st;
  row.querySelectorAll('.att-btn').forEach(b=>b.classList.remove('present','absent','late'));
  const idx=st==='present'?0:st==='absent'?1:2;
  row.querySelectorAll('.att-btn')[idx].classList.add(st);
  updateAttCounts();
}
function updateAttCounts(){
  const vals=Object.values(state.attendance);
  document.getElementById('cnt-p').textContent=vals.filter(v=>v==='present').length;
  document.getElementById('cnt-a').textContent=vals.filter(v=>v==='absent').length;
  document.getElementById('cnt-l').textContent=vals.filter(v=>v==='late').length;
}
 
// ======= PAYMENTS =======
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
      <button class="btn btn-sm btn-secondary btn-icon" title="Generar factura" onclick="generateInvoice('${p.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8h.01M12 8h5M7 12h10"/></svg>
      </button>
      <button class="btn btn-sm btn-icon" title="Notificar" style="background:#fef7e0;color:#b07d10;border:1px solid #f3d87a;border-radius:6px;padding:5px" onclick="openNotifyModal('${p.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </button>
      ${actionBtns(`editPayment('${p.id}')`,`deletePayment('${p.id}')`)}
    </div></td>
  </tr>`).join('');
}
function markPaid(id){
  const p=state.payments.find(x=>x.id===id);
  p.status='Pagado';p.date=new Date().toLocaleDateString('es-BO');
  renderPayments();updateDashboard();toast('Pago confirmado','success');
}
function generateInvoice(id){
  const p=state.payments.find(x=>x.id===id);
  if(!p) return;
  const num=`FAC-${String(Math.floor(Math.random()*9000)+1000)}`;
  document.getElementById('inv-num').textContent=`N° ${num} — ${new Date().toLocaleDateString('es-BO')}`;
  document.getElementById('inv-body').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:12px;color:var(--gray-600)">
      <div><strong style="color:var(--gray-800);display:block;margin-bottom:2px">Cliente</strong>${p.student}</div>
      <div><strong style="color:var(--gray-800);display:block;margin-bottom:2px">Estado</strong>${p.status}</div>
      <div><strong style="color:var(--gray-800);display:block;margin-bottom:2px">Concepto</strong>${p.concept}</div>
      <div><strong style="color:var(--gray-800);display:block;margin-bottom:2px">Método</strong>${p.method||'—'}</div>
    </div>
    <div style="border-top:1px solid var(--gray-200);padding-top:10px;margin-top:2px">
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid var(--gray-100)">
        <span style="color:var(--gray-600);font-weight:600">Descripción</span><span style="color:var(--gray-600);font-weight:600">Monto</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:8px 0">
        <span>${p.concept}</span><span>Bs. ${p.amount}</span>
      </div>
    </div>`;
  document.getElementById('inv-total').textContent=`Bs. ${p.amount}`;
  openModal('modal-invoice');
  toast('Factura generada','success');
}
let currentNotifyPaymentId='';
function openNotifyModal(id){
  currentNotifyPaymentId=id;
  const p=state.payments.find(x=>x.id===id);
  if(!p) return;
  document.getElementById('notify-name').textContent=p.student;
  document.getElementById('notify-concept').textContent=p.concept;
  document.getElementById('notify-amount').textContent=`Bs. ${p.amount} (${p.status})`;
  document.getElementById('notify-channel').value='whatsapp';
  updateNotifyMsg();
  openModal('modal-notify');
}
function updateNotifyMsg(){
  const p=state.payments.find(x=>x.id===currentNotifyPaymentId);
  if(!p) return;
  const ch=document.getElementById('notify-channel').value;
  const msgs={
    whatsapp:`Estimado/a padre/tutor de *${p.student}*,\n\nLe informamos que tiene un pago pendiente:\n📋 *${p.concept}*\n💰 Monto: *Bs. ${p.amount}*\n📌 Estado: ${p.status}\n\nPor favor, regularice su situación a la brevedad.\n\n_EduCore — Gestión Académica_`,
    email:`Estimado/a tutor/a de ${p.student}:\n\nTiene pendiente el siguiente pago:\n\nConcepto: ${p.concept}\nMonto: Bs. ${p.amount}\nEstado: ${p.status}\n\nPor favor acérquese a secretaría para regularizar.\n\nAtentamente,\nAdministración — EduCore`,
    sms:`EduCore: Pago pendiente - ${p.student}: ${p.concept} Bs.${p.amount}. Comuníquese con administración.`
  };
  document.getElementById('notify-msg').value=msgs[ch]||msgs.whatsapp;
}
function sendNotification(){
  const btn=document.getElementById('notify-send-btn');
  const ch=document.getElementById('notify-channel').value;
  const chNames={whatsapp:'WhatsApp',email:'correo electrónico',sms:'SMS'};
  const orig=btn.innerHTML;
  btn.textContent='Enviando...';btn.disabled=true;
  setTimeout(()=>{
    closeModal('modal-notify');
    toast(`✓ Notificación enviada por ${chNames[ch]||ch}`, 'success');
    btn.innerHTML=orig;btn.disabled=false;
  },1400);
}
function openPaymentModal(id){
  document.getElementById('p-student').innerHTML=studentOptions('');
  document.getElementById('p-id').value=id||'';
  if(id){
    const p=state.payments.find(x=>x.id===id);if(!p)return;
    document.getElementById('modal-payment-title').textContent='Editar Pago';
    document.getElementById('p-student').value=p.student;
    document.getElementById('p-concept').value=p.concept;
    document.getElementById('p-amount').value=p.amount;
    document.getElementById('p-date').value='';
    document.getElementById('p-method').value=p.method||'Efectivo';
    document.getElementById('p-ref').value=p.ref||'';
    document.getElementById('p-status').value=p.status;
  } else {
    document.getElementById('modal-payment-title').textContent='Registrar Pago';
    ['p-amount','p-ref'].forEach(f=>document.getElementById(f).value='');
    document.getElementById('p-status').value='Pagado';
    document.getElementById('p-date').value=new Date().toISOString().split('T')[0];
  }
  openModal('modal-payment');
}
function editPayment(id){openPaymentModal(id);}
function deletePayment(id){
  const p=state.payments.find(x=>x.id===id);
  confirmDelete(`¿Eliminar el pago de "${p.student}" (${p.concept})?`,()=>{state.payments=state.payments.filter(x=>x.id!==id);renderPayments();updateDashboard();toast('Pago eliminado','error');});
}
function savePayment(){
  const student=document.getElementById('p-student').value;
  const amount=parseFloat(document.getElementById('p-amount').value);
  if(!amount){toast('Ingrese un monto válido','error');return;}
  const id=document.getElementById('p-id').value;
  const dateVal=document.getElementById('p-date').value;
  const obj={id:id||genId('PAG'),student,concept:document.getElementById('p-concept').value,amount,method:document.getElementById('p-method').value,ref:document.getElementById('p-ref').value,date:dateVal?new Date(dateVal).toLocaleDateString('es-BO'):'',status:document.getElementById('p-status').value};
  if(id){const i=state.payments.findIndex(x=>x.id===id);state.payments[i]=obj;toast('Pago actualizado','success');}
  else{state.payments.push(obj);toast('Pago registrado','success');}
  closeModal('modal-payment');renderPayments();updateDashboard();
}
 
// ======= INSCRIPTIONS =======
function updateInscriptionCourse(){
  const level=document.getElementById('i-level').value;
  const opts={Primaria:['1° Primaria A','1° Primaria B','2° Primaria A'],Secundaria:['3° Secundaria A','3° Secundaria B'],Bachillerato:['4° Bachillerato A','5° Bachillerato A']};
  document.getElementById('i-course').innerHTML=(opts[level]||[]).map(o=>`<option>${o}</option>`).join('');
}
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
  updateInscriptionCourse();
  document.getElementById('i-id').value=id||'';
  if(id){
    const ins=state.inscriptions.find(x=>x.id===id);if(!ins)return;
    document.getElementById('modal-inscription-title').textContent='Editar Inscripción';
    document.getElementById('i-student').value=ins.student;
    document.getElementById('i-ci').value=ins.ci||'';
    document.getElementById('i-level').value=ins.level;
    updateInscriptionCourse();
    document.getElementById('i-course').value=ins.course;
    document.getElementById('i-year').value=ins.year;
    document.getElementById('i-status').value=ins.status;
  } else {
    document.getElementById('modal-inscription-title').textContent='Nueva Inscripción';
    ['i-student','i-ci'].forEach(f=>document.getElementById(f).value='');
    document.getElementById('i-status').value='Activa';
  }
  document.getElementById('i-student').parentElement.classList.remove('has-error');
  openModal('modal-inscription');
}
function editInscription(id){openInscriptionModal(id);}
function deleteInscription(id){
  const ins=state.inscriptions.find(x=>x.id===id);
  confirmDelete(`¿Eliminar la inscripción de "${ins.student}"?`,()=>{state.inscriptions=state.inscriptions.filter(x=>x.id!==id);renderInscriptions();updateDashboard();toast('Inscripción eliminada','error');});
}
function saveInscription(){
  const student=document.getElementById('i-student').value.trim();
  if(!student){document.getElementById('i-student').parentElement.classList.add('has-error');return;}
  document.getElementById('i-student').parentElement.classList.remove('has-error');
  const id=document.getElementById('i-id').value;
  const level=document.getElementById('i-level').value;
  const dateRaw=document.getElementById('i-date').value;
  const obj={id:id||genId('INS'),student,ci:document.getElementById('i-ci').value,course:document.getElementById('i-course').value,level,year:document.getElementById('i-year').value,date:dateRaw?new Date(dateRaw).toLocaleDateString('es-BO'):new Date().toLocaleDateString('es-BO'),status:document.getElementById('i-status').value};
  if(id){const i=state.inscriptions.findIndex(x=>x.id===id);state.inscriptions[i]=obj;toast('Inscripción actualizada','success');}
  else{state.inscriptions.push(obj);toast('Estudiante inscrito correctamente','success');}
  closeModal('modal-inscription');renderInscriptions();updateDashboard();
}
 
// ======= USERS =======
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
    const parts=u.name.split(' ');
    document.getElementById('u-name').value=parts[0]||'';
    document.getElementById('u-last').value=parts.slice(1).join(' ')||'';
    document.getElementById('u-email').value=u.email;
    document.getElementById('u-role').value=u.role;
    document.getElementById('u-status').value=u.status;
    document.getElementById('u-phone').value=u.phone||'';
    document.getElementById('u-pass').value='';
    document.getElementById('u-pass2').value='';
  } else {
    document.getElementById('modal-user-title').textContent='Nuevo Usuario';
    ['u-name','u-last','u-email','u-phone','u-pass','u-pass2'].forEach(f=>document.getElementById(f).value='');
    document.getElementById('u-status').value='Activo';
  }
  ['u-name','u-last','u-email'].forEach(f=>document.getElementById(f).parentElement.classList.remove('has-error'));
  openModal('modal-user');
}
function editUser(id){openUserModal(id);}
function deleteUser(id){
  const u=state.users.find(x=>x.id===id);
  confirmDelete(`¿Eliminar al usuario "${u.name}"?`,()=>{state.users=state.users.filter(x=>x.id!==id);renderUsers();updateDashboard();toast('Usuario eliminado','error');});
}
function saveUser(){
  const name=document.getElementById('u-name').value.trim();
  const last=document.getElementById('u-last').value.trim();
  const email=document.getElementById('u-email').value.trim();
  let ok=true;
  if(!name){document.getElementById('u-name').parentElement.classList.add('has-error');ok=false;}else document.getElementById('u-name').parentElement.classList.remove('has-error');
  if(!last){document.getElementById('u-last').parentElement.classList.add('has-error');ok=false;}else document.getElementById('u-last').parentElement.classList.remove('has-error');
  if(!email||!email.includes('@')){document.getElementById('u-email').parentElement.classList.add('has-error');ok=false;}else document.getElementById('u-email').parentElement.classList.remove('has-error');
  if(!ok) return;
  const id=document.getElementById('u-id').value;
  const obj={
    id:id||genId('USR'),name:`${name} ${last}`,email,
    role:document.getElementById('u-role').value,
    status:document.getElementById('u-status').value,
    phone:document.getElementById('u-phone').value,
    lastAccess:id?state.users.find(x=>x.id===id)?.lastAccess:'—'
  };
  if(id){const i=state.users.findIndex(x=>x.id===id);state.users[i]=obj;toast('Usuario actualizado','success');}
  else{state.users.push(obj);toast('Usuario creado','success');}
  closeModal('modal-user');renderUsers();updateDashboard();
}
 
// ======= REPORTS =======
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
    thead='<tr><th>Estudiante</th><th>Curso</th><th>Examen 1</th><th>Examen 2</th><th>Tarea</th><th>Participación</th><th>Promedio</th><th>Estado</th></tr>';
    tbody=state.grades.map(g=>{
      const avg=Math.round((g.e1+g.e2+g.task+g.part)/4);
      const cls=avg>=90?'badge-success':avg>=70?'badge-blue':avg>=51?'badge-warning':'badge-danger';
      const st=avg>=90?'Excelente':avg>=70?'Aprobado':avg>=51?'Regular':'Reprobado';
      return `<tr><td>${g.student}</td><td>3°A</td><td>${g.e1}</td><td>${g.e2}</td><td>${g.task}</td><td>${g.part}</td><td><strong>${avg}</strong></td><td><span class="badge ${cls}">${st}</span></td></tr>`;
    }).join('');
  } else if(currentReport==='asistencia'){
    thead='<tr><th>Estudiante</th><th>Presentes</th><th>Ausentes</th><th>Tardanzas</th><th>% Asistencia</th></tr>';
    tbody=attendanceStudents.map(s=>{const p=Math.floor(15+Math.random()*5),a=Math.floor(Math.random()*3),l=Math.floor(Math.random()*2),tot=p+a+l,pct=Math.round(p/tot*100);return`<tr><td>${s}</td><td>${p}</td><td>${a}</td><td>${l}</td><td><span class="badge ${pct>=90?'badge-success':pct>=75?'badge-warning':'badge-danger'}">${pct}%</span></td></tr>`;}).join('');
  } else {
    thead='<tr><th>Estudiante</th><th>Concepto</th><th>Monto</th><th>Método</th><th>Fecha</th><th>Estado</th></tr>';
    tbody=state.payments.map(p=>`<tr><td>${p.student}</td><td>${p.concept}</td><td><strong>Bs. ${p.amount}</strong></td><td>${p.method||'—'}</td><td>${p.date||'—'}</td><td>${badgeStatus(p.status)}</td></tr>`).join('');
  }
  document.getElementById('rep-thead').innerHTML=thead;
  document.getElementById('rep-tbody').innerHTML=tbody||emptyRow(6);
}
 
// ======= INIT =======
function initApp(){
  updateClock();setInterval(updateClock,1000);
  renderStudents();renderTeachers();renderSubjects();renderCourses();
  renderGrades();renderPayments();renderInscriptions();renderUsers();
  renderScheduleList();renderAttendance();
  updateDashboard();
}
 
// Init captcha on page load
refreshCaptcha();