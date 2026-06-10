import {
  Boxes,
  Copy,
  Download,
  Eye,
  MessageCircle,
  PackagePlus,
  PencilLine,
  Plus,
  Search,
  Share2,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
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

const normalizeText = (value = '') => String(value).toLowerCase().trim();

const getProductStockSummary = (product) => {
  if (!product.UsaTallas) {
    return {
      value: 'Simple',
      hint: 'Sin tallas',
      tone: 'text-[#6d4df6]',
    };
  }

  const stock = (product.Tallas || []).reduce((total, size) => total + Number(size.Stock || 0), 0);

  if (stock <= 0) {
    return {
      value: '0',
      hint: 'Sin stock',
      tone: 'text-[#ef4444]',
    };
  }

  if (stock <= 15) {
    return {
      value: String(stock),
      hint: 'Pocas unidades',
      tone: 'text-[#f97316]',
    };
  }

  return {
    value: String(stock),
    hint: 'En stock',
    tone: 'text-[#16a34a]',
  };
};

const getProductBadge = (product, index) => {
  if (product.UsaTallas) {
    return {
      label: 'Tallas',
      className: 'bg-[#ecf3ff] text-[#2d7ff9]',
    };
  }

  if (index % 3 === 1) {
    return {
      label: 'Nuevo',
      className: 'bg-[#efe9ff] text-[#7b57f6]',
    };
  }

  return {
    label: 'Destacado',
    className: 'bg-[#e8f8ef] text-[#1fa45b]',
  };
};

const buildDuplicatePayload = (product) => ({
  Nombre: `${product.Nombre} Copia`,
  Descripcion: product.Descripcion || null,
  CategoriaID: product.CategoriaID,
  PrecioMenor: product.PrecioMenor,
  PrecioMayor: product.PrecioMayor,
  UsaTallas: Boolean(product.UsaTallas),
  Imagenes: (product.Imagenes || []).map((image, index) => ({
    UrlImagen: image.UrlImagen,
    Orden: index + 1,
    EsPrincipal: Boolean(image.EsPrincipal),
  })),
  ...(product.UsaTallas
    ? {
      Tallas: (product.Tallas || []).map((size) => ({
        Talla: size.Talla,
        Stock: size.Stock,
        PrecioMenor: size.PrecioMenor,
        PrecioMayor: size.PrecioMayor,
      })),
    }
    : {}),
});

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const storeIdFromQuery = searchParams.get('tienda') || '';

  const selectedStore = stores.find(
    (store) => String(store.TiendaID) === String(selectedStoreId),
  ) || null;
  const requestedCreate = searchParams.get('create') === '1';

  const getCategoryName = (categoriaId) => (
    categories.find((category) => String(category.CategoriaID) === String(categoriaId))?.Nombre
    || `Categoria ${categoriaId}`
  );

  const loadStores = async () => {
    try {
      const response = await getTiendas();
      setStores(response.data || []);
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
      showErrorToast(getErrorMessage(error, 'No se pudieron cargar las categorias.'));
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
    if (!stores.length) {
      return;
    }

    const matchingStore = stores.find(
      (store) => String(store.TiendaID) === String(storeIdFromQuery),
    );

    if (matchingStore) {
      if (String(selectedStoreId) !== String(matchingStore.TiendaID)) {
        setSelectedStoreId(String(matchingStore.TiendaID));
      }

      return;
    }

    const fallbackStoreId = String(stores[0].TiendaID);
    if (String(selectedStoreId) !== fallbackStoreId) {
      setSelectedStoreId(fallbackStoreId);
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tienda', fallbackStoreId);
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, selectedStoreId, setSearchParams, storeIdFromQuery, stores]);

  useEffect(() => {
    setSearchQuery('');
    setSelectedCategoryFilter('all');
    loadCategories(selectedStoreId);
    loadProducts(selectedStoreId);
  }, [selectedStoreId]);

  useEffect(() => {
    if (!requestedCreate || !selectedStoreId || categoriesLoading) {
      return;
    }

    if (!categories.length) {
      showInfoToast('Primero crea al menos una categoria activa para esta tienda.');
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('create');
      setSearchParams(nextParams, { replace: true });
      return;
    }

    setSelectedProduct(null);
    setModalMode('create');
    setModalOpen(true);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('create');
    setSearchParams(nextParams, { replace: true });
  }, [
    searchParams,
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
      showInfoToast('Primero crea al menos una categoria activa para esta tienda.');
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
      title: 'Desactivar producto',
      text: `El producto ${productName} dejara de mostrarse en esta tienda.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6d4df6',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#171c33',
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

  const handleDuplicateProduct = async (product) => {
    if (!selectedStoreId) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await createProducto(selectedStoreId, buildDuplicatePayload(product));
      setProducts((currentProducts) => [response.data, ...currentProducts]);
      showSuccessToast(`Se duplico ${product.Nombre}.`);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo duplicar el producto.'));
    } finally {
      setSubmitting(false);
    }
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
        throw new Error('No se encontro el producto seleccionado.');
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

  const lowStockProducts = products.filter((product) => {
    const stockSummary = getProductStockSummary(product);

    return stockSummary.hint === 'Pocas unidades' || stockSummary.hint === 'Sin stock';
  }).length;
  const productsWithSizes = products.filter((product) => product.UsaTallas).length;
  const activeProducts = products.filter((product) => product.Estado !== false).length;
  const visibleProducts = products.filter((product) => {
    const searchableText = normalizeText([
      product.Nombre,
      product.Descripcion,
      getCategoryName(product.CategoriaID),
    ].join(' '));
    const matchesSearch = !normalizeText(searchQuery) || searchableText.includes(normalizeText(searchQuery));
    const matchesCategory = selectedCategoryFilter === 'all'
      || String(product.CategoriaID) === String(selectedCategoryFilter);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
    

      {categoriesLoading ? <LoadingScreen label="Cargando categorias de la tienda..." /> : null}
      {productsLoading ? <LoadingScreen label="Cargando productos de la tienda..." /> : null}

      {!productsLoading && products.length === 0 ? (
        <EmptyState
          title="Sin productos activos"
          description="Crea el primer producto de esta tienda y aparecera aqui con imagenes, precios y acciones."
        />
      ) : null}

      {!productsLoading && products.length > 0 ? (
        <>
          <section className="overflow-hidden rounded-[8px] border border-[#ece8f4] bg-white shadow-[0_18px_40px_rgba(66,41,133,0.08)]">
            <div className="border-b border-[#efebf6] px-5 py-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-[#171d37]">Lista de productos</h2>
                  <p className="mt-2 text-sm text-[#7b8198]">
                    Administra todos los productos de {selectedStore?.Nombre || 'tu catalogo'}.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e4f1] bg-white px-4 py-3 text-sm font-semibold text-[#2b3354]"
                    onClick={() => showInfoToast('La importacion masiva llegara en una siguiente iteracion.')}
                    type="button"
                  >
                    <Upload size={16} />
                    Importar
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e4f1] bg-white px-4 py-3 text-sm font-semibold text-[#2b3354]"
                    onClick={() => showInfoToast('La exportacion estara disponible mas adelante.')}
                    type="button"
                  >
                    <Download size={16} />
                    Exportar
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#6d4df6_0%,_#8a63ff_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(109,77,246,0.24)]"
                    disabled={categoriesLoading}
                    onClick={openCreateModal}
                    type="button"
                  >
                    <Plus size={16} />
                    Agregar producto
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.2fr),0.95fr,0.95fr,0.8fr]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9398af]" size={18} />
                  <input
                    className="w-full rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] py-3 pl-12 pr-4 text-sm text-[#1c2340] outline-none transition focus:border-[#6d4df6] focus:ring-4 focus:ring-[#6d4df6]/10"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Buscar productos..."
                    value={searchQuery}
                  />
                </label>

                <select
                  className="w-full rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] px-4 py-3 text-sm text-[#1c2340] outline-none transition focus:border-[#6d4df6] focus:ring-4 focus:ring-[#6d4df6]/10"
                  onChange={(event) => setSelectedCategoryFilter(event.target.value)}
                  value={selectedCategoryFilter}
                >
                  <option value="all">Todas las categorias</option>
                  {categories.map((category) => (
                    <option key={category.CategoriaID} value={category.CategoriaID}>
                      {category.Nombre}
                    </option>
                  ))}
                </select>

                <select
                  className="w-full rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] px-4 py-3 text-sm text-[#1c2340] outline-none transition focus:border-[#6d4df6] focus:ring-4 focus:ring-[#6d4df6]/10"
                  disabled
                  value="all-brands"
                >
                  <option value="all-brands">Todas las marcas</option>
                </select>

                <select
                  className="w-full rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] px-4 py-3 text-sm text-[#1c2340] outline-none transition focus:border-[#6d4df6] focus:ring-4 focus:ring-[#6d4df6]/10"
                  disabled
                  value="all-status"
                >
                  <option value="all-status">Estado: Todos</option>
                </select>
              </div>
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#efebf6] bg-[#fcfbff] text-left text-xs font-bold text-[#7f879f]">
                    <th className="px-3 py-4">
                      <span className="inline-flex h-6 w-6 rounded-md border border-[#d9dff0]" />
                    </th>
                    <th className="px-5 py-4">Producto</th>
                    <th className="px-5 py-4">Categoria</th>
                    <th className="px-5 py-4">Precio</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product, index) => {
                    const principalImage = getPrincipalImage(product.Imagenes);
                    const stockSummary = getProductStockSummary(product);
                    const badge = getProductBadge(product, index);

                    return (
                      <tr className="border-b border-[#f1edf7]" key={product.ProductoID}>
                        <td className="px-3 py-4 align-top">
                          <span className="inline-flex h-6 w-6 rounded-md border border-[#d9dff0]" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            {principalImage?.UrlImagen ? (
                              <img
                                alt={`Imagen principal de ${product.Nombre}`}
                                className="h-16 w-16 rounded-2xl object-cover"
                                src={principalImage.UrlImagen}
                              />
                            ) : (
                              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f1edff] text-[#7b57f6]">
                                <Boxes size={20} />
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-lg font-semibold text-[#1a2140]">{product.Nombre}</p>
                              <p className="mt-1 text-sm text-[#7b8198]">
                                SKU: PRD-{String(product.ProductoID).padStart(3, '0')}
                              </p>
                              <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[#404862]">
                          {getCategoryName(product.CategoriaID)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-base font-semibold text-[#1a2140]">
                            {formatCurrency(product.PrecioMenor)}
                          </p>
                          <p className="mt-1 text-sm text-[#7b8198]">
                            Mayor: {formatCurrency(product.PrecioMayor)}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-base font-semibold text-[#1a2140]">{stockSummary.value}</p>
                          <p className={`mt-1 text-sm ${stockSummary.tone}`}>{stockSummary.hint}</p>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            aria-label={`Desactivar ${product.Nombre}`}
                            className="relative inline-flex h-7 w-12 items-center rounded-full bg-[#6d4df6] px-1 shadow-inner"
                            onClick={async () => {
                              try {
                                await handleDeactivateProduct(product);
                              } catch (error) {
                                showErrorToast(getErrorMessage(error, 'No se pudo desactivar el producto.'));
                              }
                            }}
                            type="button"
                          >
                            <span className="ml-auto h-5 w-5 rounded-full bg-white shadow-sm" />
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9e5f3] text-[#5f6683]"
                              onClick={() => openEditModal(product)}
                              type="button"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9e5f3] text-[#5f6683]"
                              onClick={() => openEditModal(product)}
                              type="button"
                            >
                              <PencilLine size={16} />
                            </button>
                            <button
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e9e5f3] text-[#5f6683]"
                              disabled={submitting}
                              onClick={() => handleDuplicateProduct(product)}
                              type="button"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ffe0ea] text-[#ef4b88]"
                              onClick={async () => {
                                try {
                                  await handleDeactivateProduct(product);
                                } catch (error) {
                                  showErrorToast(getErrorMessage(error, 'No se pudo desactivar el producto.'));
                                }
                              }}
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 xl:hidden">
              {visibleProducts.map((product, index) => {
                const principalImage = getPrincipalImage(product.Imagenes);
                const stockSummary = getProductStockSummary(product);
                const badge = getProductBadge(product, index);

                return (
                  <article
                    className="rounded-[18px] border border-[#ece8f4] bg-white p-5 shadow-[0_12px_30px_rgba(66,41,133,0.06)]"
                    key={product.ProductoID}
                  >
                    <div className="flex items-start gap-4">
                      {principalImage?.UrlImagen ? (
                        <img
                          alt={`Imagen principal de ${product.Nombre}`}
                          className="h-20 w-20 rounded-2xl object-cover"
                          src={principalImage.UrlImagen}
                        />
                      ) : (
                        <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[#f1edff] text-[#7b57f6]">
                          <Boxes size={22} />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                        <h2 className="mt-3 text-2xl font-semibold text-[#1a2140]">{product.Nombre}</h2>
                        <p className="mt-1 text-sm text-[#7b8198]">{getCategoryName(product.CategoriaID)}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-[#faf8ff] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a90a8]">Precio</p>
                        <p className="mt-2 text-base font-semibold text-[#1a2140]">
                          {formatCurrency(product.PrecioMenor)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#faf8ff] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a90a8]">Stock</p>
                        <p className="mt-2 text-base font-semibold text-[#1a2140]">{stockSummary.value}</p>
                        <p className={`mt-1 text-sm ${stockSummary.tone}`}>{stockSummary.hint}</p>
                      </div>
                      <div className="rounded-2xl bg-[#faf8ff] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8a90a8]">Estado</p>
                        <p className="mt-2 text-base font-semibold text-[#16a34a]">Activo</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2">
                      <button
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#e9e5f3] text-[#5f6683]"
                        onClick={() => openEditModal(product)}
                        type="button"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#e9e5f3] text-[#5f6683]"
                        onClick={() => openEditModal(product)}
                        type="button"
                      >
                        <PencilLine size={16} />
                      </button>
                      <button
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#e9e5f3] text-[#5f6683]"
                        disabled={submitting}
                        onClick={() => handleDuplicateProduct(product)}
                        type="button"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#ffe0ea] text-[#ef4b88]"
                        onClick={async () => {
                          try {
                            await handleDeactivateProduct(product);
                          } catch (error) {
                            showErrorToast(getErrorMessage(error, 'No se pudo desactivar el producto.'));
                          }
                        }}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex flex-col gap-4 border-t border-[#efebf6] px-5 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[#7b8198]">
                Mostrando 1 a {visibleProducts.length} de {products.length} productos
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  className="rounded-xl border border-[#e8e4f1] px-4 py-2 text-sm font-medium text-[#9aa0b8]"
                  disabled
                  type="button"
                >
                  Anterior
                </button>
                <button className="inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl bg-[#6d4df6] px-3 text-sm font-semibold text-white" type="button">
                  1
                </button>
                <button className="inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-[#e8e4f1] px-3 text-sm font-medium text-[#4c546f]" type="button">
                  2
                </button>
                <button className="inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl border border-[#e8e4f1] px-3 text-sm font-medium text-[#4c546f]" type="button">
                  3
                </button>
                <button
                  className="rounded-xl border border-[#e8e4f1] px-4 py-2 text-sm font-medium text-[#4c546f]"
                  type="button"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </section>

          {!productsLoading && visibleProducts.length === 0 ? (
            <EmptyState
              title="No encontramos productos con esos filtros"
              description="Cambia la busqueda o la categoria seleccionada para ver mas resultados."
            />
          ) : null}
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
