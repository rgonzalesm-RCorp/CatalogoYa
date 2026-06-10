import { Outlet } from 'react-router-dom';

function LayoutPublico() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] text-[#1f2236]">
      <Outlet />
    </div>
  );
}

export default LayoutPublico;
