import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const NAV = [
  { to:'/dashboard',label:'Dashboard',roles:['administrador','secretaria','docente','estudiante'],icon:'◉' },
  { to:'/users',label:'Usuarios',roles:['administrador','secretaria'],icon:'👥' },
  { to:'/students',label:'Estudiantes',roles:['administrador','secretaria'],icon:'🎓' },
  { to:'/teachers',label:'Docentes',roles:['administrador','secretaria'],icon:'👨‍🏫' },
  { to:'/courses',label:'Cursos',roles:['administrador','secretaria'],icon:'📚' },
  { to:'/subjects',label:'Materias',roles:['administrador','secretaria'],icon:'📘' },
  { to:'/schedules',label:'Horarios',roles:['administrador','secretaria'],icon:'🕐' },
  { to:'/enrollments',label:'Inscripciones',roles:['administrador','secretaria'],icon:'📝' },
  { to:'/assignments',label:'Asignaciones',roles:['administrador','secretaria'],icon:'🔗' },
  { to:'/teacher',label:'Mis Clases',roles:['docente'],icon:'🏫' },
  { to:'/teacher/schedule',label:'Mi Horario',roles:['docente'],icon:'🕐' },
  { to:'/payments',label:'Pagos',roles:['administrador','secretaria'],icon:'💳' },
  { to:'/portal/courses',label:'Mis Cursos',roles:['estudiante'],icon:'📚' },
  { to:'/portal/schedule',label:'Mi Horario',roles:['estudiante'],icon:'🕐' },
  { to:'/portal/grades',label:'Mis Notas',roles:['estudiante'],icon:'📝' },
  { to:'/portal/payments',label:'Mis Pagos',roles:['estudiante'],icon:'💳' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  if (!user) return null;
  const items = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose}/>}
      <aside className={`bg-primary text-white w-60 fixed top-0 left-0 h-full z-40 flex flex-col transform transition-transform duration-200 lg:translate-x-0 ${open?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent text-primary text-sm font-bold flex items-center justify-center">Ec</div>
            <div>
              <div className="text-[18px] font-semibold tracking-tight">EduCore</div>
              <div className="text-[10px] text-white/50">Gestión Académica</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {items.map((it)=>(
            <NavLink key={it.to} to={it.to} onClick={onClose}
              className={({isActive})=>`flex items-center gap-3 px-5 py-2.5 text-[14px] transition-colors ${isActive?'bg-white/10 border-l-4 border-accent text-white font-medium':'text-white/80 hover:bg-white/5 border-l-4 border-transparent'}`}>
              <span className="w-5 text-center">{it.icon}</span><span>{it.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent text-primary font-semibold flex items-center justify-center">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{user.name}</div>
              <div className="text-[11px] text-white/60 capitalize">{user.role}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full h-10 rounded-btn border border-white/20 text-[13px] hover:bg-white/10 transition-colors">Cerrar sesión</button>
        </div>
      </aside>
    </>
  );
}
