import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LayoutAdmin from '../layouts/LayoutAdmin';
import LayoutPublico from '../layouts/LayoutPublico';
import AdminPage from '../pages/AdminPage';
import CatalogoPublicoPage from '../pages/CatalogoPublicoPage';
import CategoriasPage from '../pages/CategoriasPage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProductoDetallePublicoPage from '../pages/ProductoDetallePublicoPage';
import ProductosPage from '../pages/ProductosPage';
import TiendaDetallePage from '../pages/TiendaDetallePage';
import TiendasPage from '../pages/TiendasPage';
import PrivateRoute from './PrivateRoute';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<LayoutAdmin />}>
            <Route index element={<AdminPage />} />
            <Route path="tiendas" element={<TiendasPage />} />
            <Route path="tiendas/:id" element={<TiendaDetallePage />} />
            <Route path="categorias" element={<CategoriasPage />} />
            <Route path="productos" element={<ProductosPage />} />
          </Route>
        </Route>

        <Route path="/:slug" element={<LayoutPublico />}>
          <Route index element={<CatalogoPublicoPage />} />
          <Route path="producto/:productoId" element={<ProductoDetallePublicoPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
