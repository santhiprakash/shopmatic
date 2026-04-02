# SPB Dev Container
# Compatible with: DevPod, VS Code Dev Containers, GitHub Codespaces

FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Install gettext for envsubst (config template processing)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Update npm to latest
RUN npm install -g npm@latest

# Install AI coding CLIs globally
RUN npm install -g opencode-ai@latest @kilocode/cli@latest

# Copy configuration template
COPY opencode.json.template /tmp/opencode.json.template
