import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import useToast from '../../hooks/useToast';
import { myCourses, mySubjects, myStudents } from '../../services/assignmentService';
import AttendanceForm from './AttendanceForm';
import GradesForm from './GradesForm';

export default function MyCourses() {
  const { toggleSidebar } = useOutletContext();
  const { showError } = useToast();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingC, setLoadingC] = useState(true);
  const [loadingS, setLoadingS] = useState(false);
  const [loadingSt, setLoadingSt] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [view, setView] = useState(null);

  useEffect(() => { (async () => { try { const { data } = await myCourses(); setCourses(data.data); } catch { showError('Error al cargar cursos'); } finally { setLoadingC(false); } })(); }, []);
  useEffect(() => { if (!courseId) { setSubjects([]); setSubjectId(''); return; } (async () => { setLoadingS(true); try { const { data } = await mySubjects(courseId); setSubjects(data.data); setSubjectId(''); } catch { showError('Error'); } finally { setLoadingS(false); } })(); }, [courseId]);
  useEffect(() => { if (!courseId || !subjectId) { setStudents([]); return; } (async () => { setLoadingSt(true); try { const { data } = await myStudents(courseId, subjectId); setStudents(data.data); } catch { showError('Error'); } finally { setLoadingSt(false); } })(); }, [courseId, subjectId]);

  return (
    <>
      <Header title="Mis Clases" onToggleSidebar={toggleSidebar} />
      <main className="p-6 space-y-6">
        <Card title="Selecciona curso y materia">
          {loadingC ? <Spinner /> : courses.length === 0 ? <EmptyState title="No tienes cursos asignados" description="Contacta a la secretaría." /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Curso" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">— Selecciona curso —</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Select label="Materia" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!courseId || loadingS}>
                <option value="">— Selecciona materia —</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          )}
        </Card>

        {courseId && subjectId && (
          <Card title={`Estudiantes de la materia (${students.length})`}>
            {loadingSt ? <Spinner /> : students.length === 0 ? <EmptyState title="No hay estudiantes inscritos" /> : (
              <>
                <div className="flex gap-3 mb-4 flex-wrap">
                  <Button onClick={() => setView('attendance')}>📋 Registrar Asistencia</Button>
                  <Button variant="accent" onClick={() => setView('grades')}>📝 Registrar Notas</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead><tr className="bg-primary text-white"><th className="text-left px-4 py-3 font-semibold">Código</th><th className="text-left px-4 py-3 font-semibold">Nombre</th><th className="text-left px-4 py-3 font-semibold">Email</th></tr></thead>
                    <tbody>{students.map((s, idx) => (<tr key={s.id} className={idx % 2 === 0 ? 'bg-bglight' : 'bg-white'}><td className="px-4 py-3">{s.student_code}</td><td className="px-4 py-3">{s.full_name}</td><td className="px-4 py-3">{s.email}</td></tr>))}</tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        )}

        {view === 'attendance' && <AttendanceForm open onClose={() => setView(null)} courseId={Number(courseId)} subjectId={Number(subjectId)} students={students} />}
        {view === 'grades' && <GradesForm open onClose={() => setView(null)} courseId={Number(courseId)} subjectId={Number(subjectId)} students={students} />}
      </main>
    </>
  );
}
