export default function Toast({ type='info', message, onClose }) {
  const border = { success:'border-l-success', error:'border-l-danger', info:'border-l-accent' };
  return (
    <div className={`bg-white rounded-card shadow-card border-l-4 ${border[type]} p-4 flex items-start gap-3 animate-slideInRight`}>
      <div className="flex-1 text-[14px] text-textmain">{message}</div>
      <button onClick={onClose} className="text-secondary text-lg leading-none hover:text-primary">×</button>
    </div>
  );
}
