import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { BarChart3, TrendingUp, Moon } from 'lucide-react';
import { formatearPrecio } from '../../lib/constants';

export default function AdminReportes() {
  const { hotels } = useHotels();
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [reservations, setReservations] = useState<{ check_in: string; check_out: string; total_price: number; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('reservations')
      .select('check_in, check_out, total_price, status')
      .in('status', ['confirmed', 'completed'])
      .then(({ data }) => {
        setReservations(data ?? []);
        setLoading(false);
      });
  }, []);

  const totalRooms = hotels.reduce((acc, h) => acc + (h.rooms?.length ?? 0), 0);
  const daysInRange = Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / (24 * 60 * 60 * 1000)));
  const roomNightsAvailable = totalRooms * daysInRange;

  const inRange = reservations.filter((r) => {
    const start = r.check_in <= to && r.check_out >= from;
    return start;
  });

  let roomNightsSold = 0;
  for (const r of inRange) {
    const overlapStart = r.check_in < from ? from : r.check_in;
    const overlapEnd = r.check_out > to ? to : r.check_out;
    roomNightsSold += Math.max(0, Math.ceil((new Date(overlapEnd).getTime() - new Date(overlapStart).getTime()) / (24 * 60 * 60 * 1000)));
  }

  const occupancy = roomNightsAvailable > 0 ? (roomNightsSold / roomNightsAvailable) * 100 : 0;
  const revenue = inRange.reduce((s, r) => s + Number(r.total_price), 0);
  const revPar = totalRooms > 0 && daysInRange > 0 ? revenue / (totalRooms * daysInRange) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Reportes</h1>
      <p className="text-gray-500 text-sm mb-6">Ocupación e ingresos por período.</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ocupación</p>
                <p className="text-2xl font-bold text-gray-800">{occupancy.toFixed(1)}%</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Habitaciones-noche vendidas: {roomNightsSold} / {roomNightsAvailable}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingresos</p>
                <p className="text-2xl font-bold text-gray-800">{formatearPrecio(revenue)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Reservas confirmadas/completadas en el período</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Moon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">RevPAR</p>
                <p className="text-2xl font-bold text-gray-800">{formatearPrecio(revPar)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Ingreso por habitación disponible por noche</p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Resumen del período</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>Días: {from} a {to} ({daysInRange} días)</li>
          <li>Habitaciones totales: {totalRooms}</li>
          <li>Reservas en período: {inRange.length}</li>
        </ul>
      </div>
    </div>
  );
}
