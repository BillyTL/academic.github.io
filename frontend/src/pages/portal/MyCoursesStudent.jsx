import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';
import { myPortalCourses, myPortalSubjects } from '../../services/portalService';

export default function MyCoursesStudent() {
  const { toggleSidebar } = useOutletContext();
  const { showError } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await myPortalCourses();
        setCourses(data.data);
      } catch { showError('Error al cargar tus cursos'); }
      finally { setLoading(false); }
    })();
  }, []);

  const toggleCourse = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      setSubjects([]);
      return;
    }
    setExpandedCourse(courseId);
    setLoadingSub(true);
    try {
      const { data } = await myPortalSubjects(courseId);
      setSubjects(data.data);
    } catch { showError('Error al cargar materias'); }
    finally { setLoadingSub(false); }
  };

  return (
    <>
      <Header title="Mis Cursos y Materias" onToggleSidebar={toggleSidebar} />
      <main className="p-6 space-y-4">
        {loading ? <Spinner size="lg" /> : courses.length === 0 ? (
          <Card><EmptyState title="No estás inscrito en ningún curso" description="Contacta a la secretaría para inscribirte." /></Card>
        ) : (
          courses.map((c) => (
            <Card key={c.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-semibold text-primary">{c.name}</h3>
                  <div className="flex gap-3 mt-1 text-[13px] text-textmuted">
                    {c.level && <span>Nivel: {c.level}</span>}
                    <span>Período: {c.period}</span>
                    <span>Inscrito: {new Date(c.enrollment_date).toLocaleDateString('es-BO')}</span>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => toggleCourse(c.id)}>
                  {expandedCourse === c.id ? '▲ Ocultar materias' : '▼ Ver materias'}
                </Button>
              </div>

              {expandedCourse === c.id && (
                <div className="mt-4">
                  {loadingSub ? <Spinner /> : subjects.length === 0 ? (
                    <div className="text-[13px] text-textmuted p-3 bg-bglight rounded-card">No hay materias asignadas a este curso todavía.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[14px]">
                        <thead>
                          <tr className="bg-primary text-white">
                            <th className="text-left px-4 py-3 font-semibold">Materia</th>
                            <th className="text-left px-4 py-3 font-semibold">Código</th>
                            <th className="text-left px-4 py-3 font-semibold">Docente</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map((s, idx) => (
                            <tr key={s.id} className={idx % 2 === 0 ? 'bg-bglight' : 'bg-white'}>
                              <td className="px-4 py-3 font-medium">{s.name}</td>
                              <td className="px-4 py-3"><Badge variant="neutral">{s.code || '—'}</Badge></td>
                              <td className="px-4 py-3">{s.teacher_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </main>
    </>
  );
}
