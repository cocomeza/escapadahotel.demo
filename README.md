# Hotel Escapada — Web de reservas y gestión

Aplicación web para **Hotel Escapada** (Provincia de Buenos Aires, Argentina): sitio público de reservas y panel de administración tipo PMS (Property Management System). Los huéspedes pueden buscar disponibilidad por fechas, registrarse o iniciar sesión para confirmar la reserva; los pagos se coordinan por WhatsApp (transferencia) o en efectivo/débito al llegar al hotel. Sin pasarela de pago online.

---

## Tecnologías utilizadas

| Área | Tecnología |
|------|------------|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Estilos** | Tailwind CSS 3 |
| **Enrutado** | React Router v7 |
| **Backend / BD** | Supabase (PostgreSQL, Auth, Storage) |
| **Iconos** | Lucide React |

- **React 18**: interfaz de usuario y componentes reutilizables.
- **TypeScript**: tipado estático y mejor mantenibilidad.
- **Vite**: bundler y dev server rápidos, HMR.
- **Tailwind CSS**: diseño responsive y utilidades.
- **React Router**: rutas públicas (inicio, habitaciones, galería, contacto, reservar, iniciar sesión) y rutas protegidas de admin.
- **Supabase**: base de datos PostgreSQL, autenticación (admin y huéspedes), almacenamiento de imágenes.

---

## Estructura del proyecto

```
appwebhotel/
├── public/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Header.tsx    # Navbar y menú hamburguesa
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx      # Búsqueda por fechas en inicio
│   │   ├── RoomCard.tsx
│   │   ├── HotelCard.tsx
│   │   ├── HotelDetails.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── Features.tsx
│   │   ├── Gallery.tsx
│   │   └── Layout.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx   # Auth Supabase (login/signup/signOut)
│   ├── hooks/
│   │   └── useHotels.ts     # Datos de hoteles, habitaciones, imágenes
│   ├── lib/
│   │   ├── constants.ts     # Textos, precios, INFO_PAGO, etc.
│   │   └── supabase.ts      # Cliente y tipos (Hotel, Room, Reservation, etc.)
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── HotelesPage.tsx  # Habitaciones con filtro por fechas y disponibilidad
│   │   ├── HotelDetailPage.tsx
│   │   ├── GaleriaPage.tsx
│   │   ├── ContactoPage.tsx
│   │   ├── ReservarPage.tsx # Requiere login para confirmar reserva
│   │   ├── GuestAuthPage.tsx # Login / registro de huéspedes (/iniciar-sesion)
│   │   └── admin/           # Panel admin (protegido)
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminLogin.tsx
│   │       ├── AdminOverview.tsx   # Recepción: llegadas, salidas, en casa
│   │       ├── AdminReservas.tsx   # CRUD reservas, check-in/out, folio
│   │       ├── AdminHuespedes.tsx
│   │       ├── AdminFichaHuesped.tsx
│   │       ├── AdminEstadoHabitaciones.tsx
│   │       ├── AdminLimpieza.tsx   # Asignación personal limpieza
│   │       ├── AdminCalendario.tsx
│   │       ├── AdminFolio.tsx      # Cargos y pagos por reserva
│   │       ├── AdminReportes.tsx   # Ocupación e ingresos
│   │       ├── AdminHoteles.tsx
│   │       ├── AdminHabitaciones.tsx
│   │       ├── AdminImagenes.tsx
│   │       └── AdminAmenidades.tsx
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/
│       ├── 001_reservations.sql
│       ├── 002_room_status.sql
│       └── 003_pms_extended.sql
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Funcionalidades principales

### Sitio público
- **Inicio**: hero con búsqueda por check-in, check-out y huéspedes → enlace a Habitaciones con esas fechas.
- **Habitaciones**: listado con filtro por fechas y por precio; solo se muestran habitaciones **disponibles** para el rango de fechas elegido. Imágenes por habitación (desde BD o placeholders por tipo).
- **Reservar**: formulario con hotel, habitación, datos del huésped, fechas y huéspedes. Para **confirmar la reserva** es obligatorio **iniciar sesión o registrarse** (ruta `/iniciar-sesion`). Tras confirmar, se muestra la información de pago (WhatsApp / transferencia / efectivo o débito en el hotel).
- **Galería** y **Contacto**.

### Autenticación
- **Huéspedes**: registro e inicio de sesión en `/iniciar-sesion`. Tras login, pueden confirmar la reserva; el sistema prellena email y nombre si están en la cuenta.
- **Admin**: login en `/admin/login`. Acceso al panel solo con sesión iniciada.

### Panel de administración (PMS)
- **Recepción**: llegadas del día, salidas del día, en casa; accesos rápidos a reservas, estado de habitaciones, personal de limpieza, reportes.
- **Reservas**: listado, filtros (llegadas/salidas/en casa), edición, check-in/check-out, enlace al folio.
- **Huéspedes**: lista y ficha por reserva/huésped; enlace a folio.
- **Estado de habitaciones**: disponible, ocupada, en limpieza, mantenimiento; marcar como limpiada.
- **Personal de limpieza**: asignación de habitaciones por fecha y responsable; estados pendiente / en curso / hecho.
- **Calendario**: vista mensual de reservas.
- **Folio**: cargos (habitación, minibar, desayuno, otros) y pagos (efectivo, tarjeta, transferencia); saldo a pagar.
- **Reportes**: ocupación, ingresos y RevPAR por rango de fechas.
- **Hoteles, habitaciones, imágenes, amenidades**: CRUD.

---

## Base de datos (Supabase)

- **hotels**, **rooms**, **images**, **amenities**, **hotel_amenities** (según esquema existente).
- **reservations**: reservas con `checked_in_at`, `checked_out_at`, `special_requests`.
- **reservation_charges**: cargos del folio por reserva.
- **reservation_payments**: pagos por reserva.
- **cleaning_assignments**: asignación de habitaciones al personal de limpieza por día.

Migraciones en `supabase/migrations/`. **Orden de ejecución en el SQL Editor de Supabase:**

1. **`001_reservations.sql`** — crea tablas base (`hotels`, `rooms`, `amenities`, `hotel_amenities`, `images`) y tabla `reservations` con trigger.
2. **`002_room_status.sql`** — columnas en `rooms`: `status_override`, `cleaned_at`.
3. **`003_pms_extended.sql`** — columnas en `reservations` (check-in/out, solicitudes) y tablas `reservation_charges`, `reservation_payments`, `cleaning_assignments`.

---

## Variables de entorno

Crear `.env` en la raíz (o `.env.local`) con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

---

## Configurar Supabase para que el admin entre al panel

Para que un usuario pueda entrar en **Admin** (`/admin/login`) y acceder al panel, en Supabase tenés que hacer esto:

### 1. Proyecto y variables de entorno

- Creá un proyecto en [supabase.com](https://supabase.com) (o usá uno existente).
- En el proyecto: **Settings → API**: copiá **Project URL** y **anon public** key.
- En la raíz del proyecto creá un archivo **`.env`** con:
  ```env
  VITE_SUPABASE_URL=https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGc...
  ```
  (reemplazá por tu URL y tu anon key). Reiniciá `npm run dev` si ya estaba corriendo.

### 2. Autenticación (Auth)

- En el dashboard: **Authentication → Providers**.
- Asegurate de que **Email** esté **habilitado**.
- Opcional: en **Authentication → Providers → Email** podés desactivar **“Confirm email”** para que el admin entre sin tener que confirmar el correo. Si lo dejás activado, el usuario tiene que hacer clic en el link del mail antes de poder iniciar sesión.

### 3. Crear el usuario admin

El admin **tiene que existir** como usuario en Supabase Auth (email + contraseña). No se “crea” solo desde la app.

- Entrá a **Authentication → Users**.
- Clic en **“Add user”** / **“Invite user”**.
- Elegí **“Create new user”**.
- Ingresá **email** y **contraseña** (por ejemplo `admin@hotelescapada.com.ar` y una contraseña segura). Guardá esa contraseña para usarla en el login.
- Si no usás “Confirm email”, el usuario queda listo de inmediato. Si usás confirmación, revisá el correo y confirmá antes de probar el login.

Ese email y contraseña son los que se usan en **Admin → Iniciar sesión** en la app.

### 4. Base de datos y migraciones

- Para que el panel cargue hoteles, habitaciones, reservas, etc., las tablas tienen que existir. Ejecutá en **SQL Editor** las migraciones **en este orden**:
  - **`001_reservations.sql`** (crea `hotels`, `rooms`, `amenities`, `hotel_amenities`, `images` y `reservations`)
  - **`002_room_status.sql`**
  - **`003_pms_extended.sql`**

### 5. Row Level Security (RLS)

- Por defecto, en proyectos nuevos Supabase puede tener **RLS activado** en algunas tablas. Si al entrar al panel las pantallas no cargan datos (hoteles, reservas, etc.), es probable que las políticas estén bloqueando el acceso.
- Opciones:
  - **Para desarrollo/pruebas**: en **Table Editor**, tabla por tabla, podés desactivar RLS (toggle “Enable RLS”) para que el usuario autenticado (anon key con sesión) pueda leer/escribir. No recomendado en producción sin políticas bien definidas.
  - **Para producción**: dejá RLS activado y creá políticas que permitan a usuarios **autenticados** (`auth.role() = 'authenticated'`) SELECT/INSERT/UPDATE/DELETE en las tablas que use el panel (por ejemplo `hotels`, `rooms`, `reservations`, `reservation_charges`, `reservation_payments`, `cleaning_assignments`, `images`, `amenities`, `hotel_amenities`).

### 6. Storage (solo si el panel sube imágenes)

- Si usás **Admin → Imágenes** para subir fotos: en **Storage** creá un bucket (por ejemplo `hotel-images`), configuralo como **public** si las imágenes tienen que verse en la web, y añadí una política que permita a usuarios autenticados **upload** y **update/delete** en ese bucket.

---

**Resumen:** Con el proyecto creado, `.env` con URL y anon key, Auth con Email habilitado, **un usuario creado en Authentication → Users** con el email y contraseña que quieras para el admin, y las migraciones aplicadas (y RLS/Storage ajustados si hace falta), el admin ya puede entrar en **Admin** y acceder al panel.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite). |
| `npm run build` | Build de producción. |
| `npm run preview` | Vista previa del build. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Verificación de tipos (TypeScript). |

---

## Cómo correr el proyecto

1. Clonar el repositorio e instalar dependencias:
   ```bash
   cd appwebhotel
   npm install
   ```
2. Configurar variables de entorno (ver arriba).
3. En Supabase: crear proyecto, ejecutar migraciones y configurar Auth (Email habilitado; opcional: confirmación de email).
4. Ejecutar:
   ```bash
   npm run dev
   ```
5. Abrir la URL que indique Vite (por ejemplo `http://localhost:5173`).

---

## Forma de pago

La aplicación **no incluye pasarela de pago**. Los pagos se gestionan fuera de la web:

- **Transferencia bancaria** vía WhatsApp (contacto configurado en `constants.ts`).
- **Efectivo o débito** al llegar al hotel.

El texto se muestra en la página de reserva y en la pantalla de confirmación (constante `INFO_PAGO` en `src/lib/constants.ts`).

---

## Licencia

Proyecto privado. Uso según criterio del titular.
