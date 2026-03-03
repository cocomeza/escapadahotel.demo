import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Room, Hotel } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { formatearPrecio } from '../../lib/constants';

export default function AdminHabitaciones() {
  const { hotels, loading: hotelsLoading } = useHotels();
  const [rooms, setRooms] = useState<(Room & { hotel?: Hotel })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    hotel_id: '',
    name: '',
    description: '',
    price_per_night: 0,
    capacity: 1,
    size_sqm: 0,
  });

  const loadRooms = async () => {
    const { data, error: err } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    if (err) setError(err.message);
    else {
      const withHotels = (data ?? []).map((r) => ({
        ...r,
        hotel: hotels.find((h) => h.id === r.hotel_id),
      }));
      setRooms(withHotels);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!hotelsLoading) loadRooms();
  }, [hotelsLoading, hotels.length]);

  useEffect(() => {
    if (hotels.length > 0 && rooms.length > 0) {
      setRooms((prev) =>
        prev.map((r) => ({ ...r, hotel: hotels.find((h) => h.id === r.hotel_id) }))
      );
    }
  }, [hotels]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      hotel_id: hotels[0]?.id ?? '',
      name: '',
      description: '',
      price_per_night: 0,
      capacity: 1,
      size_sqm: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (r: Room) => {
    setEditing(r);
    setForm({
      hotel_id: r.hotel_id,
      name: r.name,
      description: r.description,
      price_per_night: r.price_per_night,
      capacity: r.capacity,
      size_sqm: r.size_sqm,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const { error: err } = await supabase.from('rooms').update(form).eq('id', editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('rooms').insert(form);
        if (err) throw err;
      }
      setModalOpen(false);
      loadRooms();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta habitación?')) return;
    const { error: err } = await supabase.from('rooms').delete().eq('id', id);
    if (err) setError(err.message);
    else loadRooms();
  };

  if (hotelsLoading) {
    return <div className="text-gray-500">Cargando hoteles...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Habitaciones</h1>
        <button
          onClick={openCreate}
          disabled={hotels.length === 0}
          className="inline-flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Nueva
        </button>
      </div>

      {hotels.length === 0 && (
        <p className="text-amber-700 bg-amber-50 p-4 rounded-lg">Creá primero un hotel o cabaña en la sección Hoteles.</p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Alojamiento</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Precio/noche</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacidad</th>
                <th className="w-24 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{r.name}</td>
                  <td className="py-3 px-4 text-gray-600">{r.hotel?.name ?? r.hotel_id}</td>
                  <td className="py-3 px-4 text-gray-600">{formatearPrecio(r.price_per_night)}</td>
                  <td className="py-3 px-4 text-gray-600">{r.capacity}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(r)} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && hotels.length > 0 && (
            <p className="text-center text-gray-500 py-8">No hay habitaciones. Creá una con el botón Nueva.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Editar habitación' : 'Nueva habitación'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alojamiento *</label>
                <select
                  required
                  value={form.hotel_id}
                  onChange={(e) => setForm((f) => ({ ...f, hotel_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio/noche *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.price_per_night || ''}
                    onChange={(e) => setForm((f) => ({ ...f, price_per_night: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">m²</label>
                  <input
                    type="number"
                    min={0}
                    value={form.size_sqm || ''}
                    onChange={(e) => setForm((f) => ({ ...f, size_sqm: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
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
