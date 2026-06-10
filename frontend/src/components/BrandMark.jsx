import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

function BrandMark({
  to = '/',
  subtitle = 'Catalogo digital',
  tone = 'default',
}) {
  const iconClass = tone === 'light'
    ? 'border-white/20 bg-white/12 text-[#ff96bf]'
    : 'border-[#f7d9e7] bg-[#fff4f8] text-[#f05b9a]';
  const titleClass = tone === 'light' ? 'text-white' : 'text-[#1d2340]';
  const subtitleClass = tone === 'light' ? 'text-white/70' : 'text-[#6f7287]';

  return (
    <Link className="inline-flex items-center gap-3" to={to}>
      <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${iconClass}`}>
        <ShoppingBag size={20} strokeWidth={1.8} />
      </span>
      <span>
        <span className={`block font-['Georgia'] text-[1.9rem] font-semibold leading-none ${titleClass}`}>
          CatalogosYa
        </span>
        <span className={`mt-1 block text-xs font-semibold uppercase tracking-[0.22em] ${subtitleClass}`}>
          {subtitle}
        </span>
      </span>
    </Link>
  );
}

export default BrandMark;
