import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import useToast from '../../hooks/useToast';
import { myPortalCourses, myPortalSubjects, myPortalGrades } from '../../services/portalService';

export default function MyGrades() {
  const { toggleSidebar } = useOutletContext();
  const { showError } = useToast();

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loadingC, setLoadingC] = useState(true);
  const [loadingG, setLoadingG] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  useEffect(() => {
    (async () => {
      try { const { data } = await myPortalCourses(); setCourses(data.data); }
      catch { showError('Error al cargar cursos'); }
      finally { setLoadingC(false); }
    })();
  }, []);

  useEffect(() => {
    if (!courseId) { setSubjects([]); setSubjectId(''); return; }
    (async () => {
      try { const { data } = await myPortalSubjects(courseId); setSubjects(data.data); setSubjectId(''); }
      catch { showError('Error'); }
    })();
  }, [courseId]);

  useEffect(() => {
    const params = {};
    if (courseId) params.course_id = courseId;
    if (subjectId) params.subject_id = subjectId;
    (async () => {
      setLoadingG(true);
      try { const { data } = await myPortalGrades(params); setGrades(data.data); }
      catch { showError('Error al cargar notas'); }
      finally { setLoadingG(false); }
    })();
  }, [courseId, subjectId]);

  const getVariant = (val, max) => {
    const pct = (val / max) * 100;
    if (pct >= 70) return 'success';
    if (pct >= 50) return 'warning';
    return 'danger';
  };

  return (
    <>
      <Header title="Mis Notas" onToggleSidebar={toggleSidebar} />
      <main className="p-6 space-y-6">
        <Card title="Filtrar por curso y materia">
          {loadingC ? <Spinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Curso" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">— Todos los cursos —</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.period})</option>)}
              </Select>
              <Select label="Materia" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!courseId}>
                <option value="">— Todas las materias —</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          )}
        </Card>

        <Card title={`Calificaciones (${grades.length})`}>
          {loadingG ? <Spinner /> : grades.length === 0 ? (
            <EmptyState title="No hay notas registradas" description="Tus docentes aún no han publicado calificaciones." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="text-left px-4 py-3 font-semibold">Materia</th>
                    <th className="text-left px-4 py-3 font-semibold">Curso</th>
                    <th className="text-left px-4 py-3 font-semibold">Período</th>
                    <th className="text-left px-4 py-3 font-semibold">Evaluación</th>
                    <th className="text-center px-4 py-3 font-semibold">Nota</th>
                    <th className="text-left px-4 py-3 font-semibold">Docente</th>
                    <th className="text-left px-4 py-3 font-semibold">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g, idx) => (
                    <tr key={g.id} className={idx % 2 === 0 ? 'bg-bglight' : 'bg-white'}>
                      <td className="px-4 py-3 font-medium">{g.subject_name}</td>
                      <td className="px-4 py-3">{g.course_name}</td>
                      <td className="px-4 py-3">{g.period}</td>
                      <td className="px-4 py-3">{g.evaluation_type}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={getVariant(g.grade_value, g.max_value)}>
                          {g.grade_value} / {g.max_value}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{g.teacher_name}</td>
                      <td className="px-4 py-3 text-[13px] text-textmuted">{g.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
