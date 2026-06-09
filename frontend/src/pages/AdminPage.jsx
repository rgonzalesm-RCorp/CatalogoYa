import {
  ArrowUpRight,
  Boxes,
  FolderKanban,
  LayoutDashboard,
  Link2,
  PackagePlus,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getCategoriasByTienda } from '../api/categorias.api';
import { getProductosByTienda } from '../api/productos.api';
import { getTiendas } from '../api/tiendas.api';
import StatCard from '../components/StatCard';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage, showErrorToast, showInfoToast } from '../utils/notifications';
import { buildPublicStoreUrl } from '../utils/tiendas';

const initialMetrics = {
  storeCount: 0,
  productCount: 0,
  categoryCount: 0,
  activeProductCount: 0,
  activeStoreCount: 0,
  featuredStore: null,
  averageProductsPerStore: 0,
  averageCategoriesPerStore: 0,
};

function AdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      try {
        const storesResponse = await getTiendas();
        const stores = storesResponse.data || [];

        if (!stores.length) {
          startTransition(() => {
            setMetrics(initialMetrics);
          });
          return;
        }

        const storeSummaries = await Promise.all(
          stores.map(async (store) => {
            const [categoriesResult, productsResult] = await Promise.allSettled([
              getCategoriasByTienda(store.TiendaID),
              getProductosByTienda(store.TiendaID),
            ]);

            return {
              store,
              categories: categoriesResult.status === 'fulfilled'
                ? (categoriesResult.value.data || [])
                : [],
              products: productsResult.status === 'fulfilled'
                ? (productsResult.value.data || [])
                : [],
              hasPartialError: categoriesResult.status === 'rejected' || productsResult.status === 'rejected',
            };
          }),
        );

        if (storeSummaries.some((summary) => summary.hasPartialError)) {
          showInfoToast('Algunas métricas se calcularon con datos parciales.');
        }

        const nextMetrics = {
          storeCount: stores.length,
          activeStoreCount: stores.filter((store) => store.Estado !== false).length,
          categoryCount: storeSummaries.reduce(
            (total, summary) => total + summary.categories.length,
            0,
          ),
          productCount: storeSummaries.reduce(
            (total, summary) => total + summary.products.length,
            0,
          ),
          activeProductCount: storeSummaries.reduce(
            (total, summary) => total + summary.products.filter((product) => product.Estado !== false).length,
            0,
          ),
          featuredStore: storeSummaries
            .slice()
            .sort((left, right) => right.products.length - left.products.length)[0] || null,
          averageProductsPerStore: Math.round(
            storeSummaries.reduce((total, summary) => total + summary.products.length, 0) / stores.length,
          ),
          averageCategoriesPerStore: Math.round(
            storeSummaries.reduce((total, summary) => total + summary.categories.length, 0) / stores.length,
          ),
        };

        startTransition(() => {
          setMetrics(nextMetrics);
        });
      } catch (error) {
        showErrorToast(getErrorMessage(error, 'No se pudieron cargar las métricas del dashboard.'));
        startTransition(() => {
          setMetrics(initialMetrics);
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingScreen label="Cargando dashboard..." />;
  }

  const featuredStoreStats = metrics.featuredStore
    ? {
      productCount: metrics.featuredStore.products.length,
      categoryCount: metrics.featuredStore.categories.length,
      publicUrl: `/${metrics.featuredStore.store.Slug}`,
    }
    : null;

  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden bg-[linear-gradient(135deg,_rgba(36,71,52,0.96)_0%,_rgba(63,107,83,0.92)_100%)] text-brand-sand">
        <div className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr]">
          <div>
            <p className="badge bg-white/10 text-brand-sand">Dashboard SaaS</p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
              {user?.Nombre ? `${user.Nombre}, este es el pulso de tu operación.` : 'Este es el pulso de tu operación.'}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-brand-mist">
              Revisa tiendas, categorías y productos activos desde un resumen pensado para operar como SaaS:
              métricas rápidas, contexto de catálogo y accesos directos a lo que más importa en el día a día.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
              <LayoutDashboard size={22} />
              <p className="mt-4 font-semibold">Estado actual</p>
              <p className="mt-2 text-sm text-brand-mist">
                {metrics.activeStoreCount} tiendas activas y {metrics.activeProductCount} productos activos visibles.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
              <Sparkles size={22} />
              <p className="mt-4 font-semibold">Promedio operativo</p>
              <p className="mt-2 text-sm text-brand-mist">
                {metrics.averageProductsPerStore} productos y {metrics.averageCategoriesPerStore} categorías por tienda.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          hint="Total de tiendas visibles desde tu sesión administrativa."
          icon={Store}
          label="Cantidad de tiendas"
          tone="forest"
          value={String(metrics.storeCount)}
        />
        <StatCard
          hint="Suma de productos publicados en las tiendas cargadas."
          icon={ShoppingBag}
          label="Cantidad de productos"
          tone="coral"
          value={String(metrics.productCount)}
        />
        <StatCard
          hint="Categorías activas agregadas entre todas tus tiendas."
          icon={FolderKanban}
          label="Cantidad de categorías"
          tone="gold"
          value={String(metrics.categoryCount)}
        />
        <StatCard
          hint="Productos activos según las APIs privadas disponibles hoy."
          icon={Boxes}
          label="Productos activos"
          tone="default"
          value={String(metrics.activeProductCount)}
        />
        <StatCard
          hint="Tiendas activas que hoy alimentan el catálogo público."
          icon={Link2}
          label="Tiendas activas"
          tone="default"
          value={String(metrics.activeStoreCount)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,360px]">
        <div className="admin-panel">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-coral/10 text-brand-coral">
              <ArrowUpRight size={20} />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold text-brand-forest">Accesos rápidos</p>
              <p className="text-sm text-brand-moss">Atajos listos para operar sin rodeos.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link className="rounded-[28px] border border-brand-mist/70 bg-brand-cream/50 p-5 transition hover:border-brand-coral hover:bg-white" to="/admin/tiendas#crear-tienda">
              <Store className="text-brand-coral" size={22} />
              <p className="mt-4 font-semibold text-brand-forest">Crear tienda</p>
              <p className="mt-2 text-sm leading-6 text-brand-moss">
                Abre el módulo de tiendas con el formulario listo para registrar una nueva URL pública.
              </p>
            </Link>

            <Link className="rounded-[28px] border border-brand-mist/70 bg-brand-cream/50 p-5 transition hover:border-brand-coral hover:bg-white" to="/admin/productos?create=1">
              <PackagePlus className="text-brand-coral" size={22} />
              <p className="mt-4 font-semibold text-brand-forest">Crear producto</p>
              <p className="mt-2 text-sm leading-6 text-brand-moss">
                Entra directo al módulo de productos y dispara el flujo de creación.
              </p>
            </Link>

            {featuredStoreStats ? (
              <Link
                className="rounded-[28px] border border-brand-mist/70 bg-brand-cream/50 p-5 transition hover:border-brand-coral hover:bg-white"
                target="_blank"
                rel="noreferrer"
                to={featuredStoreStats.publicUrl}
              >
                <Link2 className="text-brand-coral" size={22} />
                <p className="mt-4 font-semibold text-brand-forest">Ver catálogo público</p>
                <p className="mt-2 text-sm leading-6 text-brand-moss">
                  Abre la tienda destacada en una nueva pestaña y revisa su experiencia pública.
                </p>
              </Link>
            ) : (
              <div className="rounded-[28px] border border-brand-mist/70 bg-brand-cream/50 p-5">
                <Link2 className="text-brand-coral" size={22} />
                <p className="mt-4 font-semibold text-brand-forest">Ver catálogo público</p>
                <p className="mt-2 text-sm leading-6 text-brand-moss">
                  Crea una tienda activa para habilitar esta vista rápida del catálogo público.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="admin-panel">
            <p className="font-display text-2xl font-semibold text-brand-forest">Tienda destacada</p>
            {metrics.featuredStore ? (
              <>
                <p className="mt-4 text-sm leading-6 text-brand-moss">
                  La tienda con mayor volumen de productos visibles desde tu sesión actual.
                </p>
                <div className="mt-5 rounded-[28px] bg-brand-cream/70 p-5">
                  <div className="flex items-center gap-4">
                    {metrics.featuredStore.store.Logo ? (
                      <img
                        alt={`Logo de ${metrics.featuredStore.store.Nombre}`}
                        className="h-16 w-16 rounded-3xl object-cover"
                        src={metrics.featuredStore.store.Logo}
                      />
                    ) : (
                      <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-forest text-brand-sand">
                        <Store size={22} />
                      </span>
                    )}
                    <div>
                      <p className="font-display text-2xl font-semibold text-brand-forest">
                        {metrics.featuredStore.store.Nombre}
                      </p>
                      <p className="mt-1 text-sm text-brand-moss">
                        {buildPublicStoreUrl(metrics.featuredStore.store.Slug)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Productos</p>
                      <p className="mt-2 font-display text-3xl font-semibold text-brand-forest">
                        {featuredStoreStats.productCount}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-moss">Categorías</p>
                      <p className="mt-2 font-display text-3xl font-semibold text-brand-forest">
                        {featuredStoreStats.categoryCount}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-brand-moss">
                Todavía no hay tiendas activas para destacar en el dashboard.
              </p>
            )}
          </section>

          <section className="admin-panel">
            <p className="font-display text-2xl font-semibold text-brand-forest">Lectura rápida</p>
            <p className="mt-4 text-sm leading-6 text-brand-moss">
              Este dashboard se calcula en tiempo real a partir de tus tiendas visibles y sus módulos privados
              de categorías y productos, manteniendo una vista coherente con el catálogo SaaS actual.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}

export default AdminPage;
