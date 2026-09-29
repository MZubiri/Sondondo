# 📌 Backlog & Hoja de Ruta Post-Lanzamiento
## Proyecto: Valle del Sondondo Expeditions

Este documento consolida las mejoras, integraciones externas y optimizaciones que **no se ejecutarán en la fase inmediata**, pero que están planificadas para implementarse tras el despliegue inicial en producción.

---

## 🗂️ Matriz de Priorización Post-Lanzamiento

```mermaid
quadrantChart
    title Priorización Post-Lanzamiento (Esfuerzo vs. Valor Comercial)
    x-axis Bajo Esfuerzo --> Alto Esfuerzo
    y-axis Bajo Valor Comercial --> Alto Valor Comercial
    quadrant-1 Prioridad Alta (Fase 2)
    quadrant-2 Victorias Rápidas
    quadrant-3 Evaluar a Demanda
    quadrant-4 Proyectos Mayores (Fase 3)
    "Credenciales en Vivo Mercado Pago": [0.3, 0.95]
    "Correos Transaccionales (SMTP/Brevo)": [0.4, 0.85]
    "Backups Automatizados MySQL": [0.25, 0.75]
    "Google Analytics 4 & Search Console": [0.2, 0.65]
    "Optimización WebP & CDN Cloudflare": [0.45, 0.6]
    "Bot de WhatsApp / Telegram": [0.75, 0.8]
    "Pasarelas adicionales (Izipay / Niubiz)": [0.85, 0.7]
```

---

## 1. Pasarelas de Pago en Vivo & Finanzas (Fase Comercial)

### 1.1. Activación de Credenciales de Producción en Mercado Pago
* **Descripción:** Reemplazar el modo simulado de prueba actual (`TEST-SIMULATED-PUBLIC-KEY`) por las credenciales oficiales de producción de la empresa.
* **Requisitos Previos Requeridos:**
  * Cuenta de empresa activa en Mercado Pago Perú vinculada a la cuenta bancaria de la agencia.
  * Verificación de identidad y RUC de la agencia en el panel de Mercado Pago.
  * Obtención del `Access Token` oficial de producción (`APP_USR-...`) y su respectiva `Public Key`.
* **Tareas Técnicas:**
  * Inyectar las variables de entorno en Coolify (`MERCADOPAGO_ACCESS_TOKEN` y `MERCADOPAGO_PUBLIC_KEY`).
  * Validar la firma criptográfica del encabezado `x-signature` en el webhook de Mercado Pago para garantizar que ninguna petición falsa apruebe transacciones.

### 1.2. Pasarelas Peruanas Alternativas
* **Descripción:** Incorporar opciones de cobro adicionales para el mercado nacional e internacional:
  * **Izipay / Niubiz:** Cobros directos con tarjetas de crédito/débito nacionales e internacionales con liquidación local.
  * **Yape / Plin Directo:** Integración con API bancaria para confirmación automática de transferencias móviles mediante código QR dinámico.

---

## 2. Mensajería y Notificaciones Automáticas (Email & WhatsApp)

### 2.1. Servicio de Correos Transaccionales (SMTP / Resend / Brevo)
* **Descripción:** Enviar correos automáticos en tiempo real tanto al cliente como al equipo administrativo.
* **Casos de Uso:**
  * **Al Cliente:**
    * Correo de bienvenida y confirmación de recepción de cotización.
    * Correo de confirmación de reserva con voucher en PDF/HTML y código QR de embarque.
    * Copia digital del reclamo registrado en el Libro de Reclamaciones (requisito normativo de INDECOPI).
  * **A la Agencia (`miskichaskaperu@hotmail.com`):**
    * Notificación instantánea de nuevo mensaje de contacto.
    * Alerta de nueva solicitud de tour o reserva de hotel para asignación de guía.
* **Herramientas recomendadas:** Brevo (300 correos/día gratuitos), Resend o Google Workspace SMTP con contraseña de aplicación.

### 2.2. Automatización de Alertas por WhatsApp / Telegram
* **Descripción:** Canal de notificación operativa automática para los coordinadores de campo en Ayacucho.
* **Casos de Uso:**
  * Conexión con un bot privado de Telegram que notifique al grupo de guías: *"¡Nueva reserva confirmada para el Tour Cóndor Mayobamba para 4 personas!"*.
  * Integración con WhatsApp Cloud API oficial de Meta para recordatorios 24 horas antes del tour con recomendaciones de calzado y altitud.

---

## 3. Seguridad Avanzada y Respaldo de Datos (Disaster Recovery)

### 3.1. Copias de Seguridad Automatizadas de Base de Datos (Backups Diarios)
* **Descripción:** Salvaguardar la información ante fallos de hardware en el VPS o corrupción accidental.
* **Plan de Implementación:**
  * Script automatizado en el host o contenedor que ejecute `mysqldump` diariamente a las 02:00 a.m.
  * Compresión gzip con timestamp: `valle_sondondo_backup_YYYYMMDD_HHMM.sql.gz`.
  * Sincronización automática de respaldos a almacenamiento fuera del servidor:
    * Oracle Cloud Infrastructure (OCI) Object Storage (Bucket gratuito Always Free).
    * Alternativa: AWS S3 o Cloudflare R2 (sin cobro por egress).
  * Política de retención: Mantener 7 copias diarias, 4 copias semanales y 3 mensuales.

### 3.2. Auditoría de Seguridad y Hardening Adicional
* Autenticación de Dos Factores (2FA / TOTP con Google Authenticator) en `/admin/login`.
* Desactivación total de Swagger en producción (`/swagger`) una vez concluidas las pruebas de integración.

---

## 4. Analítica, Métricas y Rendimiento Web

### 4.1. Analítica de Tráfico y Conversiones
* **Google Analytics 4 (GA4):**
  * Medición de usuarios por país (receptivo: EE.UU., Francia, España, Perú).
  * Eventos personalizados: Clic en WhatsApp, apertura de modal de reserva, finalización de pago.
* **Google Search Console:**
  * Envío del archivo `sitemap.xml` para indexación prioritaria.
  * Monitoreo de palabras clave (*"Tours Valle del Sondondo"*, *"Cañón de Mayobamba cóndores"*, *"Andenes de Andamarca"*).

### 4.2. Monitoreo de Disponibilidad 24/7 (Uptime Monitor)
* Configuración de un monitor gratuito (ej. BetterStack o UptimeRobot) apuntando a `https://tudominio.com/health`.
* Alerta inmediata por correo y SMS en caso de caída del servidor o reinicio de Docker.

### 4.3. Optimización de Imágenes y Red de Entrega de Contenidos (CDN)
* Conversión masiva de imágenes JPEG a WebP / AVIF de alta compresión.
* Configurar Cloudflare (plan gratuito) frente al dominio de la web para:
  * Caché de borde (Edge Caching) para servir fotos al instante a usuarios de Europa o Norteamérica.
  * Protección contra ataques de denegación de servicio (DDoS).
  * Minificación automática de recursos estáticos.

---

## 5. Resumen de Fases Futuras

```
┌────────────────────────────────────────────────────────┐
│ FASE INMEDIATA (HOY):                                  │
│ - Seguridad Backend [Authorize], Rate Limiting, JWT    │
│ - Docker, Nginx, Healthchecks, ForwardedHeaders        │
│ - angular.json producción, robots.txt, sitemap.xml     │
│ - Páginas Legales & Libro de Reclamaciones INDECOPI    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ FASE 2 (POST-LANZAMIENTO / PRIMER MES):                │
│ - Credenciales de Producción en Vivo Mercado Pago      │
│ - Notificaciones de Correo Transaccional (SMTP)        │
│ - Google Search Console & Google Analytics 4           │
│ - Script de Backups Diarios a OCI Object Storage       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ FASE 3 (ESCALABILIDAD & OPERACIÓN AVANZADA):           │
│ - Bot de alertas de WhatsApp / Telegram a guías        │
│ - CDN Cloudflare & Optimización de Activos WebP        │
│ - Pasarelas adicionales (Izipay / Yape QR directo)     │
└────────────────────────────────────────────────────────┘
```
