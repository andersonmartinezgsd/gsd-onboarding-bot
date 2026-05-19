# Deploy en Hostinger + Configuración Slack

## Arquitectura de producción

```
Internet
   │
   ▼
Hostinger VPS (Ubuntu)
   │
   ├── Nginx (puerto 80/443) ──► SSL Let's Encrypt
   │      │
   │      └──► Proxy → Node.js Bot (puerto 3000)
   │
   ├── Node.js Bot (PM2)
   │      └── src/server.js (HTTP mode, no Socket Mode)
   │
   └── SQLite DB
          └── storage/db/onboarding.sqlite
```

---

## 1. Requisitos en Hostinger

Necesitas un **VPS** (no shared hosting). El bot es un proceso Node.js que debe estar corriendo continuamente.

- Plan recomendado: **KVM 2** o superior (~$8/mes)
- OS: Ubuntu 22.04 LTS
- Necesitas: Node.js 20+, Nginx, PM2, Certbot

---

## 2. Preparar el servidor

```bash
# Conectar por SSH
ssh root@TU_IP_HOSTINGER

# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar versión
node --version   # v20.x.x
npm --version    # 10.x.x

# Instalar PM2 (gestor de procesos)
npm install -g pm2

# Instalar Nginx
apt install -y nginx

# Instalar Certbot (SSL gratuito)
apt install -y certbot python3-certbot-nginx
```

---

## 3. Subir el código

**Opción A — Git (recomendado):**
```bash
# En el servidor
cd /var/www
git clone https://github.com/TU-ORG/onboarding-offboarding.git
cd onboarding-offboarding/slack-bot
npm install --production
```

**Opción B — SFTP desde tu máquina:**
En Hostinger panel → File Manager o usar FileZilla/Cyberduck.
Subir la carpeta `slack-bot/` a `/var/www/slack-bot/`.

---

## 4. Configurar variables de entorno

```bash
cd /var/www/onboarding-offboarding/slack-bot
cp .env.example .env
nano .env
```

**Variables obligatorias para producción:**
```env
NODE_ENV=production
PORT=3000
USE_SOCKET_MODE=false          # ← IMPORTANTE: HTTP mode en producción

SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
# SLACK_APP_TOKEN no se necesita en modo HTTP

HR_CHANNEL_ID=C0HR000000
IT_CHANNEL_ID=C0IT000000

DB_PATH=/var/www/onboarding-offboarding/slack-bot/storage/db/onboarding.sqlite

# Integraciones opcionales
GITHUB_TOKEN=ghp_...
GITHUB_ORG=gsd-outsources

GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_ADMIN_EMAIL=admin@gsdoutsources.com
GOOGLE_DOMAIN=gsdoutsources.com

TIMEDOCTOR_ACCESS_TOKEN=...
TIMEDOCTOR_COMPANY_ID=...

HUBSPOT_ACCESS_TOKEN=pat-na1-...

SCALEFUSION_API_KEY=...
```

```bash
# Crear directorio para la DB
mkdir -p storage/db storage/logs
```

---

## 5. Configurar Nginx como reverse proxy

```bash
nano /etc/nginx/sites-available/hr-bot
```

```nginx
server {
    listen 80;
    server_name bot.gsdoutsources.com;   # ← tu dominio o subdominio

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Activar el sitio
ln -s /etc/nginx/sites-available/hr-bot /etc/nginx/sites-enabled/
nginx -t                    # verificar config
systemctl reload nginx
```

---

## 6. SSL con Let's Encrypt (HTTPS obligatorio para Slack)

```bash
# Apuntar tu dominio a la IP del VPS antes de este paso
# En Hostinger → DNS → Añadir registro A: bot.gsdoutsources.com → TU_IP

certbot --nginx -d bot.gsdoutsources.com
# Seleccionar: 2 (Redirect HTTP to HTTPS)
```

Certbot se renueva automáticamente. Verificar:
```bash
certbot renew --dry-run
```

---

## 7. Iniciar el bot con PM2

```bash
cd /var/www/onboarding-offboarding/slack-bot

# Iniciar
pm2 start ecosystem.config.js --env production

# Guardar configuración para que arranque al reiniciar el servidor
pm2 save
pm2 startup    # ejecutar el comando que te muestre

# Monitorear
pm2 status
pm2 logs hr-bot
pm2 monit      # dashboard en tiempo real
```

---

## 8. Configurar Slack App para producción (HTTP mode)

Una vez que el bot está corriendo y Nginx/SSL funcionan:

### 8a. Actualizar Request URL en Slack

Ve a **api.slack.com/apps** → tu app:

| Sección | URL |
|---|---|
| **Interactivity & Shortcuts** → Request URL | `https://bot.gsdoutsources.com/slack/events` |
| **Slash Commands** → cada comando → Request URL | `https://bot.gsdoutsources.com/slack/events` |
| **Event Subscriptions** → Request URL | `https://bot.gsdoutsources.com/slack/events` |

### 8b. Verificar el endpoint

```bash
curl https://bot.gsdoutsources.com/healthz
# Respuesta: {"status":"ok","uptime":123}
```

### 8c. Desactivar Socket Mode

En la app de Slack → **Socket Mode** → Toggle OFF (ya no se necesita en producción).

---

## 9. Reglas de acceso en Slack

### ¿Quién puede usar los comandos `/onboard` y `/offboard`?

Por defecto cualquier miembro del workspace puede ejecutarlos. Para restringirlo:

**Opción A — Restricción por canal (recomendada para MVP):**
```javascript
// En src/handlers/commands.js, añadir al inicio de cada handler:
app.command('/onboard', async ({ ack, body, respond, client }) => {
  await ack();

  // Solo permitir desde el canal de HR
  const allowedChannels = [process.env.HR_CHANNEL_ID];
  if (body.channel_id && !allowedChannels.includes(body.channel_id)) {
    await respond({
      response_type: 'ephemeral',
      text: '⛔ Este comando solo puede usarse desde el canal #people-ops.',
    });
    return;
  }
  // ... resto del handler
```

**Opción B — Restricción por usuario/rol:**
```javascript
// Lista de Slack User IDs autorizados (HR team)
const AUTHORIZED_USERS = (process.env.AUTHORIZED_USER_IDS ?? '').split(',').filter(Boolean);

if (AUTHORIZED_USERS.length > 0 && !AUTHORIZED_USERS.includes(body.user_id)) {
  await respond({
    response_type: 'ephemeral',
    text: '⛔ No tienes permiso para usar este comando. Contacta a HR.',
  });
  return;
}
```

Añadir al `.env`:
```env
# IDs de Slack separados por coma — solo estos usuarios pueden usar /onboard y /offboard
AUTHORIZED_USER_IDS=U0HR001,U0HR002,U0ADMIN
```

**Opción C — Slack Admin (Enterprise Grid):**
Si tienen Slack Enterprise Grid, pueden usar **Workflow Builder** y **App Permissions** para restringir comandos a User Groups específicos directamente desde el panel de Slack.

---

## 10. Comandos útiles de mantenimiento

```bash
# Ver logs en tiempo real
pm2 logs hr-bot --lines 100

# Reiniciar el bot (después de cambios en .env)
pm2 restart hr-bot

# Actualizar código desde Git
cd /var/www/onboarding-offboarding/slack-bot
git pull origin main
npm install --production
pm2 restart hr-bot

# Ver estado de la DB
sqlite3 storage/db/onboarding.sqlite ".tables"
sqlite3 storage/db/onboarding.sqlite "SELECT id, process_type, client_name, employee_name, status, created_at FROM processes ORDER BY id DESC LIMIT 10;"

# Backup de la DB
cp storage/db/onboarding.sqlite storage/db/backup-$(date +%Y%m%d).sqlite
```

---

## 11. Diagrama de flujo completo en producción

```
Usuario en Slack escribe /onboard
         │
         ▼
   Slack envía POST ──► https://bot.gsdoutsources.com/slack/events
         │                    │
         │                    ▼
         │              Nginx recibe
         │                    │
         │                    ▼
         │              Node.js Bot (Puerto 3000)
         │              Bolt verifica firma con SLACK_SIGNING_SECRET
         │                    │
         │                    ▼
         │              handlers/commands.js
         │              Verifica si usuario tiene permiso
         │                    │
         ▼                    ▼
   Slack muestra       client.views.open() ──► Modal en Slack
     el modal
         │
         ▼
   Usuario rellena y envía
         │
         ▼
   Slack POST ──► /slack/events
         │
         ▼
   handlers/views.js → startOnboarding()
         │
         ├── Crea registro en SQLite
         ├── Post tracker a #people-ops
         │
         └── setImmediate → runOnboardingSteps()
               ├── Google Workspace API
               ├── ScaleFusion API (enrollment)
               ├── GitHub API
               ├── Time Doctor API
               ├── HubSpot API
               └── chat.update() ← actualiza tracker en Slack
```
