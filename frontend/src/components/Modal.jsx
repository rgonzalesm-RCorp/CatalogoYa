import { X } from 'lucide-react';
import { useEffect } from 'react';

function Modal({
  open,
  title,
  description,
  onClose,
  maxWidthClass = 'max-w-2xl',
  children,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/55 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-soft ${maxWidthClass}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-brand-mist/60 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="font-display text-3xl font-semibold text-brand-forest" id="modal-title">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-xl text-sm leading-6 text-brand-moss">{description}</p>
            ) : null}
          </div>

          <button
            aria-label="Cerrar modal"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-mist/70 bg-white text-brand-forest transition hover:border-brand-coral hover:text-brand-coral"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
