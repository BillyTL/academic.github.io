import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
export default function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-bglight">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:ml-60">
        <Outlet context={{ toggleSidebar: () => setOpen((v) => !v) }} />
      </div>
    </div>
  );
}
