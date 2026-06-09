import { Boxes, Image, PencilLine, PlusCircle, Power, Ruler } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { getCategoriasByTienda } from '../api/categorias.api';
import {
  createProducto,
  deleteProducto,
  getProductosByTienda,
  updateProducto,
} from '../api/productos.api';
import { getTiendas } from '../api/tiendas.api';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import ProductModal from '../components/ProductModal';
import { formatCurrency } from '../utils/format';
import {
  getErrorMessage,
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '../utils/notifications';
import { getPrincipalImage } from '../utils/productos';

function ProductosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedStore = stores.find(
    (store) => String(store.TiendaID) === String(selectedStoreId),
  ) || null;
  const requestedCreate = searchParams.get('create') === '1';

  const getCategoryName = (categoriaId) => (
    categories.find((category) => String(category.CategoriaID) === String(categoriaId))?.Nombre
    || `Categoría ${categoriaId}`
  );

  const loadStores = async () => {
    try {
      const response = await getTiendas();
      const nextStores = response.data || [];
      setStores(nextStores);

      if (nextStores[0]) {
        setSelectedStoreId((currentStoreId) => currentStoreId || String(nextStores[0].TiendaID));
      }
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudieron cargar las tiendas.'));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (tiendaId) => {
    if (!tiendaId) {
      setCategories([]);
      return;
    }

    setCategoriesLoading(true);

    try {
      const response = await getCategoriasByTienda(tiendaId);
      setCategories(response.data || []);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudieron cargar las categorías.'));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadProducts = async (tiendaId) => {
    if (!tiendaId) {
      setProducts([]);
      return;
    }

    setProductsLoading(true);

    try {
      const response = await getProductosByTienda(tiendaId);
      setProducts(response.data || []);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudieron cargar los productos.'));
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadCategories(selectedStoreId);
    loadProducts(selectedStoreId);
  }, [selectedStoreId]);

  useEffect(() => {
    if (!requestedCreate || !selectedStoreId || categoriesLoading) {
      return;
    }

    if (!categories.length) {
      showInfoToast('Primero crea al menos una categoría activa para esta tienda.');
      setSearchParams({}, { replace: true });
      return;
    }

    setSelectedProduct(null);
    setModalMode('create');
    setModalOpen(true);
    setSearchParams({}, { replace: true });
  }, [
    requestedCreate,
    selectedStoreId,
    categories,
    categoriesLoading,
    setSearchParams,
  ]);

  const openCreateModal = () => {
    if (!selectedStoreId) {
      showInfoToast('Selecciona una tienda antes de crear un producto.');
      return;
    }

    if (!categories.length) {
      showInfoToast('Primero crea al menos una categoría activa para esta tienda.');
      return;
    }

    setSelectedProduct(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = (force = false) => {
    if (submitting && !force) {
      return;
    }

    setModalOpen(false);
    setSelectedProduct(null);
  };

  const confirmDeleteProduct = async (productName) => {
    const result = await Swal.fire({
      title: '¿Desactivar producto?',
      text: `El producto ${productName} dejará de mostrarse en esta tienda.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef7d57',
      cancelButtonColor: '#244734',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#fff8ef',
      color: '#18261f',
    });

    return result.isConfirmed;
  };

  const handleDeactivateProduct = async (product) => {
    const confirmed = await confirmDeleteProduct(product.Nombre);

    if (!confirmed) {
      return false;
    }

    await deleteProducto(product.ProductoID);
    setProducts((currentProducts) => currentProducts.filter(
      (currentProduct) => currentProduct.ProductoID !== product.ProductoID,
    ));
    showSuccessToast(`El producto ${product.Nombre} fue desactivado.`);
    return true;
  };

  const handleModalSubmit = async (payload) => {
    if (!selectedStoreId) {
      showInfoToast('Selecciona una tienda para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      if (modalMode === 'create') {
        const response = await createProducto(selectedStoreId, payload);
        setProducts((currentProducts) => [response.data, ...currentProducts]);
        showSuccessToast(`El producto ${response.data.Nombre} fue creado.`);
        closeModal(true);
        return;
      }

      if (!selectedProduct) {
        throw new Error('No se encontró el producto seleccionado.');
      }

      if (!payload.Estado) {
        const confirmed = await confirmDeleteProduct(selectedProduct.Nombre);

        if (!confirmed) {
          return;
        }

        await deleteProducto(selectedProduct.ProductoID);
        setProducts((currentProducts) => currentProducts.filter(
          (currentProduct) => currentProduct.ProductoID !== selectedProduct.ProductoID,
        ));
        showSuccessToast(`El producto ${selectedProduct.Nombre} fue desactivado.`);
        closeModal(true);
        return;
      }

      const response = await updateProducto(selectedProduct.ProductoID, {
        Nombre: payload.Nombre,
        Descripcion: payload.Descripcion,
        CategoriaID: payload.CategoriaID,
        PrecioMenor: payload.PrecioMenor,
        PrecioMayor: payload.PrecioMayor,
        UsaTallas: payload.UsaTallas,
        Imagenes: payload.Imagenes,
        Tallas: payload.Tallas,
      });

      setProducts((currentProducts) => currentProducts.map((product) => (
        product.ProductoID === selectedProduct.ProductoID ? response.data : product
      )));
      showSuccessToast(`El producto ${response.data.Nombre} fue actualizado.`);
      closeModal(true);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo guardar el producto.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen label="Cargando productos..." />;
  }

  return (
    <div className="space-y-6">
      <header className="admin-panel">
        <p className="badge">Módulo Productos</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-brand-forest">Productos por tienda</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-moss">
          Selecciona una tienda para administrar sus productos, imágenes y tallas,
          manteniendo el catálogo organizado por categoría.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,320px),1fr]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="product-store-select">
              Tienda
            </label>
            <select
              className="field"
              id="product-store-select"
              onChange={(event) => {
                setSelectedStoreId(event.target.value);
                setModalOpen(false);
                setSelectedProduct(null);
              }}
              value={selectedStoreId}
            >
              {stores.map((store) => (
                <option key={store.TiendaID} value={store.TiendaID}>
                  {store.Nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-3xl bg-brand-cream p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Tienda activa</p>
              <p className="mt-2 text-sm font-semibold text-brand-forest">
                {selectedStore?.Nombre || 'Sin selección'}
              </p>
            </div>
            <div className="rounded-3xl bg-brand-cream p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Productos activos</p>
              <p className="mt-2 font-display text-3xl font-semibold text-brand-forest">{products.length}</p>
            </div>
            <div className="rounded-3xl bg-brand-cream p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Categorías activas</p>
              <p className="mt-2 font-display text-3xl font-semibold text-brand-forest">{categories.length}</p>
            </div>
            <div className="rounded-3xl bg-brand-cream p-4">
              <button
                className="button-primary w-full"
                disabled={categoriesLoading}
                onClick={openCreateModal}
                type="button"
              >
                <PlusCircle size={16} />
                Nuevo producto
              </button>
            </div>
          </div>
        </div>
      </header>

      {categoriesLoading ? <LoadingScreen label="Cargando categorías de la tienda..." /> : null}
      {productsLoading ? <LoadingScreen label="Cargando productos de la tienda..." /> : null}

      {!productsLoading && products.length === 0 ? (
        <EmptyState
          title="Sin productos activos"
          description="Crea el primer producto de esta tienda y aparecerá aquí con sus imágenes y tallas."
        />
      ) : null}

      {!productsLoading && products.length > 0 ? (
        <>
          <div className="hidden overflow-hidden rounded-[32px] border border-brand-mist/70 bg-white/85 shadow-soft lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-brand-mist/70">
                <thead className="bg-brand-cream/70">
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-brand-moss">
                    <th className="px-5 py-4 font-semibold">Producto</th>
                    <th className="px-5 py-4 font-semibold">Categoría</th>
                    <th className="px-5 py-4 font-semibold">Precio</th>
                    <th className="px-5 py-4 font-semibold">Imágenes</th>
                    <th className="px-5 py-4 font-semibold">Tallas</th>
                    <th className="px-5 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-mist/50">
                  {products.map((product) => {
                    const principalImage = getPrincipalImage(product.Imagenes);

                    return (
                      <tr className="align-top" key={product.ProductoID}>
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-4">
                            {principalImage?.UrlImagen ? (
                              <img
                                alt={`Imagen principal de ${product.Nombre}`}
                                className="h-16 w-16 rounded-3xl object-cover"
                                src={principalImage.UrlImagen}
                              />
                            ) : (
                              <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-forest text-brand-sand">
                                <Boxes size={20} />
                              </span>
                            )}
                            <div>
                              <p className="font-display text-2xl font-semibold text-brand-forest">{product.Nombre}</p>
                              <p className="mt-2 max-w-md text-sm leading-6 text-brand-moss">
                                {product.Descripcion || 'Sin descripción registrada todavía.'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <span className="badge">{getCategoryName(product.CategoriaID)}</span>
                        </td>
                        <td className="px-5 py-5">
                          <p className="font-semibold text-brand-forest">
                            {formatCurrency(product.PrecioMenor)} - {formatCurrency(product.PrecioMayor)}
                          </p>
                          <p className="mt-2 text-sm text-brand-moss">
                            {product.UsaTallas ? 'Calculado por tallas' : 'Precio fijo por producto'}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-brand-forest">
                            <Image size={16} />
                            <span className="text-sm font-semibold">{product.Imagenes.length} registradas</span>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2 text-brand-forest">
                            <Ruler size={16} />
                            <span className="text-sm font-semibold">
                              {product.UsaTallas ? `${product.Tallas.length} activas` : 'No usa tallas'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-3">
                            <button
                              className="button-secondary"
                              onClick={() => openEditModal(product)}
                              type="button"
                            >
                              <PencilLine size={16} />
                              Editar
                            </button>
                            <button
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-coral/30 bg-brand-coral/10 px-5 py-3 text-sm font-semibold text-brand-coral transition hover:bg-brand-coral hover:text-white"
                              onClick={async () => {
                                try {
                                  await handleDeactivateProduct(product);
                                } catch (error) {
                                  showErrorToast(getErrorMessage(error, 'No se pudo desactivar el producto.'));
                                }
                              }}
                              type="button"
                            >
                              <Power size={16} />
                              Desactivar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden">
            {products.map((product) => {
              const principalImage = getPrincipalImage(product.Imagenes);

              return (
                <article className="admin-panel" key={product.ProductoID}>
                  <div className="flex items-start gap-4">
                    {principalImage?.UrlImagen ? (
                      <img
                        alt={`Imagen principal de ${product.Nombre}`}
                        className="h-20 w-20 rounded-3xl object-cover"
                        src={principalImage.UrlImagen}
                      />
                    ) : (
                      <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-forest text-brand-sand">
                        <Boxes size={22} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="badge">{getCategoryName(product.CategoriaID)}</p>
                      <h2 className="mt-3 font-display text-2xl font-semibold text-brand-forest">{product.Nombre}</h2>
                      <p className="mt-2 text-sm leading-6 text-brand-moss">
                        {product.Descripcion || 'Sin descripción registrada todavía.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl bg-brand-cream p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Precio</p>
                      <p className="mt-2 font-semibold text-brand-forest">
                        {formatCurrency(product.PrecioMenor)} - {formatCurrency(product.PrecioMayor)}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-brand-cream p-4">
                      <div className="flex items-center gap-2 text-brand-forest">
                        <Image size={16} />
                        <span className="text-sm font-semibold">{product.Imagenes.length} imágenes</span>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-brand-cream p-4">
                      <div className="flex items-center gap-2 text-brand-forest">
                        <Ruler size={16} />
                        <span className="text-sm font-semibold">
                          {product.UsaTallas ? `${product.Tallas.length} tallas` : 'Sin tallas'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="button-secondary"
                      onClick={() => openEditModal(product)}
                      type="button"
                    >
                      <PencilLine size={16} />
                      Editar
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-coral/30 bg-brand-coral/10 px-5 py-3 text-sm font-semibold text-brand-coral transition hover:bg-brand-coral hover:text-white"
                      onClick={async () => {
                        try {
                          await handleDeactivateProduct(product);
                        } catch (error) {
                          showErrorToast(getErrorMessage(error, 'No se pudo desactivar el producto.'));
                        }
                      }}
                      type="button"
                    >
                      <Power size={16} />
                      Desactivar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}

      <ProductModal
        categories={categories}
        isOpen={modalOpen}
        mode={modalMode}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        product={selectedProduct}
        storeName={selectedStore?.Nombre}
        submitting={submitting}
      />
    </div>
  );
}

export default ProductosPage;
