import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import KpiCard from '../../components/kpi/KpiCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import { getSummary } from '../../services/dashboardService';

export default function Dashboard() {
  const { toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const { data, loading } = useFetch(getSummary, []);
  return (
    <>
      <Header title="Dashboard" onToggleSidebar={toggleSidebar} />
      <main className="p-6 space-y-6">
        <Card>
          <h2 className="text-[22px] font-semibold text-primary">Hola, {user?.name?.split(' ')[0]} 👋</h2>
          <p className="text-textmuted">Este es el resumen general del sistema Educore.</p>
        </Card>
        {loading ? <Spinner size="lg" /> : data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard label="Estudiantes activos" value={data.students} icon="🎓" />
            <KpiCard label="Docentes activos" value={data.teachers} icon="👨‍🏫" />
            <KpiCard label="Cursos activos" value={data.courses} icon="📚" />
            <KpiCard label="Materias" value={data.subjects} icon="📘" />
            <KpiCard label="Pagos del mes (Bs.)" value={Number(data.payments_month).toLocaleString('es-BO',{minimumFractionDigits:2})} icon="💳" />
            <KpiCard label="Sin curso asignado" value={data.students_without_course} variant={data.students_without_course>0?'warning':'default'} icon="⚠" />
          </div>
        )}
      </main>
    </>
  );
}
