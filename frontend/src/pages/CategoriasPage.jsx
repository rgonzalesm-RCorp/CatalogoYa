import { PencilLine, PlusCircle, Power } from 'lucide-react';
import { useEffect, useState } from 'react';
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

function CategoriasPage() {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedStore = stores.find(
    (store) => String(store.TiendaID) === String(selectedStoreId),
  ) || null;

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

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadCategories(selectedStoreId);
  }, [selectedStoreId]);

  const openCreateModal = () => {
    if (!selectedStoreId) {
      showInfoToast('Selecciona una tienda antes de crear una categoría.');
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
      title: '¿Desactivar categoría?',
      text: `La categoría ${categoryName} dejará de estar disponible en esta tienda.`,
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

  const handleDeactivateCategory = async (category) => {
    const confirmed = await confirmDeleteCategory(category.Nombre);

    if (!confirmed) {
      return false;
    }

    await deleteCategoria(category.CategoriaID);
    setCategories((currentCategories) => currentCategories.filter(
      (currentCategory) => currentCategory.CategoriaID !== category.CategoriaID,
    ));
    showSuccessToast(`La categoría ${category.Nombre} fue desactivada.`);
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
        showSuccessToast(`La categoría ${response.data.Nombre} fue creada.`);
        closeModal(true);
        return;
      }

      if (!selectedCategory) {
        throw new Error('No se encontró la categoría seleccionada.');
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
        showSuccessToast(`La categoría ${selectedCategory.Nombre} fue desactivada.`);
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
      showSuccessToast(`La categoría ${response.data.Nombre} fue actualizada.`);
      closeModal(true);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo guardar la categoría.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen label="Cargando categorías..." />;
  }

  return (
    <div className="space-y-6">
      <header className="admin-panel">
        <p className="badge">Módulo Categorías</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-brand-forest">Categorías por tienda</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-moss">
          Selecciona una tienda para administrar sus categorías activas, crear nuevas agrupaciones
          y desactivarlas sin tocar registros de otras tiendas.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,360px),1fr]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-forest" htmlFor="store-select">
              Tienda
            </label>
            <select
              className="field"
              id="store-select"
              onChange={(event) => {
                setSelectedStoreId(event.target.value);
                setModalOpen(false);
                setSelectedCategory(null);
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

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-brand-cream p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Tienda activa</p>
              <p className="mt-2 text-sm font-semibold text-brand-forest">
                {selectedStore?.Nombre || 'Sin selección'}
              </p>
            </div>
            <div className="rounded-3xl bg-brand-cream p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Categorías activas</p>
              <p className="mt-2 font-display text-3xl font-semibold text-brand-forest">{categories.length}</p>
            </div>
            <div className="rounded-3xl bg-brand-cream p-4">
              <button
                className="button-primary w-full"
                onClick={openCreateModal}
                type="button"
              >
                <PlusCircle size={16} />
                Nueva categoría
              </button>
            </div>
          </div>
        </div>
      </header>

      {categoriesLoading ? <LoadingScreen label="Cargando categorías de la tienda..." /> : null}

      {!categoriesLoading && categories.length === 0 ? (
        <EmptyState
          title="Sin categorías activas"
          description="Crea la primera categoría de esta tienda desde el botón superior y aparecerá aquí."
        />
      ) : null}

      {!categoriesLoading && categories.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <article className="admin-panel" key={category.CategoriaID}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="badge">Categoría</p>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-brand-forest">{category.Nombre}</h2>
                </div>
                <span className="rounded-full bg-brand-forest px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sand">
                  {category.Estado ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-brand-moss">
                {category.Descripcion || 'Sin descripción registrada todavía.'}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  className="button-secondary"
                  onClick={() => openEditModal(category)}
                  type="button"
                >
                  <PencilLine size={16} />
                  Editar
                </button>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-coral/30 bg-brand-coral/10 px-5 py-3 text-sm font-semibold text-brand-coral transition hover:bg-brand-coral hover:text-white"
                  onClick={async () => {
                    try {
                      await handleDeactivateCategory(category);
                    } catch (error) {
                      showErrorToast(getErrorMessage(error, 'No se pudo desactivar la categoría.'));
                    }
                  }}
                  type="button"
                >
                  <Power size={16} />
                  Desactivar
                </button>
              </div>
            </article>
          ))}
        </div>
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
