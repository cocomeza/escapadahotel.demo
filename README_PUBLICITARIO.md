# 🏨 Hotel Escapada — Web de reservas y panel de gestión

**Tu lugar en la Provincia de Buenos Aires.**

Sitio web profesional para reservas, galería e información del hotel, con **panel de administración completo** para recepción, habitaciones, limpieza, folios y reportes.

---

## ✨ Qué es

**Hotel Escapada** es una aplicación web pensada para alojamientos en la Provincia de Buenos Aires. Incluye:

- **Sitio público**: inicio, habitaciones con disponibilidad en tiempo real, galería de fotos, contacto y reserva online.
- **Panel de administración (PMS)**: recepción, reservas, huéspedes, estado de habitaciones, personal de limpieza, calendario, folios y reportes.

Los huéspedes buscan por fechas, eligen habitación y confirman la reserva con registro o inicio de sesión. El pago se coordina por **WhatsApp** (transferencia) o en **efectivo/débito** en el hotel — sin pasarela de pago integrada.

---

## 🌐 Para el visitante (sitio público)

| Funcionalidad | Descripción |
|---------------|-------------|
| **Inicio** | Hero con búsqueda por fecha de entrada, salida y cantidad de huéspedes. Enlace directo a habitaciones disponibles. |
| **Habitaciones** | Listado con filtros por fechas, precio y ubicación. Solo se muestran habitaciones **disponibles** para las fechas elegidas. Imágenes por habitación y por hotel. |
| **Reservar** | Formulario con alojamiento, habitación opcional, datos del huésped, fechas y total. Para confirmar es necesario **iniciar sesión o registrarse**. Tras confirmar, se muestra la información de pago (WhatsApp / transferencia / efectivo en el hotel). |
| **Galería** | Fotos de instalaciones y habitaciones, ordenables desde el panel. |
| **Contacto** | Formulario y datos de ubicación, teléfono y correo. |

Horarios de referencia: **entrada desde las 15:00 · salida hasta las 11:00** (Provincia de Buenos Aires).

---

## 🛠️ Para el hotel (panel de administración)

Acceso con usuario y contraseña en `/admin/login`. Incluye:

| Módulo | Qué podés hacer |
|--------|------------------|
| **Recepción (Inicio)** | Vista rápida: llegadas del día, salidas del día, huéspedes en casa. Accesos directos a reservas, habitaciones, limpieza y reportes. |
| **Reservas** | Listado completo, filtros (llegadas / salidas / en casa), editar reserva, **registrar entrada y salida**, ver folio. |
| **Huéspedes** | Lista de huéspedes y **ficha por reserva**: datos, habitación, estado, cargos y pagos. |
| **Estado de habitaciones** | Ver y marcar: disponible, ocupada, en limpieza, en mantenimiento. Marcar como “limpiada”. |
| **Personal de limpieza** | Asignar habitaciones por fecha y responsable. Estados: pendiente, en curso, hecho. |
| **Calendario** | Vista mensual de reservas. |
| **Folio** | Por reserva: cargos (habitación, minibar, desayuno, otros) y pagos (efectivo, tarjeta, transferencia). Saldo a pagar. |
| **Reportes** | Ocupación, ingresos y RevPAR por rango de fechas. |
| **Hoteles / Cabañas** | Alta, edición y listado de alojamientos (nombre, descripción, ubicación, imagen principal, precios). |
| **Habitaciones** | Alta y edición de habitaciones por hotel (nombre, descripción, capacidad, m², precio por noche). |
| **Imágenes** | Subir fotos por alojamiento y por habitación. Definir si cada imagen va a la **galería**, al **detalle del hotel** o a una **habitación concreta**. |
| **Amenidades** | Gestión de servicios (wifi, estacionamiento, etc.) y su asociación a cada hotel. |

---

## 📱 Ideal para compartir

- **Instagram / redes**: link al sitio en la bio o en historias.
- **Clientes o inversores**: una sola URL con sitio + panel para mostrar funcionalidad.
- **Portfolio**: proyecto completo con front público y PMS integrado.

---

## 🛠 Tecnologías

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router  
- **Backend y datos:** Supabase (PostgreSQL, autenticación, almacenamiento de imágenes)  
- **Despliegue:** compatible con Vercel, Netlify y similares  

---

## 📄 Resumen

| Aspecto | Detalle |
|---------|---------|
| **Nombre** | Hotel Escapada — Web de reservas y gestión |
| **Ubicación** | Provincia de Buenos Aires, Argentina |
| **Pago** | Coordinado por WhatsApp (transferencia) o efectivo/débito en el hotel |
| **Idioma** | Español (español latino) |
| **Dispositivos** | Diseño responsive (móvil, tablet, escritorio) |

---

*Proyecto desarrollado para la gestión y promoción de Hotel Escapada.*
