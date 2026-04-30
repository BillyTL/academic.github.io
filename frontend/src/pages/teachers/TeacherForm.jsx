import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';
import { createTeacher, updateTeacher } from '../../services/teacherService';

const empty = { full_name:'',email:'',password:'',phone:'',document_id:'',teacher_code:'',specialty:'',hire_date:'',status:'activo' };

export default function TeacherForm({ open, onClose, editing, onSaved }) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({ full_name:editing.full_name||'',email:editing.email||'',password:'',phone:editing.phone||'',document_id:editing.document_id||'',teacher_code:editing.teacher_code||'',specialty:editing.specialty||'',hire_date:editing.hire_date?editing.hire_date.slice(0,10):'',status:editing.status||'activo' });
    else setForm(empty);
  }, [editing, open]);
  const set=(k)=>(e)=>setForm({...form,[k]:e.target.value});
  const onSubmit = async (e) => {
    e.preventDefault();setSaving(true);
    try {
      if(editing){const p={...form};delete p.password;delete p.teacher_code;await updateTeacher(editing.id,p);showSuccess('Docente actualizado');}
      else{await createTeacher(form);showSuccess('Docente creado');}
      onSaved?.();
    } catch(err){showError(err.response?.data?.message||'Error');}finally{setSaving(false);}
  };
  return (
    <Modal open={open} onClose={onClose} title={editing?'Editar docente':'Nuevo docente'} maxWidth={720}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} loading={saving}>{editing?'Guardar':'Crear'}</Button></>}>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre completo" value={form.full_name} onChange={set('full_name')} required/>
        <Input label="Código docente" value={form.teacher_code} onChange={set('teacher_code')} required disabled={!!editing}/>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} required/>
        {!editing&&<Input label="Contraseña" type="password" value={form.password} onChange={set('password')} required minLength={6}/>}
        <Input label="Documento" value={form.document_id} onChange={set('document_id')}/>
        <Input label="Teléfono" value={form.phone} onChange={set('phone')}/>
        <Input label="Especialidad" value={form.specialty} onChange={set('specialty')}/>
        <Input label="Fecha de ingreso" type="date" value={form.hire_date} onChange={set('hire_date')}/>
        {editing&&<Select label="Estado" value={form.status} onChange={set('status')}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></Select>}
      </form>
    </Modal>
  );
}
