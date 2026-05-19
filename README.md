# GSD Onboarding / Offboarding

Automates employee onboarding and offboarding via Slack. Provisions Google Workspace, GitHub, Time Doctor, HubSpot and more — all triggered by simple Slack commands.

## Services

| Service | Description | Port |
|---|---|---|
| **slack-bot** | Node.js Slack bot (Bolt · Socket Mode) | 3000 (health) |
| **hub** | PHP dashboard for process management | 8081 |

---

## Quick Start — Local (Windows / Mac / Linux)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose)
- A Slack App with Socket Mode enabled — [create one here](https://api.slack.com/apps)
- A Google Cloud service account with domain-wide delegation

### 1 — Clone and setup

**Mac / Linux:**
```bash
git clone <repo-url>
cd onboarding-offboarding
./setup.sh
```

**Windows (PowerShell or CMD):**
```bat
git clone <repo-url>
cd onboarding-offboarding
setup.bat
```

### 2 — Fill in your credentials

Open `.env` in any text editor and set your real values:

```env
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_APP_TOKEN=xapp-...
GOOGLE_CLIENT_EMAIL=sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_ADMIN_EMAIL=admin@yourcompany.com
GOOGLE_DOMAIN=yourcompany.com
GOOGLE_CUSTOMER_ID=C0xxxxxx
```

### 3 — Start everything

```bash
docker compose up -d --build
```

- Hub dashboard → http://localhost:8081
- Bot → connects to Slack automatically via Socket Mode

### 4 — Follow logs

```bash
docker compose logs -f           # all services
docker compose logs -f slack-bot # bot only
docker compose logs -f hub       # hub only
```

---

## Development Mode (hot reload)

Changes to source files reflect immediately without rebuilding:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

The bot runs with `node --watch` and the Hub serves PHP files directly from your local `src/` folder.

---

## Slack App Setup

### 1 — Create the Slack App

1. Go to https://api.slack.com/apps → **Create New App** → **From a manifest**
2. Paste the contents of `slack-app-manifest.json`
3. Install the app to your workspace

### 2 — Get your tokens

| Token | Where to find it |
|---|---|
| `SLACK_BOT_TOKEN` | OAuth & Permissions → Bot User OAuth Token |
| `SLACK_SIGNING_SECRET` | Basic Information → App Credentials |
| `SLACK_APP_TOKEN` | Basic Information → App-Level Tokens → Generate (scope: `connections:write`) |

### 3 — Register slash commands

Go to **Slash Commands** and verify these exist (the manifest creates them automatically):

| Command | Who uses it |
|---|---|
| `/onboard` | HR — start onboarding |
| `/offboard` | HR — start offboarding |
| `/hr-status` | HR — view active processes |
| `/gsdaccount` | Any employee — self-service password change |
| `/resetpassword` | IT — send password reset to an employee |

After any change to slash commands: **OAuth & Permissions → Reinstall to Workspace**.

---

## Google Workspace Setup

1. Create a **Service Account** in Google Cloud Console
2. Enable **Domain-Wide Delegation** on the service account
3. In **Google Admin Console** (admin.google.com):
   - Security → Access and data control → API Controls → **Domain-wide delegation**
   - Add the service account Client ID with these scopes:

```
https://www.googleapis.com/auth/admin.directory.user,
https://www.googleapis.com/auth/apps.licensing,
https://www.googleapis.com/auth/admin.directory.customer.readonly,
https://www.googleapis.com/auth/drive
```

---

## Deploy on Railway

Railway deploys each service separately from the same repository.

### Step 1 — Create a Railway project

1. Go to https://railway.app → New Project → **Deploy from GitHub repo**
2. Select this repository

### Step 2 — Add the Slack Bot service

1. **Add Service** → **GitHub Repo** → select the repo
2. Set **Root Directory** to `slack-bot`
3. Railway auto-detects the `Dockerfile` and `railway.toml`
4. Add all environment variables from `.env.example` in the **Variables** tab

### Step 3 — Add the Hub service (optional)

1. **Add Service** → **GitHub Repo** → select the repo again
2. Set **Root Directory** to `hub`
3. Add `HUB_APP_URL=https://your-hub.railway.app` and other Hub vars

### Step 4 — Persistent volumes (Railway)

In Railway, create a **Volume** for each service:

| Service | Mount path |
|---|---|
| slack-bot | `/app/storage` |
| hub | `/var/www/html/storage` |

> ⚠️ Without volumes, SQLite data resets on every deploy. Use MySQL for production.

---

## Common Commands

```bash
# Start production
docker compose up -d --build

# Stop
docker compose down

# Restart after code change
docker compose restart slack-bot

# Rebuild a single service
docker compose up -d --build slack-bot

# Open a shell inside the bot container
docker compose exec slack-bot sh

# Open a shell inside the hub container
docker compose exec hub bash

# Remove everything including data volumes
docker compose down -v --rmi all
```

---

## Environment Variables Reference

See `.env.example` for the full list with comments.

### Required (bot won't start without these)
| Variable | Description |
|---|---|
| `SLACK_BOT_TOKEN` | Bot token from Slack |
| `SLACK_SIGNING_SECRET` | Signing secret from Slack |
| `SLACK_APP_TOKEN` | App-level token (Socket Mode) |

### Google Workspace
| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Service account private key |
| `GOOGLE_ADMIN_EMAIL` | Super admin email (impersonation subject) |
| `GOOGLE_DOMAIN` | Your Google Workspace domain |
| `GOOGLE_CUSTOMER_ID` | Found in Admin Console → Account → Settings |
| `GOOGLE_WORKSPACE_SKU_ID` | License SKU to auto-assign (optional) |
| `GOOGLE_LICENSE_DELAY_MS` | Wait between account creation and license (default: 5000) |

---

## Project Structure

```
onboarding-offboarding/
├── .env.example              ← copy to .env and fill in credentials
├── docker-compose.yml        ← production (named volumes, restart policies)
├── docker-compose.dev.yml    ← local dev (bind mounts, hot reload)
├── Makefile                  ← shortcuts (make up / make dev / make logs)
├── setup.sh                  ← first-time setup (Mac/Linux)
├── setup.bat                 ← first-time setup (Windows)
├── slack-app-manifest.json   ← paste this in api.slack.com to create the app
│
├── slack-bot/                ← Node.js Slack bot
│   ├── Dockerfile
│   ├── railway.toml
│   └── src/
│       ├── app.js            ← Bolt app factory
│       ├── server.js         ← entry point + health server
│       ├── config/           ← zod-validated env config
│       ├── handlers/         ← commands, views, actions, events
│       ├── integrations/     ← Google, GitHub, HubSpot, etc.
│       ├── workflows/        ← onboarding & offboarding steps
│       └── repositories/     ← SQLite data access
│
└── hub/                      ← PHP dashboard
    ├── Dockerfile
    ├── railway.toml
    ├── config/
    │   └── config.example.php  ← reads from $_ENV — copy as config.php
    └── src/                    ← PSR-12 SOLID PHP application
```

---

## Credits

Built and maintained by **Anderson Martinez** ([@andersonmartinezgsd](https://github.com/andersonmartinezgsd))
for **[GSD Outsources](https://gsdoutsources.com)** — IT & Operations Team.

> Engineered with [Claude Code](https://claude.ai/claude-code) · May 2025
