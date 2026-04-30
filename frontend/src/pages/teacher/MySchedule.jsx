import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import { mySchedule } from '../../services/scheduleService';

const DAY_ORDER = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

export default function MySchedule() {
  const { toggleSidebar } = useOutletContext();
  const { data, loading } = useFetch(mySchedule, []);

  const grouped = {};
  (data || []).forEach(s => {
    if (!grouped[s.day_of_week]) grouped[s.day_of_week] = [];
    grouped[s.day_of_week].push(s);
  });

  return (
    <>
      <Header title="Mi Horario" onToggleSidebar={toggleSidebar} />
      <main className="p-6 space-y-4">
        {loading ? <Spinner size="lg" /> : (data||[]).length === 0 ? (
          <Card><EmptyState title="No tienes horarios asignados" description="Contacta a la secretaría." /></Card>
        ) : (
          DAY_ORDER.filter(d => grouped[d]).map(day => (
            <Card key={day} title={day}>
              <div className="space-y-2">
                {grouped[day].map(s => (
                  <div key={s.id} className="flex items-center gap-4 p-3 bg-bglight rounded-card">
                    <div className="text-[16px] font-semibold text-primary min-w-[120px]">
                      {s.start_time?.slice(0,5)} - {s.end_time?.slice(0,5)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-primary">{s.subject_name}</div>
                      <div className="text-[13px] text-textmuted">{s.course_name}</div>
                    </div>
                    <Badge variant="neutral">{s.classroom || 'Sin aula'}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </main>
    </>
  );
}
