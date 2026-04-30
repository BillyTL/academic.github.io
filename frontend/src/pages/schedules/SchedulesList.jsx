import { useState } from 'react';
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
import { listTeachers } from '../../services/teacherService';
import { listCourses } from '../../services/courseService';
import { listSubjects } from '../../services/subjectService';
import { listSchedules, createSchedule, deactivateSchedule, activateSchedule } from '../../services/scheduleService';

const DAYS = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

export default function SchedulesList() {
  const { toggleSidebar } = useOutletContext();
  const { showSuccess, showError } = useToast();
  const { data: teachers } = useFetch(listTeachers, []);
  const { data: courses } = useFetch(listCourses, []);
  const { data: subjects } = useFetch(listSubjects, []);
  const { data, loading, reload } = useFetch(listSchedules, []);
  const [form, setForm] = useState({ course_id:'', subject_id:'', teacher_id:'', day_of_week:'Lunes', start_time:'08:00', end_time:'09:30', classroom:'' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await createSchedule(form); showSuccess('Horario creado'); setForm({ ...form, subject_id:'', teacher_id:'', classroom:'' }); reload(); }
    catch (err) { showError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (row) => {
    try {
      if (row.status === 'activo') { await deactivateSchedule(row.id); showSuccess('Horario desactivado'); }
      else { await activateSchedule(row.id); showSuccess('Horario activado'); }
      reload();
    } catch (err) { showError(err.response?.data?.message || 'Error'); }
  };

  const columns = [
    { key:'id', label:'ID', className:'w-16' },
    { key:'course_name', label:'Curso' },
    { key:'day_of_week', label:'Día' },
    { key:'start_time', label:'Hora Inicio', render:(r)=>r.start_time?.slice(0,5) },
    { key:'end_time', label:'Hora Fin', render:(r)=>r.end_time?.slice(0,5) },
    { key:'subject_name', label:'Materia' },
    { key:'teacher_name', label:'Docente' },
    { key:'classroom', label:'Aula', render:(r)=>r.classroom||'—' },
    { key:'status', label:'Estado', render:(r)=><Badge variant={r.status==='activo'?'success':'danger'}>{r.status}</Badge> },
  ];

  return (
    <>
      <Header title="Horarios" onToggleSidebar={toggleSidebar} />
      <main className="p-6 space-y-6">
        <Card title="Crear horario">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Select label="Curso" value={form.course_id} onChange={set('course_id')} required>
              <option value="">— Selecciona —</option>
              {(courses||[]).filter(c=>c.status==='activo').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Materia" value={form.subject_id} onChange={set('subject_id')} required>
              <option value="">— Selecciona —</option>
              {(subjects||[]).filter(s=>s.status==='activo').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Docente" value={form.teacher_id} onChange={set('teacher_id')} required>
              <option value="">— Selecciona —</option>
              {(teachers||[]).filter(t=>t.status==='activo').map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
            </Select>
            <Select label="Día" value={form.day_of_week} onChange={set('day_of_week')}>
              {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
            </Select>
            <Input label="Hora Inicio" type="time" value={form.start_time} onChange={set('start_time')} required />
            <Input label="Hora Fin" type="time" value={form.end_time} onChange={set('end_time')} required />
            <Input label="Aula" value={form.classroom} onChange={set('classroom')} placeholder="Ej. Aula 101" />
            <div className="flex items-end">
              <Button type="submit" loading={saving} className="w-full">Crear horario</Button>
            </div>
          </form>
        </Card>

        <div>
          <h3 className="text-[18px] font-medium text-primary mb-3">Horarios registrados</h3>
          {loading ? <Spinner size="lg" /> : (
            <DataTable columns={columns} data={data||[]} searchable={['course_name','subject_name','teacher_name','day_of_week','classroom']} searchPlaceholder="Buscar por curso, materia, docente, día..."
              rowActions={(row)=>(
                <Button variant={row.status==='activo'?'danger':'accent'} onClick={()=>handleToggle(row)}>
                  {row.status==='activo'?'Desactivar':'Activar'}
                </Button>
              )} />
          )}
        </div>
      </main>
    </>
  );
}
