export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const max = 5;
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="flex items-center justify-end gap-1 p-3 text-[13px]">
      <button disabled={page===1} onClick={()=>onChange(page-1)} className="px-3 h-9 rounded-btn border border-borderdef hover:bg-rowhover disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
      {pages.map((p)=>(
        <button key={p} onClick={()=>onChange(p)} className={`w-9 h-9 rounded-btn border ${p===page?'bg-primary text-white border-primary':'border-borderdef hover:bg-rowhover'}`}>{p}</button>
      ))}
      <button disabled={page===totalPages} onClick={()=>onChange(page+1)} className="px-3 h-9 rounded-btn border border-borderdef hover:bg-rowhover disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
    </div>
  );
}
