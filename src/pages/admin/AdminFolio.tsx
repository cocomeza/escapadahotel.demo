import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import {
  Reservation,
  ReservationCharge,
  ReservationPayment,
} from '../../lib/supabase';
import { formatearPrecio } from '../../lib/constants';
import { ArrowLeft, Plus, Receipt, CreditCard } from 'lucide-react';

const CHARGE_TYPES: Record<string, string> = {
  room: 'Habitación',
  minibar: 'Minibar',
  breakfast: 'Desayuno',
  other: 'Otro',
};
const PAYMENT_METHODS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
};

export default function AdminFolio() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hotels } = useHotels();
  const [reservation, setReservation] = useState<(Reservation & { hotel_name?: string; room_name?: string }) | null>(null);
  const [charges, setCharges] = useState<ReservationCharge[]>([]);
  const [payments, setPayments] = useState<ReservationPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chargeForm, setChargeForm] = useState({ description: '', amount: 0, charge_type: 'other' as ReservationCharge['charge_type'] });
  const [paymentForm, setPaymentForm] = useState({ amount: 0, payment_method: 'cash' as ReservationPayment['payment_method'], reference: '' });

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: resData, error: resErr } = await supabase.from('reservations').select('*').eq('id', id).single();
      if (resErr || !resData) {
        setReservation(null);
        setLoading(false);
        return;
      }
      const hotel = hotels.find((h) => h.id === resData.hotel_id);
      const room = hotel?.rooms?.find((r) => r.id === resData.room_id);
      setReservation({ ...resData, hotel_name: hotel?.name, room_name: room?.name });

      const [{ data: chargesData }, { data: paymentsData }] = await Promise.all([
        supabase.from('reservation_charges').select('*').eq('reservation_id', id).order('created_at', { ascending: true }),
        supabase.from('reservation_payments').select('*').eq('reservation_id', id).order('created_at', { ascending: true }),
      ]);
      setCharges(chargesData ?? []);
      setPayments(paymentsData ?? []);
      setLoading(false);
    })();
  }, [id, hotels]);

  useEffect(() => {
    if (hotels.length > 0 && reservation) {
      const hotel = hotels.find((h) => h.id === reservation.hotel_id);
      const room = hotel?.rooms?.find((r) => r.id === reservation.room_id);
      setReservation((r) => (r ? { ...r, hotel_name: hotel?.name, room_name: room?.name } : null));
    }
  }, [hotels, reservation?.id]);

  if (loading || !reservation) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const totalCharges = charges.reduce((s, c) => s + Number(c.amount), 0) + Number(reservation.total_price);
  const totalPayments = payments.reduce((s, p) => s + Number(p.amount), 0);
  const balance = totalCharges - totalPayments;

  const addCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    const { error } = await supabase.from('reservation_charges').insert({
      reservation_id: id,
      description: chargeForm.description || CHARGE_TYPES[chargeForm.charge_type],
      amount: chargeForm.amount,
      charge_type: chargeForm.charge_type,
    });
    setSaving(false);
    if (!error) {
      const { data } = await supabase.from('reservation_charges').select('*').eq('reservation_id', id).order('created_at', { ascending: true });
      setCharges(data ?? []);
      setShowAddCharge(false);
      setChargeForm({ description: '', amount: 0, charge_type: 'other' });
    }
  };

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    const { error } = await supabase.from('reservation_payments').insert({
      reservation_id: id,
      amount: paymentForm.amount,
      payment_method: paymentForm.payment_method,
      reference: paymentForm.reference || null,
    });
    setSaving(false);
    if (!error) {
      const { data } = await supabase.from('reservation_payments').select('*').eq('reservation_id', id).order('created_at', { ascending: true });
      setPayments(data ?? []);
      setShowAddPayment(false);
      setPaymentForm({ amount: 0, payment_method: 'cash', reference: '' });
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/admin/reservas')}
        className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a reservas
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Folio · {reservation.guest_name}</h1>
          <p className="text-sm text-gray-500">{reservation.hotel_name} · {reservation.room_name ?? 'Sin habitación'} · {reservation.check_in} a {reservation.check_out}</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Receipt className="w-5 h-5" /> Cargos</h2>
              <button type="button" onClick={() => setShowAddCharge(true)} className="text-sm text-cyan-600 font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Agregar</button>
            </div>
            <ul className="space-y-2 border border-gray-200 rounded-lg divide-y divide-gray-100">
              <li className="flex justify-between px-4 py-3 text-gray-800">
                <span>Estadía (reserva)</span>
                <span>{formatearPrecio(reservation.total_price)}</span>
              </li>
              {charges.map((c) => (
                <li key={c.id} className="flex justify-between px-4 py-3 text-gray-700">
                  <span>{c.description}</span>
                  <span>{formatearPrecio(c.amount)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-right font-semibold text-gray-800">Subtotal cargos: {formatearPrecio(totalCharges)}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Pagos</h2>
              <button type="button" onClick={() => setShowAddPayment(true)} className="text-sm text-cyan-600 font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Agregar</button>
            </div>
            <ul className="space-y-2 border border-gray-200 rounded-lg divide-y divide-gray-100">
              {payments.length === 0 ? (
                <li className="px-4 py-3 text-gray-500 text-sm">Sin pagos registrados.</li>
              ) : (
                payments.map((p) => (
                  <li key={p.id} className="flex justify-between px-4 py-3 text-gray-700">
                    <span>{PAYMENT_METHODS[p.payment_method]} {p.reference && `· ${p.reference}`}</span>
                    <span>{formatearPrecio(p.amount)}</span>
                  </li>
                ))
              )}
            </ul>
            <p className="mt-2 text-right font-semibold text-gray-800">Total pagado: {formatearPrecio(totalPayments)}</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-cyan-50 border-t border-cyan-200 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Saldo a pagar</span>
          <span className={`text-xl font-bold ${balance > 0 ? 'text-amber-700' : 'text-green-700'}`}>{formatearPrecio(balance)}</span>
        </div>
      </div>

      {showAddCharge && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-800 mb-4">Nuevo cargo</h3>
            <form onSubmit={addCharge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input value={chargeForm.description} onChange={(e) => setChargeForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Ej. Minibar" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={chargeForm.charge_type} onChange={(e) => setChargeForm((f) => ({ ...f, charge_type: e.target.value as ReservationCharge['charge_type'] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {Object.entries(CHARGE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" min={0} step={0.01} value={chargeForm.amount || ''} onChange={(e) => setChargeForm((f) => ({ ...f, amount: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-cyan-500 text-white py-2 rounded-lg font-medium disabled:opacity-50">Agregar</button>
                <button type="button" onClick={() => setShowAddCharge(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-800 mb-4">Registrar pago</h3>
            <form onSubmit={addPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm((f) => ({ ...f, payment_method: e.target.value as ReservationPayment['payment_method'] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {Object.entries(PAYMENT_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input type="number" min={0} step={0.01} value={paymentForm.amount || ''} onChange={(e) => setPaymentForm((f) => ({ ...f, amount: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referencia (opcional)</label>
                <input value={paymentForm.reference} onChange={(e) => setPaymentForm((f) => ({ ...f, reference: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nº operación" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="flex-1 bg-cyan-500 text-white py-2 rounded-lg font-medium disabled:opacity-50">Registrar</button>
                <button type="button" onClick={() => setShowAddPayment(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
