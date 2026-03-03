import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { CleaningAssignment } from '../../lib/supabase';
import { Sparkles, CheckCircle, UserPlus, Calendar } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecho',
};

export default function AdminLimpieza() {
  const { hotels } = useHotels();
  const [date, setDate] = useState(today);
  const [assignments, setAssignments] = useState<(CleaningAssignment & { room_name?: string; hotel_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ room_id: '', staff_name: '' });
  const [saving, setSaving] = useState(false);

  const allRooms = hotels.flatMap((h) => (h.rooms ?? []).map((r) => ({ ...r, hotel_name: h.name })));

  useEffect(() => {
    supabase
      .from('cleaning_assignments')
      .select('*')
      .eq('assignment_date', date)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const withNames = (data ?? []).map((a) => {
          const room = allRooms.find((r) => r.id === a.room_id);
          return { ...a, room_name: room?.name, hotel_name: room?.hotel_name };
        });
        setAssignments(withNames);
        setLoading(false);
      });
  }, [date]);

  useEffect(() => {
    if (assignments.length > 0 && allRooms.length > 0) {
      setAssignments((prev) =>
        prev.map((a) => {
          const room = allRooms.find((r) => r.id === a.room_id);
          return { ...a, room_name: room?.name, hotel_name: room?.hotel_name };
        })
      );
    }
  }, [allRooms.length]);

  const refresh = () => {
    supabase
      .from('cleaning_assignments')
      .select('*')
      .eq('assignment_date', date)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const withNames = (data ?? []).map((a) => {
          const room = allRooms.find((r) => r.id === a.room_id);
          return { ...a, room_name: room?.name, hotel_name: room?.hotel_name };
        });
        setAssignments(withNames);
      });
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.room_id || !assignForm.staff_name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('cleaning_assignments').upsert(
      { room_id: assignForm.room_id, assignment_date: date, staff_name: assignForm.staff_name.trim(), status: 'pending' },
      { onConflict: 'room_id,assignment_date' }
    );
    setSaving(false);
    if (!error) {
      setShowAssign(false);
      setAssignForm({ room_id: '', staff_name: '' });
      refresh();
    }
  };

  const updateStatus = async (id: string, status: CleaningAssignment['status']) => {
    const payload = status === 'done' ? { status, completed_at: new Date().toISOString() } : { status };
    await supabase.from('cleaning_assignments').update(payload).eq('id', id);
    refresh();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Personal de limpieza</h1>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600"
          >
            <UserPlus className="w-5 h-5" />
            Asignar habitación
          </button>
        </div>
      </div>

      <p className="text-gray-500 text-sm mb-6">Asignación de habitaciones al personal para el día seleccionado.</p>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay asignaciones para esta fecha. Asigná habitaciones con el botón &quot;Asignar habitación&quot;.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {assignments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{a.room_name ?? a.room_id}</p>
                      <p className="text-sm text-gray-500">{a.hotel_name}</p>
                      <p className="text-sm text-gray-600 mt-0.5">Asignado a: <strong>{a.staff_name}</strong></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      a.status === 'done' ? 'bg-green-100 text-green-800' : a.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                    {a.status !== 'in_progress' && a.status !== 'done' && (
                      <button type="button" onClick={() => updateStatus(a.id, 'in_progress')} className="text-sm text-blue-600 hover:underline">En curso</button>
                    )}
                    {a.status !== 'done' && (
                      <button type="button" onClick={() => updateStatus(a.id, 'done')} className="flex items-center gap-1 text-sm text-green-600 hover:underline">
                        <CheckCircle className="w-4 h-4" /> Hecho
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-800 mb-4">Asignar habitación</h3>
            <form onSubmit={createAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Habitación</label>
                <select
                  value={assignForm.room_id}
                  onChange={(e) => setAssignForm((f) => ({ ...f, room_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Seleccionar</option>
                  {allRooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.hotel_name} – {r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del personal</label>
                <input
                  value={assignForm.staff_name}
                  onChange={(e) => setAssignForm((f) => ({ ...f, staff_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej. María García"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-cyan-500 text-white py-2 rounded-lg font-medium disabled:opacity-50">Asignar</button>
                <button type="button" onClick={() => setShowAssign(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
