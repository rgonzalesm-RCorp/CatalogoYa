import { ArrowLeft, Copy, Link2, Power, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import { deleteTienda, getTiendaById, updateTienda } from '../api/tiendas.api';
import LoadingScreen from '../components/LoadingScreen';
import StoreForm from '../components/StoreForm';
import { formatDate } from '../utils/format';
import {
  getErrorMessage,
  showErrorToast,
  showSuccessToast,
} from '../utils/notifications';
import {
  buildPublicStoreUrl,
  buildStorePayload,
  copyText,
} from '../utils/tiendas';

function TiendaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [store, setStore] = useState(null);

  const loadStore = async () => {
    try {
      const response = await getTiendaById(id);
      setStore(response.data);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo cargar el detalle de la tienda.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [id]);

  const confirmDeactivation = async (storeName) => {
    const result = await Swal.fire({
      title: '¿Desactivar tienda?',
      text: `La tienda ${storeName} dejará de estar visible públicamente.`,
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

  const handleCopyUrl = async () => {
    if (!store?.Slug) {
      return;
    }

    try {
      await copyText(buildPublicStoreUrl(store.Slug));
      showSuccessToast('La URL pública fue copiada.');
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo copiar la URL pública.'));
    }
  };

  const handleSubmit = async (values) => {
    const payload = buildStorePayload(values);

    if (!payload.Estado) {
      const confirmed = await confirmDeactivation(store.Nombre);

      if (!confirmed) {
        return;
      }

      setSubmitting(true);

      try {
        await deleteTienda(store.TiendaID);
        showSuccessToast(`La tienda ${store.Nombre} fue desactivada.`);
        navigate('/admin/tiendas', { replace: true });
      } catch (error) {
        showErrorToast(getErrorMessage(error, 'No se pudo desactivar la tienda.'));
      } finally {
        setSubmitting(false);
      }

      return;
    }

    setSubmitting(true);

    try {
      const response = await updateTienda(store.TiendaID, {
        Nombre: payload.Nombre,
        Slug: payload.Slug,
        Logo: payload.Logo || null,
        Portada: payload.Portada || null,
        WhatsApp: payload.WhatsApp || null,
        Descripcion: payload.Descripcion || null,
        ColorPrincipal: payload.ColorPrincipal || null,
      });

      setStore(response.data);
      showSuccessToast(`La tienda ${response.data.Nombre} fue actualizada.`);
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo actualizar la tienda.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen label="Cargando detalle de tienda..." />;
  }

  if (!store) {
    return (
      <div className="space-y-6">
        <div className="admin-panel">
          <p className="font-display text-2xl font-semibold text-brand-forest">Tienda no disponible</p>
          <p className="mt-3 text-sm leading-6 text-brand-moss">
            La tienda no pudo cargarse o ya no está activa para este usuario.
          </p>
          <Link className="button-secondary mt-5" to="/admin/tiendas">
            <ArrowLeft size={16} />
            Volver a tiendas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="admin-panel overflow-hidden bg-[linear-gradient(135deg,_rgba(36,71,52,1)_0%,_rgba(63,107,83,0.95)_100%)] text-brand-sand">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-mist transition hover:text-brand-sand"
              to="/admin/tiendas"
            >
              <ArrowLeft size={16} />
              Volver a tiendas
            </Link>
            <p className="badge bg-white/10 text-brand-sand">Detalle de tienda</p>
            <h1 className="mt-4 font-display text-4xl font-semibold">{store.Nombre}</h1>
            <p className="mt-3 text-sm leading-6 text-brand-mist">
              {store.Descripcion || 'Esta tienda todavía no tiene descripción pública registrada.'}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-gold">URL pública</p>
            <p className="mt-3 break-all text-lg font-semibold">
              {buildPublicStoreUrl(store.Slug)}
            </p>
            <p className="mt-4 text-sm text-brand-mist">
              Creada el {formatDate(store.FechaCreacion)}
            </p>
            <button className="button-primary mt-5 w-full" onClick={handleCopyUrl} type="button">
              <Copy size={16} />
              Copiar URL pública
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr,340px]">
        <section className="admin-panel">
          <div className="flex items-center gap-3">
            <Link2 className="text-brand-coral" size={18} />
            <div>
              <p className="font-display text-2xl font-semibold text-brand-forest">Editar tienda</p>
              <p className="mt-1 text-sm text-brand-moss">
                Actualiza contenido, slug, imágenes y estado de la tienda.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <StoreForm
              initialValues={store}
              mode="edit"
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="admin-panel">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-brand-coral" size={18} />
              <p className="font-semibold text-brand-forest">Resumen</p>
            </div>
            <div className="mt-5 space-y-4 text-sm text-brand-moss">
              <p><span className="font-semibold text-brand-forest">Slug:</span> {store.Slug}</p>
              <p><span className="font-semibold text-brand-forest">Estado:</span> {store.Estado ? 'Activa' : 'Inactiva'}</p>
              <p><span className="font-semibold text-brand-forest">Token:</span> {store.TokenPublico}</p>
              <p><span className="font-semibold text-brand-forest">WhatsApp:</span> {store.WhatsApp || 'No definido'}</p>
              <p><span className="font-semibold text-brand-forest">Última edición:</span> {formatDate(store.FechaModificacion)}</p>
            </div>
          </section>

          <section className="admin-panel">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Color principal</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className="h-10 w-10 rounded-full border border-brand-mist"
                style={{ backgroundColor: store.ColorPrincipal || '#d9e4d7' }}
              />
              <span className="font-semibold text-brand-forest">{store.ColorPrincipal || 'No definido'}</span>
            </div>
          </section>

          {store.Logo ? (
            <section className="admin-panel">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Logo actual</p>
              <img
                alt={`Logo de ${store.Nombre}`}
                className="mt-4 h-40 w-full rounded-[28px] object-cover"
                src={store.Logo}
              />
            </section>
          ) : null}

          {store.Portada ? (
            <section className="admin-panel">
              <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Portada actual</p>
              <img
                alt={`Portada de ${store.Nombre}`}
                className="mt-4 h-40 w-full rounded-[28px] object-cover"
                src={store.Portada}
              />
            </section>
          ) : null}

          <section className="admin-panel border border-brand-coral/20 bg-brand-coral/5">
            <div className="flex items-center gap-3 text-brand-coral">
              <Power size={18} />
              <p className="font-semibold">Desactivación lógica</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-brand-moss">
              Si desmarcas el campo Estado en el formulario y guardas, se ejecutará `DELETE /api/tiendas/:id`
              sin borrar físicamente el registro.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default TiendaDetallePage;
