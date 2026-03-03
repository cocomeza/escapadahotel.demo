import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import HotelesPage from './pages/HotelesPage';
import HotelDetailPage from './pages/HotelDetailPage';
import GaleriaPage from './pages/GaleriaPage';
import ContactoPage from './pages/ContactoPage';
import ReservarPage from './pages/ReservarPage';
import GuestAuthPage from './pages/GuestAuthPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="hoteles" element={<HotelesPage />} />
          <Route path="hoteles/:id" element={<HotelDetailPage />} />
          <Route path="galeria" element={<GaleriaPage />} />
          <Route path="contacto" element={<ContactoPage />} />
          <Route path="reservar" element={<ReservarPage />} />
          <Route path="reservar/:hotelId" element={<ReservarPage />} />
          <Route path="iniciar-sesion" element={<GuestAuthPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedAdmin>
              <AdminDashboard />
            </ProtectedAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
