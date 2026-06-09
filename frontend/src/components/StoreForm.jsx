import {
  Globe,
  Image as ImageIcon,
  MessageCircle,
  PaintBucket,
  Store,
  Text,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  buildPublicStoreUrl,
  generateStoreSlug,
  getStoreFormValues,
} from '../utils/tiendas';

function StoreForm({
  mode = 'create',
  initialValues,
  onSubmit,
  submitting = false,
}) {
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <section className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-forest text-brand-sand">
            <Store size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-forest">Datos principales</p>
            <p className="text-sm text-brand-moss">
              Configura el nombre, slug y el estado visible del catálogo.
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
                  !value || Boolean(generateStoreSlug(value)) || 'El slug debe tener letras o números.'
                ),
              })}
            />
            <p className="mt-2 text-xs text-brand-moss">
              URL pública: <span className="font-semibold text-brand-forest">{buildPublicStoreUrl(slugPreview)}</span>
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
                  Si desmarcas esta opción y guardas, la tienda se desactivará lógicamente.
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
                  Las tiendas nuevas se crean activas. Luego podrás desactivarlas desde edición.
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
              Pega URLs o cadenas base64 para que el backend las procese en Cloudinary.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="Logo">
              Logo
            </label>
            <input
              className="field"
              id="Logo"
              placeholder="https://..."
              {...register('Logo')}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="Portada">
              Portada
            </label>
            <input
              className="field"
              id="Portada"
              placeholder="https://..."
              {...register('Portada')}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-brand-mist/60 bg-brand-cream/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-moss">Vista previa de logo</p>
              {logoPreview ? (
                <img
                  alt="Vista previa del logo"
                  className="mt-3 h-32 w-full rounded-2xl object-cover"
                  src={logoPreview}
                />
              ) : (
                <div className="mt-3 flex h-32 items-center justify-center rounded-2xl border border-dashed border-brand-mist text-sm text-brand-moss">
                  Sin logo cargado
                </div>
              )}
            </div>

            <div className="rounded-[24px] border border-brand-mist/60 bg-brand-cream/60 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-moss">Vista previa de portada</p>
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
            <p className="text-sm font-semibold text-brand-forest">Información pública</p>
            <p className="text-sm text-brand-moss">
              Define contacto, descripción y color principal de la tienda.
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
                    || 'Usa un color hexadecimal válido como #244734.'
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
            Descripción
          </label>
          <textarea
            className="field min-h-[140px] resize-y"
            id="Descripcion"
            placeholder="Describe brevemente la propuesta de la tienda."
            {...register('Descripcion', {
              maxLength: {
                value: 600,
                message: 'La descripción no debe superar 600 caracteres.',
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
            <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Vista pública</p>
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

        <button
          className="button-primary mt-5 w-full lg:w-auto"
          disabled={submitting}
          type="submit"
        >
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </section>
    </form>
  );
}

export default StoreForm;
