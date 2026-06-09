import { Boxes, LayoutDashboard, LogOut, Package, Store, Tags } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import BrandMark from '../components/BrandMark';
import { useAuth } from '../hooks/useAuth';
import { showInfoToast } from '../utils/notifications';

const navItems = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { to: '/admin/tiendas', label: 'Tiendas', icon: Store },
  { to: '/admin/categorias', label: 'Categorías', icon: Tags },
  { to: '/admin/productos', label: 'Productos', icon: Package },
];

function LayoutAdmin() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tu sesión administrativa se cerrará en este navegador.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef7d57',
      cancelButtonColor: '#244734',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#fff8ef',
      color: '#18261f',
    });

    if (!result.isConfirmed) {
      return;
    }

    logout();
    showInfoToast('Sesión cerrada correctamente.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(239,125,87,0.12),_transparent_30%),linear-gradient(180deg,_#f6f1e9_0%,_#fff8ef_100%)]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px,1fr] lg:px-6 lg:py-6">
        <aside className="hero-surface flex flex-col justify-between p-6">
          <div>
            <BrandMark to="/admin" tone="light" />
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-gold">Sesión activa</p>
              <p className="mt-3 font-display text-2xl font-semibold">{user?.Nombre || 'Equipo'}</p>
              <p className="mt-1 text-sm text-brand-mist">{user?.Email || 'admin@catalogosya.com'}</p>
            </div>
            <nav className="mt-8 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    className={({ isActive }) => [
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-white text-brand-ink'
                        : 'text-brand-mist hover:bg-white/10 hover:text-brand-sand',
                    ].join(' ')}
                    to={item.to}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-coral/20 text-brand-coral">
                <Boxes size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">Panel SaaS</p>
                <p className="text-xs text-brand-mist">Administra tiendas, categorías y productos.</p>
              </div>
            </div>
            <button className="button-primary mt-5 w-full" onClick={handleLogout} type="button">
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="py-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutAdmin;
