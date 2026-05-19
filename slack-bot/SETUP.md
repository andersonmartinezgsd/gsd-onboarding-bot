# Onboarding & Offboarding Bot — Setup Guide

## Stack

- **Runtime:** Node.js 20+
- **Bot Framework:** `@slack/bolt` 4.x (Socket Mode for dev, HTTP for prod)
- **Database:** SQLite via `better-sqlite3`
- **Integrations:** GitHub (`@octokit/rest`), Google Workspace (`googleapis`)

---

## 1. Create the Slack App

1. Go to https://api.slack.com/apps → **Create New App** → **From scratch**
2. Name it (e.g., `HR Bot`) and pick your workspace

### OAuth Scopes (Bot Token Scopes)

Go to **OAuth & Permissions** → **Bot Token Scopes** and add:

| Scope | Purpose |
|---|---|
| `channels:manage` | Invite users to channels |
| `chat:write` | Post messages |
| `chat:write.public` | Post to channels without joining |
| `commands` | Register slash commands |
| `users:read` | Look up user info |
| `users:read.email` | Look up users by email |
| `im:write` | Send DMs |

### Slash Commands

Go to **Slash Commands** and create:

| Command | Request URL (prod) | Description |
|---|---|---|
| `/onboard` | `https://your-domain.com/slack/events` | Start onboarding |
| `/offboard` | `https://your-domain.com/slack/events` | Start offboarding |
| `/hr-status` | `https://your-domain.com/slack/events` | View active processes |

### Interactivity & Shortcuts

Go to **Interactivity & Shortcuts** → Enable → set Request URL to `https://your-domain.com/slack/events`

### Socket Mode (Development)

Go to **Socket Mode** → Enable Socket Mode → Generate an App-Level Token with `connections:write` scope.

### Event Subscriptions

Enable Events → Subscribe to bot events:
- `app_mention`

### Install the App

Go to **Install App** → Install to workspace → copy the **Bot User OAuth Token** (`xoxb-...`)

---

## 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token   # Socket Mode only
HR_CHANNEL_ID=C0YOURCHANNELID        # ID of your #hr or #people-ops channel
```

### Get channel IDs

Right-click a channel in Slack → **Copy link** — the ID is the last segment (e.g., `C0ABC123`).

---

## 3. Optional Integrations

### GitHub

1. Create a **Personal Access Token** (or GitHub App) with `admin:org` scope
2. Add to `.env`:
   ```env
   GITHUB_TOKEN=ghp_yourtoken
   GITHUB_ORG=your-org-slug
   ```

### Google Workspace

1. Create a **Service Account** in GCP Console
2. Enable **Admin SDK API** and **Google Drive API**
3. Grant the service account **Domain-wide delegation**
4. In Google Admin → Security → API controls → add the service account with these scopes:
   - `https://www.googleapis.com/auth/admin.directory.user`
   - `https://www.googleapis.com/auth/admin.directory.group`
   - `https://www.googleapis.com/auth/drive`
5. Download the JSON key and add to `.env`:
   ```env
   GOOGLE_CLIENT_EMAIL=sa@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_ADMIN_EMAIL=admin@yourcompany.com
   GOOGLE_DOMAIN=yourcompany.com
   ```

---

## 4. Run the Bot

```bash
# Install dependencies
npm install

# Development (Socket Mode — no public URL needed)
npm run dev

# Production
NODE_ENV=production USE_SOCKET_MODE=false npm start

# With pm2
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

---

## 5. Usage

### Start Onboarding

Type `/onboard` in any Slack channel → Fill the modal → Submit.

The bot will:
1. Post a live tracker card in the `#hr` channel
2. Create Google Workspace account
3. Create onboarding Drive folder
4. Send GitHub org invitation (if configured)
5. Add employee to specified Slack channels
6. Notify the manager
7. Send a welcome DM to the new employee
8. Wait for IT to click **Hardware Ready**

### Start Offboarding

Type `/offboard` → Fill the modal → Submit.

The bot will:
1. Post a tracker card in `#hr`
2. Notify the manager
3. Transfer Google Drive files to specified recipient
4. Wait for manual confirmations:
   - **Exit Interview Done** (HR clicks the button)
   - **Hardware Returned** (IT clicks the button)
5. On **Revoke All Access Now** click: revoke GitHub + suspend Google account

### Check Status

- `/hr-status` — lists all active processes
- Mention the bot: `@HR Bot status` — inline status summary

---

## 6. Architecture

```
src/
├── config/       # Env validation (zod)
├── db/           # SQLite connection + migrations
├── blocks/       # Block Kit builders (pure functions)
├── handlers/     # Slack slash commands, actions, modals, events
├── workflows/    # Business logic orchestrators
├── integrations/ # GitHub, Google, Slack, webhook clients
├── repositories/ # Data access layer
└── utils/        # Logger, error types
```

### Data Flow

```
/onboard slash command
  → commands.js: open modal
  → views.js: modal submit → startOnboarding()
  → onboarding.js: create DB record, post tracker, run steps
  → steps.js: call integrations
  → blocks/onboarding.js: rebuild tracker → chat.update()

Button click (hardware ready, etc.)
  → actions.js: call completeManualStep()
  → onboarding.js: update DB → refreshTrackerMessage()
```

---

## 7. Adding Custom Steps

1. Add the step definition to `ONBOARDING_STEPS` or `OFFBOARDING_STEPS` in `src/workflows/steps.js`
2. Add the executor function in `stepExecutors`
3. If it's a manual step, add the key to the `MANUAL_STEPS` set and add a button in `src/blocks/onboarding.js` or `offboarding.js`
4. Register the action handler in `src/handlers/actions.js`
