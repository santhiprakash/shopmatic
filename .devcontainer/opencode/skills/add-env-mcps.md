# Add Brave Search and Neon to Opencode

Opencode doesn't support the `env` field in MCP configs. Here's how to enable them:

## Option 1: Set Environment Variables (Recommended)

Add to your `~/.zshrc`:

```bash
# Brave Search API
export BRAVE_API_KEY="BSAeAj1CfO9eDRoeOZrs36tPpCiozl9"

# Neon Database API
export NEON_API_KEY="napi_0itfbbz4v7g3x49pf3472orrx57eghexnsv1edjkwd7kj6257goyokaogu1uzzg5"
```

Then reload:
```bash
source ~/.zshrc
```

Now add to `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "brave-search": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-brave-search"],
      "enabled": true
    },
    "neon": {
      "type": "local",
      "command": ["npx", "-y", "@neondatabase/mcp-server-neon@latest"],
      "enabled": true
    }
  }
}
```

## Option 2: Use Shell Wrapper

Create wrapper scripts that set the env vars:

```bash
# ~/.config/opencode/scripts/brave-search.sh
#!/bin/bash
export BRAVE_API_KEY="BSAeAj1CfO9eDRoeOZrs36tPpCiozl9"
exec npx -y @modelcontextprotocol/server-brave-search
```

```bash
# Make executable
chmod +x ~/.config/opencode/scripts/brave-search.sh
```

Then in `opencode.json`:
```json
{
  "brave-search": {
    "type": "local",
    "command": ["~/.config/opencode/scripts/brave-search.sh"],
    "enabled": true
  }
}
```

## Current Working MCPs

✅ chrome-devtools
✅ context7
✅ sequentialthinking  
✅ firebase
✅ fetch
✅ memory

Test with: `opencode`
