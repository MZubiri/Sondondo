import subprocess
import os

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe Técnico - Valle del Sondondo Expeditions</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 20mm 16mm;
    @bottom-right {
      content: counter(page);
      font-size: 9pt;
      color: #64748b;
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }

  /* Cover Page */
  .cover {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 90vh;
    padding: 40px 20px 20px 20px;
    box-sizing: border-box;
  }

  .cover-header {
    border-left: 6px solid #0f766e;
    padding-left: 20px;
  }

  .cover-tag {
    font-size: 11pt;
    font-weight: 700;
    color: #0f766e;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
  }

  .cover-title {
    font-size: 26pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.15;
    margin: 0 0 12px 0;
  }

  .cover-subtitle {
    font-size: 13pt;
    color: #475569;
    font-weight: 400;
    margin: 0;
  }

  .cover-hero-card {
    background: linear-gradient(135deg, #042f2e 0%, #115e59 100%);
    color: white;
    padding: 26px;
    border-radius: 12px;
    margin: 40px 0;
    box-shadow: 0 10px 25px -5px rgba(15, 118, 110, 0.3);
  }

  .cover-hero-card h3 {
    margin-top: 0;
    font-size: 14pt;
    color: #5eead4;
  }

  .cover-hero-card p {
    margin-bottom: 0;
    color: #ccfbf1;
    font-size: 10.5pt;
    line-height: 1.6;
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 18px;
  }

  .cover-meta-item strong {
    display: block;
    font-size: 8.5pt;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cover-meta-item span {
    font-size: 10pt;
    font-weight: 600;
    color: #0f172a;
  }

  /* Headings */
  h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2px solid #0f766e;
    padding-bottom: 6px;
    margin-top: 28px;
    margin-bottom: 14px;
    page-break-after: avoid;
  }

  h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #0f766e;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }

  h3 {
    font-size: 11pt;
    font-weight: 600;
    color: #1e293b;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 10px 0;
  }

  /* Callouts */
  .callout {
    background-color: #f0fdfa;
    border-left: 4px solid #0f766e;
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    margin: 14px 0;
    font-size: 9.5pt;
  }

  .callout strong {
    color: #0f766e;
  }

  .callout-warning {
    background-color: #fffbeb;
    border-left-color: #d97706;
  }

  .callout-warning strong {
    color: #b45309;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 18px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }

  th {
    background: #0f766e;
    color: white;
    text-align: left;
    padding: 8px 10px;
    font-weight: 600;
  }

  td {
    padding: 6px 10px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  /* Code / Pre */
  code {
    font-family: Consolas, "SF Mono", Monaco, "Courier New", monospace;
    background: #f1f5f9;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 8.5pt;
    color: #0f766e;
  }

  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 12px 14px;
    border-radius: 6px;
    font-family: Consolas, "SF Mono", Monaco, "Courier New", monospace;
    font-size: 8pt;
    overflow-x: auto;
    line-height: 1.4;
    page-break-inside: avoid;
  }

  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
  }

  /* Diagrams */
  .diagram-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 12px;
    margin: 14px 0;
    font-family: Consolas, monospace;
    font-size: 7.5pt;
    line-height: 1.35;
    white-space: pre;
    color: #0f172a;
    page-break-inside: avoid;
  }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }

  .badge-get { background: #dbeafe; color: #1e40af; }
  .badge-post { background: #dcfce7; color: #166534; }
  .badge-put { background: #fef3c7; color: #92400e; }
  .badge-patch { background: #f3e8ff; color: #6b21a8; }
  .badge-delete { background: #fee2e2; color: #991b1b; }

  .badge-auth { background: #ffedd5; color: #9a3412; font-weight: 600; }
  .badge-public { background: #ecfdf5; color: #065f46; font-weight: 600; }

  /* Page Break Utilities */
  .page-break {
    page-break-after: always;
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="cover-header">
    <div class="cover-tag">Memoria Técnica & Arquitectura de Software</div>
    <h1 class="cover-title">Valle del Sondondo Expeditions</h1>
    <p class="cover-subtitle">Plataforma Turística Integral, Motor de Reservas & Sistema Hotelero Oficial</p>
  </div>

  <div class="cover-hero-card">
    <h3>Propósito y Alcance del Sistema</h3>
    <p>
      Documentación técnica detallada de la arquitectura de micro-servicios contenedorizados, módulos de comercio electrónico, gestión hotelera (PMS), pasarela de pagos con Mercado Pago, cumplimiento normativo INDECOPI y modelo operativo para la digitalización turística del Valle del Sondondo, Lucanas, Ayacucho, Perú.
    </p>
  </div>

  <div class="cover-meta-grid">
    <div class="cover-meta-item">
      <strong>Entidad Operadora</strong>
      <span>Valle del Sondondo Expeditions</span>
    </div>
    <div class="cover-meta-item">
      <strong>Estado de la Versión</strong>
      <span>v1.0.0 (Production Ready)</span>
    </div>
    <div class="cover-meta-item">
      <strong>Frontend Framework</strong>
      <span>Angular 21 (TypeScript 5.9 / Standalone)</span>
    </div>
    <div class="cover-meta-item">
      <strong>Backend Runtime</strong>
      <span>ASP.NET Core 9 Web API (.NET 9 / C# 13)</span>
    </div>
    <div class="cover-meta-item">
      <strong>Base de Datos & Almacén</strong>
      <span>MySQL 8.0 & Atomic JSON File Store</span>
    </div>
    <div class="cover-meta-item">
      <strong>Infraestructura & Nube</strong>
      <span>Docker Compose / Coolify en Oracle Cloud (OCI)</span>
    </div>
    <div class="cover-meta-item">
      <strong>Fecha de Publicación</strong>
      <span>Octubre 2026</span>
    </div>
    <div class="cover-meta-item">
      <strong>Territorio Operativo</strong>
      <span>Lucanas / Huancasancos, Ayacucho, Perú</span>
    </div>
  </div>
</div>

<!-- CAPÍTULO 1 -->
<h1>1. Resumen Ejecutivo y Diagnóstico Tecnológico</h1>

<p>
La plataforma web <strong>Valle del Sondondo Expeditions</strong> ha sido concebida y desarrollada para atender de manera profesional las exigencias de comercialización, visibilidad internacional y coordinación operativa de los circuitos turísticos en la mancomunidad del Valle del Sondondo (Andamarca, Aucará, Cabana Sur, Chipao, Mayobamba, Sondondo y Sacsamarca), cuna ancestral de la Danza de las Tijeras, el monumento volcánico de Pachapupum y el mayor dormidero de cóndores andinos del centro-sur del Perú.
</p>

<div class="callout">
  <strong>Clarificación del Stack Técnico Detectado:</strong><br>
  En la consulta inicial se hizo mención a un stack basado en <em>React/Vite y FastAPI</em>. Tras la auditoría exhaustiva del código fuente del repositorio, se constató que la implementación real se encuentra construida sobre un stack corporativo de alto rendimiento:
  <ul>
    <li><strong>Frontend:</strong> <code>Angular 21</code> con TypeScript 5.9, componentes Standalone, Signals reactivos, nueva sintaxis de Control Flow (<code>@if</code>, <code>@for</code>) y Tailwind CSS.</li>
    <li><strong>Backend:</strong> <code>ASP.NET Core 9 Web API</code> (.NET 9 / C# 13) con Clean Architecture, Entity Framework Core 8/9 (Pomelo MySQL Provider), Rate Limiting nativo y autenticación JWT Bearer.</li>
    <li><strong>Base de Datos:</strong> <code>MySQL 8.0</code> con persistencia relacional estricta y almacén local con bloqueo atómico multihilo para el sistema de reservas hoteleras.</li>
  </ul>
  <em>Nota de integración futura:</em> Si en fases posteriores se requiere incorporar microservicios de Inteligencia Artificial (procesamiento de lenguaje natural o visión artificial para análisis satelital), estos se acoplarán fluidamente mediante microservicios en <strong>FastAPI (Python)</strong> comunicados vía REST con la API de .NET 9.
</div>

<h2>1.1. Objetivos del Sistema</h2>
<ol>
  <li><strong>Digitalización de Circuitos Turísticos:</strong> Publicación dinámica de rutas con itinerarios detallados día por día, recomendaciones de altitud (hasta 4,800 msnm), dificultad física y precios en Soles (PEN) y Dólares (USD).</li>
  <li><strong>Comercialización Directa:</strong> Motor de cotización con derivación automatizada a WhatsApp con mensaje enriquecido y almacenamiento de trazabilidad en base de datos.</li>
  <li><strong>Sistema de Gestión Hotelera (PMS):</strong> Gestión de habitaciones del Hotel Oficial Punto Clave, asignación de vouchers (<code>HPC-2026-XXX</code>), control de housekeeping y tarifas de temporada.</li>
  <li><strong>Pasarela de Pagos Digital:</strong> Integración dual con Mercado Pago (Modo API Live/Sandbox y Modo Simulación Segura de Fallback).</li>
  <li><strong>Seguridad y Cumplimiento Normativo:</strong> Rate limiting contra ataques de fuerza bruta, protección de datos conforme a la Ley N° 29733 y Libro de Reclamaciones Virtual interactivo regulado por INDECOPI.</li>
</ol>

<!-- CAPÍTULO 2 -->
<h1>2. Arquitectura Técnica Global</h1>

<p>
El sistema está estructurado mediante una arquitectura de tres capas desacopladas, ejecutadas en contenedores Docker orquestados por Docker Compose y gestionados a través de Coolify sobre una instancia de Oracle Cloud Infrastructure (OCI).
</p>

<div class="diagram-box">
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
                      | HTTP / 5000 (Red Docker Interna)
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
</div>

<h2>2.1. Capa de Presentación (Frontend Angular 21)</h2>
<ul>
  <li><strong>Componentes Standalone:</strong> Eliminación de módulos tradicionales de Angular (<code>NgModule</code>) en favor de componentes independientes de carga ultrarrápida.</li>
  <li><strong>Signals Reactivos & Control Flow:</strong> Uso de signals para reactividad de estado y sintaxis <code>@if</code>, <code>@for</code> para renderizado eficiente en el DOM virtual.</li>
  <li><strong>Servicios Singleton:</strong> Inyección mediante <code>inject()</code> para tours, hotel, pagos, autenticación, temas y traducción.</li>
  <li><strong>Soporte Multilingüe (i18n):</strong> Servicio <code>TranslationService</code> con soporte para Español (ES), Inglés (EN) y Quechua Chanka (QU).</li>
  <li><strong>Sistema de Temas:</strong> <code>ThemeService</code> con alternancia de Modo Claro y Modo Oscuro persistente en <code>localStorage</code>.</li>
</ul>

<h2>2.2. Capa de Lógica y Servicios (Backend ASP.NET Core 9)</h2>
<ul>
  <li><strong>Clean Architecture:</strong> Separación en tres proyectos: <code>ValleSondondo.Domain</code> (entidades puras), <code>ValleSondondo.Infrastructure</code> (DbContext y datos) y <code>ValleSondondo.API</code> (controladores y middlewares).</li>
  <li><strong>Resiliencia de Conexión:</strong> <code>EnableRetryOnFailure</code> configurado con hasta 10 reintentos automáticos durante el inicio en frío para esperar a la base de datos MySQL.</li>
  <li><strong>Rate Limiting (.NET 9):</strong> Políticas basadas en ventana deslizante (*Sliding Window*) para mitigar spam y ataques de fuerza bruta.</li>
  <li><strong>Forwarded Headers:</strong> Propagación segura de encabezados para detección de HTTPS tras proxies inversos de Coolify/Traefik.</li>
</ul>

<!-- CAPÍTULO 3 -->
<h1>3. Tecnologías y Librerías Utilizadas</h1>

<table>
  <thead>
    <tr>
      <th>Componente</th>
      <th>Tecnología / Versión</th>
      <th>Función y Rol Técnico</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend Core</strong></td>
      <td>Angular 21.0.0 / TypeScript 5.9.2</td>
      <td>Framework SPA reactivo empresarial con tipado estricto.</td>
    </tr>
    <tr>
      <td><strong>Programación Asíncrona</strong></td>
      <td>RxJS 7.8.0</td>
      <td>Gestión de flujos HTTP, debounce de filtros y observables.</td>
    </tr>
    <tr>
      <td><strong>Estilos y UI</strong></td>
      <td>Tailwind CSS / PostCSS</td>
      <td>Diseño responsivo, modo oscuro y paleta cromática andina.</td>
    </tr>
    <tr>
      <td><strong>Servidor Web Frontend</strong></td>
      <td>Nginx Alpine</td>
      <td>Compresión gzip, caché de 6 meses y reverse proxy local.</td>
    </tr>
    <tr>
      <td><strong>Backend Core</strong></td>
      <td>ASP.NET Core 9 / C# 13</td>
      <td>Runtime web de ultra alta velocidad y bajo consumo de memoria.</td>
    </tr>
    <tr>
      <td><strong>ORM / Acceso a Datos</strong></td>
      <td>Pomelo EF Core 8.0.36</td>
      <td>Mapeo objeto-relacional para MySQL con soporte de LINQ.</td>
    </tr>
    <tr>
      <td><strong>Seguridad / JWT</strong></td>
      <td>Microsoft.AspNetCore.Authentication.JwtBearer</td>
      <td>Tokens firmados con algoritmo HMAC-SHA256 y claims de admin.</td>
    </tr>
    <tr>
      <td><strong>Rate Limiting</strong></td>
      <td>System.Threading.RateLimiting 9.0</td>
      <td>Protección contra DDoS y fuerza bruta por IP con ventana deslizante.</td>
    </tr>
    <tr>
      <td><strong>Documentación API</strong></td>
      <td>Swagger / OpenAPI v1</td>
      <td>Explorador interactivo de endpoints con autenticación Bearer.</td>
    </tr>
    <tr>
      <td><strong>Base de Datos</strong></td>
      <td>MySQL 8.0 (InnoDB / utf8mb4)</td>
      <td>Persistencia relacional de tours, reservas, mensajes y usuarios.</td>
    </tr>
    <tr>
      <td><strong>Contenedores & PaaS</strong></td>
      <td>Docker Multi-Stage / Coolify</td>
      <td>Compilación reproducible y despliegue automatizado en OCI.</td>
    </tr>
  </tbody>
</table>

<!-- CAPÍTULO 4 -->
<div class="page-break"></div>
<h1>4. Módulos Principales del Sistema</h1>

<h2>4.1. Módulo de Catálogo y Circuitos Turísticos</h2>
<p>
Presenta los atractivos turísticos clasificados en categorías clave (Alta Montaña / Trekking, Cultura Viva, Termalismo y Arqueología). Cada tour contiene:
</p>
<ul>
  <li><strong>Ficha de Dificultad y Altitud:</strong> Especificación en msnm (ej. 3,200 msnm en Mayobamba, 4,022 msnm en Pachapupum y 4,800 msnm en Pampa Galeras).</li>
  <li><strong>Tarifas Duales:</strong> Cotización en Soles Peruanos (PEN) y Dólares Americanos (USD).</li>
  <li><strong>Itinerario Estructurado Día a Día:</strong> Desglose por jornadas con actividades, alimentación provista y tipo de hospedaje.</li>
  <li><strong>Equipamiento & Recomendaciones:</strong> Listado claro de indumentaria requerida, aclimatación previa y servicios no incluidos.</li>
</ul>

<h2>4.2. Módulo de Hospedaje Oficial (Hotel Punto Clave)</h2>
<p>
Incorpora el motor de reservación y gestión del hotel oficial de la empresa:
</p>
<ul>
  <li><strong>Tipologías de Habitación:</strong> Habitación Doble Matrimonial, Habitación Triple Estándar (hasta 4 huéspedes) y Apartamento Dúplex con cocina privada, terraza e hidromasaje.</li>
  <li><strong>Sistema de Housekeeping:</strong> Estado de limpieza de cada unidad (<code>clean</code>, <code>dirty</code>, <code>occupied</code>, <code>maintenance</code>).</li>
  <li><strong>Bloqueo de Fechas & Tarifas Festivas:</strong> Permite establecer sobrecostos dinámicos en fechas como la Fiesta del Agua <em>Yaku Raymi</em> o bloquear habitaciones por mantenimiento.</li>
  <li><strong>Generación de Vouchers:</strong> Código correlativo identificador (<code>HPC-2026-XXX</code>) con enlace de confirmación a WhatsApp.</li>
</ul>

<h2>4.3. Módulo de Cotizaciones y Motor de Reservas</h2>
<p>
Permite al viajero ingresar el tour deseado, cantidad de personas, fecha tentativa y requerimientos especiales. Al confirmar:
</p>
<ul>
  <li>La solicitud queda registrada en base de datos con estado <code>Pending</code>.</li>
  <li>El frontend abre instantáneamente una conversación oficial en <strong>WhatsApp Business</strong> de la agencia (+51 966 380 590) con los datos del tour ya estructurados.</li>
</ul>

<h2>4.4. Módulo de Pasarela de Pagos (Mercado Pago)</h2>
<p>
Ofrece checkout seguro con dos modalidades de operación:
</p>
<ul>
  <li><strong>Modo Live/Sandbox:</strong> Consume el endpoint de preferencias de Mercado Pago (<code>/checkout/preferences</code>) retornando el <code>init_point</code> para pago con tarjeta de crédito, débito o PagoEfectivo.</li>
  <li><strong>Modo Simulación Segura:</strong> Si no se configuran tokens reales de Mercado Pago, la plataforma conmuta automáticamente al simulador local, garantizando que el flujo de reservas y vouchers pueda ser probado de extremo a extremo sin caídas.</li>
  <li><strong>Webhook Asíncrono:</strong> Endpoint <code>/api/payments/webhook</code> para recibir eventos IPN de acreditación y actualizar el estado de la reserva a <code>Paid</code>.</li>
</ul>

<h2>4.5. Módulo Legal & Libro de Reclamaciones INDECOPI</h2>
<p>
Cumple con la normativa peruana vigente para comercio electrónico:
</p>
<ul>
  <li><strong>Libro de Reclamaciones Virtual:</strong> Conforme al <strong>D.S. N° 011-2011-PCM</strong> y <strong>Ley N° 29571</strong>. Genera número correlativo formal (<code>REC-2026-XXXX</code>) con constancia descargable/imprimible.</li>
  <li><strong>Términos & Condiciones:</strong> Regulaciones de alta montaña, seguros de viaje y acuerdos de servicios.</li>
  <li><strong>Políticas de Cancelación & Reembolso:</strong> Plazos para no-show y causales de fuerza mayor (huaicos, paros comunales).</li>
  <li><strong>Política de Privacidad:</strong> Tratamiento de datos personales conforme a la <strong>Ley N° 29733</strong> de la República del Perú.</li>
</ul>

<h2>4.6. Panel Administrativo (Backoffice)</h2>
<p>
Entorno protegido mediante autenticación JWT para los coordinadores de la agencia:
</p>
<ul>
  <li><strong>Dashboard de Métricas:</strong> KPIs cuantitativos de reservas, tours activos y mensajes.</li>
  <li><strong>Gestión de Reservas:</strong> Listado, cambio de estado y botón directo para responder al pasajero por WhatsApp en un solo clic.</li>
  <li><strong>Gestión de Tours & Galería:</strong> Creación, edición con soporte para imágenes de hasta 50MB y cambio de orden de visualización.</li>
</ul>

<!-- CAPÍTULO 5 -->
<div class="page-break"></div>
<h1>5. Inventario Completo de Endpoints de la API</h1>

<p>
A continuación se presenta el catálogo técnico detallado de todas las rutas provistas por el backend en ASP.NET Core 9:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 12%;">Método</th>
      <th style="width: 33%;">Ruta / Endpoint</th>
      <th style="width: 15%;">Autenticación</th>
      <th style="width: 15%;">Rate Limiting</th>
      <th style="width: 25%;">Descripción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/auth/login</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>login-policy</code> (5/min)</td>
      <td>Inicio de sesión admin. Retorna JWT Bearer.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/agency</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Datos institucionales, teléfono y redes sociales.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/health</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td>Ninguno</td>
      <td>Healthcheck para Docker, Coolify y monitores.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/tours</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Catálogo de tours activos (filtros: category, search).</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/tours/{slug}</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Detalle completo de tour por slug e itinerarios.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/tours/featured</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Listado de circuitos turísticos destacados.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/tours</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Crea un nuevo tour con días de itinerario.</td>
    </tr>
    <tr>
      <td><span class="badge badge-put">PUT</span></td>
      <td><code>/api/tours/{id}</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Actualiza atributos, precios o fotos de un tour.</td>
    </tr>
    <tr>
      <td><span class="badge badge-patch">PATCH</span></td>
      <td><code>/api/tours/{id}/toggle-active</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Activa o desactiva la visibilidad pública del tour.</td>
    </tr>
    <tr>
      <td><span class="badge badge-delete">DELETE</span></td>
      <td><code>/api/tours/{id}</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Elimina un tour y sus itinerarios asociados.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/categories</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Categorías turísticas con conteo de tours.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/bookings</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Listado de reservas y cotizaciones de tours.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/bookings</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>contact-policy</code> (6/min)</td>
      <td>Registra cotización y genera link a WhatsApp.</td>
    </tr>
    <tr>
      <td><span class="badge badge-patch">PATCH</span></td>
      <td><code>/api/bookings/{id}/status</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Modifica estado (Pending, Confirmed, Cancelled).</td>
    </tr>
    <tr>
      <td><span class="badge badge-delete">DELETE</span></td>
      <td><code>/api/bookings/{id}</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Elimina el registro de una reserva.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/hotel</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Información, amenidades y habitaciones del hotel.</td>
    </tr>
    <tr>
      <td><span class="badge badge-put">PUT</span></td>
      <td><code>/api/hotel</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Actualiza los datos institucionales del hotel.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/hotel/rooms</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Catálogo de habitaciones disponibles.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/hotel/rooms</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Registra una nueva habitación en el hotel.</td>
    </tr>
    <tr>
      <td><span class="badge badge-put">PUT</span></td>
      <td><code>/api/hotel/rooms/{id}</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Modifica datos y galería de una habitación.</td>
    </tr>
    <tr>
      <td><span class="badge badge-patch">PATCH</span></td>
      <td><code>/api/hotel/rooms/{id}/housekeeping</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Actualiza estado de limpieza (clean, dirty, etc).</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/hotel/date-blocks</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Bloqueos de fechas y tarifas de temporada.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/hotel/date-blocks</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Crea un bloqueo o tarifa especial por festividad.</td>
    </tr>
    <tr>
      <td><span class="badge badge-delete">DELETE</span></td>
      <td><code>/api/hotel/date-blocks/{id}</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Elimina un bloqueo de fecha.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/hotel/bookings</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Lista reservas de habitación con filtros y buscador.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/hotel/bookings</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>contact-policy</code> (6/min)</td>
      <td>Registra reserva de hotel y asigna voucher HPC.</td>
    </tr>
    <tr>
      <td><span class="badge badge-patch">PATCH</span></td>
      <td><code>/api/hotel/bookings/{id}/status</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Actualiza estado de reserva hotelera.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/payments/create-preference</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>contact-policy</code> (6/min)</td>
      <td>Crea preferencia de pago en Mercado Pago.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/payments/process-payment</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>contact-policy</code> (6/min)</td>
      <td>Procesa cobro directo mediante tarjeta de crédito.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/payments/webhook</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td>Ninguno</td>
      <td>Webhook de recepción de pagos Mercado Pago.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/contact</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Lista de mensajes de contacto recibidos.</td>
    </tr>
    <tr>
      <td><span class="badge badge-post">POST</span></td>
      <td><code>/api/contact</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>contact-policy</code> (6/min)</td>
      <td>Envía mensaje de consulta ciudadana o turística.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/testimonials</code></td>
      <td><span class="badge badge-public">Público</span></td>
      <td><code>general-policy</code></td>
      <td>Testimonios aprobados de viajeros.</td>
    </tr>
    <tr>
      <td><span class="badge badge-get">GET</span></td>
      <td><code>/api/dashboard/stats</code></td>
      <td><span class="badge badge-auth">[Authorize]</span></td>
      <td>Ninguno</td>
      <td>Métricas consolidadas (reservas, tours, mensajes).</td>
    </tr>
  </tbody>
</table>

<!-- CAPÍTULO 6 -->
<div class="page-break"></div>
<h1>6. Estado Actual de Desarrollo y Hoja de Ruta</h1>

<h2>6.1. Matriz de Cumplimiento Técnico</h2>
<table>
  <thead>
    <tr>
      <th>Área</th>
      <th>Requerimiento Técnico</th>
      <th>Estado</th>
      <th>Detalle Operativo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Seguridad</strong></td>
      <td>Protección con <code>[Authorize]</code></td>
      <td>✅ 100% Operativo</td>
      <td>Todos los endpoints administrativos exigen token JWT válido.</td>
    </tr>
    <tr>
      <td><strong>Seguridad</strong></td>
      <td>Rate Limiting .NET 9</td>
      <td>✅ 100% Operativo</td>
      <td>Políticas por IP (5/min login, 6/min formularios, 120/min general).</td>
    </tr>
    <tr>
      <td><strong>Seguridad</strong></td>
      <td>ForwardedHeaders</td>
      <td>✅ 100% Operativo</td>
      <td>Detección de HTTPS en reversa de Traefik y Nginx.</td>
    </tr>
    <tr>
      <td><strong>Infraestructura</strong></td>
      <td>Volumen persistente de hotel</td>
      <td>✅ 100% Operativo</td>
      <td>Volumen <code>hotel_data</code> mapeado en <code>/app/hotel_storage</code>.</td>
    </tr>
    <tr>
      <td><strong>Infraestructura</strong></td>
      <td>Proxy de Healthcheck</td>
      <td>✅ 100% Operativo</td>
      <td>Nginx enruta <code>/health</code> directamente al backend.</td>
    </tr>
    <tr>
      <td><strong>Frontend</strong></td>
      <td>Reemplazo de Entorno en Prod</td>
      <td>✅ 100% Operativo</td>
      <td><code>fileReplacements</code> activo en <code>angular.json</code> para prod.</td>
    </tr>
    <tr>
      <td><strong>SEO</strong></td>
      <td>Robots.txt & Sitemap.xml</td>
      <td>✅ 100% Operativo</td>
      <td>Indexación de circuitos turísticos y bloqueo de <code>/admin</code>.</td>
    </tr>
    <tr>
      <td><strong>Legal & E-Commerce</strong></td>
      <td>Libro de Reclamaciones Virtual</td>
      <td>✅ 100% Operativo</td>
      <td>Conforme a D.S. N° 011-2011-PCM con código <code>REC-2026-XXXX</code>.</td>
    </tr>
    <tr>
      <td><strong>Legal & E-Commerce</strong></td>
      <td>Páginas Legales Institucionales</td>
      <td>✅ 100% Operativo</td>
      <td>Términos, Cancelaciones y Privacidad conforme a Ley 29733.</td>
    </tr>
    <tr>
      <td><strong>Pasarela</strong></td>
      <td>Modo Live de Mercado Pago</td>
      <td>🟡 Modo Sandbox/Simulado</td>
      <td>Arquitectura lista; pendiente inyección de token de producción.</td>
    </tr>
    <tr>
      <td><strong>Notificaciones</strong></td>
      <td>Correos Transaccionales SMTP</td>
      <td>🟡 Planificado (Fase 2)</td>
      <td>En backlog para envío automático de vouchers vía Brevo/Resend.</td>
    </tr>
    <tr>
      <td><strong>Backup</strong></td>
      <td>Respaldo Automático a Cloud</td>
      <td>🟡 Planificado (Fase 2)</td>
      <td>Script cron de <code>mysqldump</code> diario hacia OCI Object Storage.</td>
    </tr>
  </tbody>
</table>

<h2>6.2. Hoja de Ruta Post-Lanzamiento</h2>
<ol>
  <li><strong>Fase 1 (Inmediata - Concluida):</strong> Fortalecimiento de seguridad, Dockerización multi-etapa, compilación optimizada en producción de Angular y ASP.NET Core 9, y despliegue en Coolify.</li>
  <li><strong>Fase 2 (Post-Lanzamiento - Primer Mes):</strong> Inyección de claves bancarias reales de Mercado Pago Perú, automatización de correos transaccionales (SMTP) para clientes y agencia, y alta en Google Search Console.</li>
  <li><strong>Fase 3 (Escalabilidad):</strong> Bot de alertas en Telegram/WhatsApp para guías de campo en Ayacucho, integración de cobro directo mediante QR Yape y CDN Cloudflare para distribución global de activos fotográficos.</li>
</ol>

<br>
<hr style="border: none; border-top: 1px solid #cbd5e1; margin: 30px 0;">
<p style="text-align: center; font-size: 8.5pt; color: #64748b;">
  Informe técnico oficial elaborado para la plataforma <strong>Valle del Sondondo Expeditions & Hospedaje Punto Clave</strong>.<br>
  Todos los derechos reservados © 2026 Valle del Sondondo Expeditions, Lucanas, Ayacucho, Perú.
</p>

</body>
</html>
"""

html_path = os.path.abspath("temp_report.html")
pdf_path = os.path.abspath("INFORME_TECNICO_VALLE_DEL_SONDONDO.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

cmd = [
    edge_exe,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    "--no-pdf-header-footer",
    html_path
]

print(f"Ejecutando conversion a PDF...")
result = subprocess.run(cmd, capture_output=True, text=True)
print(f"Retorno: {result.returncode}")
if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"PDF generado exitosamente en: {pdf_path} ({size_kb:.2f} KB)")
else:
    print("Error: No se encontro el archivo PDF.")
