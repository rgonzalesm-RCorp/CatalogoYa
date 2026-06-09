import { Store } from 'lucide-react';
import { Link } from 'react-router-dom';

function BrandMark({ to = '/', tone = 'dark' }) {
  const themeClass = tone === 'light'
    ? 'border-white/20 bg-white/10 text-brand-sand'
    : 'border-brand-mist bg-brand-ink text-brand-sand';

  return (
    <Link className="inline-flex items-center gap-3" to={to}>
      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${themeClass}`}>
        <Store size={20} />
      </span>
      <span className="font-display text-xl font-semibold tracking-[0.18em] uppercase">
        CatalogosYa
      </span>
    </Link>
  );
}

export default BrandMark;
