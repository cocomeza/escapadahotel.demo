import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Amenity } from '../../lib/supabase';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const ICON_OPTIONS = ['wifi', 'coffee', 'car', 'air-vent', 'utensils', 'waves', 'sun', 'sparkles'];

export default function AdminAmenidades() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Amenity | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: 'wifi' });

  const loadAmenities = async () => {
    const { data, error: err } = await supabase.from('amenities').select('*').order('name');
    if (err) setError(err.message);
    else setAmenities(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadAmenities();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', icon: 'wifi' });
    setModalOpen(true);
  };

  const openEdit = (a: Amenity) => {
    setEditing(a);
    setForm({ name: a.name, icon: a.icon });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const { error: err } = await supabase.from('amenities').update(form).eq('id', editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('amenities').insert(form);
        if (err) throw err;
      }
      setModalOpen(false);
      loadAmenities();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta amenidad? Se quitará de todos los hoteles.')) return;
    const { error: err } = await supabase.from('amenities').delete().eq('id', id);
    if (err) setError(err.message);
    else loadAmenities();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Amenidades</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-600"
        >
          <Plus className="w-5 h-5" />
          Nueva
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Icono</th>
                <th className="w-24 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{a.name}</td>
                  <td className="py-3 px-4 text-gray-600">{a.icon}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(a)} className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {amenities.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay amenidades. Creá una con el botón Nueva.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Editar amenidad' : 'Nueva amenidad'}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
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
