export default function KpiCard({ label, value, variant='default', icon }) {
  const variantBg = { default:'bg-white', warning:'bg-badgeWnBg', success:'bg-badgeOkBg' };
  return (
    <div className={`${variantBg[variant]} rounded-card shadow-card p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[13px] text-textmuted font-medium uppercase tracking-wide">{label}</div>
          <div className="text-[28px] font-semibold text-primary mt-1">{value}</div>
        </div>
        {icon && <div className="text-3xl text-accent">{icon}</div>}
      </div>
    </div>
  );
}
