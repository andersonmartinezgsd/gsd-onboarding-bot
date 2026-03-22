#!/usr/bin/env bash
# ─────────────────────────────────────────────
#  AMR Tech — Servidor local AMR Hub
#  Puerto fijo: 9476
# ─────────────────────────────────────────────

PORT=9476
ROOT="/Users/andersonmartinezrestrepo/DEV-PROJECTS/Framework/hub/public"

echo ""
echo "  AMR Hub corriendo en → http://localhost:${PORT}"
echo "  Raíz: ${ROOT}"
echo "  Ctrl+C para detener"
echo ""

php -S "localhost:${PORT}" -t "${ROOT}"
