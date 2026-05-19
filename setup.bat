@echo off
REM =============================================================================
REM GSD Onboarding/Offboarding — First-time setup script (Windows)
REM Run from PowerShell or Command Prompt as a regular user
REM =============================================================================

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║   GSD Onboarding/Offboarding — Setup (Windows)  ║
echo ╚══════════════════════════════════════════════════╝
echo.

REM ── 1. Check Docker ─────────────────────────────────────────────────────────
docker --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] Docker not found.
    echo   Install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo [OK] Docker found.

REM ── 2. Check docker compose ─────────────────────────────────────────────────
docker compose version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] docker compose plugin not found.
    echo   Update Docker Desktop to the latest version.
    pause
    exit /b 1
)
echo [OK] Docker Compose found.

REM ── 3. Create .env from example ─────────────────────────────────────────────
IF NOT EXIST .env (
    copy .env.example .env >nul
    echo [OK] .env created from .env.example
    echo.
    echo  [!] Open .env in Notepad and fill in:
    echo      - SLACK_BOT_TOKEN
    echo      - SLACK_APP_TOKEN
    echo      - SLACK_SIGNING_SECRET
    echo      - GOOGLE_CLIENT_EMAIL
    echo      - GOOGLE_PRIVATE_KEY
    echo      - and other credentials
    echo.
) ELSE (
    echo [OK] .env already exists — skipped.
)

REM ── 4. Create storage directories ───────────────────────────────────────────
IF NOT EXIST hub\storage\db        mkdir hub\storage\db
IF NOT EXIST hub\storage\logs      mkdir hub\storage\logs
IF NOT EXIST hub\storage\uploads   mkdir hub\storage\uploads
IF NOT EXIST hub\storage\cache     mkdir hub\storage\cache
IF NOT EXIST slack-bot\storage\db  mkdir slack-bot\storage\db
IF NOT EXIST slack-bot\storage\logs mkdir slack-bot\storage\logs
echo [OK] Storage directories ready.

REM ── 5. Summary ──────────────────────────────────────────────────────────────
echo.
echo ══════════════════════════════════════════════════
echo  Setup complete!
echo.
echo  Next steps:
echo  1. Edit .env with your real credentials
echo  2. Run: docker compose up -d --build
echo  3. Hub: http://localhost:8081
echo  4. Bot: connects to Slack automatically via Socket Mode
echo.
echo  Useful commands:
echo    docker compose logs -f           (follow all logs)
echo    docker compose logs -f slack-bot (bot logs only)
echo    docker compose down              (stop everything)
echo ══════════════════════════════════════════════════
echo.
pause
