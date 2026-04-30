import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';
import { createCourse, updateCourse } from '../../services/courseService';

const empty={name:'',level:'',period:'',status:'activo'};
export default function CourseForm({ open, onClose, editing, onSaved }) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  useEffect(()=>{setForm(editing?{name:editing.name||'',level:editing.level||'',period:editing.period||'',status:editing.status||'activo'}:empty);},[editing,open]);
  const set=(k)=>(e)=>setForm({...form,[k]:e.target.value});
  const onSubmit=async(e)=>{e.preventDefault();setSaving(true);try{if(editing)await updateCourse(editing.id,form);else await createCourse(form);showSuccess(`Curso ${editing?'actualizado':'creado'}`);onSaved?.();}catch(err){showError(err.response?.data?.message||'Error');}finally{setSaving(false);}};
  return (
    <Modal open={open} onClose={onClose} title={editing?'Editar curso':'Nuevo curso'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} loading={saving}>{editing?'Guardar':'Crear'}</Button></>}>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
        <Input label="Nombre del curso" value={form.name} onChange={set('name')} required placeholder="Ej. 1ro Secundaria A"/>
        <Input label="Nivel" value={form.level} onChange={set('level')} placeholder="Ej. Secundaria"/>
        <Input label="Período" value={form.period} onChange={set('period')} required placeholder="Ej. 2026"/>
        {editing&&<Select label="Estado" value={form.status} onChange={set('status')}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></Select>}
      </form>
    </Modal>
  );
}
