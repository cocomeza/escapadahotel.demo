import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Reservation } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { Pencil, Trash2, X, LogIn, LogOut, Receipt } from 'lucide-react';
import { formatearPrecio } from '../../lib/constants';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const today = new Date().toISOString().slice(0, 10);
type ReservationRow = Reservation & { hotel_name?: string; room_name?: string };

export default function AdminReservas() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const checkinId = searchParams.get('checkin');
  const checkoutId = searchParams.get('checkout');
  const { hotels } = useHotels();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkinOutModal, setCheckinOutModal] = useState<'checkin' | 'checkout' | null>(null);
  const [checkinOutReservation, setCheckinOutReservation] = useState<ReservationRow | null>(null);
  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    guests: 1,
    total_price: 0,
    status: 'pending' as Reservation['status'],
    notes: '',
  });

  const getRoomName = (r: ReservationRow) => {
    if (!r.room_id) return '—';
    const hotel = hotels.find((h) => h.id === r.hotel_id);
    const room = hotel?.rooms?.find((room) => room.id === r.room_id);
    return room ? room.name : '—';
  };

  const loadReservations = async () => {
    const { data, error: err } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else {
      const withNames = (data ?? []).map((r) => {
        const hotel = hotels.find((h) => h.id === r.hotel_id);
        const room = hotel?.rooms?.find((room) => room.id === r.room_id);
        return {
          ...r,
          hotel_name: hotel?.name,
          room_name: room?.name ?? '—',
        };
      });
      setReservations(withNames);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    if (hotels.length > 0 && reservations.length > 0) {
      setReservations((prev) =>
        prev.map((r) => {
          const hotel = hotels.find((h) => h.id === r.hotel_id);
          const room = hotel?.rooms?.find((room) => room.id === r.room_id);
          return { ...r, hotel_name: hotel?.name, room_name: room?.name ?? '—' };
        })
      );
    }
  }, [hotels]);

  useEffect(() => {
    if (checkinId && reservations.length > 0) {
      const r = reservations.find((x) => x.id === checkinId);
      if (r && !r.checked_in_at && r.status !== 'cancelled') {
        setCheckinOutReservation(r);
        setCheckinOutModal('checkin');
      }
    }
  }, [checkinId, reservations]);

  useEffect(() => {
    if (checkoutId && reservations.length > 0) {
      const r = reservations.find((x) => x.id === checkoutId);
      if (r && r.checked_in_at && !r.checked_out_at) {
        setCheckinOutReservation(r);
        setCheckinOutModal('checkout');
      }
    }
  }, [checkoutId, reservations]);

  let list = reservations;
  if (filter === 'arrivals') list = reservations.filter((r) => r.check_in === today && !r.checked_out_at && r.status !== 'cancelled');
  if (filter === 'departures') list = reservations.filter((r) => r.check_out === today && r.checked_in_at && !r.checked_out_at);
  if (filter === 'inhouse') list = reservations.filter((r) => r.check_in <= today && r.check_out >= today && r.checked_in_at && !r.checked_out_at);

  const openEdit = (r: Reservation) => {
    setEditing(r);
    setForm({
      guest_name: r.guest_name,
      guest_email: r.guest_email,
      guest_phone: r.guest_phone,
      check_in: r.check_in,
      check_out: r.check_out,
      guests: r.guests,
      total_price: r.total_price,
      status: r.status,
      notes: r.notes ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('reservations')
        .update({
          guest_name: form.guest_name,
          guest_email: form.guest_email,
          guest_phone: form.guest_phone,
          check_in: form.check_in,
          check_out: form.check_out,
          guests: form.guests,
          total_price: form.total_price,
          status: form.status,
          notes: form.notes || null,
        })
        .eq('id', editing.id);
      if (err) throw err;
      setModalOpen(false);
      loadReservations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reserva?')) return;
    const { error: err } = await supabase.from('reservations').delete().eq('id', id);
    if (err) setError(err.message);
    else loadReservations();
  };

  const handleCheckIn = async (id: string) => {
    setSaving(true);
    const { error: err } = await supabase.from('reservations').update({ checked_in_at: new Date().toISOString() }).eq('id', id);
    setSaving(false);
    if (err) setError(err.message);
    else { setCheckinOutModal(null); setCheckinOutReservation(null); loadReservations(); }
  };

  const handleCheckOut = async (id: string) => {
    setSaving(true);
    const { error: err } = await supabase
      .from('reservations')
      .update({ checked_out_at: new Date().toISOString(), status: 'completed' })
      .eq('id', id);
    setSaving(false);
    if (err) setError(err.message);
    else { setCheckinOutModal(null); setCheckinOutReservation(null); loadReservations(); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reservas</h1>
        <div className="flex gap-2">
          <Link to="/admin/reservas" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!filter ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todas</Link>
          <Link to="/admin/reservas?filter=arrivals" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'arrivals' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Llegadas hoy</Link>
          <Link to="/admin/reservas?filter=departures" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'departures' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Salidas hoy</Link>
          <Link to="/admin/reservas?filter=inhouse" className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'inhouse' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>En casa</Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Huésped</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Alojamiento</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Habitación</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-out</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th className="w-40 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">{r.guest_name}</p>
                    <p className="text-xs text-gray-500">{r.guest_email}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{r.hotel_name ?? r.hotel_id}</td>
                  <td className="py-3 px-4 text-gray-600">{r.room_name ?? '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{r.check_in}</td>
                  <td className="py-3 px-4 text-gray-600">{r.check_out}</td>
                  <td className="py-3 px-4 text-gray-600">{formatearPrecio(r.total_price)}</td>
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
                    {r.checked_in_at && !r.checked_out_at && <span className="ml-1 text-xs text-green-600">En casa</span>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {!r.checked_in_at && r.status !== 'cancelled' && r.check_in <= today && (
                        <Link to={`/admin/reservas?checkin=${r.id}`} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Check-in"><LogIn className="w-4 h-4" /></Link>
                      )}
                      {r.checked_in_at && !r.checked_out_at && (
                        <Link to={`/admin/reservas?checkout=${r.id}`} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Check-out"><LogOut className="w-4 h-4" /></Link>
                      )}
                      <Link to={`/admin/folio/${r.id}`} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Folio"><Receipt className="w-4 h-4" /></Link>
                      <button onClick={() => openEdit(r)} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg" title="Editar"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay reservas aún.</p>
          )}
        </div>
      )}

      {/* Modal Check-in / Check-out */}
      {checkinOutModal && checkinOutReservation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {checkinOutModal === 'checkin' ? 'Confirmar check-in' : 'Confirmar check-out'}
            </h2>
            <p className="text-gray-600 mb-4">
              {checkinOutReservation.guest_name} · {checkinOutReservation.room_name ?? 'Sin habitación'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => checkinOutModal === 'checkin' ? handleCheckIn(checkinOutReservation.id) : handleCheckOut(checkinOutReservation.id)}
                className="flex-1 bg-cyan-500 text-white py-2 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50"
              >
                {saving ? 'Procesando...' : checkinOutModal === 'checkin' ? 'Hacer check-in' : 'Hacer check-out'}
              </button>
              <button
                type="button"
                onClick={() => { setCheckinOutModal(null); setCheckinOutReservation(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Editar reserva</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    required
                    value={form.guest_name}
                    onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.guest_email}
                    onChange={(e) => setForm((f) => ({ ...f, guest_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  value={form.guest_phone}
                  onChange={(e) => setForm((f) => ({ ...f, guest_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
                  <input
                    type="date"
                    required
                    value={form.check_in}
                    onChange={(e) => setForm((f) => ({ ...f, check_in: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
                  <input
                    type="date"
                    required
                    value={form.check_out}
                    onChange={(e) => setForm((f) => ({ ...f, check_out: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Huéspedes</label>
                  <input
                    type="number"
                    min={1}
                    value={form.guests}
                    onChange={(e) => setForm((f) => ({ ...f, guests: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input
                    type="number"
                    min={0}
                    value={form.total_price || ''}
                    onChange={(e) => setForm((f) => ({ ...f, total_price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Reservation['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  {(['pending', 'confirmed', 'cancelled', 'completed'] as const).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-cyan-500 text-white py-2 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
