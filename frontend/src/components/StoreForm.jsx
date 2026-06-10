import {
  Globe,
  Image as ImageIcon,
  MessageCircle,
  PaintBucket,
  Store,
  Text,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  buildPublicStoreUrl,
  generateStoreSlug,
  getStoreFormValues,
} from '../utils/tiendas';
import { readFileAsDataUrl } from '../utils/files';
import { showErrorToast } from '../utils/notifications';

function StoreForm({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
  stickyFooter = false,
}) {
  const logoInputRef = useRef(null);
  const portadaInputRef = useRef(null);
  const [uploadingAsset, setUploadingAsset] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: getStoreFormValues(initialValues),
  });

  useEffect(() => {
    reset(getStoreFormValues(initialValues));
  }, [initialValues, reset]);

  const values = watch();
  const slugPreview = generateStoreSlug(values?.Slug || values?.Nombre);
  const logoPreview = values?.Logo?.trim();
  const portadaPreview = values?.Portada?.trim();
  const colorPreview = values?.ColorPrincipal?.trim() || '#244734';
  const isEditingInactive = mode === 'edit' && values?.Estado === false;
  const submitLabel = isEditingInactive
    ? 'Guardar y desactivar'
    : mode === 'create'
      ? 'Crear tienda'
      : 'Guardar cambios';
  const formClassName = stickyFooter ? 'flex min-h-full flex-col' : 'space-y-6';
  const footerClassName = stickyFooter
    ? 'sticky bottom-0 z-10 mt-6 flex flex-col-reverse gap-3 border-t border-brand-mist/70 bg-white/95 pb-1 pt-4 backdrop-blur sm:flex-row sm:justify-end'
    : 'mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between';

  const handleAssetSelected = async (event, fieldName) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadingAsset(fieldName);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setValue(fieldName, dataUrl, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      showErrorToast(error.message || 'No se pudo cargar la imagen.');
    } finally {
      setUploadingAsset('');
      event.target.value = '';
    }
  };

  const clearAsset = (fieldName) => {
    setValue(fieldName, '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form className={formClassName} onSubmit={handleSubmit(onSubmit)}>
      <div className={stickyFooter ? 'flex-1 space-y-6' : 'space-y-6'}>
        <section className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-forest text-brand-sand">
              <Store size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-forest">Datos principales</p>
              <p className="text-sm text-brand-moss">
                Configura el nombre, slug y el estado visible del catalogo.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="Nombre">
                Nombre
              </label>
              <input
                className="field"
                id="Nombre"
                placeholder="Tienda Rouss"
                {...register('Nombre', {
                  required: 'El nombre es obligatorio.',
                  validate: (value) => (
                    Boolean(value?.trim()) || 'El nombre es obligatorio.'
                  ),
                })}
              />
              {errors.Nombre ? (
                <p className="mt-2 text-sm text-brand-coral">{errors.Nombre.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="Slug">
                Slug
              </label>
              <input
                className="field"
                id="Slug"
                placeholder="tienda-rouss"
                {...register('Slug', {
                  validate: (value) => (
                    !value || Boolean(generateStoreSlug(value)) || 'El slug debe tener letras o numeros.'
                  ),
                })}
              />
              <p className="mt-2 text-xs text-brand-moss">
                URL publica: <span className="font-semibold text-brand-forest">{buildPublicStoreUrl(slugPreview)}</span>
              </p>
              {errors.Slug ? (
                <p className="mt-2 text-sm text-brand-coral">{errors.Slug.message}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-brand-mist/70 bg-brand-cream/70 p-4">
            {mode === 'edit' ? (
              <label className="flex items-center justify-between gap-4" htmlFor="Estado">
                <div>
                  <p className="text-sm font-semibold text-brand-forest">Estado</p>
                  <p className="mt-1 text-sm text-brand-moss">
                    Si desmarcas esta opcion y guardas, la tienda se desactivara logicamente.
                  </p>
                </div>
                <input
                  className="h-5 w-5 rounded border-brand-mist text-brand-coral focus:ring-brand-coral"
                  id="Estado"
                  type="checkbox"
                  {...register('Estado')}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-forest">Estado</p>
                  <p className="mt-1 text-sm text-brand-moss">
                    Las tiendas nuevas se crean activas. Luego podras desactivarlas desde edicion.
                  </p>
                </div>
                <span className="rounded-full bg-brand-forest px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sand">
                  Activa
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-coral text-white">
              <ImageIcon size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-forest">Identidad visual</p>
              <p className="text-sm text-brand-moss">
                Sube el logo y el banner igual que las imagenes de producto. El backend los publicara en Cloudinary.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <input
              className="hidden"
              {...register('Logo')}
            />
            <input
              className="hidden"
              {...register('Portada')}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-brand-mist/60 bg-brand-cream/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-brand-moss">Logo</p>
                    <p className="mt-1 text-sm text-brand-moss">Formato cuadrado o transparente recomendado.</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-forest shadow-sm">
                    {logoPreview ? 'Listo' : 'Pendiente'}
                  </span>
                </div>
                {logoPreview ? (
                  <img
                    alt="Vista previa del logo"
                    className="mt-3 h-32 w-full rounded-2xl bg-white object-cover"
                    src={logoPreview}
                  />
                ) : (
                  <div className="mt-3 flex h-32 items-center justify-center rounded-2xl border border-dashed border-brand-mist text-sm text-brand-moss">
                    Sin logo cargado
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="button-secondary"
                    onClick={() => logoInputRef.current?.click()}
                    type="button"
                  >
                    <Upload size={16} />
                    {uploadingAsset === 'Logo' ? 'Cargando...' : logoPreview ? 'Reemplazar logo' : 'Subir logo'}
                  </button>
                  {logoPreview ? (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-coral/30 bg-brand-coral/10 px-5 py-3 text-sm font-semibold text-brand-coral transition hover:bg-brand-coral hover:text-white"
                      onClick={() => clearAsset('Logo')}
                      type="button"
                    >
                      <Trash2 size={16} />
                      Quitar
                    </button>
                  ) : null}
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleAssetSelected(event, 'Logo')}
                    ref={logoInputRef}
                    type="file"
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-brand-mist/60 bg-brand-cream/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-brand-moss">Banner</p>
                    <p className="mt-1 text-sm text-brand-moss">Usa una imagen horizontal para la portada principal.</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-forest shadow-sm">
                    {portadaPreview ? 'Listo' : 'Pendiente'}
                  </span>
                </div>
                {portadaPreview ? (
                  <img
                    alt="Vista previa de la portada"
                    className="mt-3 h-32 w-full rounded-2xl object-cover"
                    src={portadaPreview}
                  />
                ) : (
                  <div className="mt-3 flex h-32 items-center justify-center rounded-2xl border border-dashed border-brand-mist text-sm text-brand-moss">
                    Sin portada cargada
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="button-secondary"
                    onClick={() => portadaInputRef.current?.click()}
                    type="button"
                  >
                    <Upload size={16} />
                    {uploadingAsset === 'Portada' ? 'Cargando...' : portadaPreview ? 'Reemplazar banner' : 'Subir banner'}
                  </button>
                  {portadaPreview ? (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-coral/30 bg-brand-coral/10 px-5 py-3 text-sm font-semibold text-brand-coral transition hover:bg-brand-coral hover:text-white"
                      onClick={() => clearAsset('Portada')}
                      type="button"
                    >
                      <Trash2 size={16} />
                      Quitar
                    </button>
                  ) : null}
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleAssetSelected(event, 'Portada')}
                    ref={portadaInputRef}
                    type="file"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gold text-brand-forest">
              <Text size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-forest">Informacion publica</p>
              <p className="text-sm text-brand-moss">
                Define contacto, descripcion y color principal de la tienda.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-forest" htmlFor="WhatsApp">
                <MessageCircle size={16} />
                WhatsApp
              </label>
              <input
                className="field"
                id="WhatsApp"
                placeholder="+59170000000"
                {...register('WhatsApp', {
                  maxLength: {
                    value: 30,
                    message: 'WhatsApp no debe superar 30 caracteres.',
                  },
                })}
              />
              {errors.WhatsApp ? (
                <p className="mt-2 text-sm text-brand-coral">{errors.WhatsApp.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-forest" htmlFor="ColorPrincipal">
                <PaintBucket size={16} />
                Color principal
              </label>
              <div className="flex gap-3">
                <input
                  className="field"
                  id="ColorPrincipal"
                  placeholder="#244734"
                  {...register('ColorPrincipal', {
                    validate: (value) => (
                      !value
                      || /^#([0-9A-Fa-f]{6})$/.test(value)
                      || 'Usa un color hexadecimal valido como #244734.'
                    ),
                  })}
                />
                <input
                  className="h-12 w-16 cursor-pointer rounded-2xl border border-brand-mist bg-white p-1"
                  onChange={(event) => setValue('ColorPrincipal', event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })}
                  type="color"
                  value={/^#([0-9A-Fa-f]{6})$/.test(colorPreview) ? colorPreview : '#244734'}
                />
              </div>
              {errors.ColorPrincipal ? (
                <p className="mt-2 text-sm text-brand-coral">{errors.ColorPrincipal.message}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-forest" htmlFor="Descripcion">
              <Globe size={16} />
              Descripcion
            </label>
            <textarea
              className="field min-h-[140px] resize-y"
              id="Descripcion"
              placeholder="Describe brevemente la propuesta de la tienda."
              {...register('Descripcion', {
                maxLength: {
                  value: 600,
                  message: 'La descripcion no debe superar 600 caracteres.',
                },
              })}
            />
            {errors.Descripcion ? (
              <p className="mt-2 text-sm text-brand-coral">{errors.Descripcion.message}</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-mist/70 bg-brand-ink p-5 text-brand-sand">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Vista publica</p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {values?.Nombre?.trim() || 'Tu tienda'}
              </p>
              <p className="mt-3 text-sm text-brand-mist">{buildPublicStoreUrl(slugPreview)}</p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-mist">Color aplicado</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="h-8 w-8 rounded-full border border-white/20"
                  style={{ backgroundColor: /^#([0-9A-Fa-f]{6})$/.test(colorPreview) ? colorPreview : '#244734' }}
                />
                <span className="text-sm font-semibold">{colorPreview || '#244734'}</span>
              </div>
            </div>
          </div>

          {!stickyFooter ? (
            <div className={footerClassName}>
              {onCancel ? (
                <button
                  className="button-secondary"
                  disabled={submitting}
                  onClick={onCancel}
                  type="button"
                >
                  Cancelar
                </button>
              ) : null}
              <button
                className="button-primary w-full lg:w-auto"
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Guardando...' : submitLabel}
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {stickyFooter ? (
        <section className={footerClassName}>
          <button
            className="button-secondary"
            disabled={submitting}
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="button-primary"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Guardando...' : submitLabel}
          </button>
        </section>
      ) : null}
    </form>
  );
}

export default StoreForm;
