#!/bin/bash
set -eo pipefail

# ============================================================
# Load API keys from .env
# ============================================================
WORKSPACE_DIR="$(ls -d /workspaces/*/ 2>/dev/null | head -1)"
ENV_FILE="${WORKSPACE_DIR}.devcontainer/.env"

if [ -f "$ENV_FILE" ]; then
  echo "🔑 Loading environment from .env"
  set -a
  source "$ENV_FILE"
  set +a

  # Persist ALL .env vars for interactive SSH sessions
  # This ensures devpod ssh / VS Code terminal has access to everything
  BASHRC="$HOME/.bashrc"
  echo "" >> "$BASHRC"
  echo "# --- SPB Dev Container: project env vars (auto-generated) ---" >> "$BASHRC"
  echo "if [ -f \"$ENV_FILE\" ]; then set -a; source \"$ENV_FILE\"; set +a; fi" >> "$BASHRC"
else
  echo "⚠️  No .env found. Copy .env.example to .env and add your keys."
  echo "   Then rebuild: devpod delete <project> && devpod up . --ide none"
fi

# Vars to inject into config template
ENV_VARS='${ZAI_API_KEY} ${MINIMAX_API_KEY} ${NVIDIA_API_KEY} ${BRAVE_API_KEY}'

# ============================================================
# 1. Opencode CLI Setup
# ============================================================
echo "🔧 Setting up Opencode CLI..."

OPENCODE_CONFIG="$HOME/.config/opencode"
OPENCODE_DATA="$HOME/.local/share/opencode"
mkdir -p "$OPENCODE_CONFIG" "$OPENCODE_DATA"

envsubst "$ENV_VARS" < /tmp/opencode.json.template > "$OPENCODE_CONFIG/opencode.json"

# Generate auth.json (Opencode Go + provider keys)
OPENCODE_AUTH="{"
SEP=""
if [ -n "${OPENCODE_GO_KEY:-}" ]; then
  OPENCODE_AUTH+="${SEP}\"opencode-go\":{\"type\":\"api\",\"key\":\"${OPENCODE_GO_KEY}\"}"
  SEP=","
fi
if [ -n "${ZAI_API_KEY:-}" ]; then
  OPENCODE_AUTH+="${SEP}\"zai-coding-plan\":{\"type\":\"api\",\"key\":\"${ZAI_API_KEY}\"}"
  SEP=","
fi
if [ -n "${MINIMAX_API_KEY:-}" ]; then
  OPENCODE_AUTH+="${SEP}\"minimax-coding-plan\":{\"type\":\"api\",\"key\":\"${MINIMAX_API_KEY}\"}"
  SEP=","
fi
OPENCODE_AUTH+="}"
echo "$OPENCODE_AUTH" > "$OPENCODE_DATA/auth.json"

echo "✅ Opencode CLI configured"

# ============================================================
# 2. Kilo Code CLI Setup
# ============================================================
echo "🔧 Setting up Kilo Code CLI..."

KILO_CONFIG="$HOME/.config/kilo"
KILO_DATA="$HOME/.local/share/kilo"
mkdir -p "$KILO_CONFIG" "$KILO_DATA"

envsubst "$ENV_VARS" < /tmp/opencode.json.template > "$KILO_CONFIG/opencode.json"

# Generate auth.json (Kilo subscription + Nvidia)
KILO_AUTH="{"
SEP=""
if [ -n "${KILO_API_KEY:-}" ]; then
  KILO_AUTH+="${SEP}\"kilo\":{\"type\":\"api\",\"key\":\"${KILO_API_KEY}\"}"
  SEP=","
fi
if [ -n "${NVIDIA_API_KEY:-}" ]; then
  KILO_AUTH+="${SEP}\"nvidia\":{\"type\":\"api\",\"key\":\"${NVIDIA_API_KEY}\"}"
  SEP=","
fi
KILO_AUTH+="}"
echo "$KILO_AUTH" > "$KILO_DATA/auth.json"

echo "✅ Kilo Code CLI configured"

# ============================================================
# 3. Kilo Code VS Code Extension MCP Settings
# ============================================================
KILO_VSCODE_DIR="$HOME/.local/share/kilocode"
mkdir -p "$KILO_VSCODE_DIR"

BRAVE_KEY="${BRAVE_API_KEY:-}"
cat > "$KILO_VSCODE_DIR/mcp_settings.json" << MCPEOF
{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]},"sequentialthinking":{"command":"npx","args":["-y","@modelcontextprotocol/server-sequential-thinking"]},"bravesearch":{"command":"npx","args":["-y","@modelcontextprotocol/server-brave-search"],"env":{"BRAVE_API_KEY":"${BRAVE_KEY}"},"alwaysAllow":["brave_web_search"]}}}
MCPEOF

echo "✅ Kilo Code VS Code MCP configured"

# ============================================================
# 4. Install Project Dependencies
# ============================================================
if [ -n "${WORKSPACE_DIR:-}" ] && [ -f "${WORKSPACE_DIR}package.json" ]; then
  echo "📦 Installing project dependencies..."
  cd "$WORKSPACE_DIR"
  npm install

  if [ -f "server/package.json" ]; then
    echo "📦 Installing backend dependencies..."
    cd server && npm install && cd ..
  fi
fi

echo ""
echo "🚀 Dev environment ready!"
echo "   Run 'opencode' for Opencode CLI"
echo "   Run 'kilo' for Kilo Code CLI"
echo ""
echo "   Available models:"
echo "   • SPB GLM-5.1 / GLM-5 Turbo / GLM-5  (Z.AI)"
echo "   • SPB MiniMax M2.7 / M2.5             (MiniMax)"
echo "   • SPB Kimi K2.5                        (Nvidia)"
