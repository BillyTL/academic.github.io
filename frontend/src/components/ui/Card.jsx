export default function Card({ children, className='', title, action }) {
  return (
    <div className={`bg-white rounded-card shadow-card p-5 ${className}`}>
      {(title||action)&&<div className="flex items-center justify-between mb-4">{title&&<h3 className="text-[18px] font-medium text-primary">{title}</h3>}{action}</div>}
      {children}
    </div>
  );
}
