import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';
import { createSubject, updateSubject } from '../../services/subjectService';

const empty={name:'',code:'',description:'',status:'activo'};
export default function SubjectForm({ open, onClose, editing, onSaved }) {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  useEffect(()=>{setForm(editing?{name:editing.name||'',code:editing.code||'',description:editing.description||'',status:editing.status||'activo'}:empty);},[editing,open]);
  const set=(k)=>(e)=>setForm({...form,[k]:e.target.value});
  const onSubmit=async(e)=>{e.preventDefault();setSaving(true);try{if(editing)await updateSubject(editing.id,form);else await createSubject(form);showSuccess(`Materia ${editing?'actualizada':'creada'}`);onSaved?.();}catch(err){showError(err.response?.data?.message||'Error');}finally{setSaving(false);}};
  return (
    <Modal open={open} onClose={onClose} title={editing?'Editar materia':'Nueva materia'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={onSubmit} loading={saving}>{editing?'Guardar':'Crear'}</Button></>}>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
        <Input label="Nombre" value={form.name} onChange={set('name')} required/>
        <Input label="Código" value={form.code} onChange={set('code')} placeholder="Ej. MAT-101"/>
        <Input label="Descripción" value={form.description} onChange={set('description')}/>
        {editing&&<Select label="Estado" value={form.status} onChange={set('status')}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></Select>}
      </form>
    </Modal>
  );
}
