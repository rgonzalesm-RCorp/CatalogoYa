import { PencilLine, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
  createCategoria,
  deleteCategoria,
  getCategoriasByTienda,
  updateCategoria,
} from '../api/categorias.api';
import { getTiendas } from '../api/tiendas.api';
import CategoryModal from '../components/CategoryModal';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import {
  getErrorMessage,
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '../utils/notifications';

const normalizeText = (value = '') => String(value).toLowerCase().trim();

function CategoriasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const storeIdFromQuery = searchParams.get('tienda') || '';

  const selectedStore = stores.find(
    (store) => String(store.TiendaID) === String(selectedStoreId),
  ) || null;

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
    loadCategories(selectedStoreId);
  }, [selectedStoreId]);

  const visibleCategories = useMemo(() => (
    categories.filter((category) => (
      !normalizeText(searchQuery)
      || normalizeText(`${category.Nombre} ${category.Descripcion || ''}`).includes(normalizeText(searchQuery))
    ))
  ), [categories, searchQuery]);

  const openCreateModal = () => {
    if (!selectedStoreId) {
      showInfoToast('Selecciona una tienda antes de crear una categoria.');
      return;
    }

    setSelectedCategory(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = (force = false) => {
    if (submitting && !force) {
      return;
    }

    setModalOpen(false);
    setSelectedCategory(null);
  };

  const confirmDeleteCategory = async (categoryName) => {
    const result = await Swal.fire({
      title: 'Desactivar categoria',
      text: `La categoria ${categoryName} dejara de estar disponible en esta tienda.`,
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

  const handleDeactivateCategory = async (category) => {
    const confirmed = await confirmDeleteCategory(category.Nombre);

    if (!confirmed) {
      return false;
    }

    await deleteCategoria(category.CategoriaID);
    setCategories((currentCategories) => currentCategories.filter(
      (currentCategory) => currentCategory.CategoriaID !== category.CategoriaID,
    ));
    showSuccessToast(`La categoria ${category.Nombre} fue desactivada.`);
    return true;
  };

  const handleModalSubmit = async (values) => {
    if (!selectedStoreId) {
      showInfoToast('Selecciona una tienda para continuar.');
      return;
    }

    setSubmitting(true);

    try {
      if (modalMode === 'create') {
        const response = await createCategoria(selectedStoreId, {
          Nombre: values.Nombre,
          Descripcion: values.Descripcion || undefined,
        });

        setCategories((currentCategories) => [response.data, ...currentCategories]);
        showSuccessToast(`La categoria ${response.data.Nombre} fue creada.`);
        closeModal(true);
        return;
      }

      if (!selectedCategory) {
        throw new Error('No se encontro la categoria seleccionada.');
      }

      if (!values.Estado) {
        const confirmed = await confirmDeleteCategory(selectedCategory.Nombre);

        if (!confirmed) {
          return;
        }

        await deleteCategoria(selectedCategory.CategoriaID);
        setCategories((currentCategories) => currentCategories.filter(
          (category) => category.CategoriaID !== selectedCategory.CategoriaID,
        ));
        showSuccessToast(`La categoria ${selectedCategory.Nombre} fue desactivada.`);
        closeModal(true);
        return;
      }

      const response = await updateCategoria(selectedCategory.CategoriaID, {
        Nombre: values.Nombre,
        Descripcion: values.Descripcion || null,
      });

      setCategories((currentCategories) => currentCategories.map((category) => (
        category.CategoriaID === selectedCategory.CategoriaID ? response.data : category
      )));
      showSuccessToast(`La categoria ${response.data.Nombre} fue actualizada.`);
      closeModal(true);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo guardar la categoria.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen label="Cargando categorias..." />;
  }

  return (
    <div className="space-y-6">

      <section className="rounded-[8px] border border-[#ece8f4] bg-white p-5 shadow-[0_18px_40px_rgba(66,41,133,0.08)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-[#171d37]">Lista de categorias</h2>
            <p className="mt-2 text-sm text-[#7b8198]">
              Organiza las categorias visibles de {selectedStore?.Nombre || 'tu tienda'}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              className="rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] px-4 py-3 text-sm text-[#1c2340] outline-none transition focus:border-[#6d4df6] focus:ring-4 focus:ring-[#6d4df6]/10"
              onChange={(event) => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('tienda', event.target.value);
                setSearchParams(nextParams);
              }}
              value={selectedStoreId}
            >
              {stores.map((store) => (
                <option key={store.TiendaID} value={store.TiendaID}>
                  {store.Nombre}
                </option>
              ))}
            </select>

            <button
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#6d4df6_0%,_#8a63ff_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(109,77,246,0.24)]"
              onClick={openCreateModal}
              type="button"
            >
              <Plus size={16} />
              Agregar categoria
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr),300px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9398af]" size={18} />
            <input
              className="w-full rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] py-3 pl-12 pr-4 text-sm text-[#1c2340] outline-none transition focus:border-[#6d4df6] focus:ring-4 focus:ring-[#6d4df6]/10"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar categorias..."
              value={searchQuery}
            />
          </label>

          <div className="rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] px-4 py-3 text-sm text-[#6b7289]">
            Mostrando <span className="font-semibold text-[#171d37]">{visibleCategories.length}</span> categorias
          </div>
        </div>
      </section>

      {categoriesLoading ? <LoadingScreen label="Cargando categorias de la tienda..." /> : null}

      {!categoriesLoading && categories.length === 0 ? (
        <EmptyState
          title="Sin categorias activas"
          description="Crea la primera categoria de esta tienda y aparecera aqui con el nuevo estilo del admin."
        />
      ) : null}

      {!categoriesLoading && categories.length > 0 ? (
        <>
          {visibleCategories.length === 0 ? (
            <EmptyState
              title="No encontramos categorias con esa busqueda"
              description="Prueba con otro termino para volver a ver resultados."
            />
          ) : null}

          {visibleCategories.length > 0 ? (
            <div className="overflow-hidden rounded-[8px] border border-[#ece8f4] bg-white shadow-[0_18px_40px_rgba(66,41,133,0.08)]">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#efebf6] bg-[#fcfbff] text-left text-xs font-bold uppercase tracking-[0.18em] text-[#8a90a8]">
                      <th className="px-5 py-4">Categoria</th>
                      <th className="px-5 py-4">Descripcion</th>
                      <th className="px-5 py-4">Tienda</th>
                      <th className="px-5 py-4">Estado</th>
                      <th className="px-5 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCategories.map((category) => (
                      <tr className="border-b border-[#f1edf7]" key={category.CategoriaID}>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-base font-semibold text-[#171d37]">{category.Nombre}</p>
                            <p className="mt-1 text-sm text-[#7b8198]">ID: {category.CategoriaID}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm leading-7 text-[#6e7490]">
                          {category.Descripcion || 'Sin descripcion registrada todavia.'}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[#404862]">
                          {selectedStore?.Nombre || 'Sin seleccion'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#ecfdf3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#16a34a]">
                            Activa
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e4f1] px-4 py-2.5 text-sm font-semibold text-[#2b3354]"
                              onClick={() => openEditModal(category)}
                              type="button"
                            >
                              <PencilLine size={16} />
                              Editar
                            </button>
                            <button
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#ffe0ea] px-4 py-2.5 text-sm font-semibold text-[#ef4b88]"
                              onClick={async () => {
                                try {
                                  await handleDeactivateCategory(category);
                                } catch (error) {
                                  showErrorToast(getErrorMessage(error, 'No se pudo desactivar la categoria.'));
                                }
                              }}
                              type="button"
                            >
                              <Trash2 size={16} />
                              Desactivar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <CategoryModal
        category={selectedCategory}
        isOpen={modalOpen}
        mode={modalMode}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        storeName={selectedStore?.Nombre}
        submitting={submitting}
      />
    </div>
  );
}

export default CategoriasPage;
