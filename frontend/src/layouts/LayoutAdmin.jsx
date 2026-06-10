import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  Store,
  Tags,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { getTiendas } from '../api/tiendas.api';
import { useAuth } from '../hooks/useAuth';
import { showInfoToast } from '../utils/notifications';

const navigationGroups = [
  {
    title: 'Catalogo',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/productos', label: 'Productos', icon: Package },
      { to: '/admin/categorias', label: 'Categorias', icon: Tags },
    ],
  },
  {
    title: 'Configuracion',
    items: [
      { to: '/admin/tiendas', label: 'Perfil de la tienda', icon: Store },
    ],
  },
];

const pageTitles = {
  '/admin': {
    title: 'Dashboard',
    description: 'Resumen operativo del catalogo digital.',
  },
  '/admin/productos': {
    title: 'Productos',
    description: 'Administra todos los productos de tu catalogo.',
  },
  '/admin/categorias': {
    title: 'Categorias',
    description: 'Organiza las categorias visibles de tu catalogo.',
  },
  '/admin/tiendas': {
    title: 'Perfil de la tienda',
    description: 'Gestiona la identidad visual, el contacto y la configuracion publica.',
  },
};

function LayoutAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [stores, setStores] = useState([]);
  const userMenuRef = useRef(null);
  const storeMenuRef = useRef(null);
  const storeIdFromQuery = searchParams.get('tienda') || '';
  const selectedStore = stores.find((store) => String(store.TiendaID) === String(storeIdFromQuery))
    || stores[0]
    || null;

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await getTiendas();
        setStores(response.data || []);
      } catch (error) {
        setStores([]);
      }
    };

    loadStores();
  }, []);

  useEffect(() => {
    if (!stores.length) {
      return;
    }

    const hasSelectedStore = stores.some(
      (store) => String(store.TiendaID) === String(storeIdFromQuery),
    );

    if (hasSelectedStore) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tienda', String(stores[0].TiendaID));
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, storeIdFromQuery, stores]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }

      if (!storeMenuRef.current?.contains(event.target)) {
        setIsStoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Cerrar sesion',
      text: 'Tu sesion administrativa se cerrara en este navegador.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6d4df6',
      cancelButtonColor: '#c8c5d7',
      confirmButtonText: 'Si, salir',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#171c33',
    });

    if (!result.isConfirmed) {
      return;
    }

    logout();
    setIsUserMenuOpen(false);
    showInfoToast('Sesion cerrada correctamente.');
    navigate('/login', { replace: true });
  };

  const currentPage = pageTitles[location.pathname] || {
    title: 'Panel administrativo',
    description: 'Gestiona tu catalogo desde una sola vista.',
  };

  const handleSelectStore = (storeId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tienda', String(storeId));
    setSearchParams(nextParams);
    setIsStoreMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(109,77,246,0.08),_transparent_24%),linear-gradient(180deg,_#fbfaff_0%,_#f7f5ff_100%)]">
      {isSidebarOpen ? (
        <button
          aria-label="Ocultar menu lateral"
          className="fixed inset-0 z-30 bg-[#13182d]/20 xl:hidden"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      ) : null}

      <header className="grid min-h-[90px] w-full border-b border-[#ebe8f4] bg-white xl:grid-cols-[312px,1fr]">
        <div className="flex items-center gap-3 border-r border-[#ebe8f4] px-4 py-5 xl:px-4">
          <button
            aria-label={isSidebarOpen ? 'Ocultar menu lateral' : 'Mostrar menu lateral'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8f7ff] text-[#727896] transition hover:bg-[#f1eeff]"
            onClick={() => setIsSidebarOpen((currentValue) => !currentValue)}
            type="button"
          >
            <Menu size={18} />
          </button>

          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f5d9e6] bg-[#fff5f8] text-[#f05b9a]">
            <ShoppingBag size={20} />
          </span>

          <div className="min-w-0">
            <p className="truncate font-['Georgia'] text-[1rem] font-semibold leading-none text-[#151d39]">
              {selectedStore?.Nombre || 'Tienda Rous'}
            </p>
            <p className="mt-1 text-sm text-[#70768d]">Catalogo Digital</p>
          </div>
        </div>

        <div className="flex items-center justify-end px-4 py-5 xl:px-6">
          <div className="relative flex items-center gap-3" ref={userMenuRef}>
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#677089] shadow-[0_8px_24px_rgba(17,24,39,0.04)]" type="button">
              <CircleHelp size={18} />
            </button>

            <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#677089] shadow-[0_8px_24px_rgba(17,24,39,0.04)]" type="button">
              <Bell size={18} />
              <span className="absolute right-2 top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ff4b8b] px-1 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            <button
              aria-label="Abrir menu de usuario"
              className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(17,24,39,0.04)]"
              onClick={() => setIsUserMenuOpen((currentValue) => !currentValue)}
              type="button"
            >
              {user?.Foto ? (
                <img
                  alt={user?.Nombre || 'Usuario'}
                  className="h-full w-full object-cover"
                  src={user.Foto}
                />
              ) : (
                <span className="inline-flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,_#6d4df6_0%,_#8a63ff_100%)] text-sm font-bold text-white">
                  {String(user?.Nombre || 'A').slice(0, 1).toUpperCase()}
                </span>
              )}
            </button>

            {isUserMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-[320px] rounded-[22px] border border-[#ece8f4] bg-white p-4 shadow-[0_18px_40px_rgba(66,41,133,0.12)]">
                <div className="flex items-center gap-3">
                  {user?.Foto ? (
                    <img
                      alt={user?.Nombre || 'Usuario'}
                      className="h-12 w-12 rounded-full object-cover"
                      src={user.Foto}
                    />
                  ) : (
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#6d4df6_0%,_#8a63ff_100%)] text-sm font-bold text-white">
                      {String(user?.Nombre || 'A').slice(0, 1).toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#151d39]">{user?.Nombre || 'Administrador'}</p>
                    <p className="truncate text-sm text-[#737996]">{user?.Correo || user?.Email || 'Sin correo disponible'}</p>
                  </div>
                </div>

                <button
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ebe8f3] px-4 py-3 text-sm font-semibold text-[#5a6280] transition hover:bg-[#f7f5ff] hover:text-[#1d2340]"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut size={16} />
                  Cerrar sesion
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-90px)] w-full">
        <aside
          className={[
            'fixed left-0 top-[90px] z-40 flex h-[calc(100vh-90px)] w-[312px] flex-col border-r border-[#ebe8f4] bg-white transition-transform duration-300 xl:sticky xl:top-0 xl:h-[calc(100vh-90px)] xl:translate-x-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full xl:hidden',
          ].join(' ')}
        >
          <div className="px-4 pt-4">
            <div className="relative" ref={storeMenuRef}>
              <button
                className="w-full rounded-[20px] border border-[#ece8f4] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(17,24,39,0.04)]"
                onClick={() => setIsStoreMenuOpen((currentValue) => !currentValue)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  {selectedStore?.Logo ? (
                    <img
                      alt={`Logo de ${selectedStore.Nombre}`}
                      className="h-10 w-10 rounded-2xl object-cover"
                      src={selectedStore.Logo}
                    />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#161c33_0%,_#2f3658_100%)] text-white">
                      <Store size={16} />
                    </span>
                  )}

                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-[#151d39]">
                      {selectedStore?.Nombre || 'Tu tienda'}
                    </p>
                    {selectedStore?.Slug ? (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-[#6f768d]">
                        Ver catalogo
                      </span>
                    ) : (
                      <span className="mt-0.5 inline-flex text-xs text-[#8a90a6]">Sin catalogo publico disponible</span>
                    )}
                  </div>

                  <ChevronDown
                    className={`text-[#9ca3b9] transition ${isStoreMenuOpen ? 'rotate-180' : ''}`}
                    size={16}
                  />
                </div>
              </button>

              {isStoreMenuOpen && stores.length > 0 ? (
                <div className="absolute left-0 top-[calc(100%+10px)] z-20 w-full rounded-[20px] border border-[#ece8f4] bg-white p-2 shadow-[0_18px_40px_rgba(66,41,133,0.12)]">
                  {stores.map((store) => (
                    <button
                      className={[
                        'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                        String(selectedStore?.TiendaID) === String(store.TiendaID)
                          ? 'bg-[linear-gradient(135deg,_#f1ecff_0%,_#eee8ff_100%)]'
                          : 'hover:bg-[#f7f5ff]',
                      ].join(' ')}
                      key={store.TiendaID}
                      onClick={() => handleSelectStore(store.TiendaID)}
                      type="button"
                    >
                      {store.Logo ? (
                        <img
                          alt={`Logo de ${store.Nombre}`}
                          className="h-10 w-10 rounded-2xl object-cover"
                          src={store.Logo}
                        />
                      ) : (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#161c33_0%,_#2f3658_100%)] text-white">
                          <Store size={16} />
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#151d39]">{store.Nombre}</p>
                        <p className="mt-0.5 truncate text-xs text-[#6f768d]">{store.Slug || 'Sin slug'}</p>
                      </div>

                      {String(selectedStore?.TiendaID) === String(store.TiendaID) ? (
                        <span className="rounded-full bg-[#6d4df6]/10 px-2 py-1 text-[11px] font-semibold text-[#6d4df6]">
                          Activa
                        </span>
                      ) : null}
                    </button>
                  ))}

                  {selectedStore?.Slug ? (
                    <Link
                      className="mt-2 inline-flex w-full items-center justify-center rounded-2xl border border-[#ebe8f3] px-4 py-3 text-sm font-semibold text-[#5a6280] transition hover:bg-[#f7f5ff] hover:text-[#1d2340]"
                      rel="noreferrer"
                      target="_blank"
                      to={`/${selectedStore.Slug}`}
                    >
                      Ver catalogo
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="scrollbar-none flex-1 overflow-y-auto px-3 pb-5 pt-5">
            {navigationGroups.map((group) => (
              <div className="mb-6" key={group.title}>
                <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8f95ab]">
                  {group.title}
                </p>

                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        className={({ isActive }) => [
                          'relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition',
                          isActive
                            ? 'bg-[linear-gradient(135deg,_#f1ecff_0%,_#eee8ff_100%)] text-[#6d4df6] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-r-full before:bg-[#6d4df6]'
                            : 'text-[#5c6481] hover:bg-[#f7f5ff] hover:text-[#1d2340]',
                        ].join(' ')}
                        to={item.to}
                      >
                        <Icon size={18} />
                        <span className="flex-1">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-5">
            <div className="rounded-[22px] bg-[linear-gradient(135deg,_#f4efff_0%,_#fbf9ff_100%)] p-4">
              <p className="text-sm font-semibold text-[#6d4df6]">Necesitas ayuda?</p>
              <p className="mt-1 text-sm text-[#737996]">Soporte en linea</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="w-full px-4 py-5 xl:px-6 xl:py-6">
            <div className="mb-6">
              <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-[#151d39]">{currentPage.title}</h1>
                <p className="mt-1 text-base text-[#737996]">{currentPage.description}</p>
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default LayoutAdmin;
