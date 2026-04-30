export default function Header({ title, action, onToggleSidebar }) {
  return (
    <header className="h-16 bg-white border-b border-borderdef flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="lg:hidden w-10 h-10 rounded-btn hover:bg-rowhover text-primary text-xl" aria-label="Menú">☰</button>
        <h1 className="text-[22px] font-semibold text-primary">{title}</h1>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
