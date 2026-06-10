import {
  Boxes,
  ImagePlus,
  Package,
  PlusCircle,
  Ruler,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import {
  buildProductPayload,
  getPriceRangeFromSizes,
  getProductFormValues,
} from '../utils/productos';
import { readFileAsDataUrl } from '../utils/files';
import { formatCurrency } from '../utils/format';
import { showErrorToast } from '../utils/notifications';
import Modal from './Modal';

function ProductModal({
  isOpen,
  mode = 'create',
  product,
  storeName,
  categories,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const fileInputRef = useRef(null);
  const [processingImages, setProcessingImages] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: getProductFormValues(product),
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: 'Imagenes',
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: 'Tallas',
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    reset(getProductFormValues(product));
  }, [isOpen, product, reset]);

  const isEditing = mode === 'edit';
  const usaTallas = watch('UsaTallas');
  const estado = watch('Estado');
  const images = watch('Imagenes') || [];
  const sizes = watch('Tallas') || [];
  const priceRangeFromSizes = usaTallas ? getPriceRangeFromSizes(sizes) : null;

  const categoryOptions = [...categories];
  const currentCategoryId = watch('CategoriaID');

  if (
    currentCategoryId
    && !categoryOptions.some((category) => String(category.CategoriaID) === String(currentCategoryId))
  ) {
    categoryOptions.unshift({
      CategoriaID: currentCategoryId,
      Nombre: `Categoria actual (${currentCategoryId})`,
    });
  }

  const hasCategoryOptions = categoryOptions.length > 0;

  const setPrincipalImage = (index) => {
    const currentImages = getValues('Imagenes') || [];

    currentImages.forEach((_, imageIndex) => {
      setValue(`Imagenes.${imageIndex}.EsPrincipal`, imageIndex === index, {
        shouldDirty: true,
      });
    });
  };

  const handleRemoveImage = (index) => {
    const currentImages = getValues('Imagenes') || [];
    const removedWasPrincipal = currentImages[index]?.EsPrincipal;

    removeImage(index);

    setTimeout(() => {
      const remainingImages = getValues('Imagenes') || [];

      if (removedWasPrincipal && remainingImages.length && !remainingImages.some((image) => image?.EsPrincipal)) {
        setValue('Imagenes.0.EsPrincipal', true, { shouldDirty: true });
      }
    }, 0);
  };

  const handleAddImage = () => {
    const currentImages = getValues('Imagenes') || [];

    appendImage({
      ProductoImagenID: null,
      UrlImagen: '',
      EsPrincipal: currentImages.length === 0,
      Orden: currentImages.length + 1,
    });
  };

  const handleFilesSelected = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setProcessingImages(true);

    try {
      const currentImages = getValues('Imagenes') || [];
      const hasPrincipal = currentImages.some(
        (image) => image?.EsPrincipal && String(image?.UrlImagen || '').trim(),
      );
      const dataUrls = await Promise.all(files.map(readFileAsDataUrl));

      dataUrls.forEach((dataUrl, index) => {
        appendImage({
          ProductoImagenID: null,
          UrlImagen: dataUrl,
          EsPrincipal: !hasPrincipal && index === 0,
          Orden: currentImages.length + index + 1,
        });
      });
    } catch (error) {
      showErrorToast(error.message || 'No se pudieron cargar las imagenes.');
    } finally {
      setProcessingImages(false);
      event.target.value = '';
    }
  };

  const handleAddSize = () => {
    appendSize({
      ProductoTallaID: null,
      Talla: '',
      Stock: 0,
      PrecioMenor: '',
      PrecioMayor: '',
    });
  };

  const handleFormSubmit = handleSubmit((values) => {
    try {
      const payload = buildProductPayload(values);
      onSubmit(payload);
    } catch (error) {
      showErrorToast(error.message || 'Revisa la informacion del producto.');
    }
  });

  return (
    <Modal
      description={isEditing
        ? `Actualiza el producto seleccionado para ${storeName || 'la tienda actual'}.`
        : `Crea un nuevo producto para ${storeName || 'la tienda actual'}.`}
      maxWidthClass="max-w-6xl"
      onClose={submitting || processingImages ? () => {} : onClose}
      open={isOpen}
      title={isEditing ? 'Editar producto' : 'Crear producto'}
    >
      <form className="flex min-h-full flex-col" onSubmit={handleFormSubmit}>
        <div className="flex-1">
          <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <section className="space-y-6">
              <div className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-forest text-brand-sand">
                    <Package size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-forest">Informacion general</p>
                    <p className="text-sm text-brand-moss">
                      Define el producto, su categoria y la forma en que se vendera.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="producto-nombre">
                      Nombre
                    </label>
                    <input
                      className="field"
                      id="producto-nombre"
                      placeholder="Vestido floral"
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
                    <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="producto-categoria">
                      Categoria
                    </label>
                    <select
                      className="field"
                      disabled={!hasCategoryOptions}
                      id="producto-categoria"
                      {...register('CategoriaID', {
                        required: 'La categoria es obligatoria.',
                      })}
                    >
                      <option value="">
                        {hasCategoryOptions ? 'Selecciona una categoria' : 'No hay categorias disponibles'}
                      </option>
                      {categoryOptions.map((category) => (
                        <option key={category.CategoriaID} value={category.CategoriaID}>
                          {category.Nombre}
                        </option>
                      ))}
                    </select>
                    {errors.CategoriaID ? (
                      <p className="mt-2 text-sm text-brand-coral">{errors.CategoriaID.message}</p>
                    ) : null}
                  </div>

                  <div className="rounded-[24px] border border-brand-mist/60 bg-brand-cream/60 p-4">
                    <label className="flex items-center justify-between gap-4" htmlFor="producto-usa-tallas">
                      <div>
                        <p className="text-sm font-semibold text-brand-forest">Usa tallas</p>
                        <p className="mt-1 text-sm text-brand-moss">
                          Activa esta opcion si el precio y stock se controlan por talla.
                        </p>
                      </div>
                      <input
                        className="h-5 w-5 rounded border-brand-mist text-brand-coral focus:ring-brand-coral"
                        id="producto-usa-tallas"
                        type="checkbox"
                        {...register('UsaTallas')}
                      />
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="producto-descripcion">
                      Descripcion
                    </label>
                    <textarea
                      className="field min-h-[140px] resize-y"
                      id="producto-descripcion"
                      placeholder="Describe detalles relevantes del producto."
                      {...register('Descripcion', {
                        maxLength: {
                          value: 800,
                          message: 'La descripcion no debe superar 800 caracteres.',
                        },
                      })}
                    />
                    {errors.Descripcion ? (
                      <p className="mt-2 text-sm text-brand-coral">{errors.Descripcion.message}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-coral text-white">
                    <ImagePlus size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-forest">Imagenes del producto</p>
                    <p className="text-sm text-brand-moss">
                      Sube archivos o pega URLs/base64. Solo una imagen puede quedar como principal.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="button-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <Upload size={16} />
                    {processingImages ? 'Procesando...' : 'Subir imagenes'}
                  </button>
                  <button
                    className="button-secondary"
                    onClick={handleAddImage}
                    type="button"
                  >
                    <PlusCircle size={16} />
                    Agregar por URL
                  </button>
                  <input
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={handleFilesSelected}
                    ref={fileInputRef}
                    type="file"
                  />
                </div>

                {imageFields.length === 0 ? (
                  <div className="mt-5 rounded-[24px] border border-dashed border-brand-mist bg-brand-cream/50 p-5 text-sm text-brand-moss">
                    Todavia no hay imagenes agregadas para este producto.
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {imageFields.map((field, index) => {
                      const currentImage = images[index];
                      const imageUrl = currentImage?.UrlImagen?.trim();
                      const isPrincipal = Boolean(currentImage?.EsPrincipal);

                      return (
                        <div
                          className="rounded-[24px] border border-brand-mist/70 bg-brand-cream/60 p-4"
                          key={field.id}
                        >
                          <div className="grid gap-4 lg:grid-cols-[180px,1fr]">
                            <div>
                              {imageUrl ? (
                                <img
                                  alt={`Vista previa ${index + 1}`}
                                  className="h-36 w-full rounded-2xl object-cover"
                                  src={imageUrl}
                                />
                              ) : (
                                <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-brand-mist text-sm text-brand-moss">
                                  Sin vista previa
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor={`producto-imagen-${index}`}>
                                  URL o imagen codificada
                                </label>
                                <input
                                  className="field"
                                  id={`producto-imagen-${index}`}
                                  placeholder="https://..."
                                  {...register(`Imagenes.${index}.UrlImagen`)}
                                />
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <button
                                  className={isPrincipal ? 'button-primary' : 'button-secondary'}
                                  onClick={() => setPrincipalImage(index)}
                                  type="button"
                                >
                                  <Star size={16} />
                                  {isPrincipal ? 'Imagen principal' : 'Marcar principal'}
                                </button>
                                <button
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-coral/30 bg-brand-coral/10 px-5 py-3 text-sm font-semibold text-brand-coral transition hover:bg-brand-coral hover:text-white"
                                  onClick={() => handleRemoveImage(index)}
                                  type="button"
                                >
                                  <Trash2 size={16} />
                                  Quitar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gold text-brand-forest">
                    <Boxes size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-forest">Precios</p>
                    <p className="text-sm text-brand-moss">
                      Define precio fijo por producto o deja que el rango se calcule por tallas.
                    </p>
                  </div>
                </div>

                {!usaTallas ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="producto-precio-menor">
                        Precio por unidad
                      </label>
                      <input
                        className="field"
                        id="producto-precio-menor"
                        min="0"
                        placeholder="0"
                        step="0.01"
                        type="number"
                        {...register('PrecioMenor', {
                          validate: (value) => (
                            usaTallas
                            || String(value ?? '').trim() !== ''
                            || 'El precio por unidad es obligatorio cuando no usas tallas.'
                          ),
                        })}
                      />
                      {errors.PrecioMenor ? (
                        <p className="mt-2 text-sm text-brand-coral">{errors.PrecioMenor.message}</p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="producto-precio-mayor">
                        Precio por mayor
                      </label>
                      <input
                        className="field"
                        id="producto-precio-mayor"
                        min="0"
                        placeholder="0"
                        step="0.01"
                        type="number"
                        {...register('PrecioMayor', {
                          validate: (value) => (
                            usaTallas
                            || String(value ?? '').trim() !== ''
                            || 'El precio por mayor es obligatorio cuando no usas tallas.'
                          ),
                        })}
                      />
                      {errors.PrecioMayor ? (
                        <p className="mt-2 text-sm text-brand-coral">{errors.PrecioMayor.message}</p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[24px] border border-brand-mist/60 bg-brand-cream/60 p-4">
                    <p className="text-sm font-semibold text-brand-forest">Rango calculado por tallas</p>
                    <p className="mt-2 text-sm text-brand-moss">
                      El backend calculara `PrecioMenor` y `PrecioMayor` usando las tallas activas.
                    </p>
                    <p className="mt-3 font-semibold text-brand-forest">
                      {priceRangeFromSizes
                        ? `${formatCurrency(priceRangeFromSizes.min)} - ${formatCurrency(priceRangeFromSizes.max)}`
                        : 'Agrega tallas para calcular el rango.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-brand-mist/70 bg-white/70 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-forest text-brand-sand">
                    <Ruler size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-forest">Tallas</p>
                    <p className="text-sm text-brand-moss">
                      Registra stock y precios por talla cuando `UsaTallas` este activo.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="button-secondary"
                    disabled={!usaTallas}
                    onClick={handleAddSize}
                    type="button"
                  >
                    <PlusCircle size={16} />
                    Agregar talla
                  </button>
                  {!usaTallas ? (
                    <p className="self-center text-sm text-brand-moss">
                      Activa `UsaTallas` para gestionar tallas.
                    </p>
                  ) : null}
                </div>

                {usaTallas ? (
                  sizeFields.length === 0 ? (
                    <div className="mt-5 rounded-[24px] border border-dashed border-brand-mist bg-brand-cream/50 p-5 text-sm text-brand-moss">
                      Todavia no hay tallas cargadas para este producto.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {sizeFields.map((field, index) => (
                        <div className="rounded-[24px] border border-brand-mist/60 bg-brand-cream/60 p-4" key={field.id}>
                          <div className="grid gap-4 lg:grid-cols-[1.1fr,0.7fr,0.9fr,0.9fr,auto]">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor={`producto-talla-${index}`}>
                                Talla
                              </label>
                              <input
                                className="field"
                                id={`producto-talla-${index}`}
                                placeholder="M"
                                {...register(`Tallas.${index}.Talla`)}
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor={`producto-stock-${index}`}>
                                Stock
                              </label>
                              <input
                                className="field"
                                id={`producto-stock-${index}`}
                                min="0"
                                placeholder="0"
                                type="number"
                                {...register(`Tallas.${index}.Stock`)}
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor={`producto-talla-precio-menor-${index}`}>
                                Precio por unidad
                              </label>
                              <input
                                className="field"
                                id={`producto-talla-precio-menor-${index}`}
                                min="0"
                                placeholder="0"
                                step="0.01"
                                type="number"
                                {...register(`Tallas.${index}.PrecioMenor`)}
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor={`producto-talla-precio-mayor-${index}`}>
                                Precio por mayor
                              </label>
                              <input
                                className="field"
                                id={`producto-talla-precio-mayor-${index}`}
                                min="0"
                                placeholder="0"
                                step="0.01"
                                type="number"
                                {...register(`Tallas.${index}.PrecioMayor`)}
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-coral/30 bg-brand-coral/10 text-brand-coral transition hover:bg-brand-coral hover:text-white"
                                onClick={() => removeSize(index)}
                                type="button"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : null}
              </div>

              <div className="rounded-[28px] border border-brand-mist/70 bg-brand-ink p-5 text-brand-sand">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">Resumen</p>
                    <p className="mt-2 font-display text-2xl font-semibold">
                      {watch('Nombre')?.trim() || 'Nuevo producto'}
                    </p>
                    <p className="mt-2 text-sm text-brand-mist">
                      {watch('CategoriaID')
                        ? `${categoryOptions.find((category) => String(category.CategoriaID) === String(watch('CategoriaID')))?.Nombre || 'Categoria seleccionada'}`
                        : 'Selecciona una categoria para este producto.'}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-brand-mist">Estado</p>
                    <p className="mt-2 text-sm font-semibold">
                      {usaTallas
                        ? `${sizes.length} tallas registradas`
                        : `${imageFields.length} imagenes registradas`}
                    </p>
                  </div>
                </div>

                {isEditing ? (
                  <label className="mt-5 flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4" htmlFor="producto-estado">
                    <div>
                      <p className="text-sm font-semibold">Estado</p>
                      <p className="mt-1 text-sm text-brand-mist">
                        Si desmarcas esta opcion y guardas, el producto se desactivara logicamente.
                      </p>
                    </div>
                    <input
                      className="h-5 w-5 rounded border-white/20 text-brand-coral focus:ring-brand-coral"
                      id="producto-estado"
                      type="checkbox"
                      {...register('Estado')}
                    />
                  </label>
                ) : null}
              </div>
            </section>
          </div>
        </div>

        <section className="sticky bottom-0 z-10 mt-6 flex flex-col-reverse gap-3 border-t border-brand-mist/70 bg-white/95 pb-1 pt-4 backdrop-blur sm:flex-row sm:justify-end">
          <button
            className="button-secondary"
            disabled={submitting || processingImages}
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="button-primary"
            disabled={submitting || processingImages || !hasCategoryOptions}
            type="submit"
          >
            {submitting
              ? 'Guardando...'
              : isEditing
                ? estado ? 'Guardar cambios' : 'Guardar y desactivar'
                : 'Crear producto'}
          </button>
        </section>
      </form>
    </Modal>
  );
}

export default ProductModal;
