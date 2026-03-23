#!/bin/bash
#
# Build script for all platforms
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🔨 Building skill-discuss-for-specs for all platforms..."

# L2 Platforms (Skills + Hooks)
echo ""
echo "═══════════════════════════════════════"
echo "  L2 Platforms (Skills + Hooks)"
echo "═══════════════════════════════════════"

echo ""
echo "📦 Building for Claude Code..."
"$PROJECT_ROOT/platforms/claude-code/build.sh"

echo ""
echo "📦 Building for Cursor..."
"$PROJECT_ROOT/platforms/cursor/build.sh"

# L1 Platforms (Skills only)
echo ""
echo "═══════════════════════════════════════"
echo "  L1 Platforms (Skills only)"
echo "═══════════════════════════════════════"

echo ""
echo "📦 Building for Kilocode..."
"$PROJECT_ROOT/platforms/kilocode/build.sh"

echo ""
echo "📦 Building for OpenCode..."
"$PROJECT_ROOT/platforms/opencode/build.sh"

echo ""
echo "📦 Building for Codex CLI..."
"$PROJECT_ROOT/platforms/codex/build.sh"

echo ""
echo "✅ Build complete for all platforms!"
echo ""
echo "Platforms built:"
echo "  L2: claude-code, cursor"
echo "  L1: kilocode, opencode, codex"
