# Guía de Despliegue en VPS Oracle Cloud con Coolify
## Proyecto: Valle del Sondondo Expeditions

Esta guía detalla el paso a paso para desplegar la plataforma completa (Frontend Angular, Backend ASP.NET Core 9 y Base de Datos MySQL 8) en un **VPS de Oracle Cloud Infrastructure (OCI)** utilizando **Coolify**.

---

## 1. Requisitos Previos en Oracle Cloud (OCI)

### 1.1. Abrir Puertos en la Security List (Ingress Rules) de OCI
Para que el tráfico de internet llegue a tu VPS y a Coolify, debes asegurarte de que la lista de seguridad de tu Virtual Cloud Network (VCN) permita el tráfico en los siguientes puertos:

En la consola de Oracle Cloud:
1. Ve a **Networking** > **Virtual Cloud Networks**.
2. Selecciona tu VCN y luego tu **Default Security List**.
3. Añade las siguientes **Ingress Rules**:
   - **HTTP**: Source `0.0.0.0/0`, Protocol `TCP`, Destination Port `80`.
   - **HTTPS**: Source `0.0.0.0/0`, Protocol `TCP`, Destination Port `443`.
   - *(Opcional si usas puertos directos)*: Port `5000` (API) o `3306` (MySQL solo si necesitas acceso remoto).

### 1.2. Abrir Puertos en el Firewall del VPS (iptables / ufw)
En las instancias de Ubuntu/Oracle Linux de OCI, suele haber un firewall a nivel del sistema operativo. Conéctate por SSH y ejecuta:

```bash
# Si usas Ubuntu con UFW:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Si OCI tiene reglas por defecto de iptables (común en Oracle Linux o Ubuntu OCI):
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## 2. Despliegue en Coolify

Coolify es un PaaS autoalojado compatible con Docker Compose.

### Opción A: Despliegue mediante Repositorio Git (Recomendado)

1. **Subir el código a GitHub / GitLab**:
   - Haz commit y push de este proyecto a un repositorio privado o público.

2. **Crear nuevo recurso en Coolify**:
   - Entra a tu panel de **Coolify** (`http://TU_IP_VPS:8000`).
   - Ve a **Projects** > Selecciona tu entorno (ej. `production`) > Clic en **+ New Resource**.
   - Selecciona **Git Repository** (público o privado con GitHub App / Deploy Key).
   - Ingresa la URL de tu repositorio y rama (`main` o `master`).

3. **Configurar como Docker Compose**:
   - Coolify detectará automáticamente el archivo `docker-compose.yml`.
   - En la pestaña **Configuration**:
     - Verifica que la ruta apunte a `docker-compose.yml`.

4. **Variables de Entorno (¡Ya Vienen Listas por Defecto!)**:
   - El repositorio ya incluye el archivo `.env` configurado y `docker-compose.yml` tiene valores por defecto para cada variable, por lo que **no es necesario escribir nada manualmente para desplegar**.
   - Si deseas personalizar credenciales, puedes modificarlas en la pestaña **Environment Variables** de Coolify:
     ```env
     DB_ROOT_PASSWORD=Sondondo_Root_Password_2026!
     DB_NAME=valle_sondondo_db
     DB_USER=sondondo_user
     DB_PASSWORD=Sondondo_Db_User_Pass_2026!
     ADMIN_USERNAME=admin@valledelsondondo.com
     ADMIN_PASSWORD=Sondondo2026!
     WHATSAPP_NUMBER=51966380590
     AGENCY_EMAIL=miskichaskaperu@hotmail.com
     ```

5. **Configurar Dominios y SSL**:
   - En Coolify, para el servicio `frontend`:
     - Asigna tu dominio (ej. `https://valledelsondondo.com` o `https://tours.tudominio.pe`).
     - Coolify generará automáticamente el certificado SSL mediante Let's Encrypt a través de Traefik/Caddy.

6. **Desplegar**:
   - Haz clic en el botón **Deploy**.
   - Coolify descargará el código, construirá las imágenes multi-etapa de .NET 9 y Angular, levantará MySQL, ejecutará las migraciones automáticas y dejará la web 100% activa.

---

### Opción B: Despliegue directo mediante Docker Compose en Coolify UI

1. En Coolify: **+ New Resource** > **Docker Compose**.
2. Pega el contenido de `docker-compose.yml`.
3. Rellena las variables de entorno en la interfaz de Coolify.
4. Haz clic en **Deploy**.

---

## 3. Verificación Post-Despliegue

1. **Healthcheck de la API**:
   - Accede a `https://tu-dominio.com/api/agency` o `https://tu-api/health`. Debe responder `Healthy`.
2. **Documentación Swagger**:
   - Accede a `https://tu-api/swagger` para probar interactivamente los endpoints de tours, reservas y testimonios.
3. **Persistencia de Base de Datos**:
   - El volumen `mysql_data` garantiza que todas las cotizaciones y datos seeded se mantengan intactos entre reinicios y actualizaciones.
