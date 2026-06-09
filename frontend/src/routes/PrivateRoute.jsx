import { Navigate, Outlet, useLocation } from 'react-router-dom';

import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';

function PrivateRoute() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingScreen label="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export default PrivateRoute;
