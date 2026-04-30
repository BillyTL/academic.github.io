import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import QrDisplay from '../../components/payments/QrDisplay';
import useToast from '../../hooks/useToast';
import useFetch from '../../hooks/useFetch';
import { listStudents } from '../../services/studentService';
import { createPayment } from '../../services/paymentService';
import { PAYMENT_METHODS } from '../../utils/constants';

const empty = { student_id:'', amount:'', payment_method:'efectivo', reference:'', concept:'', payment_date:new Date().toISOString().slice(0,10) };

export default function PaymentForm({ open, onClose, onSaved }) {
  const { showSuccess, showError } = useToast();
  const { data: students } = useFetch(listStudents, []);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);

  useEffect(() => { if (open) { setForm(empty); setGeneratedQr(null); } }, [open]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await createPayment(form);
      const qr = data?.data?.qr_code;
      showSuccess('Pago registrado');
      if (qr) setGeneratedQr(qr); else onSaved?.();
    } catch (err) { showError(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const close = () => { if (generatedQr) onSaved?.(); else onClose?.(); };

  return (
    <Modal open={open} onClose={close} title={generatedQr ? 'Pago registrado — QR generado' : 'Registrar pago'} maxWidth={620}
      footer={generatedQr ? <Button onClick={() => onSaved?.()}>Listo</Button> : <><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} loading={saving}>Registrar pago</Button></>}>
      {generatedQr ? (
        <div className="flex flex-col items-center gap-3">
          <div className="text-[14px] text-textmuted text-center">El pago fue registrado con éxito. Comparte este QR:</div>
          <QrDisplay value={generatedQr} size={240} />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Estudiante" value={form.student_id} onChange={set('student_id')} required>
            <option value="">— Selecciona —</option>
            {(students || []).filter(s => s.status === 'activo').map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.student_code})</option>)}
          </Select>
          <Input label="Concepto" value={form.concept} onChange={set('concept')} required placeholder="Ej. Mensualidad Marzo" />
          <Input label="Monto (Bs.)" type="number" step="0.01" min="0.01" value={form.amount} onChange={set('amount')} required />
          <Input label="Fecha" type="date" value={form.payment_date} onChange={set('payment_date')} required />
          <Select label="Método de pago" value={form.payment_method} onChange={set('payment_method')}>
            {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </Select>
          {form.payment_method !== 'qr' && <Input label={form.payment_method === 'tarjeta' ? 'Nº autorización' : 'Nº de recibo'} value={form.reference} onChange={set('reference')} />}
          {form.payment_method === 'qr' && (
            <div className="flex items-end"><div className="text-[12px] text-textmuted bg-badgeWnBg p-3 rounded-btn border-l-4 border-warning w-full">Se generará un código QR único automáticamente.</div></div>
          )}
        </form>
      )}
    </Modal>
  );
}
