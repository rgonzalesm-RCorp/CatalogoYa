import { Copy, ExternalLink, PlusCircle, Power, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

import { createTienda, deleteTienda, getTiendas, updateTienda } from '../api/tiendas.api';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import StoreForm from '../components/StoreForm';
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

function TiendasPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingStoreId, setDeletingStoreId] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [stores, setStores] = useState([]);

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
            `La tienda se creó, pero el slug solicitado no se pudo aplicar. Quedó como ${buildPublicStoreUrl(nextStore.Slug)}.`,
          );
        }
      }

      setStores((currentStores) => [nextStore, ...currentStores]);
      setFormKey((currentKey) => currentKey + 1);
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
      showSuccessToast('La URL pública fue copiada.');
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo copiar la URL pública.'));
    }
  };

  const handleDeactivateStore = async (store) => {
    const result = await Swal.fire({
      title: '¿Desactivar tienda?',
      text: `La tienda ${store.Nombre} dejará de estar disponible públicamente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef7d57',
      cancelButtonColor: '#244734',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#fff8ef',
      color: '#18261f',
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

  if (loading) {
    return <LoadingScreen label="Cargando tiendas..." />;
  }

  return (
    <div className="space-y-6">
      <header className="admin-panel">
        <p className="badge">Módulo Tiendas</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-brand-forest">Tus tiendas</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-moss">
          Administra las tiendas del usuario autenticado: crea nuevas, edita su identidad visual,
          copia su URL pública y desactívalas con borrado lógico cuando ya no deban mostrarse.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-brand-cream p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Tiendas activas</p>
            <p className="mt-2 font-display text-3xl font-semibold text-brand-forest">{stores.length}</p>
          </div>
          <div className="rounded-3xl bg-brand-cream p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Dominio público</p>
            <p className="mt-2 font-semibold text-brand-forest">catalogosYa.com</p>
          </div>
          <div className="rounded-3xl bg-brand-cream p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Acceso</p>
            <p className="mt-2 text-sm font-semibold text-brand-forest">
              Solo ves y administras tus propias tiendas.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[460px,1fr]">
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="admin-panel" id="crear-tienda">
            <div className="flex items-center gap-3">
              <PlusCircle className="text-brand-coral" size={20} />
              <div>
                <p className="font-display text-2xl font-semibold text-brand-forest">Crear tienda</p>
                <p className="mt-1 text-sm text-brand-moss">
                  Completa la información pública y deja lista la URL `catalogosYa.com/{'{slug}'}`.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <StoreForm
                key={formKey}
                mode="create"
                onSubmit={handleCreateStore}
                submitting={submitting}
              />
            </div>
          </section>
        </aside>

        <section className="space-y-4">
          {stores.length === 0 ? (
            <EmptyState
              title="Todavía no hay tiendas"
              description="Crea la primera tienda desde el formulario lateral y aparecerá listada aquí."
            />
          ) : null}

          {stores.map((store) => (
            <article className="admin-panel" key={store.TiendaID}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  {store.Logo ? (
                    <img
                      alt={`Logo de ${store.Nombre}`}
                      className="h-16 w-16 rounded-3xl object-cover"
                      src={store.Logo}
                    />
                  ) : (
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-forest text-brand-sand">
                      <Store size={22} />
                    </span>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-display text-2xl font-semibold text-brand-forest">{store.Nombre}</p>
                      <span className="rounded-full bg-brand-forest px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-sand">
                        {store.Estado ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-brand-moss">{buildPublicStoreUrl(store.Slug)}</p>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-moss">
                      {store.Descripcion || 'Sin descripción pública registrada todavía.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="button-secondary"
                    onClick={() => handleCopyUrl(store.Slug)}
                    type="button"
                  >
                    <Copy size={16} />
                    Copiar URL
                  </button>
                  <Link className="button-secondary" to={`/admin/tiendas/${store.TiendaID}`}>
                    <ExternalLink size={16} />
                    Editar
                  </Link>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-coral/30 bg-brand-coral/10 px-5 py-3 text-sm font-semibold text-brand-coral transition hover:bg-brand-coral hover:text-white"
                    disabled={deletingStoreId === store.TiendaID}
                    onClick={() => handleDeactivateStore(store)}
                    type="button"
                  >
                    <Power size={16} />
                    {deletingStoreId === store.TiendaID ? 'Desactivando...' : 'Desactivar'}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl bg-brand-cream p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Slug</p>
                  <p className="mt-2 text-sm font-semibold text-brand-forest">{store.Slug}</p>
                </div>
                <div className="rounded-3xl bg-brand-cream p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">WhatsApp</p>
                  <p className="mt-2 text-sm font-semibold text-brand-forest">{store.WhatsApp || 'No definido'}</p>
                </div>
                <div className="rounded-3xl bg-brand-cream p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Color principal</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span
                      className="h-6 w-6 rounded-full border border-brand-mist"
                      style={{ backgroundColor: store.ColorPrincipal || '#d9e4d7' }}
                    />
                    <span className="text-sm font-semibold text-brand-forest">
                      {store.ColorPrincipal || 'No definido'}
                    </span>
                  </div>
                </div>
                <div className="rounded-3xl bg-brand-cream p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Token público</p>
                  <p className="mt-2 break-all text-sm font-semibold text-brand-forest">{store.TokenPublico}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default TiendasPage;
