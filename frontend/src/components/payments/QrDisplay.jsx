import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
export default function QrDisplay({ value, size=220 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!value || !ref.current) return;
    QRCode.toCanvas(ref.current, value, { width:size, margin:2, color:{dark:'#3E3F29',light:'#FFFFFF'} }).catch(()=>{});
  }, [value, size]);
  if (!value) return null;
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-bglight rounded-card border border-borderdef">
      <canvas ref={ref}/>
      <div className="text-[12px] text-textmuted font-mono break-all text-center">{value}</div>
    </div>
  );
}
