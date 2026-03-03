import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { Reservation } from '../../lib/supabase';
import { formatearPrecio } from '../../lib/constants';
import { User, Search, FileText } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

export default function AdminHuespedes() {
  const navigate = useNavigate();
  const { hotels } = useHotels();
  const [reservations, setReservations] = useState<(Reservation & { hotel_name?: string; room_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('check_in', { ascending: false });
    if (error) {
      setReservations([]);
    } else {
      const withNames = (data ?? []).map((r) => ({
        ...r,
        hotel_name: hotels.find((h) => h.id === r.hotel_id)?.name,
        room_name: hotels.flatMap((h) => h.rooms ?? []).find((room) => room.id === r.room_id)?.name,
      }));
      setReservations(withNames);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (hotels.length > 0 && reservations.length > 0) {
      setReservations((prev) =>
        prev.map((r) => ({
          ...r,
          hotel_name: hotels.find((h) => h.id === r.hotel_id)?.name,
          room_name: hotels.flatMap((h) => h.rooms ?? []).find((room) => room.id === r.room_id)?.name,
        }))
      );
    }
  }, [hotels]);

  const filtered = reservations.filter(
    (r) =>
      !search ||
      r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      r.guest_email.toLowerCase().includes(search.toLowerCase()) ||
      (r.guest_phone && r.guest_phone.includes(search))
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de huéspedes</h1>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Huésped</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contacto</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Habitación</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in / Check-out</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="w-24 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">{r.guest_name}</p>
                    <p className="text-xs text-gray-500">{r.guests} huésped{r.guests !== 1 ? 'es' : ''}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <p>{r.guest_email}</p>
                    <p>{r.guest_phone}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <p>{r.room_name || '—'}</p>
                    <p className="text-xs text-gray-500">{r.hotel_name}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <p>{r.check_in}</p>
                    <p>{r.check_out}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        r.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : r.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : r.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/huespedes/${r.id}`)}
                      className="flex items-center gap-1.5 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      Ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay huéspedes registrados.</p>
          )}
        </div>
      )}
    </div>
  );
}
