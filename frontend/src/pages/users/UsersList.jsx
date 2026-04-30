import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/ui/Spinner';
import UserForm from './UserForm';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { listUsers, deactivateUser, activateUser } from '../../services/userService';

export default function UsersList() {
  const { toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { data, loading, reload } = useFetch(listUsers, []);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const isAdmin = user?.role === 'administrador';

  const handleToggleStatus = async (row) => {
    try {
      if (row.status === 'activo') await deactivateUser(row.id);
      else await activateUser(row.id);
      showSuccess(`Usuario ${row.status === 'activo' ? 'desactivado' : 'activado'}`);
      reload();
    } catch (err) { showError(err.response?.data?.message || 'Error'); }
  };

  const columns = [
    { key:'full_name',label:'Nombre' },{ key:'email',label:'Email' },
    { key:'role',label:'Rol',render:(r)=><span className="capitalize">{r.role}</span> },
    { key:'document_id',label:'Documento' },{ key:'phone',label:'Teléfono' },
    { key:'status',label:'Estado',render:(r)=><Badge variant={r.status==='activo'?'success':'danger'}>{r.status}</Badge> },
  ];

  return (
    <>
      <Header title="Usuarios" onToggleSidebar={toggleSidebar} action={isAdmin&&<Button onClick={()=>{setEditing(null);setOpenForm(true);}}>+ Nuevo usuario</Button>}/>
      <main className="p-6">
        {loading ? <Spinner size="lg"/> : (
          <DataTable columns={columns} data={data||[]} searchable={['full_name','email','document_id','role']} searchPlaceholder="Buscar por nombre, email, documento..."
            rowActions={(row)=>(
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={()=>{setEditing(row);setOpenForm(true);}}>Editar</Button>
                {isAdmin&&<Button variant={row.status==='activo'?'danger':'accent'} onClick={()=>handleToggleStatus(row)}>{row.status==='activo'?'Desactivar':'Activar'}</Button>}
              </div>
            )}/>
        )}
      </main>
      <UserForm open={openForm} onClose={()=>setOpenForm(false)} editing={editing} onSaved={()=>{setOpenForm(false);reload();}}/>
    </>
  );
}
