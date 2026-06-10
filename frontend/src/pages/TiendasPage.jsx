import { Copy, ExternalLink, Plus, Search, Store, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

import { createTienda, deleteTienda, getTiendas, updateTienda } from '../api/tiendas.api';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import StoreModal from '../components/StoreModal';
import {
  getErrorMessage,
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '../utils/notifications';
import {
  buildPublicStoreUrl,
  buildStorePayload,
  copyText,
} from '../utils/tiendas';

const normalizeText = (value = '') => String(value).toLowerCase().trim();

function TiendasPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingStoreId, setDeletingStoreId] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedStore, setSelectedStore] = useState(null);

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

  useEffect(() => {
    loadStores();
  }, []);

  const visibleStores = useMemo(() => (
    stores.filter((store) => (
      !normalizeText(searchQuery)
      || normalizeText(`${store.Nombre} ${store.Slug} ${store.Descripcion || ''}`).includes(normalizeText(searchQuery))
    ))
  ), [stores, searchQuery]);

  const openCreateModal = () => {
    setSelectedStore(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (store) => {
    setSelectedStore(store);
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModalOpen(false);
    setSelectedStore(null);
  };

  const handleCreateStore = async (values) => {
    const payload = buildStorePayload(values);
    setSubmitting(true);

    try {
      const createResponse = await createTienda({
        Nombre: payload.Nombre,
        Logo: payload.Logo || undefined,
        Portada: payload.Portada || undefined,
        WhatsApp: payload.WhatsApp || undefined,
        Descripcion: payload.Descripcion || undefined,
        ColorPrincipal: payload.ColorPrincipal || undefined,
      });

      let nextStore = createResponse.data;

      if (payload.Slug && payload.Slug !== nextStore.Slug) {
        try {
          const updateResponse = await updateTienda(nextStore.TiendaID, {
            Slug: payload.Slug,
          });
          nextStore = updateResponse.data;
        } catch (error) {
          showInfoToast(
            `La tienda se creo, pero el slug solicitado no se pudo aplicar. Quedo como ${buildPublicStoreUrl(nextStore.Slug)}.`,
          );
        }
      }

      setStores((currentStores) => [nextStore, ...currentStores]);
      setFormKey((currentKey) => currentKey + 1);
      setModalOpen(false);
      setSelectedStore(null);
      showSuccessToast(`La tienda ${nextStore.Nombre} fue creada correctamente.`);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo crear la tienda.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUrl = async (slug) => {
    try {
      await copyText(buildPublicStoreUrl(slug));
      showSuccessToast('La URL publica fue copiada.');
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo copiar la URL publica.'));
    }
  };

  const handleDeactivateStore = async (store) => {
    const result = await Swal.fire({
      title: 'Desactivar tienda',
      text: `La tienda ${store.Nombre} dejara de estar disponible publicamente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6d4df6',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#171c33',
    });

    if (!result.isConfirmed) {
      return;
    }

    setDeletingStoreId(store.TiendaID);

    try {
      await deleteTienda(store.TiendaID);
      setStores((currentStores) => currentStores.filter(
        (currentStore) => currentStore.TiendaID !== store.TiendaID,
      ));
      showSuccessToast(`La tienda ${store.Nombre} fue desactivada.`);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo desactivar la tienda.'));
    } finally {
      setDeletingStoreId(null);
    }
  };

  const handleEditStore = async (values) => {
    if (!selectedStore) {
      return;
    }

    const payload = buildStorePayload(values);

    if (!payload.Estado) {
      const result = await Swal.fire({
        title: 'Desactivar tienda',
        text: `La tienda ${selectedStore.Nombre} dejara de estar visible publicamente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#6d4df6',
        cancelButtonColor: '#d1d5db',
        confirmButtonText: 'Si, desactivar',
        cancelButtonText: 'Cancelar',
        background: '#ffffff',
        color: '#171c33',
      });

      if (!result.isConfirmed) {
        return;
      }

      setSubmitting(true);

      try {
        await deleteTienda(selectedStore.TiendaID);
        setStores((currentStores) => currentStores.filter(
          (currentStore) => currentStore.TiendaID !== selectedStore.TiendaID,
        ));
        setModalOpen(false);
        setSelectedStore(null);
        showSuccessToast(`La tienda ${selectedStore.Nombre} fue desactivada.`);
      } catch (error) {
        showErrorToast(getErrorMessage(error, 'No se pudo desactivar la tienda.'));
      } finally {
        setSubmitting(false);
      }

      return;
    }

    setSubmitting(true);

    try {
      const response = await updateTienda(selectedStore.TiendaID, {
        Nombre: payload.Nombre,
        Slug: payload.Slug,
        Logo: payload.Logo || null,
        Portada: payload.Portada || null,
        WhatsApp: payload.WhatsApp || null,
        Descripcion: payload.Descripcion || null,
        ColorPrincipal: payload.ColorPrincipal || null,
      });

      setStores((currentStores) => currentStores.map((store) => (
        store.TiendaID === selectedStore.TiendaID ? response.data : store
      )));
      setModalOpen(false);
      setSelectedStore(null);
      showSuccessToast(`La tienda ${response.data.Nombre} fue actualizada.`);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo actualizar la tienda.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen label="Cargando tiendas..." />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
          <section className="rounded-[8px] border border-[#ece8f4] bg-white p-5 shadow-[0_18px_40px_rgba(66,41,133,0.08)]">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-[#171d37]">Lista de tiendas</h2>
                <p className="mt-2 text-sm text-[#7b8198]">
                  Administra tu presencia publica y el acceso a cada catalogo.
                </p>
              </div>

              <div className="rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] px-4 py-3 text-sm text-[#6b7289]">
                Dominio publico: <span className="font-semibold text-[#171d37]">catalogosYa.com</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr),auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9398af]" size={18} />
                <input
                  className="w-full rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] py-3 pl-12 pr-4 text-sm text-[#1c2340] outline-none transition focus:border-[#6d4df6] focus:ring-4 focus:ring-[#6d4df6]/10"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar tiendas..."
                  value={searchQuery}
                />
              </label>

              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#6d4df6_0%,_#8a63ff_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(109,77,246,0.24)]"
                onClick={openCreateModal}
                type="button"
              >
                <Plus size={16} />
                Agregar tienda
              </button>
            </div>
          </section>

          {stores.length === 0 ? (
            <EmptyState
              title="Todavia no hay tiendas"
              description="Crea la primera tienda desde el panel lateral y aparecera aqui con el nuevo estilo del admin."
            />
          ) : null}

          {stores.length > 0 && visibleStores.length === 0 ? (
            <EmptyState
              title="No encontramos tiendas con esa busqueda"
              description="Prueba con otro nombre o slug para volver a ver resultados."
            />
          ) : null}

          {visibleStores.length > 0 ? (
            <div className="overflow-hidden rounded-[8px] border border-[#ece8f4] bg-white shadow-[0_18px_40px_rgba(66,41,133,0.08)]">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#efebf6] bg-[#fcfbff] text-left text-xs font-bold uppercase tracking-[0.18em] text-[#8a90a8]">
                      <th className="px-5 py-4">Tienda</th>
                      <th className="px-5 py-4">Slug</th>
                      <th className="px-5 py-4">WhatsApp</th>
                      <th className="px-5 py-4">Color</th>
                      <th className="px-5 py-4">Token</th>
                      <th className="px-5 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleStores.map((store) => (
                      <tr className="border-b border-[#f1edf7]" key={store.TiendaID}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {store.Logo ? (
                              <img
                                alt={`Logo de ${store.Nombre}`}
                                className="h-12 w-12 rounded-2xl object-cover"
                                src={store.Logo}
                              />
                            ) : (
                              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1edff] text-[#7b57f6]">
                                <Store size={18} />
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-[#171d37]">{store.Nombre}</p>
                              <p className="mt-1 text-sm text-[#7b8198]">
                                {store.Descripcion || 'Sin descripcion publica registrada todavia.'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[#404862]">
                          {store.Slug}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[#404862]">
                          {store.WhatsApp || 'No definido'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-7 w-7 rounded-full border border-[#ddd7ea]"
                              style={{ backgroundColor: store.ColorPrincipal || '#d9e4d7' }}
                            />
                            <span className="text-sm font-semibold text-[#171d37]">{store.ColorPrincipal || 'No definido'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[#404862]">
                          <span className="block max-w-[180px] truncate">{store.TokenPublico}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e4f1] px-4 py-2.5 text-sm font-semibold text-[#2b3354]"
                              onClick={() => handleCopyUrl(store.Slug)}
                              type="button"
                            >
                              <Copy size={16} />
                              Copiar URL
                            </button>
                            <button
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e4f1] px-4 py-2.5 text-sm font-semibold text-[#2b3354]"
                              onClick={() => openEditModal(store)}
                              type="button"
                            >
                              <ExternalLink size={16} />
                              Editar
                            </button>
                            <button
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#ffe0ea] px-4 py-2.5 text-sm font-semibold text-[#ef4b88]"
                              disabled={deletingStoreId === store.TiendaID}
                              onClick={() => handleDeactivateStore(store)}
                              type="button"
                            >
                              <Trash2 size={16} />
                              {deletingStoreId === store.TiendaID ? 'Desactivando...' : 'Desactivar'}
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
      </div>

      <StoreModal
        isOpen={modalOpen}
        key={modalMode === 'create' ? formKey : selectedStore?.TiendaID || 'edit-store'}
        mode={modalMode}
        onClose={closeModal}
        onSubmit={modalMode === 'create' ? handleCreateStore : handleEditStore}
        store={selectedStore}
        submitting={submitting}
      />
    </div>
  );
}

export default TiendasPage;
