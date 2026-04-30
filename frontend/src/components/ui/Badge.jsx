export default function Badge({ variant='neutral', children }) {
  const map = {
    success:'bg-badgeOkBg text-badgeOkTx',danger:'bg-badgeErBg text-badgeErTx',
    warning:'bg-badgeWnBg text-badgeWnTx',neutral:'bg-badgeNuBg text-badgeNuTx',
  };
  return <span className={`inline-block px-2 py-0.5 rounded-badge text-[12px] font-medium ${map[variant]||map.neutral}`}>{children}</span>;
}
