import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import { createUser, updateUser, listRoles } from '../../services/userService';

export default function UserForm({ open, onClose, editing, onSaved }) {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const { data: roles } = useFetch(listRoles, []);
  const [form, setForm] = useState({ role_id:'',full_name:'',email:'',password:'',phone:'',document_id:'',status:'activo' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({ role_id:editing.role_id||roles?.find(r=>r.name===editing.role)?.id||'', full_name:editing.full_name||'', email:editing.email||'', password:'', phone:editing.phone||'', document_id:editing.document_id||'', status:editing.status||'activo' });
    } else setForm({ role_id:'',full_name:'',email:'',password:'',phone:'',document_id:'',status:'activo' });
  }, [editing, roles, open]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { const p={...form};delete p.password; await updateUser(editing.id,p); showSuccess('Usuario actualizado'); }
      else { await createUser(form); showSuccess('Usuario creado'); }
      onSaved?.();
    } catch (err) { showError(err.response?.data?.message||'Error al guardar'); }
    finally { setSaving(false); }
  };

  const isAdmin = user?.role === 'administrador';
  return (
    <Modal open={open} onClose={onClose} title={editing?'Editar usuario':'Nuevo usuario'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} loading={saving}>{editing?'Guardar':'Crear'}</Button></>}>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre completo" value={form.full_name} onChange={set('full_name')} required/>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} required/>
        {!editing&&<Input label="Contraseña" type="password" value={form.password} onChange={set('password')} required minLength={6}/>}
        <Input label="Documento" value={form.document_id} onChange={set('document_id')}/>
        <Input label="Teléfono" value={form.phone} onChange={set('phone')}/>
        <Select label="Rol" value={form.role_id} onChange={set('role_id')} required disabled={!isAdmin&&!!editing}>
          <option value="">— Selecciona —</option>
          {(roles||[]).map((r)=><option key={r.id} value={r.id} className="capitalize">{r.name}</option>)}
        </Select>
        {editing&&<Select label="Estado" value={form.status} onChange={set('status')}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></Select>}
      </form>
    </Modal>
  );
}
