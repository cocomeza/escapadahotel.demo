import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Room } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { Sparkles, Wrench, CheckCircle, Clock } from 'lucide-react';

type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export default function AdminEstadoHabitaciones() {
  const { hotels, loading: hotelsLoading } = useHotels();
  const [roomsOverride, setRoomsOverride] = useState<Record<string, { status_override?: string | null; cleaned_at?: string | null }>>({});
  const [reservations, setReservations] = useState<{ room_id: string | null; check_in: string; check_out: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    supabase
      .from('reservations')
      .select('room_id, check_in, check_out, status')
      .in('status', ['pending', 'confirmed'])
      .then(({ data }) => setReservations(data ?? []));
  }, []);

  useEffect(() => {
    if (!hotelsLoading) setLoading(false);
  }, [hotelsLoading]);

  const applyOverride = (roomId: string, data: { status_override?: string | null; cleaned_at?: string | null }) => {
    setRoomsOverride((prev) => ({ ...prev, [roomId]: { ...prev[roomId], ...data } }));
  };

  const getRoomDisplay = (room: Room & { hotel_name?: string }) => {
    const over = roomsOverride[room.id] ?? {};
    return {
      ...room,
      status_override: over.status_override !== undefined ? over.status_override : room.status_override,
      cleaned_at: over.cleaned_at !== undefined ? over.cleaned_at : room.cleaned_at,
    };
  };

  const isRoomOccupied = (roomId: string) =>
    reservations.some(
      (r) =>
        r.room_id === roomId &&
        r.check_in <= today &&
        r.check_out >= today
    );

  const allRooms = hotels.flatMap((h) => (h.rooms ?? []).map((r) => ({ ...r, hotel_name: h.name })));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estado de habitaciones</h1>
        <p className="text-gray-600 text-sm mt-1">Control de ocupación y limpieza. Fecha de referencia: {today}</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allRooms.map((room) => {
            const r = getRoomDisplay(room);
            const occupied = isRoomOccupied(room.id);
            const override = r.status_override;
            let status: RoomStatus = 'available';
            if (occupied) status = 'occupied';
            else if (override === 'cleaning') status = 'cleaning';
            else if (override === 'maintenance') status = 'maintenance';

            return (
              <RoomStatusCard
                key={room.id}
                room={r}
                status={status}
                cleanedAt={r.cleaned_at}
                onStatusChange={async (newOverride) => {
                  const payload: { status_override: string | null; cleaned_at?: string } = {
                    status_override: newOverride === 'available' ? null : newOverride,
                  };
                  if (newOverride === 'available') payload.cleaned_at = new Date().toISOString();
                  const { error } = await supabase.from('rooms').update(payload).eq('id', room.id);
                  if (!error) applyOverride(room.id, payload);
                }}
                onMarkCleaned={async () => {
                  const payload = { cleaned_at: new Date().toISOString(), status_override: null };
                  const { error } = await supabase.from('rooms').update(payload).eq('id', room.id);
                  if (!error) applyOverride(room.id, payload);
                }}
              />
            );
          })}
        </div>
      )}

      {!loading && allRooms.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No hay habitaciones. Creá habitaciones en la sección Habitaciones.
        </div>
      )}

      <div className="mt-8 bg-cyan-50 border border-cyan-200 rounded-xl p-4">
        <h2 className="font-semibold text-gray-800 mb-2">Leyenda</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" /> Disponible</li>
          <li><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2" /> Ocupada (reserva activa)</li>
          <li><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2" /> En limpieza</li>
          <li><span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-2" /> En mantenimiento</li>
        </ul>
      </div>
    </div>
  );
}

function RoomStatusCard({
  room,
  status,
  cleanedAt,
  onStatusChange,
  onMarkCleaned,
}: {
  room: Room & { hotel_name?: string };
  status: RoomStatus;
  cleanedAt?: string | null;
  onStatusChange: (override: 'available' | 'cleaning' | 'maintenance') => void;
  onMarkCleaned: () => void;
}) {
  const statusConfig = {
    available: { label: 'Disponible', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    occupied: { label: 'Ocupada', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
    cleaning: { label: 'En limpieza', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    maintenance: { label: 'Mantenimiento', bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' },
  };
  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{room.name}</h3>
          <p className="text-xs text-gray-500">{room.hotel_name}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </div>
      {cleanedAt && (
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          Limpiada: {new Date(cleanedAt).toLocaleDateString('es-AR')}
        </p>
      )}
      <div className="mt-auto space-y-2">
        {status !== 'occupied' && (
          <>
            <div className="flex gap-2 flex-wrap">
              {status !== 'cleaning' && (
                <button
                  type="button"
                  onClick={() => onStatusChange('cleaning')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  En limpieza
                </button>
              )}
              {status !== 'maintenance' && (
                <button
                  type="button"
                  onClick={() => onStatusChange('maintenance')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Mantenimiento
                </button>
              )}
              {(status === 'cleaning' || status === 'maintenance') && (
                <button
                  type="button"
                  onClick={() => onStatusChange('available')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                >
                  Disponible
                </button>
              )}
            </div>
            {status === 'cleaning' && (
              <button
                type="button"
                onClick={onMarkCleaned}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como limpiada
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
