# 🚀 Plan de Trabajo: Preparación Integral para Producción
## Proyecto: Valle del Sondondo Expeditions

Este documento detalla el plan técnico y operativo para ejecutar de inmediato las mejoras críticas de seguridad, infraestructura, compilación, SEO y cumplimiento legal para el lanzamiento en producción.

---

## 📋 Resumen del Alcance Inmediato

| # | Área | Requerimiento | Impacto / Beneficio |
| :---: | :--- | :--- | :--- |
| **1** | **Seguridad** | Anotaciones `[Authorize]` en endpoints administrativos | Impide el acceso no autorizado y fuga de datos personales (DNI, teléfonos, correos). |
| **2** | **Seguridad** | Clave JWT robusta y gestión segura de credenciales | Elimina claves públicas por defecto y previene falsificación de tokens. |
| **3** | **Seguridad** | Rate Limiting contra ataques de fuerza bruta y DDoS | Protege `/api/auth/login`, `/api/contact` y pasarela contra saturación. |
| **4** | **Infraestructura** | Configurar `ForwardedHeaders` en ASP.NET Core | Garantiza detección de `https://` y compatibilidad con callbacks de Mercado Pago. |
| **5** | **Infraestructura** | Volumen Docker para persistencia de Hospedaje | Evita pérdida de habitaciones y reservas de hotel al actualizar contenedores. |
| **6** | **Infraestructura** | Proxy para endpoint `/health` en Nginx | Habilita healthchecks de monitores de uptime y Coolify. |
| **7** | **Frontend** | Reemplazo de entorno (`fileReplacements`) en `angular.json` | Asegura que la compilación de producción use `environment.prod.ts`. |
| **8** | **SEO** | Generación de `robots.txt` y `sitemap.xml` | Indexación de circuitos turísticos en Google/Bing y bloqueo de `/admin`. |
| **9** | **Legal & Ecommerce** | Páginas Legales y Libro de Reclamaciones Virtual | Cumplimiento estricto con INDECOPI, Ley N° 29733 y normativas de pasarelas de pago. |

---

## 🛠️ Fases de Implementación Técnica

```mermaid
flowchart TD
    subgraph Fase 1: Backend & Seguridad
        A1[1. Proteger Endpoints con [Authorize]] --> A2[2. Validar JWT & Claves de Entorno]
        A2 --> A3[3. Implementar Rate Limiting .NET 9]
        A3 --> A4[4. Configurar ForwardedHeaders]
    end

    subgraph Fase 2: Docker & Nginx
        B1[5. Agregar Volumen Docker hotel_storage] --> B2[6. Configurar Proxy /health en Nginx]
    end

    subgraph Fase 3: Frontend & SEO
        C1[7. fileReplacements en angular.json] --> C2[8. Crear robots.txt & sitemap.xml]
    end

    subgraph Fase 4: Requisitos Legales INDECOPI
        D1[9. Términos & Condiciones] --> D2[10. Políticas de Cancelación & Reembolso]
        D2 --> D3[11. Política de Privacidad Datos Personales]
        D3 --> D4[12. Libro de Reclamaciones Virtual]
        D4 --> D5[13. Enlaces Legales en Footer]
    end

    Fase 1 --> Fase 2 --> Fase 3 --> Fase 4
```

---

### Módulo 1: Seguridad y Backend (ASP.NET Core 9)

#### 1.1. Protección de Controladores con `[Authorize]`
* **Archivos a modificar:**
  * `backend/src/ValleSondondo.API/Controllers/BookingsController.cs`:
    * Proteger `GET /api/bookings`, `GET /api/bookings/{id}`, `PATCH /api/bookings/{id}/status`, `DELETE /api/bookings/{id}`.
    * Mantener público únicamente `POST /api/bookings` (formulario de cotización de clientes).
  * `backend/src/ValleSondondo.API/Controllers/ToursController.cs`:
    * Proteger `POST /api/tours`, `PUT /api/tours/{id}`, `DELETE /api/tours/{id}`, `PATCH /api/tours/{id}/toggle-active`.
    * Mantener públicos los `GET` de catálogo para los visitantes.
  * `backend/src/ValleSondondo.API/Controllers/HotelController.cs`:
    * Proteger `PUT /api/hotel`, `POST /api/hotel/rooms`, `PUT /api/hotel/rooms/{id}`, `DELETE /api/hotel/rooms/{id}`, `PATCH /api/hotel/rooms/{id}/toggle-active`, `GET /api/hotel/bookings`, `PATCH /api/hotel/bookings/{id}/status`, `DELETE /api/hotel/bookings/{id}`.
    * Mantener públicos `GET /api/hotel` y `GET /api/hotel/rooms`.
  * `backend/src/ValleSondondo.API/Controllers/InteractionsController.cs`:
    * Proteger `GET /api/contact`, `PATCH /api/contact/{id}/read`, `DELETE /api/contact/{id}`.
    * Mantener público `POST /api/contact`.

#### 1.2. Clave JWT y Validación en Entorno
* **Archivos a modificar:**
  * `backend/src/ValleSondondo.API/Program.cs`:
    * Exigir que en ambiente `Production` la variable `JwtSettings:SecretKey` no utilice el valor por defecto y tenga al menos 32 caracteres.
  * `.env.example`:
    * Documentar la variable `JWT_SECRET_KEY` para que el operador del VPS genere su propio hash seguro (ej. con `openssl rand -base64 48`).

#### 1.3. Rate Limiting en .NET 9
* **Archivos a modificar:**
  * `backend/src/ValleSondondo.API/Program.cs`:
    * Registrar `builder.Services.AddRateLimiter(...)` utilizando una directiva de ventana deslizante (*Sliding Window*):
      * Política `login-policy`: Máximo 5 intentos por minuto por IP para `/api/auth/login`.
      * Política `contact-policy`: Máximo 6 solicitudes por minuto para `/api/contact` y `/api/bookings`.
      * Política `api-general`: Límite amplio para navegación normal (100 req/min).
    * Activar `app.UseRateLimiter()`.

#### 1.4. ForwardedHeaders (Reverse Proxy / HTTPS)
* **Archivos a modificar:**
  * `backend/src/ValleSondondo.API/Program.cs`:
    * Agregar antes de `app.UseCors()`:
      ```csharp
      app.UseForwardedHeaders(new ForwardedHeadersOptions
      {
          ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
      });
      ```
    * Esto asegura que `Request.Scheme` devuelva `https://` y que las URLs de retorno de pagos y webhooks se armen bajo protocolo seguro.

---

### Módulo 2: Infraestructura, Docker y Nginx

#### 2.1. Volumen para Almacenamiento de Hospedaje
* **Archivos a modificar:**
  * `docker-compose.yml`:
    * Añadir volumen `hotel_data:/app/hotel_storage` al servicio `backend`.
    * Declarar `hotel_data:` en la sección `volumes`.

#### 2.2. Proxy de `/health` en Nginx
* **Archivos a modificar:**
  * `frontend/nginx.conf`:
    * Agregar bloque:
      ```nginx
      location /health {
          proxy_pass http://backend:5000/health;
          proxy_http_version 1.1;
          proxy_set_header Host $host;
      }
      ```

---

### Módulo 3: Configuración de Frontend y SEO

#### 3.1. Reemplazo de Entorno (`fileReplacements`)
* **Archivos a modificar:**
  * `frontend/angular.json`:
    * En `architect.build.configurations.production`, añadir:
      ```json
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ]
      ```

#### 3.2. Archivos de Indexación SEO
* **Archivos a crear en `frontend/public/`:**
  * `robots.txt`:
    * Permitir rastreo en `/`, denegar rastreo en `/admin/`, declarar enlace a `sitemap.xml`.
  * `sitemap.xml`:
    * Mapeo XML estándar con `lastmod`, `changefreq` y `priority` para:
      * Página principal (`/`)
      * Circuitos turísticos (`/tour/vuelo-del-condor-mayobamba`, `/tour/andenes-andamarca-danza-tijeras`, etc.)
      * Sección de habitaciones y hospedaje (`/#habitaciones`)
      * Páginas legales (`/terminos-y-condiciones`, `/politica-de-cancelacion`, `/privacidad`, `/libro-de-reclamaciones`)

---

### Módulo 4: Requisitos Legales y Comercio Electrónico (INDECOPI)

#### 4.1. Creación de Páginas Legales
Se crearán componentes standalone modernos y adaptados a la normativa peruana y las exigencias de pasarelas de pago:
1. **Términos y Condiciones Generales (`terminos-condiciones.component.ts`)**:
   * Identificación de la agencia operadora (RUC, domicilio fiscal en Lucanas, Ayacucho).
   * Condiciones de los servicios de alta montaña, guianza oficial y seguros.
   * Responsabilidades del pasajero (condición médica, aclimatación a +3,400 msnm).
2. **Políticas de Cancelación, Reembolso y No-Show (`politica-cancelacion.component.ts`)**:
   * Plazos para reprogramaciones o cancelaciones sin penalidad (ej. 72 horas de anticipación).
   * Clausulado por factores de fuerza mayor (condiciones climáticas adversas, huaicos, huelgas o paros comunales).
   * Porcentajes de reembolso y tiempos de procesamiento bancario.
3. **Política de Privacidad y Protección de Datos Personales (`politica-privacidad.component.ts`)**:
   * Cumplimiento estricto con la Ley N° 29733 (Ley de Protección de Datos Personales de Perú).
   * Finalidad de recolección de DNI/Pasaporte para el manifiesto de pasajeros y control en reservas protegidas.
4. **Libro de Reclamaciones Virtual (`libro-reclamaciones.component.ts`)**:
   * Formulario digital conforme al D.S. N° 011-2011-PCM (Reglamento de INDECOPI).
   * Campos requeridos: Datos del consumidor, identificación del bien/servicio contratado (Queja o Reclamo), detalle del reclamo y envío formal con generación de número correlativo (`REC-2026-XXXX`).

#### 4.2. Enlaces en el Pie de Página (Footer)
* Actualizar `frontend/src/app/components/footer/footer.component.ts` para incorporar los enlaces directos a las páginas legales y el botón/logo oficial del **Libro de Reclamaciones**.

---

## ⏱️ Cronograma de Ejecución Estimado

| Tarea | Archivos Clave | Tiempo Estimado |
| :--- | :--- | :---: |
| **Paso 1: Backend Security** | `Controllers/*.cs`, `Program.cs` | ~25 min |
| **Paso 2: Infraestructura & Docker** | `docker-compose.yml`, `nginx.conf` | ~15 min |
| **Paso 3: Frontend Build & SEO** | `angular.json`, `robots.txt`, `sitemap.xml` | ~15 min |
| **Paso 4: Módulo Legal & INDECOPI** | 4 componentes legales, rutas y footer | ~35 min |
| **Paso 5: Validación & Builds** | `dotnet build`, `ng build` | ~10 min |
| **Total Estimado** | | **~1 hora 40 min** |

---

## ✅ Criterios de Aceptación (Definition of Done)
1. Ninguna ruta administrativa permite peticiones sin token Bearer válido (retorna `401 Unauthorized`).
2. El intento reiterado de logins es bloqueado por Rate Limiting (`429 Too Many Requests`).
3. El frontend compila en modo producción con `ng build` usando `environment.prod.ts` sin errores.
4. Las páginas legales y el Libro de Reclamaciones son 100% accesibles y funcionales en la web.
5. El backend compila con 0 errores y Docker Compose incluye todos los volúmenes de persistencia.
