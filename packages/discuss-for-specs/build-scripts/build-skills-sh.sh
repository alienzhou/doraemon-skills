#!/bin/bash
#
# Build skills.sh compatible artifact at repo root
# Generates discuss-for-specs/SKILL.md with frontmatter for skills.sh distribution
#
# Usage: ./scripts/build-skills-sh.sh
#

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_NAME="discuss-for-specs"
SKILL_SRC="${REPO_ROOT}/skills/${SKILL_NAME}"
OUTPUT_DIR="${REPO_ROOT}/${SKILL_NAME}"
HEADER_FILE="${SKILL_SRC}/headers/cursor.yaml"
SKILL_FILE="${SKILL_SRC}/SKILL.md"

# 从 package.json 读取版本号
VERSION=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('${REPO_ROOT}/npm-package/package.json','utf-8')).version)")

if [ ! -f "$SKILL_FILE" ]; then
  echo "❌ SKILL.md not found: $SKILL_FILE"
  exit 1
fi

if [ ! -f "$HEADER_FILE" ]; then
  echo "❌ Header not found: $HEADER_FILE"
  exit 1
fi

# 创建输出目录
mkdir -p "${OUTPUT_DIR}/references"

# 合并 header + SKILL.md，注入版本号
{
  sed "s/{{version}}/${VERSION}/g" "$HEADER_FILE"
  echo ""
  cat "$SKILL_FILE"
} > "${OUTPUT_DIR}/SKILL.md"

# 复制 references（排除 l1-guidance.md）
for ref in "${SKILL_SRC}/references/"*; do
  filename=$(basename "$ref")
  if [ "$filename" != "l1-guidance.md" ]; then
    cp "$ref" "${OUTPUT_DIR}/references/${filename}"
  fi
done

echo "✅ Built skills.sh artifact: ${OUTPUT_DIR}/"
echo "   Version: ${VERSION}"
