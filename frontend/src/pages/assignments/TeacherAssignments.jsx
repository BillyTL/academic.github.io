import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/ui/Spinner';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import { listTeachers } from '../../services/teacherService';
import { listCourses } from '../../services/courseService';
import { listSubjects } from '../../services/subjectService';
import { listAssignments, createAssignment, deactivateAssignment, activateAssignment } from '../../services/assignmentService';

export default function TeacherAssignments() {
  const { toggleSidebar } = useOutletContext();
  const { showSuccess, showError } = useToast();
  const { data: teachers } = useFetch(listTeachers, []);
  const { data: courses } = useFetch(listCourses, []);
  const { data: subjects } = useFetch(listSubjects, []);
  const { data, loading, reload } = useFetch(listAssignments, []);
  const [form, setForm] = useState({ teacher_id:'', course_id:'', subject_id:'' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createAssignment(form); showSuccess('Asignación creada'); setForm({ teacher_id:'', course_id:'', subject_id:'' }); reload(); }
    catch (err) { showError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (row) => {
    try {
      if (row.status === 'activo') { await deactivateAssignment(row.id); showSuccess('Asignación desactivada'); }
      else { await activateAssignment(row.id); showSuccess('Asignación activada'); }
      reload();
    } catch (err) { showError(err.response?.data?.message || 'Error'); }
  };

  const columns = [
    { key:'teacher_name',label:'Docente' },{ key:'teacher_code',label:'Código' },
    { key:'course_name',label:'Curso' },{ key:'subject_name',label:'Materia' },
    { key:'status',label:'Estado',render:(r)=><Badge variant={r.status==='activo'?'success':'danger'}>{r.status}</Badge> },
  ];

  return (
    <>
      <Header title="Asignaciones (Docente → Curso → Materia)" onToggleSidebar={toggleSidebar} />
      <main className="p-6 space-y-6">
        <Card title="Nueva asignación">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select label="Docente" value={form.teacher_id} onChange={set('teacher_id')} required>
              <option value="">— Selecciona —</option>
              {(teachers||[]).filter(t=>t.status==='activo').map((t)=><option key={t.id} value={t.id}>{t.full_name} ({t.teacher_code})</option>)}
            </Select>
            <Select label="Curso" value={form.course_id} onChange={set('course_id')} required>
              <option value="">— Selecciona —</option>
              {(courses||[]).filter(c=>c.status==='activo').map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Materia" value={form.subject_id} onChange={set('subject_id')} required>
              <option value="">— Selecciona —</option>
              {(subjects||[]).filter(s=>s.status==='activo').map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <div className="flex items-end"><Button type="submit" loading={saving} className="w-full">Asignar</Button></div>
          </form>
        </Card>
        <div>
          <h3 className="text-[18px] font-medium text-primary mb-3">Asignaciones existentes</h3>
          {loading?<Spinner size="lg"/>:(
            <DataTable columns={columns} data={data||[]} searchable={['teacher_name','course_name','subject_name']} searchPlaceholder="Buscar..."
              rowActions={(row)=>(
                <Button
                  variant={row.status==='activo'?'danger':'accent'}
                  onClick={()=>handleToggle(row)}
                >
                  {row.status==='activo'?'Desactivar':'Activar'}
                </Button>
              )}/>
          )}
        </div>
      </main>
    </>
  );
}
