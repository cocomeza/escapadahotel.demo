-- Estado de habitaciones: override (limpieza, mantenimiento) y control de limpieza
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status_override TEXT CHECK (status_override IN ('cleaning', 'maintenance') OR status_override IS NULL);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS cleaned_at TIMESTAMPTZ;

COMMENT ON COLUMN rooms.status_override IS 'Override: cleaning = en limpieza, maintenance = en mantenimiento. Si NULL, disponible (salvo que esté ocupada por reserva).';
COMMENT ON COLUMN rooms.cleaned_at IS 'Última vez que se marcó la habitación como limpiada.';
