import { useEffect } from 'react';
export default function Modal({ open, onClose, title, children, footer, maxWidth=560 }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key==='Escape' && onClose?.();
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onEsc); document.body.style.overflow=''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.4)'}} onClick={onClose}>
      <div className="bg-white rounded-card shadow-card w-full animate-fadeInUp max-h-[90vh] flex flex-col" style={{maxWidth}} onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-borderdef">
          <h3 className="text-[18px] font-medium text-primary">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-rowhover text-secondary text-xl leading-none" aria-label="Cerrar">×</button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="flex justify-end gap-2 p-5 border-t border-borderdef">{footer}</div>}
      </div>
    </div>
  );
}
