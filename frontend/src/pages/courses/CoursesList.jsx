import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/ui/Spinner';
import CourseForm from './CourseForm';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { listCourses, deactivateCourse, activateCourse } from '../../services/courseService';

export default function CoursesList() {
  const { toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { data, loading, reload } = useFetch(listCourses, []);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const canEdit=['administrador','secretaria'].includes(user?.role);
  const isAdmin=user?.role==='administrador';

  const handleToggle=async(row)=>{try{if(row.status==='activo')await deactivateCourse(row.id);else await activateCourse(row.id);showSuccess('Estado actualizado');reload();}catch(err){showError(err.response?.data?.message||'Error');}};

  const columns=[
    {key:'name',label:'Curso'},{key:'level',label:'Nivel'},{key:'period',label:'Período'},
    {key:'students_count',label:'Estudiantes',render:(r)=><Badge variant="neutral">{r.students_count} inscritos</Badge>},
    {key:'status',label:'Estado',render:(r)=><Badge variant={r.status==='activo'?'success':'danger'}>{r.status}</Badge>},
  ];

  return (
    <>
      <Header title="Cursos" onToggleSidebar={toggleSidebar} action={canEdit&&<Button onClick={()=>{setEditing(null);setOpenForm(true);}}>+ Nuevo curso</Button>}/>
      <main className="p-6">
        {loading?<Spinner size="lg"/>:(
          <DataTable columns={columns} data={data||[]} searchable={['name','level','period']} searchPlaceholder="Buscar curso..."
            rowActions={(row)=>(<div className="flex gap-2 justify-end">
              {canEdit&&<Button variant="ghost" onClick={()=>{setEditing(row);setOpenForm(true);}}>Editar</Button>}
              {isAdmin&&<Button variant={row.status==='activo'?'danger':'accent'} onClick={()=>handleToggle(row)}>{row.status==='activo'?'Desactivar':'Activar'}</Button>}
            </div>)}/>
        )}
      </main>
      <CourseForm open={openForm} onClose={()=>setOpenForm(false)} editing={editing} onSaved={()=>{setOpenForm(false);reload();}}/>
    </>
  );
}
