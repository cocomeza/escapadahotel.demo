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

## Importante

- El archivo **`vercel.json`** está configurado para que todas las rutas (inicio, habitaciones, reservar, admin, etc.) sirvan el `index.html` y React Router funcione bien.
- **No subas** el `.env` al repo; las variables se configuran solo en Vercel (y en tu máquina local en `.env`).
