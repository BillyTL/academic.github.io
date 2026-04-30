import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';

const DEMO_ACCOUNTS = [
  { label: 'Administrador', email: 'admin@educore.com', icon: '🛡️' },
  { label: 'Secretaría', email: 'secretaria@educore.com', icon: '📋' },
  { label: 'Docente', email: 'docente1@educore.com', icon: '👨‍🏫' },
  { label: 'Estudiante', email: 'ana@educore.com', icon: '🎓' },
];

export default function Login() {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { showError('Ingresa email y contraseña'); return; }
    setLoading(true);
    try {
      const u = await login(email, password);
      showSuccess(`Bienvenido, ${u.name.split(' ')[0]}`);
      navigate('/dashboard');
    } catch (err) {
      showError(err.response?.data?.message || 'Credenciales inválidas');
    } finally { setLoading(false); }
  };

  const quickLogin = (acc) => {
    setEmail(acc.email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #F1F0E4 0%, #e8e6d4 50%, #BCA88D 100%)' }}>
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary text-white text-xl font-bold flex items-center justify-center shadow-lg">Ec</div>
            <span className="text-2xl font-bold text-primary tracking-tight">EduCore</span>
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-[12px] font-medium mb-4">
            Sistema de gestión académica · 2026
          </div>
          <h1 className="text-[42px] font-bold text-primary leading-tight mb-4">
            Gestión académica <span className="text-accent">completa</span><br />en una sola plataforma
          </h1>
          <p className="text-[16px] text-textmuted leading-relaxed max-w-lg">
            EduCore centraliza estudiantes, notas, horarios, pagos e inscripciones. Cada usuario accede únicamente a lo que le corresponde, según su rol.
          </p>
        </div>

        <div className="mt-8">
          <div className="text-[11px] text-textmuted uppercase tracking-widest font-medium mb-3">Acceso por rol</div>
          <div className="text-[13px] text-textmuted">Administrador · Docente · Estudiante · Secretaría</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8 max-w-md">
          {[
            { icon: '🛡️', title: 'Administrador', desc: 'Control total del sistema, usuarios y reportes.' },
            { icon: '👨‍🏫', title: 'Docente', desc: 'Registro de notas, asistencia y horarios.' },
            { icon: '🎓', title: 'Estudiante', desc: 'Consulta notas, horarios y pagos.' },
            { icon: '📋', title: 'Secretaría', desc: 'Inscripciones, pagos y expedientes.' },
          ].map((r) => (
            <div key={r.title} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/80">
              <div className="text-lg mb-1">{r.icon}</div>
              <div className="text-[13px] font-semibold text-primary">{r.title}</div>
              <div className="text-[11px] text-textmuted mt-0.5">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-borderdef/50">
            {/* Logo móvil */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary text-white text-lg font-bold flex items-center justify-center">Ec</div>
                <span className="text-xl font-bold text-primary">EduCore</span>
              </div>
              <p className="text-[13px] text-textmuted">Sistema de Gestión Académica</p>
            </div>

            <div className="mb-6">
              <h2 className="text-[24px] font-bold text-primary">Iniciar sesión</h2>
              <p className="text-[14px] text-textmuted mt-1">Ingresa tus credenciales para acceder</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-textmain mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@educore.com"
                  className="w-full h-12 px-4 rounded-lg border border-borderdef bg-bglight/50 text-textmain text-[14px]
                             focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 focus:bg-white
                             transition-all duration-200"
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-textmain mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-lg border border-borderdef bg-bglight/50 text-textmain text-[14px]
                             focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 focus:bg-white
                             transition-all duration-200"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-white rounded-lg font-medium text-[14px]
                           hover:bg-[#2f3020] disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Ingresar al sistema'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-borderdef">
              <div className="text-[12px] text-textmuted font-medium mb-3 text-center">Acceso rápido demo</div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => quickLogin(acc)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-borderdef
                               hover:bg-bglight hover:border-accent/50 transition-all duration-200 text-left"
                  >
                    <span className="text-lg">{acc.icon}</span>
                    <div>
                      <div className="text-[12px] font-medium text-primary">{acc.label}</div>
                      <div className="text-[10px] text-textmuted">{acc.email}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-textmuted text-center mt-3">Password: password123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
