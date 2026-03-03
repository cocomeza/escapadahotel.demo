import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Hotel } from '../../lib/supabase';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { formatearPrecio } from '../../lib/constants';

export default function AdminHoteles() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    rating: 5,
    price_per_night: 0,
    main_image: '',
  });

  const loadHotels = async () => {
    const { data, error: err } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setHotels(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', location: '', rating: 5, price_per_night: 0, main_image: '' });
    setModalOpen(true);
  };

  const openEdit = (h: Hotel) => {
    setEditing(h);
    setForm({
      name: h.name,
      description: h.description,
      location: h.location,
      rating: h.rating,
      price_per_night: h.price_per_night,
      main_image: h.main_image,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const { error: err } = await supabase
          .from('hotels')
          .update(form)
          .eq('id', editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('hotels').insert(form);
        if (err) throw err;
      }
      setModalOpen(false);
      loadHotels();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este alojamiento? Se eliminarán habitaciones e imágenes asociadas.')) return;
    const { error: err } = await supabase.from('hotels').delete().eq('id', id);
    if (err) setError(err.message);
    else loadHotels();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hoteles / Cabañas</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-600"
        >
          <Plus className="w-5 h-5" />
          Nuevo
        </button>
      </div>

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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ubicación</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Precio/noche</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                <th className="w-24 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{h.name}</td>
                  <td className="py-3 px-4 text-gray-600">{h.location}</td>
                  <td className="py-3 px-4 text-gray-600">{formatearPrecio(h.price_per_night)}</td>
                  <td className="py-3 px-4 text-gray-600">{h.rating}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(h)} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(h.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {hotels.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay alojamientos. Creá uno con el botón Nuevo.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[95vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Editar alojamiento' : 'Nuevo alojamiento'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio por noche *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL imagen principal</label>
                <input
                  type="url"
                  value={form.main_image}
                  onChange={(e) => setForm((f) => ({ ...f, main_image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej. https://..."
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
