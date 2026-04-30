import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import QrDisplay from '../../components/payments/QrDisplay';
import PaymentForm from './PaymentForm';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import { listPayments, cancelPayment } from '../../services/paymentService';

export default function PaymentsList() {
  const { toggleSidebar } = useOutletContext();
  const { showSuccess, showError } = useToast();
  const { data, loading, reload } = useFetch(listPayments, []);
  const [openForm, setOpenForm] = useState(false);
  const [qrPayment, setQrPayment] = useState(null);

  const handleCancel = async (row) => { try { await cancelPayment(row.id); showSuccess('Pago anulado'); reload(); } catch (err) { showError(err.response?.data?.message || 'Error'); } };
  const methodVariant = (m) => m === 'qr' ? 'warning' : m === 'tarjeta' ? 'neutral' : 'success';
  const statusVariant = (s) => s === 'pagado' ? 'success' : s === 'anulado' ? 'danger' : 'warning';

  const columns = [
    { key:'payment_date',label:'Fecha',render:(r)=>new Date(r.payment_date).toLocaleDateString('es-BO') },
    { key:'student_name',label:'Estudiante' },{ key:'student_code',label:'Código' },{ key:'concept',label:'Concepto' },
    { key:'amount',label:'Monto',render:(r)=>`Bs. ${Number(r.amount).toLocaleString('es-BO',{minimumFractionDigits:2})}` },
    { key:'payment_method',label:'Método',render:(r)=><Badge variant={methodVariant(r.payment_method)}>{r.payment_method.toUpperCase()}</Badge> },
    { key:'reference',label:'Ref / QR',render:(r)=>r.qr_code||r.reference||'—' },
    { key:'status',label:'Estado',render:(r)=><Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
  ];

  return (
    <>
      <Header title="Pagos" onToggleSidebar={toggleSidebar} action={<Button onClick={() => setOpenForm(true)}>+ Registrar pago</Button>} />
      <main className="p-6">
        {loading ? <Spinner size="lg" /> : (
          <DataTable columns={columns} data={data || []} searchable={['student_name','student_code','concept','reference','qr_code']} searchPlaceholder="Buscar..."
            rowActions={(row) => (
              <div className="flex gap-2 justify-end">
                {row.qr_code && <Button variant="ghost" onClick={() => setQrPayment(row)}>Ver QR</Button>}
                {row.status === 'pagado' && <Button variant="danger" onClick={() => handleCancel(row)}>Anular</Button>}
              </div>
            )} />
        )}
      </main>
      <PaymentForm open={openForm} onClose={() => setOpenForm(false)} onSaved={() => { setOpenForm(false); reload(); }} />
      <Modal open={!!qrPayment} onClose={() => setQrPayment(null)} title="Código QR del pago" footer={<Button onClick={() => setQrPayment(null)}>Cerrar</Button>}>
        {qrPayment && (
          <div className="flex flex-col items-center gap-3">
            <div className="text-[14px] text-textmuted">Pago de <strong className="text-primary">{qrPayment.student_name}</strong></div>
            <div className="text-[22px] font-semibold text-primary">Bs. {Number(qrPayment.amount).toLocaleString('es-BO',{minimumFractionDigits:2})}</div>
            <QrDisplay value={qrPayment.qr_code} />
          </div>
        )}
      </Modal>
    </>
  );
}
