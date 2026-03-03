import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Image } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';

const BUCKET = 'hotel-images';

export default function AdminImagenes() {
  const { hotels } = useHotels();
  const [images, setImages] = useState<(Image & { hotel_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Image | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    hotel_id: '',
    room_id: '',
    url: '',
    alt_text: '',
    sort_order: 0,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const loadImages = async () => {
    const { data, error: err } = await supabase
      .from('images')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else {
      const withHotel = (data ?? []).map((img) => ({
        ...img,
        hotel_name: hotels.find((h) => h.id === img.hotel_id)?.name,
      }));
      setImages(withHotel);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (hotels.length > 0 && images.length > 0) {
      setImages((prev) =>
        prev.map((img) => ({ ...img, hotel_name: hotels.find((h) => h.id === img.hotel_id)?.name }))
      );
    }
  }, [hotels]);

  const openCreate = () => {
    setEditing(null);
    setUploadFile(null);
    setForm({
      hotel_id: hotels[0]?.id ?? '',
      room_id: '',
      url: '',
      alt_text: '',
      sort_order: images.length,
    });
    setModalOpen(true);
  };

  const openEdit = (img: Image) => {
    setEditing(img);
    setUploadFile(null);
    setForm({
      hotel_id: img.hotel_id ?? '',
      room_id: img.room_id ?? '',
      url: img.url,
      alt_text: img.alt_text,
      sort_order: img.sort_order,
    });
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith('image/')) setUploadFile(f);
    else setUploadFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let url = form.url;
      if (uploadFile) {
        setUploading(true);
        const ext = uploadFile.name.split('.').pop() || 'jpg';
        const path = `${form.hotel_id || 'general'}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, uploadFile, {
          cacheControl: '3600',
          upsert: false,
        });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        url = urlData.publicUrl;
        setUploading(false);
      }
      const row = {
        hotel_id: form.hotel_id || null,
        room_id: form.room_id || null,
        url,
        alt_text: form.alt_text || 'Imagen',
        sort_order: form.sort_order,
      };
      if (editing) {
        const { error: err } = await supabase.from('images').update(row).eq('id', editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('images').insert(row);
        if (err) throw err;
      }
      setModalOpen(false);
      loadImages();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return;
    const { error: err } = await supabase.from('images').delete().eq('id', id);
    if (err) setError(err.message);
    else loadImages();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Imágenes</h1>
        <button
          onClick={openCreate}
          disabled={hotels.length === 0}
          className="inline-flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Nueva / Subir
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <p className="text-sm text-gray-500 mb-4">
        Creá un bucket en Supabase Storage llamado <code className="bg-gray-100 px-1 rounded">hotel-images</code> y activá acceso público de lectura para que las imágenes se vean en la app.
      </p>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
              <div className="aspect-[4/3] bg-gray-100 relative">
                <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(img)} className="p-2 bg-white rounded-lg text-cyan-600 hover:bg-cyan-50">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(img.id)} className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate">{img.alt_text}</p>
                <p className="text-xs text-gray-400">{img.hotel_name ?? '—'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {images.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-8">No hay imágenes. Subí una desde el botón Nueva / Subir.</p>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Editar imagen' : 'Subir / Nueva imagen'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alojamiento</label>
                <select
                  value={form.hotel_id}
                  onChange={(e) => setForm((f) => ({ ...f, hotel_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">—</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subir archivo</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm">{uploadFile ? uploadFile.name : 'Elegir imagen'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {uploadFile && <p className="text-xs text-gray-500 mt-1">Se usará esta imagen en lugar de la URL.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL (si no subís archivo)</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto alternativo *</label>
                <input
                  required
                  value={form.alt_text}
                  onChange={(e) => setForm((f) => ({ ...f, alt_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-cyan-500 text-white py-2 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50"
                >
                  {uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Guardar'}
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
