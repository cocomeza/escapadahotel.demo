import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Image,
  Sparkles,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  Users,
  ClipboardList,
  Calendar,
  BarChart3,
  Brush,
} from 'lucide-react';
import { useState } from 'react';
import AdminOverview from './AdminOverview';
import AdminHoteles from './AdminHoteles';
import AdminHabitaciones from './AdminHabitaciones';
import AdminImagenes from './AdminImagenes';
import AdminAmenidades from './AdminAmenidades';
import AdminReservas from './AdminReservas';
import AdminHuespedes from './AdminHuespedes';
import AdminFichaHuesped from './AdminFichaHuesped';
import AdminEstadoHabitaciones from './AdminEstadoHabitaciones';
import AdminCalendario from './AdminCalendario';
import AdminFolio from './AdminFolio';
import AdminLimpieza from './AdminLimpieza';
import AdminReportes from './AdminReportes';

const nav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/admin/reservas', icon: CalendarCheck, label: 'Reservas' },
  { to: '/admin/huespedes', icon: Users, label: 'Huéspedes' },
  { to: '/admin/estado-habitaciones', icon: ClipboardList, label: 'Estado habitaciones' },
  { to: '/admin/limpieza', icon: Brush, label: 'Personal limpieza' },
  { to: '/admin/calendario', icon: Calendar, label: 'Calendario' },
  { to: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/admin/hoteles', icon: Building2, label: 'Hoteles / Cabañas' },
  { to: '/admin/habitaciones', icon: BedDouble, label: 'Habitaciones' },
  { to: '/admin/imagenes', icon: Image, label: 'Imágenes' },
  { to: '/admin/amenidades', icon: Sparkles, label: 'Amenidades' },
];

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <span className="font-bold text-gray-800">Hotel Escapada · Admin</span>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {nav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-64">
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur border-b border-gray-200 flex items-center px-4">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-gray-500 text-sm ml-2 md:ml-0">Panel de administración</span>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/dashboard" element={<AdminOverview />} />
            <Route path="/hoteles/*" element={<AdminHoteles />} />
            <Route path="/habitaciones/*" element={<AdminHabitaciones />} />
            <Route path="/imagenes/*" element={<AdminImagenes />} />
            <Route path="/amenidades/*" element={<AdminAmenidades />} />
            <Route path="/reservas/*" element={<AdminReservas />} />
            <Route path="/huespedes/:id" element={<AdminFichaHuesped />} />
            <Route path="/huespedes" element={<AdminHuespedes />} />
            <Route path="/estado-habitaciones/*" element={<AdminEstadoHabitaciones />} />
            <Route path="/calendario" element={<AdminCalendario />} />
            <Route path="/folio/:id" element={<AdminFolio />} />
            <Route path="/limpieza" element={<AdminLimpieza />} />
            <Route path="/reportes" element={<AdminReportes />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
