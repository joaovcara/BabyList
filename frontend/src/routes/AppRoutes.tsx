import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getBasename } from '../config/app';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute, SetupRoute } from './GuestRoute';
import { SetupPage } from '../pages/setup/SetupPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { PublicPage } from '../pages/public/PublicPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { ProdutosPage } from '../pages/admin/ProdutosPage';
import { CategoriasPage } from '../pages/admin/CategoriasPage';
import { ReservasPage } from '../pages/admin/ReservasPage';
import { ConfiguracoesPage } from '../pages/admin/ConfiguracoesPage';

export function AppRoutes() {
  return (
    <BrowserRouter basename={getBasename()}>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route
          path="/setup"
          element={
            <SetupRoute>
              <SetupPage />
            </SetupRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="produtos" element={<ProdutosPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="reservas" element={<ReservasPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
