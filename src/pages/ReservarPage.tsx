import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useHotel } from '../hooks/useHotels';
import { useHotels } from '../hooks/useHotels';
import { useAuth } from '../contexts/AuthContext';
import { formatearPrecio, INFO_PAGO } from '../lib/constants';

export default function ReservarPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hotel, loading: hotelLoading } = useHotel(hotelId ?? '');
  const { hotels } = useHotels();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    hotel_id: hotelId ?? '',
    room_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    guests: 1,
    notes: '',
  });

  useEffect(() => {
    if (hotelId) setForm((f) => ({ ...f, hotel_id: hotelId }));
  }, [hotelId]);

  // Si es un solo hotel y entró por /reservar sin hotelId, preseleccionar ese hotel
  useEffect(() => {
    if (!hotelId && hotels.length === 1 && !form.hotel_id) {
      setForm((f) => ({ ...f, hotel_id: hotels[0].id }));
    }
  }, [hotelId, hotels, form.hotel_id]);

  // Prellenar con parámetros del hero o del link de una habitación
  useEffect(() => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const huespedes = searchParams.get('huespedes');
    const roomId = searchParams.get('roomId');
    setForm((f) => ({
      ...f,
      ...(checkIn && { check_in: checkIn }),
      ...(checkOut && { check_out: checkOut }),
      ...(huespedes && { guests: Math.max(1, parseInt(huespedes, 10) || 1) }),
      ...(roomId && { room_id: roomId }),
    }));
  }, [searchParams]);

  // Prellenar nombre y email si el usuario está logueado
  useEffect(() => {
    if (user?.email && !form.guest_email) setForm((f) => ({ ...f, guest_email: user.email ?? '' }));
    const name = user?.user_metadata?.display_name;
    if (name && !form.guest_name) setForm((f) => ({ ...f, guest_name: name }));
  }, [user]);

  const nights = form.check_in && form.check_out
    ? Math.max(0, (new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const pricePerNight = form.room_id && hotel?.rooms?.length
    ? hotel.rooms.find((r) => r.id === form.room_id)?.price_per_night ?? hotel?.price_per_night ?? 0
    : hotel?.price_per_night ?? 0;
  const totalPrice = Math.round(nights * pricePerNight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('reservations').insert({
        hotel_id: form.hotel_id,
        room_id: form.room_id || null,
        guest_name: form.guest_name,
        guest_email: form.guest_email,
        guest_phone: form.guest_phone,
        check_in: form.check_in,
        check_out: form.check_out,
        guests: form.guests,
        total_price: totalPrice,
        status: 'pending',
        notes: form.notes || null,
      });
      if (err) throw err;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (hotelId && hotelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Reserva solicitada correctamente</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4">
            Te contactaremos para confirmar. Revisá tu correo.
          </p>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 text-left mb-6">
            <h3 className="font-semibold text-gray-800 mb-1">{INFO_PAGO.titulo}</h3>
            <p className="text-sm text-gray-700">{INFO_PAGO.descripcion}</p>
            <p className="text-sm text-gray-600 mt-2">Contacto: {INFO_PAGO.contactoWhatsApp}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-cyan-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-cyan-600 touch-manipulation"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const returnToLogin = `/iniciar-sesion?returnTo=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <div className="py-8 sm:py-12 md:py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Reservar en Hotel Escapada</h1>
          {hotel && <p className="text-gray-600">{hotel.name}</p>}
        </div>

        {!user && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 font-medium mb-2">Para confirmar la reserva tenés que iniciar sesión o registrarte.</p>
            <Link
              to={returnToLogin}
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600"
            >
              Iniciar sesión / Registrarse
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 space-y-4">
          {!hotelId && hotels.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alojamiento *</label>
              <select
                required
                value={form.hotel_id}
                onChange={(e) => setForm((f) => ({ ...f, hotel_id: e.target.value, room_id: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Seleccionar...</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}
          {!hotelId && hotels.length === 1 && form.hotel_id && (
            <p className="text-sm text-gray-600">Reservando en <strong>{hotels[0].name}</strong></p>
          )}
          {hotel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habitación (opcional)</label>
              <select
                value={form.room_id}
                onChange={(e) => setForm((f) => ({ ...f, room_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Precio general</option>
                {hotel.rooms?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {formatearPrecio(r.price_per_night)}/noche
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
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
              type="tel"
              required
              value={form.guest_phone}
              onChange={(e) => setForm((f) => ({ ...f, guest_phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Huéspedes *</label>
            <select
              value={form.guests}
              onChange={(e) => setForm((f) => ({ ...f, guests: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'huésped' : 'huéspedes'}</option>
              ))}
            </select>
          </div>
          {nights > 0 && (
            <p className="text-sm text-gray-600">
              {nights} noche{nights !== 1 ? 's' : ''} × {formatearPrecio(pricePerNight)} = <strong>{formatearPrecio(totalPrice)}</strong>
            </p>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
            <strong>Forma de pago:</strong> {INFO_PAGO.descripcion}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              placeholder="Pedidos especiales, horario de llegada..."
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting || !form.hotel_id || !user}
            className="w-full bg-cyan-500 text-white py-3 rounded-lg font-medium hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!user ? 'Iniciá sesión para confirmar la reserva' : submitting ? 'Enviando...' : 'Confirmar reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}
