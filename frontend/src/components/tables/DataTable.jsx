import { useMemo, useState } from 'react';
import Pagination from './Pagination';
import EmptyState from '../ui/EmptyState';
import { PAGE_SIZE } from '../../utils/constants';

export default function DataTable({ columns=[], data=[], rowActions, searchable=[], searchPlaceholder='Buscar...' }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => searchable.some((k) => String(row[k]??'').toLowerCase().includes(q)));
  }, [data, search, searchable]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      {searchable.length > 0 && (
        <div className="p-4 border-b border-borderdef">
          <input value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} placeholder={searchPlaceholder}
            className="h-12 w-full md:w-80 px-3 rounded-btn border border-borderdef bg-white focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 text-[14px]"/>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-primary text-white">
              {columns.map((c)=><th key={c.key} className={`text-left font-semibold px-4 py-3 ${c.className||''}`}>{c.label}</th>)}
              {rowActions && <th className="px-4 py-3 text-right font-semibold">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, idx)=>(
              <tr key={row.id??idx} className={`${idx%2===0?'bg-bglight':'bg-white'} hover:bg-rowhover transition-colors`}>
                {columns.map((c)=><td key={c.key} className={`px-4 py-3 ${c.className||''}`}>{c.render ? c.render(row) : (row[c.key]??'—')}</td>)}
                {rowActions && <td className="px-4 py-3 text-right whitespace-nowrap">{rowActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState />}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
