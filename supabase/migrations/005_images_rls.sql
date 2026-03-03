-- Políticas RLS para la tabla images
-- Si en Supabase la tabla "images" tiene RLS activado, sin estas políticas el CRUD del panel Admin falla.
-- Ejecutá este archivo en Supabase → SQL Editor si no podés listar, subir, editar o eliminar imágenes.

-- Activar RLS en images (si no está activado)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Lectura: permitir a todos (anon + authenticated) para que la Galería pública y el Admin puedan ver
DROP POLICY IF EXISTS "images_select_all" ON images;
CREATE POLICY "images_select_all"
ON images FOR SELECT
TO public
USING (true);

-- Inserción: solo usuarios autenticados (admin)
DROP POLICY IF EXISTS "images_insert_authenticated" ON images;
CREATE POLICY "images_insert_authenticated"
ON images FOR INSERT
TO authenticated
WITH CHECK (true);

-- Actualización: solo usuarios autenticados (admin)
DROP POLICY IF EXISTS "images_update_authenticated" ON images;
CREATE POLICY "images_update_authenticated"
ON images FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Eliminación: solo usuarios autenticados (admin)
DROP POLICY IF EXISTS "images_delete_authenticated" ON images;
CREATE POLICY "images_delete_authenticated"
ON images FOR DELETE
TO authenticated
USING (true);
