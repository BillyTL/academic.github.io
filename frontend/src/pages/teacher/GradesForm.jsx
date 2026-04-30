import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';
import { registerGrades } from '../../services/gradeService';

export default function GradesForm({ open, onClose, courseId, subjectId, students }) {
  const { showSuccess, showError } = useToast();
  const [period, setPeriod] = useState('1er Trimestre');
  const [evaluationType, setEvaluationType] = useState('Examen');
  const [maxValue, setMaxValue] = useState(100);
  const [records, setRecords] = useState(students.reduce((acc, s) => ({ ...acc, [s.id]: { grade_value:'', notes:'' } }), {}));
  const [saving, setSaving] = useState(false);
  const setGrade = (id, v) => setRecords({ ...records, [id]: { ...records[id], grade_value: v } });
  const setNotes = (id, v) => setRecords({ ...records, [id]: { ...records[id], notes: v } });

  const onSubmit = async () => {
    const max = parseFloat(maxValue);
    if (isNaN(max) || max <= 0) { showError('Nota máxima inválida'); return; }
    for (const s of students) {
      const val = records[s.id]?.grade_value;
      if (val === '' || val == null) { showError(`Falta nota de ${s.full_name}`); return; }
      const n = parseFloat(val);
      if (isNaN(n) || n < 0 || n > max) { showError(`Nota fuera de rango (0-${max}) para ${s.full_name}`); return; }
    }
    setSaving(true);
    try {
      await registerGrades({ course_id: courseId, subject_id: subjectId, period, evaluation_type: evaluationType, max_value: max,
        records: students.map((s) => ({ student_id: s.id, grade_value: parseFloat(records[s.id].grade_value), notes: records[s.id].notes || null })) });
      showSuccess('Notas registradas'); onClose?.();
    } catch (err) { showError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar notas" maxWidth={820}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} loading={saving}>Guardar notas</Button></>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Select label="Período" value={period} onChange={(e)=>setPeriod(e.target.value)}>
          <option>1er Trimestre</option><option>2do Trimestre</option><option>3er Trimestre</option><option>Final</option>
        </Select>
        <Select label="Tipo de evaluación" value={evaluationType} onChange={(e)=>setEvaluationType(e.target.value)}>
          <option>Examen</option><option>Práctica</option><option>Tarea</option><option>Proyecto</option><option>Participación</option>
        </Select>
        <Input label="Nota máxima" type="number" min="1" step="1" value={maxValue} onChange={(e)=>setMaxValue(e.target.value)}/>
      </div>
      <div className="space-y-2">
        {students.map((s) => (
          <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-bglight p-3 rounded-card">
            <div className="md:col-span-5"><div className="font-medium text-primary">{s.full_name}</div><div className="text-[12px] text-textmuted">{s.student_code}</div></div>
            <div className="md:col-span-3">
              <input type="number" min="0" max={maxValue} step="0.01" placeholder={`0 - ${maxValue}`} value={records[s.id]?.grade_value||''}
                onChange={(e)=>setGrade(s.id,e.target.value)} className="h-10 w-full px-3 rounded-btn border border-borderdef bg-white focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20"/>
            </div>
            <div className="md:col-span-4">
              <input placeholder="Observaciones (opcional)" value={records[s.id]?.notes||''} onChange={(e)=>setNotes(s.id,e.target.value)}
                className="h-10 w-full px-3 rounded-btn border border-borderdef bg-white text-[13px] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20"/>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
