#!/usr/bin/env bash
# server.sh - Launch jest-mcp server with support for fnm, nvm, or system node

set -e

# Change to the directory this script is in
cd "$(dirname "$0")"

# Try to use fnm if available
if command -v fnm >/dev/null 2>&1; then
  echo "Using fnm Node version manager..."
  eval $(fnm env)
fi

# Try to use nvm if available
if [ -s "$NVM_DIR/nvm.sh" ]; then
  echo "Using nvm Node version manager..."
  . "$NVM_DIR/nvm.sh"
fi

# Try to use asdf if available
if command -v asdf >/dev/null 2>&1; then
  echo "Using asdf Node version manager..."
  . "$HOME/.asdf/asdf.sh"
fi

if command -v node >/dev/null 2>&1; then
  exec node server.ts
fi

echo "No Node.js runtime found. Please install Node.js or a Node version manager (fnm, nvm, asdf)."
exit 1
