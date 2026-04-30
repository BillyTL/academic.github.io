export default function Button({ children, variant='primary', type='button', disabled, loading, onClick, className='', ...rest }) {
  const base = 'h-12 px-6 rounded-btn font-medium text-[13px] tracking-wide transition-colors duration-150 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:'bg-primary text-white hover:bg-[#2f3020]',
    secondary:'bg-transparent border border-secondary text-secondary hover:bg-secondary/10',
    danger:'bg-danger text-white hover:bg-[#6f2d2d]',
    accent:'bg-accent text-white hover:bg-[#a89274]',
    ghost:'bg-transparent text-primary hover:bg-rowhover',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      className={`${base} ${variants[variant]||variants.primary} ${className}`} {...rest}>
      {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : children}
    </button>
  );
}
