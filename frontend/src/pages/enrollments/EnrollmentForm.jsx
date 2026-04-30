import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/ui/Spinner';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import { listStudents } from '../../services/studentService';
import { listCourses } from '../../services/courseService';
import { listEnrollments, createEnrollment, deactivateEnrollment } from '../../services/enrollmentService';

export default function EnrollmentForm() {
  const { toggleSidebar } = useOutletContext();
  const { showSuccess, showError } = useToast();
  const { data: students, loading: lS } = useFetch(listStudents, []);
  const { data: courses, loading: lC } = useFetch(listCourses, []);
  const { data: enrolls, loading: lE, reload } = useFetch(listEnrollments, []);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const selectedStudent = useMemo(() => students?.find((s) => s.id === Number(studentId)), [students, studentId]);
  const selectedCourse = useMemo(() => courses?.find((c) => c.id === Number(courseId)), [courses, courseId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!studentId || !courseId) { showError('Selecciona estudiante y curso'); return; }
    setSaving(true);
    try { await createEnrollment({ student_id: Number(studentId), course_id: Number(courseId), enrollment_date: date }); showSuccess(`Inscrito en ${selectedCourse.name}`); setStudentId(''); setCourseId(''); reload(); }
    catch (err) { showError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (row) => { try { await deactivateEnrollment(row.id); showSuccess('Inscripción desactivada'); reload(); } catch (err) { showError(err.response?.data?.message || 'Error'); } };

  const columns = [
    { key: 'student_name', label: 'Estudiante' }, { key: 'student_code', label: 'Código' },
    { key: 'course_name', label: 'Curso' }, { key: 'period', label: 'Período' },
    { key: 'enrollment_date', label: 'Fecha', render: (r) => r.enrollment_date ? new Date(r.enrollment_date).toLocaleDateString('es-BO') : '—' },
    { key: 'status', label: 'Estado', render: (r) => <Badge variant={r.status === 'activo' ? 'success' : 'danger'}>{r.status}</Badge> },
  ];

  return (
    <>
      <Header title="Inscripciones" onToggleSidebar={toggleSidebar} />
      <main className="p-6 space-y-6">
        <Card title="Inscribir estudiante en curso">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select label="Estudiante" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              <option value="">— Selecciona estudiante —</option>
              {(students || []).filter(s => s.status === 'activo').map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.student_code})</option>)}
            </Select>
            <Select label="Curso" value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
              <option value="">— Selecciona curso —</option>
              {(courses || []).filter(c => c.status === 'activo').map((c) => <option key={c.id} value={c.id}>{c.name} — {c.period}</option>)}
            </Select>
            <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <div className="flex items-end"><Button type="submit" loading={saving} className="w-full">Inscribir</Button></div>
          </form>
          {selectedStudent && selectedCourse && (
            <div className="mt-5 p-4 bg-bglight rounded-card border-l-4 border-accent">
              <div className="text-[13px] text-textmuted">Vas a inscribir a:</div>
              <div className="text-[16px] font-medium text-primary">{selectedStudent.full_name} → {selectedCourse.name} ({selectedCourse.period})</div>
            </div>
          )}
        </Card>
        <div>
          <h3 className="text-[18px] font-medium text-primary mb-3">Inscripciones existentes</h3>
          {(lS || lC || lE) ? <Spinner size="lg" /> : (
            <DataTable columns={columns} data={enrolls || []} searchable={['student_name', 'student_code', 'course_name']} searchPlaceholder="Buscar..."
              rowActions={(row) => row.status === 'activo' && <Button variant="danger" onClick={() => handleDeactivate(row)}>Desactivar</Button>} />
          )}
        </div>
      </main>
    </>
  );
}
