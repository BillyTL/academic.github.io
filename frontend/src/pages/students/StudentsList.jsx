import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/ui/Spinner';
import StudentForm from './StudentForm';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { listStudents, deactivateStudent, activateStudent } from '../../services/studentService';

export default function StudentsList() {
  const { toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { data, loading, reload } = useFetch(listStudents, []);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const canEdit = ['administrador','secretaria'].includes(user?.role);

  const handleToggle = async (row) => {
    try { if (row.status==='activo') await deactivateStudent(row.id); else await activateStudent(row.id); showSuccess('Estado actualizado'); reload(); }
    catch (err) { showError(err.response?.data?.message||'Error'); }
  };

  const columns = [
    { key:'student_code',label:'Código' },{ key:'full_name',label:'Nombre' },{ key:'email',label:'Email' },
    { key:'guardian_name',label:'Apoderado' },{ key:'guardian_phone',label:'Tel. apoderado' },
    { key:'status',label:'Estado',render:(r)=><Badge variant={r.status==='activo'?'success':'danger'}>{r.status}</Badge> },
  ];

  return (
    <>
      <Header title="Estudiantes" onToggleSidebar={toggleSidebar} action={canEdit&&<Button onClick={()=>{setEditing(null);setOpenForm(true);}}>+ Nuevo estudiante</Button>}/>
      <main className="p-6">
        {loading?<Spinner size="lg"/>:(
          <DataTable columns={columns} data={data||[]} searchable={['full_name','email','student_code','guardian_name']} searchPlaceholder="Buscar por nombre, código, apoderado..."
            rowActions={(row)=>(
              <div className="flex gap-2 justify-end">
                {canEdit&&<Button variant="ghost" onClick={()=>{setEditing(row);setOpenForm(true);}}>Editar</Button>}
                {canEdit&&<Button variant={row.status==='activo'?'danger':'accent'} onClick={()=>handleToggle(row)}>{row.status==='activo'?'Desactivar':'Activar'}</Button>}
              </div>
            )}/>
        )}
      </main>
      <StudentForm open={openForm} onClose={()=>setOpenForm(false)} editing={editing} onSaved={()=>{setOpenForm(false);reload();}}/>
    </>
  );
}
