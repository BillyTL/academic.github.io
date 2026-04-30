export default function Select({ label, error, options=[], className='', children, ...rest }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[13px] font-medium text-textmain">{label}</label>}
      <div className="relative">
        <select className={`h-12 w-full pl-3 pr-10 rounded-btn border bg-white text-textmain text-[14px] appearance-none border-borderdef focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 ${error?'!border-danger':''} ${className}`} {...rest}>
          {children || options.map((o)=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-secondary">▾</span>
      </div>
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </div>
  );
}
