import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/ui/Spinner';
import useFetch from '../../hooks/useFetch';
import { myPortalPayments } from '../../services/portalService';

export default function MyPayments() {
  const { toggleSidebar } = useOutletContext();
  const { data, loading } = useFetch(myPortalPayments, []);

  const methodVariant = (m) => m === 'qr' ? 'warning' : m === 'tarjeta' ? 'neutral' : 'success';
  const statusVariant = (s) => s === 'pagado' ? 'success' : s === 'anulado' ? 'danger' : 'warning';

  const columns = [
    { key:'payment_date', label:'Fecha', render:(r)=>new Date(r.payment_date).toLocaleDateString('es-BO') },
    { key:'concept', label:'Concepto' },
    { key:'amount', label:'Monto', render:(r)=>`Bs. ${Number(r.amount).toLocaleString('es-BO',{minimumFractionDigits:2})}` },
    { key:'payment_method', label:'Método', render:(r)=><Badge variant={methodVariant(r.payment_method)}>{r.payment_method.toUpperCase()}</Badge> },
    { key:'reference', label:'Referencia', render:(r)=>r.qr_code||r.reference||'—' },
    { key:'status', label:'Estado', render:(r)=><Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
  ];

  return (
    <>
      <Header title="Mis Pagos" onToggleSidebar={toggleSidebar} />
      <main className="p-6">
        {loading ? <Spinner size="lg" /> : (
          <DataTable columns={columns} data={data||[]} searchable={['concept','reference','qr_code']} searchPlaceholder="Buscar por concepto..." />
        )}
      </main>
    </>
  );
}
