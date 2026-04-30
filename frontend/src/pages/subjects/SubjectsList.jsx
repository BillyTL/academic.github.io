import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/ui/Spinner';
import SubjectForm from './SubjectForm';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { listSubjects, deactivateSubject, activateSubject } from '../../services/subjectService';

export default function SubjectsList() {
  const { toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { data, loading, reload } = useFetch(listSubjects, []);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const canEdit=['administrador','secretaria'].includes(user?.role);
  const isAdmin=user?.role==='administrador';

  const handleToggle=async(row)=>{try{if(row.status==='activo')await deactivateSubject(row.id);else await activateSubject(row.id);showSuccess('Estado actualizado');reload();}catch(err){showError(err.response?.data?.message||'Error');}};

  const columns=[
    {key:'name',label:'Materia'},{key:'code',label:'Código'},{key:'description',label:'Descripción'},
    {key:'status',label:'Estado',render:(r)=><Badge variant={r.status==='activo'?'success':'danger'}>{r.status}</Badge>},
  ];

  return (
    <>
      <Header title="Materias" onToggleSidebar={toggleSidebar} action={canEdit&&<Button onClick={()=>{setEditing(null);setOpenForm(true);}}>+ Nueva materia</Button>}/>
      <main className="p-6">
        {loading?<Spinner size="lg"/>:(
          <DataTable columns={columns} data={data||[]} searchable={['name','code','description']} searchPlaceholder="Buscar materia..."
            rowActions={(row)=>(<div className="flex gap-2 justify-end">
              {canEdit&&<Button variant="ghost" onClick={()=>{setEditing(row);setOpenForm(true);}}>Editar</Button>}
              {isAdmin&&<Button variant={row.status==='activo'?'danger':'accent'} onClick={()=>handleToggle(row)}>{row.status==='activo'?'Desactivar':'Activar'}</Button>}
            </div>)}/>
        )}
      </main>
      <SubjectForm open={openForm} onClose={()=>setOpenForm(false)} editing={editing} onSaved={()=>{setOpenForm(false);reload();}}/>
    </>
  );
}
