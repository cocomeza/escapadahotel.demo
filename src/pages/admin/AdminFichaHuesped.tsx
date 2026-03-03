import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useHotels } from '../../hooks/useHotels';
import { Reservation } from '../../lib/supabase';
import { formatearPrecio } from '../../lib/constants';
import { ArrowLeft, Mail, Phone, Calendar, User, FileText } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

export default function AdminFichaHuesped() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hotels } = useHotels();
  const [reservation, setReservation] = useState<(Reservation & { hotel_name?: string; room_name?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setReservation(null);
        } else {
          const hotel = hotels.find((h) => h.id === data.hotel_id);
          const room = hotel?.rooms?.find((r) => r.id === data.room_id);
          setReservation({
            ...data,
            hotel_name: hotel?.name,
            room_name: room?.name,
          });
        }
        setLoading(false);
      });
  }, [id, hotels]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Reserva no encontrada.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/huespedes')}
          className="text-cyan-500 font-medium hover:underline"
        >
          Volver a huéspedes
        </button>
      </div>
    );
  }

  const r = reservation;

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/admin/huespedes')}
        className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a lista de huéspedes
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-600" />
          <h1 className="text-xl font-bold text-gray-800">Ficha del huésped</h1>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos personales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-800">{r.guest_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Correo electrónico</p>
                  <p className="font-medium text-gray-800">{r.guest_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-800">{r.guest_phone}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Cantidad de huéspedes</p>
                <p className="font-medium text-gray-800">{r.guests}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Estadía</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Entrada</p>
                  <p className="font-medium text-gray-800">{r.check_in}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Salida</p>
                  <p className="font-medium text-gray-800">{r.check_out}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Habitación</p>
                <p className="font-medium text-gray-800">{r.room_name || 'Sin asignar'}</p>
                <p className="text-sm text-gray-500">{r.hotel_name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-medium text-gray-800">{formatearPrecio(r.total_price)}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Estado y notas</h2>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${
                  r.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : r.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : r.status === 'completed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
              {r.checked_in_at && <span className="text-sm text-green-600">Entrada: {new Date(r.checked_in_at).toLocaleString('es-AR')}</span>}
              {r.checked_out_at && <span className="text-sm text-gray-600">Salida: {new Date(r.checked_out_at).toLocaleString('es-AR')}</span>}
            </div>
            {r.special_requests && (
              <div className="mt-3 p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                <p className="text-xs text-gray-500 mb-1">Solicitudes especiales</p>
                <p className="text-gray-800">{r.special_requests}</p>
              </div>
            )}
            {r.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Notas</p>
                <p className="text-gray-800">{r.notes}</p>
              </div>
            )}
          </section>

          <div className="pt-4 border-t flex gap-2 flex-wrap">
            <Link
              to={`/admin/folio/${r.id}`}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600"
            >
              Ver folio / cobrar
            </Link>
            <button
              type="button"
              onClick={() => navigate('/admin/reservas')}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Editar reserva
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/huespedes')}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
