import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';
import { registerAttendance } from '../../services/attendanceService';
import { ATTENDANCE_STATUS } from '../../utils/constants';

export default function AttendanceForm({ open, onClose, courseId, subjectId, students }) {
  const { showSuccess, showError } = useToast();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState(students.reduce((acc, s) => ({ ...acc, [s.id]: { status:'presente', notes:'' } }), {}));
  const [saving, setSaving] = useState(false);
  const setStatus = (id, status) => setRecords({ ...records, [id]: { ...records[id], status } });
  const setNotes = (id, notes) => setRecords({ ...records, [id]: { ...records[id], notes } });
  const setAll = (status) => setRecords(students.reduce((acc, s) => ({ ...acc, [s.id]: { ...records[s.id], status } }), {}));

  const onSubmit = async () => {
    setSaving(true);
    try {
      await registerAttendance({ course_id: courseId, subject_id: subjectId, attendance_date: date,
        records: students.map((s) => ({ student_id: s.id, status: records[s.id]?.status || 'presente', notes: records[s.id]?.notes || null })) });
      showSuccess('Asistencia registrada'); onClose?.();
    } catch (err) { showError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar asistencia" maxWidth={820}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} loading={saving}>Guardar asistencia</Button></>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex items-end gap-2">
          <Button variant="secondary" onClick={() => setAll('presente')}>Todos presentes</Button>
          <Button variant="secondary" onClick={() => setAll('ausente')}>Todos ausentes</Button>
        </div>
      </div>
      <div className="space-y-2">
        {students.map((s) => (
          <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-bglight p-3 rounded-card">
            <div className="md:col-span-4">
              <div className="font-medium text-primary">{s.full_name}</div>
              <div className="text-[12px] text-textmuted">{s.student_code}</div>
            </div>
            <div className="md:col-span-3 flex gap-1">
              {ATTENDANCE_STATUS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setStatus(s.id, opt.value)}
                  className={`flex-1 h-10 rounded-btn text-[13px] font-medium border transition-colors ${records[s.id]?.status === opt.value
                    ? opt.value === 'presente' ? 'bg-success text-white border-success' : opt.value === 'ausente' ? 'bg-danger text-white border-danger' : 'bg-warning text-white border-warning'
                    : 'bg-white border-borderdef text-textmuted hover:bg-rowhover'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="md:col-span-5">
              <input placeholder="Notas (opcional)" value={records[s.id]?.notes || ''} onChange={(e) => setNotes(s.id, e.target.value)}
                className="h-10 w-full px-3 rounded-btn border border-borderdef bg-white text-[13px] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20" />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
