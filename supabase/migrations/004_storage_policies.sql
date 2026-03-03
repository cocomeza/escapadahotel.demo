-- Políticas de Storage para el bucket hotel-images
-- Ejecutá esto en Supabase → SQL Editor si la subida desde el panel Admin falla.
-- El bucket "hotel-images" tiene que existir (crealo en Storage si no está).

-- Permite a usuarios autenticados SUBIR archivos al bucket hotel-images
DROP POLICY IF EXISTS "hotel_images_allow_authenticated_upload" ON storage.objects;
CREATE POLICY "hotel_images_allow_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hotel-images');

-- Permite a todos (lectura pública) VER archivos del bucket (para getPublicUrl)
DROP POLICY IF EXISTS "hotel_images_allow_public_read" ON storage.objects;
CREATE POLICY "hotel_images_allow_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hotel-images');

-- Opcional: permite a autenticados actualizar/borrar sus archivos en el bucket
DROP POLICY IF EXISTS "hotel_images_allow_authenticated_update" ON storage.objects;
CREATE POLICY "hotel_images_allow_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'hotel-images')
WITH CHECK (bucket_id = 'hotel-images');

DROP POLICY IF EXISTS "hotel_images_allow_authenticated_delete" ON storage.objects;
CREATE POLICY "hotel_images_allow_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'hotel-images');
