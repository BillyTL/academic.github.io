export default function EmptyState({ title='Sin resultados', description }) {
  return (
    <div className="text-center py-10 text-textmuted">
      <div className="text-4xl mb-2">📭</div>
      <div className="font-medium text-primary">{title}</div>
      {description && <div className="text-[13px] mt-1">{description}</div>}
    </div>
  );
}
