# Desplegar en Vercel

## Opción 1: Conectar el repo de GitHub (recomendado)

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión (con tu cuenta de GitHub si querés).
2. Clic en **Add New… → Project**.
3. Importá el repositorio **cocomeza/escapadahotel.demo** (conectar GitHub si no está vinculado).
4. Vercel detecta Vite y usa:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. **Variables de entorno:** en la misma pantalla (o en Settings → Environment Variables) agregá:
   - `VITE_SUPABASE_URL` → tu URL de Supabase (ej. `https://xxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` → tu anon public key de Supabase
   Así la app en producción puede hablar con tu proyecto de Supabase.
6. Clic en **Deploy**. Cuando termine, Vercel te da una URL (ej. `escapadahotel-demo.vercel.app`).
7. Cada push a la rama `main` en GitHub puede generar un nuevo deploy automático si dejaste activado el deploy automático.

---

## Opción 2: Vercel CLI

```bash
npm i -g vercel
cd c:\Users\mezac\appwebhotel
vercel
```

Seguí las preguntas (link to existing project o crear uno nuevo). Las variables de entorno las podés agregar en el dashboard de Vercel después, en **Project → Settings → Environment Variables**.

---

## Bucket de imágenes en Supabase (Admin → Imágenes)

Para que **Nueva / Subir** funcione y las fotos se vean en la app:

1. **Nombre del bucket:** tiene que ser exactamente `hotel-images`.
2. **Bucket público:** en Supabase → **Storage** → elegí el bucket `hotel-images` → **Settings** (engranaje) → activá **Public bucket** para que las URLs públicas funcionen.
3. **Políticas de Storage (importante):** Sin políticas RLS en Storage, la subida falla con 403. Opción A: en **Storage** → `hotel-images` → **Policies** → **New policy** → plantilla "Allow uploads for authenticated users". Opción B (recomendado): en Supabase → **SQL Editor** pegá y ejecutá el contenido de **`supabase/migrations/004_storage_policies.sql`**.
   - Podés usar la plantilla **“Allow uploads for authenticated users”** (permite a usuarios logueados subir).

Si el bucket es público y las políticas están bien, al hacer clic en **Nueva / Subir**, elegir un hotel, subir un archivo y guardar, la imagen debería verse en la lista y en la web.

---

## Importante

- El archivo **`vercel.json`** está configurado para que todas las rutas (inicio, habitaciones, reservar, admin, etc.) sirvan el `index.html` y React Router funcione bien.
- **No subas** el `.env` al repo; las variables se configuran solo en Vercel (y en tu máquina local en `.env`).
