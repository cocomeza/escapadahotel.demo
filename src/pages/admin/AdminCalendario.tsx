import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { Reservation } from '../../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function AdminCalendario() {
  const { hotels } = useHotels();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const start = new Date(year, month, 1).toISOString().slice(0, 10);
    const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    supabase
      .from('reservations')
      .select('*')
      .in('status', ['pending', 'confirmed'])
      .lte('check_in', end)
      .gte('check_out', start)
      .then(({ data }) => {
        setReservations(data ?? []);
        setLoading(false);
      });
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const calendarDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  const pad = (n: number) => String(n).padStart(2, '0');
  const toDateStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateStr: toDateStr(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, d),
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      dateStr: toDateStr(year, month, d),
    });
  }
  const totalCells = Math.ceil(calendarDays.length / 7) * 7;
  while (calendarDays.length < totalCells) {
    const d = calendarDays.length - (firstDay + daysInMonth) + 1;
    const nextM = month + 1;
    const nextY = nextM > 11 ? year + 1 : year;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateStr: toDateStr(nextY, nextM > 11 ? 0 : nextM, d),
    });
  }

  const getReservationsForDay = (dateStr: string) =>
    reservations.filter((r) => dateStr >= r.check_in && dateStr <= r.check_out);

  const roomName = (r: Reservation) => {
    const hotel = hotels.find((h) => h.id === r.hotel_id);
    const room = hotel?.rooms?.find((room) => room.id === r.room_id);
    return room?.name || 'Sin habitación';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Calendario de reservas</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {WEEKDAYS.map((w) => (
                  <th key={w} className="py-2 px-1 text-center text-xs font-semibold text-gray-600">
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalCells / 7 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100">
                  {calendarDays.slice(rowIndex * 7, rowIndex * 7 + 7).map((cell) => {
                    const dayReservations = getReservationsForDay(cell.dateStr);
                    return (
                      <td
                        key={cell.dateStr}
                        className={`align-top p-1 border-r border-gray-100 last:border-r-0 min-h-[80px] ${
                          cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-right">
                          <span
                            className={`text-sm ${
                              cell.isCurrentMonth ? 'text-gray-800 font-medium' : 'text-gray-400'
                            }`}
                          >
                            {cell.day}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayReservations.slice(0, 2).map((r) => (
                            <div
                              key={r.id}
                              className="text-xs px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 truncate"
                              title={`${r.guest_name} - ${roomName(r)}`}
                            >
                              {r.guest_name}
                            </div>
                          ))}
                          {dayReservations.length > 2 && (
                            <div className="text-xs text-gray-500">+{dayReservations.length - 2}</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Reservas del mes</h2>
        {reservations.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay reservas confirmadas o pendientes en este mes.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {reservations.map((r) => {
              const room = hotels.flatMap((h) => h.rooms ?? []).find((room) => room.id === r.room_id);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                  <span className="font-medium text-gray-800">{r.guest_name}</span>
                  <span className="text-gray-500">—</span>
                  <span>{room?.name || 'Sin habitación'}</span>
                  <span className="text-gray-500">
                    {r.check_in} a {r.check_out}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      r.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
