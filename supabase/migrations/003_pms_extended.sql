-- PMS: check-in/check-out real, folio (cargos y pagos), personal de limpieza

-- Reservations: timestamps reales de check-in y check-out
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS special_requests TEXT;

COMMENT ON COLUMN reservations.checked_in_at IS 'Momento en que se realizó el check-in.';
COMMENT ON COLUMN reservations.checked_out_at IS 'Momento en que se realizó el check-out.';
COMMENT ON COLUMN reservations.special_requests IS 'Solicitudes especiales del huésped (cama extra, desayuno, etc.).';

-- Cargos del folio (habitación, minibar, extras)
CREATE TABLE IF NOT EXISTS reservation_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  charge_type TEXT NOT NULL DEFAULT 'other' CHECK (charge_type IN ('room', 'minibar', 'breakfast', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pagos registrados
CREATE TABLE IF NOT EXISTS reservation_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asignaciones de limpieza (habitación + fecha + responsable)
CREATE TABLE IF NOT EXISTS cleaning_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  assignment_date DATE NOT NULL,
  staff_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, assignment_date)
);

COMMENT ON TABLE reservation_charges IS 'Cargos del folio por reserva (habitación, minibar, etc.).';
COMMENT ON TABLE reservation_payments IS 'Pagos realizados por el huésped.';
COMMENT ON TABLE cleaning_assignments IS 'Asignación de habitaciones al personal de limpieza por día.';
