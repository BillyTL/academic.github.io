import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';
import { createStudent, updateStudent } from '../../services/studentService';

const empty = { full_name:'',email:'',password:'',phone:'',document_id:'',student_code:'',birth_date:'',address:'',guardian_name:'',guardian_phone:'',status:'activo' };

export default function StudentForm({ open, onClose, editing, onSaved }) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({ full_name:editing.full_name||'',email:editing.email||'',password:'',phone:editing.phone||'',document_id:editing.document_id||'',student_code:editing.student_code||'',birth_date:editing.birth_date?editing.birth_date.slice(0,10):'',address:editing.address||'',guardian_name:editing.guardian_name||'',guardian_phone:editing.guardian_phone||'',status:editing.status||'activo' });
    else setForm(empty);
  }, [editing, open]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { const p={...form};delete p.password;delete p.student_code; await updateStudent(editing.id,p); showSuccess('Estudiante actualizado'); }
      else { await createStudent(form); showSuccess('Estudiante creado'); }
      onSaved?.();
    } catch (err) { showError(err.response?.data?.message||'Error al guardar'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing?'Editar estudiante':'Nuevo estudiante'} maxWidth={720}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} loading={saving}>{editing?'Guardar':'Crear'}</Button></>}>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre completo" value={form.full_name} onChange={set('full_name')} required/>
        <Input label="Código de estudiante" value={form.student_code} onChange={set('student_code')} required disabled={!!editing}/>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} required/>
        {!editing&&<Input label="Contraseña" type="password" value={form.password} onChange={set('password')} required minLength={6}/>}
        <Input label="Documento" value={form.document_id} onChange={set('document_id')}/>
        <Input label="Teléfono" value={form.phone} onChange={set('phone')}/>
        <Input label="Fecha de nacimiento" type="date" value={form.birth_date} onChange={set('birth_date')}/>
        <Input label="Dirección" value={form.address} onChange={set('address')}/>
        <Input label="Apoderado" value={form.guardian_name} onChange={set('guardian_name')}/>
        <Input label="Teléfono apoderado" value={form.guardian_phone} onChange={set('guardian_phone')}/>
        {editing&&<Select label="Estado" value={form.status} onChange={set('status')}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></Select>}
      </form>
    </Modal>
  );
}
