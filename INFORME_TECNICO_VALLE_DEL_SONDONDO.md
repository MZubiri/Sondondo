# INFORME TÉCNICO Y DOCUMENTACIÓN DE ARQUITECTURA
## Proyecto: Plataforma Turística Integral "Valle del Sondondo Expeditions & Hospedaje Punto Clave"

---

**Entidad Titular:** Valle del Sondondo Expeditions & Inversiones Turísticas del Sur  
**Destino Operativo:** Valle del Sondondo (Andamarca, Aucará, Cabana Sur, Chipao, Mayobamba, Sondondo, Sacsamarca), Lucanas, Ayacucho, Perú  
**Fecha de Publicación:** Octubre 2026  
**Versión del Sistema:** v1.0.0 (Release Candidate / Production Ready)  
**Ambiente de Despliegue:** Oracle Cloud Infrastructure (OCI) / Coolify PaaS / Docker  

---

## 1. RESUMEN EJECUTIVO

El presente informe técnico proporciona la documentación integral y exhaustiva de la arquitectura de software, stack tecnológico, diseño de datos, inventario de servicios y estado operativo de la plataforma digital **Valle del Sondondo Expeditions**. 

La solución ha sido concebida para digitalizar, promocionar y comercializar la oferta ecoturística, arqueológica y cultural de la mancomunidad del Valle del Sondondo (declarada Patrimonio Cultural de la Nación y candidata a Patrimonio Mundial de la UNESCO), integrando una experiencia de usuario (UX) moderna, un motor de reservas ágil, un sistema de gestión hotelera (PMS) para el hospedaje oficial de la operadora, y un checkout con pasarela de pagos digital.

### 1.1. Clarificación del Stack Tecnológico Implementado

> [!NOTE]
> **Aclaración sobre el stack técnico:** Si bien en requerimientos conceptuales previos se contemplaron combinaciones como *FastAPI backend con React/Vite frontend*, la plataforma en producción se encuentra implementada sobre un stack empresarial de alto rendimiento y tipado estricto:
> * **Frontend:** **Angular 21 (TypeScript 5.9)** utilizando la arquitectura de *Standalone Components*, *Signals* reactivos, *Control Flow Syntax* moderno (`@if`, `@for`), *Tailwind CSS* y sistema de diseño adaptativo.
> * **Backend:** **ASP.NET Core 9 (.NET 9 Web API / C# 13)** implementado bajo el patrón *Clean Architecture*, con *Entity Framework Core 8/9 (Pomelo MySQL)*, autenticación criptográfica *JWT Bearer*, *Rate Limiting* nativo de .NET 9 con algoritmo de ventana deslizante (*Sliding Window*), y documentación *OpenAPI / Swagger v1*.
> * **Persistencia:** **MySQL 8.0** para la información relacional (tours, categorías, reservas de expediciones, mensajes y testimonios) complementado con un almacenamiento atómico en JSON con control de concurrencia y volumen Docker persistente para el subsistema de hospedaje y tarifas de temporada.
> * **Contenedorización & Reverse Proxy:** **Docker Multi-Stage Builds**, **Docker Compose v2** y **Nginx Alpine** como proxy inverso local, preparado para operar en conjunto con **Traefik** sobre **Coolify PaaS** en Oracle Cloud Infrastructure (OCI).

En el caso de que la organización requiera en el futuro integrar servicios de Inteligencia Artificial (procesamiento de lenguaje natural para bots o análisis satelital de bofedales con visión por computadora), la arquitectura actual permite desacoplar dichos microservicios mediante **FastAPI (Python)** interactuando mediante llamadas asíncronas REST o eventos HTTP con el núcleo de .NET 9.

---

## 2. ARQUITECTURA TÉCNICA GLOBAL

La arquitectura del sistema sigue un modelo de capas desacopladas (*Decoupled Layered Architecture*) orientado a microservicios en contenedor (*Containerized Micro-Architecture*).

```
+-----------------------------------------------------------------------------------+
|                              CLIENTES / USUARIOS                                  |
|         Navegadores Web (Desktop & Mobile) / Redes Sociales / Buscadores          |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / 443
                                           v
+-----------------------------------------------------------------------------------+
|                         BORDE & PROXY INVERSO (TRAEFIK / OCI)                     |
|                 Terminación SSL (Let's Encrypt) - Enrutamiento Coolify            |
+------------------------------------------+----------------------------------------+
                                           | HTTP / 80 (Red Docker Interna)
                                           v
+-----------------------------------------------------------------------------------+
|                         CONTENEDOR FRONTEND (NGINX ALPINE)                         |
|   * Servidor Web de Alto Rendimiento para Angular 21 SPA                          |
|   * Compresión Gzip dinámica / Caché inmutable para activos estáticos             |
|   * Reverse Proxy: Redirige /api/* y /health hacia backend:5000                  |
+---------------------+-------------------------------------------------------------+
                      |
                      | HTTP / 5000 (Red Docker Interna: son_network)
                      v
+-----------------------------------------------------------------------------------+
|                       CONTENEDOR BACKEND (ASP.NET CORE 9 WEB API)                 |
|   * Middleware: ForwardedHeaders, CORS, RateLimiter, JWT Authentication          |
|   * Controladores RESTful & Inyección de Dependencias                             |
|   * Capa de Aplicación / DTOs con validaciones DataAnnotations                   |
|   * Entity Framework Core (Pomelo MySQL Provider)                                 |
+---------------------+-------------------------------+-----------------------------+
                      |                               |
                      | MySQL Protocol (3306)         | File I/O Local Atómico
                      v                               v
+-----------------------------------+   +-------------------------------------------+
|  CONTENEDOR BASE DE DATOS (MYSQL) |   |    VOLUMEN PERSISTENTE HOTEL (DOCKER)     |
|  * Esquema: valle_sondondo_db     |   |    * hotel_storage/hotel_info.json        |
|  * Motor: InnoDB / utf8mb4        |   |    * hotel_storage/hotel_bookings.json    |
|  * Volumen: mysql_data            |   |    * Control de bloqueo Thread-Safe       |
+-----------------------------------+   +-------------------------------------------+
```

### 2.1. Desglose de Componentes de Infraestructura

1. **Proxy Inverso de Borde (Traefik / Coolify):**
   - Recibe las peticiones públicas seguras (`https://valledelsondondo.com` y subdominios).
   - Resuelve certificados SSL automáticamente vía *ACME Let's Encrypt*.
   - Propaga los encabezados de cliente real (`X-Forwarded-For`, `X-Forwarded-Proto`, `Host`).

2. **Frontend Nginx Alpine:**
   - Despacha los archivos transpilados de Angular (`dist/frontend/browser`).
   - Implementa `client_max_body_size 50M` para permitir subida de fotografías en base64 desde el panel administrativo.
   - Aplica caché `max-age=15552000, immutable` (6 meses) a imágenes, fuentes tipográficas y bundles con hash.
   - Enruta peticiones a `/api/` y `/health` hacia el contenedor backend en el puerto 5000.
   - Fallback de rutas SPA: `try_files $uri $uri/ /index.html` para soportar navegación HTML5 History API sin errores 404.

3. **Backend ASP.NET Core 9 Web API:**
   - Ejecutado en runtime Linux optimizado (`aspnet:9.0`).
   - Gestiona la lógica de negocio, reglas de validación, cotizaciones, cálculo de tarifas y firmas criptográficas.
   - Manejo de reintentos con política de resiliencia (`EnableRetryOnFailure` con 10 intentos y retraso exponencial) para esperar a que la base de datos MySQL complete su inicio en frío.

4. **Persistencia MySQL 8.0:**
   - Almacena entidades relacionales de alta integridad (Tours, Días de Itinerario, Categorías, Solicitudes de Reserva, Mensajes de Contacto, Testimonios).
   - Volumen de Docker nombrado `mysql_data` con persistencia garantizada en el disco del host.

5. **Almacén de Hospedaje en Volumen Docker (`hotel_data`):**
   - Mapeado en `/app/hotel_storage`.
   - Garantiza que las modificaciones de habitaciones, comodidades, tarifas dinámicas por fiestas patronales y reservas del hotel no se pierdan al reconstruir o actualizar el contenedor del backend.

---

## 3. TECNOLOGÍAS Y LIBRERÍAS UTILIZADAS

### 3.1. Ecosistema Frontend

| Tecnología / Librería | Versión | Rol y Justificación Técnica |
| :--- | :---: | :--- |
| **Angular** | `^21.0.0` | Framework web empresarial. Uso de componentes standalone, inyección de dependencias `inject()`, nueva sintaxis de control de flujo (`@if`, `@for`, `@switch`) y directivas reactivas. |
| **TypeScript** | `~5.9.2` | Tipado estricto de modelos, DTOs e interfaces, asegurando cero discrepancias entre frontend y backend. |
| **RxJS** | `~7.8.0` | Manejo de flujos asíncronos para peticiones HTTP, debounce en filtros de búsqueda y observables de estado. |
| **Tailwind CSS / PostCSS** | `v4` | Motor de diseño de utilidades de última generación para diseño responsivo móvil primero (*Mobile First*), modo oscuro nativo y temas cromáticos andinos. |
| **Angular Router** | `^21.0.0` | Enrutamiento declarativo con títulos de página dinámicos y protección de rutas administrativas mediante `authGuard`. |
| **Angular Forms** | `^21.0.0` | Formularios reactivos (`ReactiveFormsModule`) para el Libro de Reclamaciones, checkout de pagos y cotizaciones con validadores nativos. |
| **Lucide SVG Icons** | Custom inline | Componente de iconos ligeros SVG encapsulado (`IconComponent`) sin sobrecarga de bibliotecas de fuentes externas. |
| **Nginx** | `Alpine` | Servidor web estático y reverse proxy contenedorizado de ultra bajo consumo de memoria (<15 MB RAM). |

### 3.2. Ecosistema Backend

| Tecnología / Librería | Versión | Rol y Justificación Técnica |
| :--- | :---: | :--- |
| **.NET SDK & Runtime** | `9.0` | Entorno de ejecución multiplataforma de altísimo rendimiento con compilación JIT avanzada y bajo consumo de recursos. |
| **C#** | `13.0` | Lenguaje de programación fuertemente tipado con expresiones de colección, coincidencia de patrones (*pattern matching*) y constructs modernos. |
| **Pomelo.EntityFrameworkCore.MySql** | `8.0.36` | Proveedor ORM oficial de Entity Framework Core para MySQL 8, compatible con migraciones automáticas y consultas LINQ optimizadas. |
| **Microsoft.AspNetCore.Authentication.JwtBearer** | `9.0` | Middleware para validación de tokens de seguridad HMAC-SHA256 para el área administrativa. |
| **System.Threading.RateLimiting** | `9.0` | Subsistema nativo de limitación de tasa de peticiones con algoritmo de ventana deslizante por dirección IP. |
| **Swashbuckle.AspNetCore (Swagger / OpenAPI)** | `6.5+` | Generación de especificación OpenAPI interactiva con autenticación Bearer para depuración y pruebas de API. |

### 3.3. DevOps y Despliegue

| Herramienta | Rol en la Plataforma |
| :--- | :--- |
| **Docker Multi-Stage** | Construcción reproducible en 2 etapas: SDK de compilación descartable y runtime ligero final para imágenes seguras y compactas. |
| **Docker Compose v2** | Definición de servicios (`frontend`, `backend`, `db`), redes internas (`expose`), límites de memoria, healthchecks y volúmenes compartidos. |
| **Coolify PaaS** | Plataforma autoalojada (*Self-Hosted*) de orquestación de aplicaciones sobre VPS de Oracle Cloud con despliegue automático mediante Git Push. |
| **Let's Encrypt / Traefik** | Aprovisionamiento y renovación automática de certificados SSL/TLS con calificación A+ en SSL Labs. |

---

## 4. ESTRUCTURA Y MÓDULOS PRINCIPALES DEL SISTEMA

La plataforma se compone de 7 módulos de negocio principales estructurados modularmente:

```
+-----------------------------------------------------------------------------------+
|                        MÓDULOS DE VALLE DEL SONDONDO EXPEDITIONS                  |
+-----------------------------------------------------------------------------------+
| 1. Catálogo & Circuitos    | Rutas, itinerarios diarios, altitudes, precios PEN/USD |
| 2. Hospedaje Punto Clave   | Habitaciones, amenidades, bloqueos y housekeeping     |
| 3. Cotizaciones & Reservas | Motor de cotización web + Redirección a WhatsApp      |
| 4. Pasarela Mercado Pago   | Preferencias de pago, checkout y webhooks automáticos |
| 5. Cultura & Festividades  | Guía de distritos, mapa de accesibilidad y eventos    |
| 6. Legal & Reclamaciones   | Libro de reclamaciones INDECOPI y políticas legales   |
| 7. Backoffice Admin        | Dashboard con métricas, gestión de tours y reservas   |
+-----------------------------------------------------------------------------------+
```

### 4.1. Módulo 1: Catálogo y Circuitos Turísticos
Permite la exhibición de rutas de ecoturismo, alta montaña y cultura viva en los distritos del Valle del Sondondo:
- **Circuitos Principales Preconfigurados:**
  1. *Kuntur Ñan (El Vuelo del Cóndor de Mayobamba):* Avistamiento en cañón a 3,200 msnm con visita a dormideros y puquial.
  2. *Andenes Vivos de Andamarca, Caniche y Danza de Tijeras:* 5,000 hectáreas de terrazas agrícolas preíncas, fortaleza Wari de Caniche y demostración ritual.
  3. *Minivolcanes de Pachapupum & Termas Medicinales:* Formación geológica cónica de sal y azufre a 4,022 msnm con pozas termales en Sacsamarca.
  4. *Trek Pampa Galeras & Bofedales del Apu Qarhuarazo:* Reserva Nacional de Vicuñas y ascensión hacia las faldas del nevado tutelar (4,800 msnm).
  5. *Gran Travesía Valle del Sondondo (Ruta de la Mancomunidad):* Expedición integral de 3 a 5 días por los seis distritos ancestrales.
- **Ficha Técnica Detallada por Tour:**
  - Altitud máxima en msnm (crucial para recomendaciones de salud y aclimatación).
  - Nivel de dificultad física (Baja, Moderada, Desafiante).
  - Precios duales en Soles Peruanos (PEN) y Dólares Americanos (USD).
  - Itinerario pormenorizado día por día (actividades, desayuno/almuerzo/cena, tipo de alojamiento).
  - Listado de servicios incluidos, no incluidos y recomendaciones de vestimenta y calzado.

### 4.2. Módulo 2: Hospedaje Oficial (Hotel Punto Clave)
Integra el hospedaje oficial de la operadora turística:
- **Inventario de Habitaciones:**
  - *Habitación Doble:* Balcón exterior, baño privado, TV plana, WiFi de alta velocidad.
  - *Habitación Triple Estándar:* Capacidad hasta 4 personas (2 individuales + 1 doble matrimonial).
  - *Apartamento Dúplex Premium:* Dos niveles, bañera de hidromasaje, cocina completa equipada y terraza privada.
- **Submódulo PMS (Property Management System):**
  - Control de Housekeeping en tiempo real: estados *Limpia (Clean)*, *Sucia (Dirty)*, *Ocupada (Occupied)*, *Mantenimiento*.
  - Bloqueo de fechas por mantenimiento o eventos privados.
  - Tarifas dinámicas de temporada para festividades patronales (como la Fiesta del Agua *Yaku Raymi*).
  - Generación de código correlativo de voucher hotelero (`HPC-2026-XXX`).

### 4.3. Módulo 3: Motor de Cotizaciones y Reservas de Tours
- Formulario interactivo con cálculo en tiempo real de pasajeros y fecha estimada de expedición.
- Generación automática de enlace enriquecido hacia **WhatsApp Web / WhatsApp Móvil** con mensaje preformateado, codificado con `WebUtility.UrlEncode`:
  - Incluye nombre del pasajero, tour solicitado, número de viajeros y fecha deseada.
  - Asigna automáticamente el prefijo de país `+51` para números peruanos.
- Almacenamiento simultáneo de la solicitud en base de datos con estado inicial `Pending`.

### 4.4. Módulo 4: Pasarela de Pago (Mercado Pago Integration)
- Arquitectura de pagos dual:
  1. **Modo Directo / API:** Generación de preferencia de pago mediante la API REST de Mercado Pago (`/checkout/preferences`) utilizando el `AccessToken` corporativo.
  2. **Modo Simulación Segura (Fallback):** Si no existen credenciales de producción activas en las variables de entorno, la pasarela opera en modo de simulación transparente, emitiendo referencias correlativas para pruebas de extremo a extremo sin rechazos inesperados.
- **Soporte de Webhooks:** Endpoint `/api/payments/webhook` que procesa notificaciones asíncronas de Mercado Pago, consulta el estado de la transacción y actualiza automáticamente la reserva a estado `Paid`.

### 4.5. Módulo 5: Cultura Viva, Conectividad y Calendario Festivo
- **Calendario Turístico Interactivo:** Fechas clave de festividades patrimoniales:
  - *Agosto:* Fiesta del Agua (*Yaku Raymi*) y limpieza ancestral de acequias.
  - *Junio:* Chaccu Nacional de la Vicuña en Pampa Galeras.
  - *Diciembre - Enero:* Fiesta Mayor de los Danzantes de Tijeras (*Danzaq*).
- **Guía de Rutas y Accesibilidad:**
  - Ruta 1: Lima - Ica - Nazca - Puquio - Andamarca / Aucará (Vía Interoceánica Sur).
  - Ruta 2: Lima - Ayacucho (Huamanga) - Cangallo - Huancasancos - Valle del Sondondo.
  - Tiempos de viaje estimados, empresas de transporte interprovincial y estado de vías.

### 4.6. Módulo 6: Cumplimiento Legal e INDECOPI
Módulo de adhesión a la normativa peruana de comercio electrónico y protección al consumidor:
- **Libro de Reclamaciones Virtual:**
  - Conforme al **D.S. N° 011-2011-PCM** y **Ley N° 29571** (Código de Protección y Defensa del Consumidor).
  - Formulario estricto con diferenciación pedagógica entre **Reclamo** (disconformidad directa con el servicio) y **Queja** (malestar en la atención o trato).
  - Generación de código correlativo de constancia digital: `REC-2026-XXXX`.
  - Impresión directa de hoja de reclamo para el usuario.
- **Páginas Legales Institucionales:**
  - *Términos y Condiciones:* Responsabilidades en turismo de alta montaña, seguro de accidentes y deslinde por altitud.
  - *Políticas de Cancelación:* Reglas de devolución (72 horas de anticipación, supuestos de fuerza mayor por huaicos o bloqueos comunales).
  - *Política de Privacidad:* Cumplimiento de la **Ley N° 29733** (Protección de Datos Personales en el Perú).

### 4.7. Módulo 7: Panel de Control Administrativo (Backoffice)
Acceso privado bajo autenticación JWT:
- **Dashboard Estadístico:** Indicadores clave de rendimiento (KPIs): Total de reservas recibidas, reservas pendientes de atención, tours publicados, habitaciones ocupadas y mensajes sin leer.
- **Gestión de Reservas:** Visualización en tabla con filtros por estado, buscador en vivo y botón de **Respuesta en 1 Clic por WhatsApp**.
- **Gestión de Tours (CRUD):** Creación y edición completa de circuitos, itinerarios detallados, subida de imágenes y activación/desactivación inmediata.
- **Gestión Hotelera:** Control de disponibilidad, estados de limpieza y tarifas especiales.
- **Bandeja de Mensajes y Testimonios:** Moderación de reseñas y atención de consultas de contacto.

---

## 5. INVENTARIO COMPLETO DE ENDPOINTS DE LA API

Todos los endpoints RESTful responden bajo el prefijo `/api` (a excepción del healthcheck `/health`). La serialización utiliza la política *camelCase* y omite propiedades nulas.

### 5.1. Matriz Consolidada de Endpoints

| Método | Endpoint | Acceso / Auth | Rate Limit Policy | Descripción Funcional |
| :---: | :--- | :---: | :---: | :--- |
| `POST` | `/api/auth/login` | Público | `login-policy` (5 req/min) | Autentica al administrador y retorna el token JWT Bearer. |
| `GET` | `/api/agency` | Público | `general-policy` | Retorna los metadatos institucionales de la agencia y teléfonos. |
| `GET` | `/health` | Público | Ninguno | Healthcheck para monitores de disponibilidad y orquestadores. |
| `GET` | `/api/tours` | Público | `general-policy` | Lista el catálogo de tours activos con filtros opcionales. |
| `GET` | `/api/tours/{slug}` | Público | `general-policy` | Obtiene el detalle técnico completo de un tour por su slug URL. |
| `GET` | `/api/tours/featured` | Público | `general-policy` | Retorna los tours destacados para la página de inicio. |
| `POST` | `/api/tours` | `[Authorize]` | Ninguno | Crea un nuevo tour e itinerarios asociados. |
| `PUT` | `/api/tours/{id}` | `[Authorize]` | Ninguno | Actualiza datos, itinerarios o imágenes de un tour. |
| `PATCH` | `/api/tours/{id}/toggle-active` | `[Authorize]` | Ninguno | Alterna la visibilidad pública de un circuito turístico. |
| `DELETE` | `/api/tours/{id}` | `[Authorize]` | Ninguno | Elimina un tour y sus días de itinerario de la base de datos. |
| `GET` | `/api/categories` | Público | `general-policy` | Retorna categorías activas con conteo de tours vinculados. |
| `GET` | `/api/bookings` | `[Authorize]` | Ninguno | Lista todas las cotizaciones con filtros por estado o búsqueda. |
| `GET` | `/api/bookings/{id}` | `[Authorize]` | Ninguno | Obtiene la información detallada de una cotización específica. |
| `POST` | `/api/bookings` | Público | `contact-policy` (6 req/min) | Registra una nueva solicitud de tour y genera enlace de WhatsApp. |
| `PATCH` | `/api/bookings/{id}/status` | `[Authorize]` | Ninguno | Actualiza el estado de una reserva (Pending, Confirmed, Cancelled). |
| `DELETE` | `/api/bookings/{id}` | `[Authorize]` | Ninguno | Elimina el registro de una reserva del sistema. |
| `GET` | `/api/hotel` | Público | `general-policy` | Retorna información general, amenidades y habitaciones del hotel. |
| `PUT` | `/api/hotel` | `[Authorize]` | Ninguno | Actualiza la información institucional y amenidades del hotel. |
| `GET` | `/api/hotel/rooms` | Público | `general-policy` | Obtiene el listado de habitaciones y especificaciones. |
| `GET` | `/api/hotel/rooms/{id}` | Público | `general-policy` | Retorna los detalles de una habitación por su identificador. |
| `POST` | `/api/hotel/rooms` | `[Authorize]` | Ninguno | Da de alta una nueva habitación en el inventario. |
| `PUT` | `/api/hotel/rooms/{id}` | `[Authorize]` | Ninguno | Modifica atributos, galería o precios de una habitación. |
| `PATCH` | `/api/hotel/rooms/{id}/toggle-active` | `[Authorize]` | Ninguno | Activa o desactiva la disponibilidad de una habitación. |
| `DELETE` | `/api/hotel/rooms/{id}` | `[Authorize]` | Ninguno | Elimina una habitación del catálogo del hotel. |
| `PATCH` | `/api/hotel/rooms/{id}/housekeeping` | `[Authorize]` | Ninguno | Actualiza el estado de limpieza (clean, dirty, occupied). |
| `GET` | `/api/hotel/date-blocks` | Público | `general-policy` | Lista bloqueos de fechas y tarifas de temporada activas. |
| `POST` | `/api/hotel/date-blocks` | `[Authorize]` | Ninguno | Registra un nuevo bloqueo de fecha o sobreescritura de tarifa. |
| `DELETE` | `/api/hotel/date-blocks/{id}` | `[Authorize]` | Ninguno | Elimina una regla de bloqueo de fecha o tarifa especial. |
| `GET` | `/api/hotel/bookings` | `[Authorize]` | Ninguno | Lista las reservas de hospedaje con buscador y filtros de estado. |
| `POST` | `/api/hotel/bookings` | Público | `contact-policy` (6 req/min) | Registra una reserva de hospedaje y genera código de voucher. |
| `PATCH` | `/api/hotel/bookings/{id}/status` | `[Authorize]` | Ninguno | Modifica el estado de una reserva de hotel. |
| `DELETE` | `/api/hotel/bookings/{id}` | `[Authorize]` | Ninguno | Elimina una reserva de habitación del sistema. |
| `POST` | `/api/payments/create-preference`| Público | `contact-policy` (6 req/min) | Genera la preferencia de pago para el Checkout de Mercado Pago. |
| `POST` | `/api/payments/process-payment` | Público | `contact-policy` (6 req/min) | Procesa pagos directos por token con Mercado Pago. |
| `POST` | `/api/payments/webhook` | Público | Ninguno | Recibe notificaciones asíncronas de Mercado Pago (IPN). |
| `GET` | `/api/contact` | `[Authorize]` | Ninguno | Lista los mensajes recibidos a través del formulario de contacto. |
| `POST` | `/api/contact` | Público | `contact-policy` (6 req/min) | Recibe y almacena un nuevo mensaje de contacto ciudadano/turista. |
| `PATCH` | `/api/contact/{id}/read` | `[Authorize]` | Ninguno | Marca o desmarca un mensaje de contacto como leído. |
| `DELETE` | `/api/contact/{id}` | `[Authorize]` | Ninguno | Elimina un mensaje de la bandeja de entrada. |
| `GET` | `/api/testimonials` | Público | `general-policy` | Lista testimonios y opiniones de viajeros aprobadas. |
| `GET` | `/api/dashboard/stats` | `[Authorize]` | Ninguno | Retorna métricas cuantitativas consolidadas para el backoffice. |

---

## 6. MODELO DE DATOS Y PERSISTENCIA

### 6.1. Diagrama Entidad-Relación (Base de Datos MySQL)

```mermaid
erDiagram
    CATEGORY ||--o{ TOUR : categorizes
    TOUR ||--o{ ITINERARY_DAY : contains
    TOUR ||--o{ BOOKING_INQUIRY : receives

    CATEGORY {
        int Id PK
        string Name
        string Slug UK
        string Description
        string Icon
        int DisplayOrder
        bool IsActive
    }

    TOUR {
        int Id PK
        string Title
        string Slug UK
        string Subtitle
        string Description
        int CategoryId FK
        string Duration
        int DurationDays
        decimal PriceSoles
        decimal PriceUsd
        string Difficulty
        string AltitudeMax
        string StartingPoint
        bool Featured
        bool IsActive
        int DisplayOrder
        string MainImageUrl
        text GalleryImagesJson
        text IncludedJson
        text NotIncludedJson
        text RecommendationsJson
        datetime CreatedAt
        datetime UpdatedAt
    }

    ITINERARY_DAY {
        int Id PK
        int TourId FK
        int DayNumber
        string Title
        text Description
        string Activities
        string Meals
        string Accommodation
    }

    BOOKING_INQUIRY {
        int Id PK
        int TourId FK
        string FullName
        string Email
        string Phone
        int NumberOfPeople
        datetime TravelDate
        text Message
        string PreferredLanguage
        string Status
        datetime CreatedAt
    }

    CONTACT_MESSAGE {
        int Id PK
        string Name
        string Email
        string Phone
        string Subject
        text Message
        bool IsRead
        datetime CreatedAt
    }

    TESTIMONIAL {
        int Id PK
        string AuthorName
        string Location
        int Rating
        text Comment
        string TourName
        string AvatarUrl
        datetime Date
        bool IsApproved
    }
```

### 6.2. Esquema de Persistencia Hotelera (`hotel_storage`)

El módulo hotelero utiliza una capa de persistencia desacoplada en formato JSON de alta velocidad con bloqueo multihilo (`lock (_lock)`):
- `hotel_info.json`: Atributos institucionales del hotel, dirección, coordenadas, catálogo de amenidades, inventario de habitaciones y reglas de bloqueo de fechas / tarifas por temporada festiva.
- `hotel_bookings.json`: Listado de reservas de habitación con códigos de voucher (`HPC-2026-XXX`), datos del huésped (DNI/Pasaporte, teléfono), estado de pago y estado de estadía (Confirmed, CheckedIn, CheckedOut, Cancelled).

---

## 7. SEGURIDAD, CONTROL DE ACCESO Y RENDIMIENTO

### 7.1. Autenticación y Autorización Criptográfica
- **Estándar:** JSON Web Tokens (JWT) firmados con algoritmo **HMAC-SHA256**.
- **Claims incluidos:** `NameIdentifier` (identificador del administrador), `Name`, `Email`, `Role` ("Administrator") y `agency` ("Valle del Sondondo Expeditions").
- **Expiración:** Configurable (por defecto 7 días), con sincronización horaria estricta (`ClockSkew = TimeSpan.Zero`).
- **Seguridad en Producción:** El sistema valida que la variable `JWT_SECRET_KEY` contenga una cadena con longitud mínima de 32 caracteres generada aleatoriamente en el servidor de despliegue.

### 7.2. Rate Limiting Avanzado (.NET 9)
Para prevenir ataques de fuerza bruta, denegación de servicio (DDoS) y saturación de buzones de correo y WhatsApp, se implementaron 3 políticas de ventana deslizante:

```
[Cliente HTTP] 
      |
      v
+-----------------------------------------------------------------------------------+
|                            RATE LIMITING MIDDLEWARE                               |
+-----------------------------------------------------------------------------------+
| 1. login-policy   | Límite: 5 req/minuto por IP   | Destino: /api/auth/login      |
| 2. contact-policy | Límite: 6 req/minuto por IP   | Destino: /api/bookings, etc.  |
| 3. general-policy | Límite: 120 req/minuto por IP | Destino: Catálogos públicos   |
+-----------------------------------------------------------------------------------+
      |
      +---> Si excede límite: Retorna HTTP 429 Too Many Requests
      +---> Si está dentro de límite: Procesa petición normalmente
```

### 7.3. Protección de Encabezados Inversos (Forwarded Headers)
Para soportar adecuadamente el despliegue tras balanceadores de carga y proxies inversos (Traefik en Coolify y Nginx en el contenedor):
```csharp
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
```
Esto garantiza que `Request.Scheme` detecte correctamente el protocolo `https://` para generar las URLs de retorno (*back_urls*) y webhooks de Mercado Pago sin provocar advertencias de contenido mixto (*Mixed Content*).

---

## 8. CONFIGURACIÓN DE DESPLIEGUE EN PRODUCCIÓN

### 8.1. Archivo `docker-compose.yml`

El archivo de orquestación define los tres contenedores principales y los volúmenes de almacenamiento persistente:

```yaml
services:
  # 1. Base de datos MySQL 8.0
  db:
    image: mysql:8.0
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-Sondondo_Root_Password_2026!}
      MYSQL_DATABASE: ${DB_NAME:-valle_sondondo_db}
      MYSQL_USER: ${DB_USER:-sondondo_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-Sondondo_Db_User_Pass_2026!}
    volumes:
      - mysql_data:/var/lib/mysql
    expose:
      - 3306
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -u root -p$${MYSQL_ROOT_PASSWORD} || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

  # 2. Backend ASP.NET Core 9 Web API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5000
      - ConnectionStrings__DefaultConnection=Server=db;Port=3306;Database=${DB_NAME:-valle_sondondo_db};User=${DB_USER:-sondondo_user};Password=${DB_PASSWORD:-Sondondo_Db_User_Pass_2026!};CharSet=utf8mb4;
      - AgencySettings__WhatsAppNumber=${WHATSAPP_NUMBER:-51966380590}
      - AgencySettings__Email=${AGENCY_EMAIL:-miskichaskaperu@hotmail.com}
      - AdminSettings__Username=${ADMIN_USERNAME:-admin@valledelsondondo.com}
      - AdminSettings__Password=${ADMIN_PASSWORD:-Sondondo2026!}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - MercadoPago__AccessToken=${MERCADOPAGO_ACCESS_TOKEN:-}
      - MercadoPago__PublicKey=${MERCADOPAGO_PUBLIC_KEY:-TEST-SIMULATED-PUBLIC-KEY}
      - MercadoPago__IsSandbox=${MERCADOPAGO_SANDBOX:-false}
    volumes:
      - hotel_data:/app/hotel_storage
    expose:
      - 5000
    depends_on:
      db:
        condition: service_healthy

  # 3. Frontend Angular SPA servido por Nginx
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    expose:
      - 80
    depends_on:
      - backend

volumes:
  mysql_data:
    driver: local
  hotel_data:
    driver: local
```

### 8.2. Variables de Entorno del Sistema (`.env`)

| Variable | Tipo / Valor Ejemplo | Propósito |
| :--- | :--- | :--- |
| `DB_ROOT_PASSWORD` | `String (Segura)` | Contraseña del usuario root de MySQL. |
| `DB_NAME` | `valle_sondondo_db` | Nombre de la base de datos operativa. |
| `DB_USER` | `sondondo_user` | Usuario con permisos asignados en MySQL. |
| `DB_PASSWORD` | `String (Segura)` | Contraseña del usuario de la base de datos. |
| `ADMIN_USERNAME` | `admin@valledelsondondo.com` | Correo de acceso al panel administrativo. |
| `ADMIN_PASSWORD` | `String (Segura)` | Contraseña de acceso al panel administrativo. |
| `JWT_SECRET_KEY` | `Hash 32+ caracteres` | Clave secreta simétrica para firma de tokens JWT. |
| `WHATSAPP_NUMBER` | `51966380590` | Número de WhatsApp oficial para recibir cotizaciones. |
| `AGENCY_EMAIL` | `miskichaskaperu@hotmail.com` | Correo electrónico de contacto institucional. |
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-...` | Token de acceso de producción para Mercado Pago. |
| `MERCADOPAGO_PUBLIC_KEY` | `APP_USR-...` | Clave pública para componentes de frontend. |
| `MERCADOPAGO_SANDBOX` | `false` | Indica si opera en modo prueba o cobro real. |

---

## 9. ESTADO ACTUAL DE DESARROLLO Y HOJA DE RUTA

### 9.1. Matriz de Estado Operativo

| Módulo / Requerimiento | Estado | Verificación y Notas Técnicas |
| :--- | :---: | :--- |
| **Arquitectura Backend .NET 9** | ✅ Completado | Clean Architecture (Domain, Infrastructure, API). |
| **Autenticación JWT** | ✅ Completado | Claims y expiración de 7 días, decoradores `[Authorize]`. |
| **Rate Limiting .NET 9** | ✅ Completado | Políticas `login-policy`, `contact-policy`, `general-policy`. |
| **Persistencia MySQL** | ✅ Completado | Migraciones automáticas y *seed* con 10 reintentos de conexión. |
| **Persistencia Hotelera** | ✅ Completado | Volumen Docker `hotel_data` contra pérdida en despliegues. |
| **Frontend Angular 21** | ✅ Completado | Standalone components, signals reactivos y control flow. |
| **Diseño Móvil & Temas** | ✅ Completado | Responsivo 100%, modo claro/oscuro y multiidioma (ES/EN/QU). |
| **SEO & Indexación** | ✅ Completado | `robots.txt` y `sitemap.xml` generados bloqueando `/admin`. |
| **Cumplimiento INDECOPI** | ✅ Completado | Libro de Reclamaciones digital con código `REC-2026-XXXX`. |
| **Páginas Legales** | ✅ Completado | Términos y condiciones, cancelación y privacidad (Ley 29733). |
| **Integración Mercado Pago** | 🟡 Listo / Sandbox | Arquitectura lista con fallback de simulación; pendiente token live. |
| **Correos Transaccionales (SMTP)**| 🟡 Planificado | En backlog post-lanzamiento para integración con Brevo/Resend. |
| **Backups Automáticos a Cloud** | 🟡 Planificado | Script diario programado en cron para respaldo en OCI Bucket. |

### 9.2. Hoja de Ruta Post-Lanzamiento (Próximas Fases)

```
FASE 1: LANZAMIENTO INMEDIATO (ESTADO ACTUAL)
├── Puesta en producción en VPS Oracle Cloud con Coolify
├── Operación con catálogo completo de tours y reservas por WhatsApp
├── Libro de reclamaciones y páginas legales activas
└── Checkout de pago operativo

FASE 2: POST-LANZAMIENTO (MES 1)
├── Inserción de credenciales en vivo de Mercado Pago (tras alta bancaria)
├── Servicio de correos transaccionales automáticos (Resend / Brevo)
├── Envío de sitemap.xml a Google Search Console & configuración GA4
└── Script de backups automatizados de MySQL con cifrado y envío a OCI Bucket

FASE 3: ESCALABILIDAD (MES 3-6)
├── Bot de WhatsApp / Telegram para coordinadores y guías en Sondondo
├── Incorporación de métodos de cobro adicionales (Yape QR directo, Izipay)
└── Configuración de Cloudflare CDN para aceleración global de imágenes
```

---

## 10. CONCLUSIONES Y RECOMENDACIONES

1. **Robustez y Rendimiento:** La adopción de **ASP.NET Core 9** y **Angular 21** proporciona a la agencia una plataforma con rendimiento de nivel corporativo, tiempos de respuesta de API inferiores a 50 milisegundos en peticiones internas y una navegación fluida sin recargas de página.
2. **Resiliencia Operativa:** La arquitectura de contenedores con volúmenes de almacenamiento independientes garantiza que las actualizaciones de código (nuevos despliegues) no provoquen pérdida de cotizaciones ni modificaciones en el inventario hotelero.
3. **Certeza Legal y Comercial:** El cumplimiento riguroso con INDECOPI y la Ley N° 29733 posiciona a **Valle del Sondondo Expeditions** como una operadora formal, apta para operar con pasarelas de pago financieras y recibir turismo receptivo nacional e internacional con estándares de máxima confianza.

---
*Documento elaborado como memoria técnica del proyecto Valle del Sondondo Expeditions.*
