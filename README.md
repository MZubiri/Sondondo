# 🏔️ Valle del Sondondo Expeditions & Hospedaje Punto Clave

Plataforma digital integral para la promoción, comercialización y gestión operativa del turismo vivencial, ecoturismo y hotelería en la mancomunidad del **Valle del Sondondo** (Andamarca, Aucará, Cabana Sur, Chipao, Mayobamba, Sondondo y Sacsamarca), Provincia de Lucanas, Ayacucho, Perú.

[![Angular](https://img.shields.io/badge/Frontend-Angular%2021-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![ASP.NET Core 9](https://img.shields.io/badge/Backend-.NET%209%20Web%20API-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com)
[![MySQL 8.0](https://img.shields.io/badge/Database-MySQL%208.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%20CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#licencia)

---

## 📑 Índice

1. [Descripción General](#-descripción-general)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Módulos Principales](#-módulos-principales)
5. [Estructura del Proyecto](#-estructura-del-proyecto)
6. [Instalación y Ejecución Local](#-instalación-y-ejecución-local)
7. [Variables de Entorno](#-variables-de-entorno)
8. [API REST y Endpoints](#-api-rest-y-endpoints)
9. [Despliegue en Producción](#-despliegue-en-producción)
10. [Documentación Técnica e Informes](#-documentación-técnica-e-informes)

---

## 🌄 Descripción General

El Valle del Sondondo es un territorio ancestral declarado **Patrimonio Cultural de la Nación** y postulado a **Patrimonio Mundial de la UNESCO**, caracterizado por más de 5,000 hectáreas de andenes preíncas en uso continuo, el nevado tutelar Apu Qarhuarazo (5,112 msnm), los cañones de avistamiento del Cóndor Andino en Mayobamba y la cuna de los Danzantes de Tijeras (*Danzaq*).

Esta plataforma digital resuelve la visibilidad turística y la comercialización directa para la operadora **Valle del Sondondo Expeditions & Hospedaje Punto Clave**, ofreciendo:
- Catálogo interactivo de expediciones y trekking con fichas técnicas de altitud y dificultad.
- Motor de reservas directas conectado con WhatsApp API y pasarela de pago.
- Sistema de Gestión Hotelera (PMS) para el hospedaje oficial de la operadora.
- Módulo legal y Libro de Reclamaciones conforme a la normativa peruana (INDECOPI / Ley N° 29571).
- Panel de control administrativo protegido con JWT para la gestión en tiempo real de itinerarios, reservas y tarifas.

---

## 🏗️ Arquitectura del Sistema

La solución adopta una **Clean Architecture** desacoplada y contenedorizada con Docker:

```text
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

---

## 💻 Stack Tecnológico

### Frontend
- **Framework:** Angular 21 (Standalone Components, Signals reactivos, nueva sintaxis `@if` / `@for`).
- **Lenguaje:** TypeScript 5.9.
- **Estilos:** Tailwind CSS v4 + PostCSS, diseño *Mobile-First* y modo oscuro nativo.
- **Enrutamiento:** Angular Router con protección de rutas administrativas mediante `authGuard`.
- **Formularios:** Reactive Forms con validaciones estrictas para cotizaciones y reclamos.
- **Servidor Web:** Nginx Alpine optimizado para SPA con compresión Gzip y proxy pass a la API.

### Backend
- **Framework:** ASP.NET Core 9 Web API (.NET 9).
- **Lenguaje:** C# 13.
- **ORM:** Entity Framework Core con Pomelo MySQL Provider.
- **Seguridad:** Autenticación JWT Bearer con HMAC-SHA256 y políticas de autorización por roles.
- **Rate Limiting:** Subsistema nativo de ventana deslizante (`login-policy`, `contact-policy`, `general-policy`).
- **Documentación API:** Swagger / OpenAPI interactivo con soporte para tokens Bearer.

### Base de Datos y Persistencia
- **RDBMS:** MySQL 8.0 (InnoDB, codificación `utf8mb4`).
- **Persistencia Hotelera:** Almacén desacoplado en JSON con volumen Docker (`hotel_data`) y bloqueo de concurrencia seguro multihilo (`lock`).

### DevOps e Infraestructura
- **Contenedores:** Docker Multi-stage Builds & Docker Compose v2.
- **PaaS:** Coolify sobre VPS en Oracle Cloud Infrastructure (OCI).
- **Certificados SSL:** Traefik con Let's Encrypt automatizado.

---

## 📦 Módulos Principales

1. **Catálogo & Circuitos Turísticos:**
   - Rutas emblemáticas: *Kuntur Ñan* (Cañón de Mayobamba), *Andenes Vivos de Andamarca*, *Minivolcanes de Pachapupum*, *Trek Apu Qarhuarazo*, *Gran Travesía Sondondo*.
   - Ficha técnica completa por tour: altitud máxima, dificultad, itinerario diario configurable, precios PEN/USD, incluidos/no incluidos y recomendaciones de vestimenta.
2. **Hospedaje Oficial (Punto Clave):**
   - Catálogo de habitaciones (Doble, Triple Estándar, Dúplex Premium).
   - Sistema PMS: control de estados de limpieza (clean, dirty, occupied), bloqueo de fechas y tarifas de temporada festiva.
   - Generación de vouchers con correlativo `HPC-2026-XXX`.
3. **Motor de Cotizaciones & Reservas:**
   - Cálculo en tiempo real de pasajeros y generación automática de enlace enriquecido a WhatsApp con codificación segura (`WebUtility.UrlEncode`).
4. **Pasarela de Pagos (Mercado Pago):**
   - Creación de preferencias de pago vía API y modo de simulación segura de respaldo.
   - Soporte de webhooks (`/api/payments/webhook`) para actualización asíncrona de estados.
5. **Cultura Viva & Calendario Festivo:**
   - Información de festividades (Yaku Raymi en agosto, Danza de Tijeras en diciembre/enero, Chaccu de Vicuñas en junio).
   - Rutas de acceso terrestre desde Lima vía Puquio o Huamanga.
6. **Cumplimiento Legal INDECOPI:**
   - Libro de Reclamaciones virtual conforme a la Ley N° 29571 y D.S. N° 011-2011-PCM.
   - Código correlativo de constancia `REC-2026-XXXX` e impresión de hoja de reclamación.
   - Términos y condiciones para turismo de alta montaña y política de privacidad (Ley N° 29733).
7. **Backoffice Administrativo:**
   - Dashboard con métricas clave (tours, reservas, habitaciones, mensajes no leídos).
   - CRUD completo de expediciones, itinerarios día por día, disponibilidad hotelera y testimonios.

---

## 📁 Estructura del Proyecto

```text
valledelsondondoexpeditions/
├── backend/                        # Código fuente del backend ASP.NET Core 9
│   ├── Controllers/               # Controladores RESTful (Auth, Tours, Hotel, Bookings, etc.)
│   ├── Data/                      # Contexto DbContext de EF Core, migraciones y seeders
│   ├── Models/                    # Entidades del dominio (Tour, Category, Booking, etc.)
│   ├── Services/                  # Servicios de aplicación y persistencia hotelera
│   ├── DTOs/                      # Data Transfer Objects para requests y responses
│   ├── Dockerfile                 # Construcción multi-stage de .NET 9
│   └── Program.cs                 # Configuración de pipeline, middleware y DI
├── frontend/                       # Código fuente del frontend Angular 21
│   ├── src/
│   │   ├── app/                   # Componentes standalone, páginas, servicios y modelos
│   │   │   ├── pages/             # Vistas públicas y panel administrativo
│   │   │   ├── components/        # Componentes UI reutilizables (Navbar, Footer, Modal, etc.)
│   │   │   ├── services/          # Clientes HTTP hacia la API REST
│   │   │   └── models/            # Interfaces TypeScript tipadas
│   │   ├── assets/                # Imágenes optimizadas, banners y logotipos
│   │   └── environments/          # Configuración de URLs de API para dev y prod
│   ├── nginx.conf                 # Configuración de Nginx para SPA y reverse proxy
│   └── Dockerfile                 # Construcción multi-stage de Angular + Nginx
├── docker-compose.yml              # Orquestación de contenedores (frontend, backend, db)
├── .env.example                    # Plantilla documentada de variables de entorno
├── COOLIFY_DEPLOYMENT.md           # Guía paso a paso de despliegue en Coolify / OCI
├── INFORME_TECNICO_VALLE_DEL_SONDONDO.md  # Informe técnico exhaustivo de arquitectura
├── INFORME_TECNICO_VALLE_DEL_SONDONDO.pdf # Versión ejecutiva en PDF para stakeholders
└── generate_pdf_report.py          # Script generador de la versión PDF del informe
```

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- [Docker](https://www.docker.com/) y Docker Compose v2 instalados.
- *(Opcional para desarrollo local sin Docker)*: .NET 9 SDK, Node.js 20+ y servidor MySQL 8.0.

### Método 1: Ejecución con Docker Compose (Recomendado)

1. Clonar el repositorio y acceder al directorio:
   ```bash
   git clone https://github.com/tu-organizacion/valledelsondondoexpeditions.git
   cd valledelsondondoexpeditions
   ```

2. Crear el archivo `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```

3. Levantar los servicios:
   ```bash
   docker compose up -d --build
   ```

4. Acceder a la plataforma:
   - **Frontend:** [http://localhost:80](http://localhost:80)
   - **Backend API & Swagger:** [http://localhost:5000/swagger](http://localhost:5000/swagger)
   - **Healthcheck:** [http://localhost:5000/health](http://localhost:5000/health)

### Método 2: Ejecución para Desarrollo

#### 1. Backend (.NET 9)
```bash
cd backend
dotnet restore
dotnet run
```
*El backend escuchará en `http://localhost:5000` con Swagger habilitado en desarrollo.*

#### 2. Frontend (Angular 21)
```bash
cd frontend
npm install
npm start
```
*El frontend se iniciará en `http://localhost:4200` con proxy automático hacia el backend.*

---

## 🔑 Variables de Entorno

Configuradas a través del archivo `.env`:

| Variable | Descripción | Valor por Defecto / Ejemplo |
| :--- | :--- | :--- |
| `DB_ROOT_PASSWORD` | Contraseña root de la base de datos MySQL | `Sondondo_Root_Password_2026!` |
| `DB_NAME` | Nombre de la base de datos operativa | `valle_sondondo_db` |
| `DB_USER` | Usuario asignado de la base de datos | `sondondo_user` |
| `DB_PASSWORD` | Contraseña del usuario de la base de datos | `Sondondo_Db_User_Pass_2026!` |
| `ADMIN_USERNAME` | Correo de acceso al panel administrativo | `admin@valledelsondondo.com` |
| `ADMIN_PASSWORD` | Contraseña del panel administrativo | `Sondondo2026!` |
| `JWT_SECRET_KEY` | Clave criptográfica para firmas JWT (min 32 chars) | *(Cadena aleatoria segura)* |
| `WHATSAPP_NUMBER` | Número de WhatsApp oficial para cotizaciones | `51966380590` |
| `AGENCY_EMAIL` | Correo corporativo de la agencia | `miskichaskaperu@hotmail.com` |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token de producción de Mercado Pago | `APP_USR-...` |
| `MERCADOPAGO_PUBLIC_KEY` | Public Key para el Checkout | `APP_USR-...` |
| `MERCADOPAGO_SANDBOX` | Booleano para activar modo sandbox | `false` |

---

## 📡 API REST y Endpoints

La API cuenta con endpoints protegidos y públicos bajo la ruta `/api`:

| Categoría | Endpoints Principales | Autenticación |
| :--- | :--- | :---: |
| **Autenticación** | `POST /api/auth/login` | Pública |
| **Circuitos Turísticos**| `GET /api/tours`, `GET /api/tours/{slug}`, `POST /api/tours`, `PUT /api/tours/{id}` | Pública / Admin |
| **Cotizaciones** | `GET /api/bookings`, `POST /api/bookings`, `PATCH /api/bookings/{id}/status` | Pública / Admin |
| **Hospedaje Punto Clave**| `GET /api/hotel`, `GET /api/hotel/rooms`, `POST /api/hotel/rooms`, `PATCH .../housekeeping` | Pública / Admin |
| **Pasarela de Pagos** | `POST /api/payments/create-preference`, `POST /api/payments/webhook` | Pública |
| **Contacto & Reclamos** | `POST /api/contact`, `GET /api/contact`, `POST /api/claims` | Pública / Admin |
| **Backoffice Métricas** | `GET /api/dashboard/stats` | Admin (JWT) |

---

## 🌐 Despliegue en Producción

La plataforma está preparada para desplegarse mediante **Coolify PaaS** en una máquina virtual de **Oracle Cloud Infrastructure (OCI)**:

1. Conectar el repositorio de GitHub en Coolify como un nuevo proyecto basado en `docker-compose`.
2. Asignar las variables de entorno de producción desde el dashboard de Coolify.
3. Asignar el dominio corporativo (`valledelsondondo.com`).
4. Coolify aprovisiona automáticamente certificados SSL vía Traefik y despliega los tres contenedores.

Consulta la guía detallada en [COOLIFY_DEPLOYMENT.md](COOLIFY_DEPLOYMENT.md).

---

## 📚 Documentación Técnica e Informes

Para una revisión en profundidad de los diagramas, decisiones de diseño, modelo de entidades y plan de escalabilidad:
- 📄 **Informe Técnico Completo (Markdown):** [INFORME_TECNICO_VALLE_DEL_SONDONDO.md](INFORME_TECNICO_VALLE_DEL_SONDONDO.md)
- 📑 **Informe Técnico Ejecutivo (PDF de alta calidad):** [INFORME_TECNICO_VALLE_DEL_SONDONDO.pdf](INFORME_TECNICO_VALLE_DEL_SONDONDO.pdf)
- 📋 **Plan de Trabajo hacia Producción:** [PLAN_DE_TRABAJO_PRODUCCION.md](PLAN_DE_TRABAJO_PRODUCCION.md)
- 📌 **Backlog Post-Lanzamiento:** [BACKLOG_POST_LANZAMIENTO.md](BACKLOG_POST_LANZAMIENTO.md)

---

## 📄 Licencia

© 2026 Valle del Sondondo Expeditions & Inversiones Turísticas del Sur. Todos los derechos reservados.
