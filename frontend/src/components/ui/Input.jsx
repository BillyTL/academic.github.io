export default function Input({ label, error, className='', ...rest }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[13px] font-medium text-textmain">{label}</label>}
      <input className={`h-12 px-3 rounded-btn border bg-white text-textmain text-[14px] border-borderdef focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 ${error?'!border-danger':''} ${className}`} {...rest}/>
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </div>
  );
}
