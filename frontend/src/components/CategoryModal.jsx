import { FolderOpen, Power, Text } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Modal from './Modal';

const getCategoryFormValues = (category) => ({
  Nombre: category?.Nombre || '',
  Descripcion: category?.Descripcion || '',
  Estado: category?.Estado ?? true,
});

function CategoryModal({
  isOpen,
  mode = 'create',
  category,
  storeName,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: getCategoryFormValues(category),
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(getCategoryFormValues(category));
  }, [category, isOpen, reset]);

  const isEditing = mode === 'edit';
  const estado = watch('Estado');

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit({
      Nombre: values.Nombre.trim(),
      Descripcion: values.Descripcion.trim(),
      Estado: values.Estado,
    });
  });

  return (
    <Modal
      description={isEditing
        ? `Actualiza la categoría seleccionada para ${storeName || 'la tienda actual'}.`
        : `Crea una nueva categoría para ${storeName || 'la tienda actual'}.`}
      onClose={submitting ? () => {} : onClose}
      open={isOpen}
      title={isEditing ? 'Editar categoría' : 'Crear categoría'}
    >
      <form className="space-y-6" onSubmit={handleFormSubmit}>
        <section className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-forest text-brand-sand">
              <FolderOpen size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-forest">Datos de la categoría</p>
              <p className="text-sm text-brand-moss">
                Las categorías ayudan a organizar mejor el catálogo de cada tienda.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="categoria-nombre">
                Nombre
              </label>
              <input
                className="field"
                id="categoria-nombre"
                placeholder="Nuevos ingresos"
                {...register('Nombre', {
                  required: 'El nombre es obligatorio.',
                  validate: (value) => Boolean(value?.trim()) || 'El nombre es obligatorio.',
                })}
              />
              {errors.Nombre ? (
                <p className="mt-2 text-sm text-brand-coral">{errors.Nombre.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-forest" htmlFor="categoria-descripcion">
                <Text size={16} />
                Descripción
              </label>
              <textarea
                className="field min-h-[140px] resize-y"
                id="categoria-descripcion"
                placeholder="Describe qué tipo de productos agrupa esta categoría."
                {...register('Descripcion', {
                  maxLength: {
                    value: 400,
                    message: 'La descripción no debe superar 400 caracteres.',
                  },
                })}
              />
              {errors.Descripcion ? (
                <p className="mt-2 text-sm text-brand-coral">{errors.Descripcion.message}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-mist/70 bg-brand-cream/60 p-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-coral text-white">
              <Power size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-forest">Estado</p>
              <p className="text-sm text-brand-moss">
                Las categorías nuevas se crean activas. En edición puedes desactivarla lógicamente.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-brand-mist/60 bg-white/80 p-4">
            {isEditing ? (
              <label className="flex items-center justify-between gap-4" htmlFor="categoria-estado">
                <div>
                  <p className="text-sm font-semibold text-brand-forest">
                    {estado ? 'Categoría activa' : 'Categoría marcada para desactivación'}
                  </p>
                  <p className="mt-1 text-sm text-brand-moss">
                    Si desmarcas esta opción y guardas, te pediremos confirmación para desactivar.
                  </p>
                </div>
                <input
                  className="h-5 w-5 rounded border-brand-mist text-brand-coral focus:ring-brand-coral"
                  id="categoria-estado"
                  type="checkbox"
                  {...register('Estado')}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-forest">Estado inicial</p>
                  <p className="mt-1 text-sm text-brand-moss">
                    La categoría se publicará activa al crearla.
                  </p>
                </div>
                <span className="rounded-full bg-brand-forest px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sand">
                  Activa
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col-reverse gap-3 border-t border-brand-mist/70 pt-2 sm:flex-row sm:justify-end">
          <button
            className="button-secondary"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="button-primary"
            disabled={submitting}
            type="submit"
          >
            {submitting
              ? 'Guardando...'
              : isEditing
                ? estado ? 'Guardar cambios' : 'Guardar y desactivar'
                : 'Crear categoría'}
          </button>
        </section>
      </form>
    </Modal>
  );
}

export default CategoryModal;
