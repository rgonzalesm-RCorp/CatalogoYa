import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-6">
      <div className="panel max-w-xl text-center">
        <p className="badge mx-auto">404</p>
        <h1 className="mt-5 font-display text-4xl font-semibold text-brand-forest">
          La ruta que buscas no existe
        </h1>
        <p className="mt-4 text-sm leading-6 text-brand-moss">
          Revisa la URL o vuelve al punto de entrada principal del frontend.
        </p>
        <div className="mt-8 flex justify-center">
          <Link className="button-primary" to="/login">
            Ir a login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
