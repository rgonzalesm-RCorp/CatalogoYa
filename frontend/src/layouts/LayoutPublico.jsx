import { Link, Outlet, useParams } from 'react-router-dom';

import BrandMark from '../components/BrandMark';

function LayoutPublico() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(36,71,52,0.18),_transparent_30%),linear-gradient(180deg,_#fff8ef_0%,_#f6f1e9_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-6">
        <header className="sticky top-4 z-20 rounded-[28px] border border-white/70 bg-white/80 px-4 py-4 shadow-soft backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <BrandMark to={slug ? `/${slug}` : '/login'} />
            <div className="flex flex-col gap-3 text-sm text-brand-moss md:flex-row md:items-center">
              <span className="rounded-full bg-brand-cream px-3 py-2 font-medium text-brand-forest">
                Catálogo público
              </span>
              <Link className="button-secondary" to="/login">
                Administrar tienda
              </Link>
            </div>
          </div>
        </header>

        <main className="mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutPublico;
