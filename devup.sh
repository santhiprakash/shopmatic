#!/bin/bash
# ============================================================
# SPB Dev Container Launcher
# Usage: ./devup.sh [project-path]
# Example: ./devup.sh ~/Projects/ecomjunction
# ============================================================
set -eo pipefail

# Colors
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

# ============================================================
# 1. Get project path
# ============================================================
PROJECT_PATH="${1:-.}"
PROJECT_PATH="$(cd "$PROJECT_PATH" 2>/dev/null && pwd)" || {
  echo -e "${RED}Error: Directory '$1' not found${NC}"
  exit 1
}
PROJECT_NAME="$(basename "$PROJECT_PATH")"

# Check .devcontainer exists
if [ ! -f "$PROJECT_PATH/.devcontainer/devcontainer.json" ]; then
  echo -e "${RED}Error: No .devcontainer/ found in $PROJECT_PATH${NC}"
  echo -e "Copy one first: ${CYAN}cp -r ~/Projects/spbcode/.devcontainer $PROJECT_PATH/${NC}"
  exit 1
fi

# Check .env exists
if [ ! -f "$PROJECT_PATH/.devcontainer/.env" ]; then
  echo -e "${YELLOW}Warning: No .env file found.${NC}"
  echo -e "Copy the template: ${CYAN}cp $PROJECT_PATH/.devcontainer/.env.example $PROJECT_PATH/.devcontainer/.env${NC}"
  echo ""
fi

# ============================================================
# 2. Choose where to run
# ============================================================
echo -e "${BOLD}SPB Dev Container — ${PROJECT_NAME}${NC}"
echo ""
echo "Where do you want to run the container?"
echo ""
echo -e "  ${CYAN}1)${NC} 🖥️  Local Docker     (runs on this Mac)"
echo -e "  ${CYAN}2)${NC} ☁️  Azure VM (SSH)    (runs on remote server)"
echo ""
read -p "Select [1/2]: " CHOICE

case "$CHOICE" in
  1)
    PROVIDER="docker"
    LOCATION="Local Docker"
    # Verify local Docker is running
    if ! docker info > /dev/null 2>&1; then
      echo -e "${RED}Error: Docker is not running. Start Docker Desktop first.${NC}"
      exit 1
    fi
    ;;
  2)
    PROVIDER="ssh"
    LOCATION="Azure VM (SSH)"
    # Verify SSH host is reachable
    if ! ssh -o ConnectTimeout=5 dev "echo ok" > /dev/null 2>&1; then
      echo -e "${RED}Error: Cannot reach SSH host 'dev'. Check your connection.${NC}"
      exit 1
    fi
    ;;
  *)
    echo -e "${RED}Invalid choice. Use 1 or 2.${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}▶ Starting ${PROJECT_NAME} on ${LOCATION}...${NC}"
echo ""

# ============================================================
# 3. Check if workspace already exists
# ============================================================
EXISTING=$(devpod list 2>/dev/null | grep -w "$PROJECT_NAME" || true)
if [ -n "$EXISTING" ]; then
  EXISTING_PROVIDER=$(echo "$EXISTING" | awk '{print $NF}' | head -1)
  # Simplified: just check if it mentions the provider
  echo -e "${YELLOW}Workspace '${PROJECT_NAME}' already exists.${NC}"
  read -p "Delete and recreate? [y/N]: " RECREATE
  if [[ "$RECREATE" =~ ^[Yy]$ ]]; then
    echo "Deleting old workspace..."
    devpod delete "$PROJECT_NAME" 2>/dev/null || true
  else
    echo "Resuming existing workspace..."
  fi
fi

# ============================================================
# 4. Launch container
# ============================================================
devpod up "$PROJECT_PATH" --provider "$PROVIDER" --ide none

echo ""
echo -e "${GREEN}✅ Container ready!${NC}"
echo ""
echo -e "  📍 Running on: ${BOLD}${LOCATION}${NC}"
echo -e "  📂 Project:    ${BOLD}${PROJECT_NAME}${NC}"
echo ""
echo -e "  Connect:  ${CYAN}devpod ssh ${PROJECT_NAME}${NC}"
echo -e "  Opencode: ${CYAN}devpod ssh ${PROJECT_NAME} --command opencode${NC}"
echo -e "  Stop:     ${CYAN}devpod stop ${PROJECT_NAME}${NC}"
echo -e "  Delete:   ${CYAN}devpod delete ${PROJECT_NAME}${NC}"
echo ""

# ============================================================
# 5. Offer to connect
# ============================================================
read -p "Connect now? [Y/n]: " CONNECT
if [[ ! "$CONNECT" =~ ^[Nn]$ ]]; then
  devpod ssh "$PROJECT_NAME"
fi
