#!/usr/bin/env bash
# Preparación mínima para macOS/Linux. Idempotente; un paso opcional que falla avisa y sigue.
# Uso: bash scripts/setup.sh
set -u
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/bin:$PATH"

ok()    { printf '[OK] %s\n' "$*"; }
aviso() { printf '[!!] %s\n' "$*"; }
tiene() { command -v "$1" >/dev/null 2>&1; }

# uv
if ! tiene uv; then
  aviso "Falta uv; instalando con el instalador oficial de astral.sh..."
  curl -LsSf https://astral.sh/uv/install.sh | sh || aviso "No se pudo instalar uv."
  export PATH="$HOME/.local/bin:$PATH"
fi

if tiene uv; then
  uv python install 3.12 || aviso "No se pudo instalar Python 3.12."
  if tiene markitdown; then ok "markitdown ya instalado"; else
    uv tool install --python 3.12 "markitdown[all]" || aviso "Falló markitdown."
  fi
  if tiene skillspector; then ok "skillspector ya instalado"; else
    uv tool install --python 3.12 git+https://github.com/NVIDIA/skillspector.git || aviso "Falló skillspector (opcional)."
  fi
else
  aviso "Sin uv no se instalan markitdown ni skillspector."
fi

# Agentes gratuitos (necesitan node/npm)
if tiene npm; then
  tiene codex    && ok "codex ya instalado"    || npm install -g @openai/codex || aviso "Falló codex."
  tiene opencode && ok "opencode ya instalado" || npm install -g opencode-ai   || aviso "Falló opencode."
else
  aviso "Falta npm/node: instala Node LTS (https://nodejs.org o brew install node) y repite."
fi

# .env
if [ -f "$RAIZ/.env" ]; then ok ".env ya existe"
elif [ -f "$RAIZ/.env.example" ]; then cp "$RAIZ/.env.example" "$RAIZ/.env" && ok ".env creado desde .env.example"
else aviso "No existe .env.example; .env no creado."; fi

echo
echo "=== Resumen ==="
for t in git gh node uv markitdown skillspector codex opencode ollama; do
  if tiene "$t"; then printf '  %-13s OK\n' "$t"; else printf '  %-13s falta\n' "$t"; fi
done
echo
echo "Logins pendientes (si aplica): gh auth login | codex login | gemini"
exit 0
