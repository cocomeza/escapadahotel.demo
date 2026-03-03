import { useHotels } from '../../hooks/useHotels';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Reservation } from '../../lib/supabase';
import {
  Building2,
  CalendarCheck,
  Image,
  BedDouble,
  LogIn,
  LogOut,
  Users,
  Sparkles,
  ClipboardList,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const today = new Date().toISOString().slice(0, 10);

export default function AdminOverview() {
  const { hotels, loading } = useHotels();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsCount, setReservationsCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('reservations')
      .select('*')
      .in('status', ['pending', 'confirmed'])
      .then(({ data }) => setReservations(data ?? []));
    supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setReservationsCount(count ?? 0));
  }, []);

  const arrivals = reservations.filter((r) => r.check_in === today && !r.checked_out_at);
  const departures = reservations.filter((r) => r.check_out === today && r.checked_in_at && !r.checked_out_at);
  const inHouse = reservations.filter(
    (r) => r.check_in <= today && r.check_out >= today && r.checked_in_at && !r.checked_out_at
  );
  const totalRooms = hotels.reduce((acc, h) => acc + (h.rooms?.length ?? 0), 0);
  const totalImages = hotels.reduce((acc, h) => acc + (h.images?.length ?? 0), 0);

  const getRoomName = (roomId: string | null) => {
    if (!roomId) return '—';
    for (const h of hotels) {
      const room = h.rooms?.find((r) => r.id === roomId);
      if (room) return `${h.name} – ${room.name}`;
    }
    return '—';
  };

  const cards = [
    { label: 'Alojamientos', value: loading ? '—' : hotels.length, icon: Building2, to: '/admin/hoteles' },
    { label: 'Habitaciones', value: loading ? '—' : totalRooms, icon: BedDouble, to: '/admin/habitaciones' },
    { label: 'Imágenes', value: loading ? '—' : totalImages, icon: Image, to: '/admin/imagenes' },
    { label: 'Reservas', value: reservationsCount ?? '—', icon: CalendarCheck, to: '/admin/reservas' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Recepción</h1>
      <p className="text-gray-500 text-sm mb-6">Resumen del día · {today}</p>

      {/* Recepción: llegadas, salidas, en casa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/admin/reservas?filter=arrivals"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-cyan-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{arrivals.length}</p>
                <p className="text-sm text-gray-500">Llegadas hoy</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
        <Link
          to="/admin/reservas?filter=departures"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-cyan-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{departures.length}</p>
                <p className="text-sm text-gray-500">Salidas hoy</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
        <Link
          to="/admin/reservas?filter=inhouse"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-cyan-200 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{inHouse.length}</p>
                <p className="text-sm text-gray-500">En casa</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Listas rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Llegadas hoy</h2>
            <Link to="/admin/reservas" className="text-cyan-600 text-sm hover:underline">Ver todas</Link>
          </div>
          <ul className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {arrivals.length === 0 ? (
              <li className="px-4 py-4 text-gray-500 text-sm">No hay llegadas programadas hoy.</li>
            ) : (
              arrivals.slice(0, 5).map((r) => (
                <li key={r.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">{r.guest_name}</p>
                    <p className="text-xs text-gray-500">{getRoomName(r.room_id)}</p>
                  </div>
                  <Link
                    to={`/admin/reservas?checkin=${r.id}`}
                    className="text-green-600 text-sm font-medium hover:underline"
                  >
                    Check-in
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Salidas hoy</h2>
            <Link to="/admin/reservas" className="text-cyan-600 text-sm hover:underline">Ver todas</Link>
          </div>
          <ul className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {departures.length === 0 ? (
              <li className="px-4 py-4 text-gray-500 text-sm">No hay salidas programadas hoy.</li>
            ) : (
              departures.slice(0, 5).map((r) => (
                <li key={r.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-800">{r.guest_name}</p>
                    <p className="text-xs text-gray-500">{getRoomName(r.room_id)}</p>
                  </div>
                  <Link
                    to={`/admin/reservas?checkout=${r.id}`}
                    className="text-amber-600 text-sm font-medium hover:underline"
                  >
                    Check-out
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Accesos rápidos */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Accesos rápidos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-cyan-200 hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Icon className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
        <Link
          to="/admin/estado-habitaciones"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-cyan-200 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Estado habitaciones</p>
            <p className="text-xs text-gray-500">Limpieza y ocupación</p>
          </div>
        </Link>
        <Link
          to="/admin/limpieza"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-cyan-200 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Personal limpieza</p>
            <p className="text-xs text-gray-500">Asignación del día</p>
          </div>
        </Link>
        <Link
          to="/admin/reportes"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-cyan-200 hover:shadow-md transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Reportes</p>
            <p className="text-xs text-gray-500">Ocupación e ingresos</p>
          </div>
        </Link>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Alojamientos</h2>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : hotels.length === 0 ? (
          <p className="text-gray-500">No hay alojamientos. Creá uno en Hoteles / Cabañas.</p>
        ) : (
          <ul className="space-y-2">
            {hotels.slice(0, 5).map((h) => (
              <li key={h.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="font-medium text-gray-800">{h.name}</span>
                <Link to="/admin/hoteles" className="text-cyan-500 text-sm hover:underline">Editar</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
