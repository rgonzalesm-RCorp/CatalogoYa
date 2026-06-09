import { CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginWithGoogle } from '../api/auth.api';
import BrandMark from '../components/BrandMark';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { useGoogleIdentity } from '../hooks/useGoogleIdentity';
import { getErrorMessage, showErrorToast, showSuccessToast } from '../utils/notifications';

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, navigate]);

  const handleGoogleCredential = async (idToken) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await loginWithGoogle({ idToken });
      login(response.data);
      showSuccessToast(`Bienvenido, ${response.data.user.Nombre}`);
      navigate('/admin', { replace: true });
    } catch (error) {
      showErrorToast(getErrorMessage(error, 'No se pudo iniciar sesión con Google.'));
    } finally {
      setSubmitting(false);
    }
  };

  const { buttonRef, error: googleError, isReady } = useGoogleIdentity({
    onCredential: handleGoogleCredential,
  });

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(216,177,106,0.2),_transparent_30%),linear-gradient(180deg,_#18261f_0%,_#244734_100%)] px-4">
        <LoadingScreen label="Preparando acceso seguro..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(216,177,106,0.2),_transparent_30%),linear-gradient(180deg,_#18261f_0%,_#244734_100%)] px-4 py-6 text-brand-sand lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col gap-6 lg:grid lg:grid-cols-[1.1fr,0.9fr]">
        <section className="hero-surface flex flex-col justify-between p-6 md:p-8">
          <div>
            <BrandMark to="/login" tone="light" />
            <p className="mt-10 badge bg-white/10 text-brand-sand">Frontend Administrativo</p>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-tight md:text-6xl">
              Gestiona catálogos online desde un panel limpio y enfocado.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-brand-mist md:text-lg">
              Ingresa con tu cuenta de Gmail para administrar tiendas, categorías
              y productos desde un mismo panel, sin contraseñas locales y con
              validación directa contra Google.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <LockKeyhole className="text-brand-gold" size={22} />
              <p className="mt-4 font-semibold">Acceso seguro</p>
              <p className="mt-2 text-sm text-brand-mist">
                El backend valida Google y responde con un JWT para todas las rutas privadas.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <Sparkles className="text-brand-coral" size={22} />
              <p className="mt-4 font-semibold">Sin friccion</p>
              <p className="mt-2 text-sm text-brand-mist">
                El flujo evita formularios extra y te lleva directo al panel administrativo.
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <CheckCircle2 className="text-brand-sand" size={22} />
              <p className="mt-4 font-semibold">Sesion persistente</p>
              <p className="mt-2 text-sm text-brand-mist">
                El JWT se conserva en localStorage y Axios lo adjunta automaticamente.
              </p>
            </div>
          </div>
        </section>

        <section className="panel flex items-center">
          <div className="w-full">
            <p className="badge">Acceso con Gmail</p>
            <h2 className="mt-5 font-display text-3xl font-semibold text-brand-forest">
              Continuar con Google
            </h2>
            <p className="mt-3 text-sm leading-6 text-brand-moss">
              Usa el boton oficial para obtener tu credencial de Google, enviarla a
              <span className="font-semibold text-brand-forest"> POST /api/auth/google</span>
              {' '}y entrar al admin con tu JWT.
            </p>

            <div className="mt-8 rounded-[28px] border border-brand-mist/70 bg-brand-cream/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-brand-forest">Continuar con Google</p>
                  <p className="mt-1 text-sm leading-6 text-brand-moss">
                    Selecciona tu cuenta de Gmail para iniciar sesion en CatalogosYa.
                  </p>
                </div>
                <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-forest">
                  SaaS Admin
                </span>
              </div>

              <div className="mt-5">
                {!isReady && !googleError ? (
                  <div className="field flex min-h-[52px] items-center justify-center text-brand-moss">
                    Preparando boton de Google...
                  </div>
                ) : null}

                <div
                  className={[
                    'min-h-[52px]',
                    submitting ? 'pointer-events-none opacity-60' : '',
                    !isReady && !googleError ? 'hidden' : '',
                  ].join(' ')}
                  ref={buttonRef}
                />

                {submitting ? (
                  <p className="mt-3 text-sm font-medium text-brand-moss">
                    Validando tu cuenta y generando el acceso al panel...
                  </p>
                ) : null}

                {googleError ? (
                  <p className="mt-3 text-sm font-medium text-brand-coral">{googleError}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-brand-mist/70 bg-white/70 p-4">
              <p className="text-sm font-semibold text-brand-forest">Lo que hace este acceso</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-brand-moss">
                <li>Valida tu identidad con Google.</li>
                <li>Consume el endpoint privado del backend para obtener el JWT.</li>
                <li>Guarda la sesion en localStorage y te redirige a `/admin`.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
