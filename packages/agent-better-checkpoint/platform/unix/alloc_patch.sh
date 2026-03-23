#!/usr/bin/env bash
#
# alloc_patch.sh — Allocate a temporary patch file for hunk-level checkpoint commits
#
# Creates a writable patch path under ~/.vibe-x/agent-better-checkpoint/tmp/
# and returns a one-line JSON payload with id, createdAt, path, and ttlHours.
#
# Usage:
#   alloc_patch.sh --workspace /path/to/repo
#   alloc_patch.sh --help

set -euo pipefail

TTL_HOURS=48
TMP_ROOT="${HOME}/.vibe-x/agent-better-checkpoint/tmp"
WORKSPACE=""

usage() {
    cat <<'EOF'
alloc_patch.sh — Allocate a temporary patch file for checkpoint hunks

Usage:
  alloc_patch.sh --workspace <path>
  alloc_patch.sh --help

Options:
  --workspace <path>   Workspace root used to derive a stable temp namespace
  --help               Show this help message
EOF
}

error() {
    local code="$1"
    shift
    echo "${code}: $*" >&2
    exit 1
}

json_escape() {
    local str="$1"
    str="${str//\\/\\\\}"
    str="${str//\"/\\\"}"
    str="${str//$'\n'/\\n}"
    str="${str//$'\r'/\\r}"
    str="${str//$'\t'/\\t}"
    printf '%s' "$str"
}

workspace_hash() {
    local input="$1"
    if command -v shasum >/dev/null 2>&1; then
        printf '%s' "$input" | shasum -a 256 | awk '{print substr($1,1,8)}'
    elif command -v sha256sum >/dev/null 2>&1; then
        printf '%s' "$input" | sha256sum | awk '{print substr($1,1,8)}'
    else
        printf '%s' "$input" | cksum | awk '{print $1}'
    fi
}

random_id() {
    local id
    id=$(LC_ALL=C tr -dc 'A-Z0-9' < /dev/urandom | head -c 10 || true)
    if [[ -z "$id" ]]; then
        id="$(date -u +%s)"
    fi
    printf '%s' "$id"
}

cleanup_expired() {
    local root="$1"
    [[ -d "$root" ]] || return 0

    find "$root" -type f -name 'patch-*.patch' -mtime +1 -exec rm -f {} + 2>/dev/null || true
    find "$root" -type d -empty -mindepth 1 -exec rmdir {} + 2>/dev/null || true
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --workspace)
            WORKSPACE="${2:-}"
            shift 2
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            error "ABC_TEMP_ALLOC_FAILED" "Unknown option: $1"
            ;;
    esac
done

if [[ -z "$WORKSPACE" ]]; then
    error "ABC_TEMP_ALLOC_FAILED" "Missing required --workspace argument. Please provide the workspace root path."
fi

if ! mkdir -p "$TMP_ROOT" 2>/dev/null; then
    error "ABC_TEMP_ALLOC_FAILED" "Failed to create the temp root at ${TMP_ROOT}. Please check directory permissions."
fi

cleanup_expired "$TMP_ROOT"

WORKSPACE_HASH=$(workspace_hash "$WORKSPACE")
WORKSPACE_DIR="${TMP_ROOT}/${WORKSPACE_HASH}"
if ! mkdir -p "$WORKSPACE_DIR" 2>/dev/null; then
    error "ABC_TEMP_ALLOC_FAILED" "Failed to create the workspace temp directory at ${WORKSPACE_DIR}. Please check directory permissions."
fi

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
CREATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
ID=$(random_id)
PATCH_PATH="${WORKSPACE_DIR}/patch-${STAMP}-${ID}.patch"

if ! : > "$PATCH_PATH" 2>/dev/null; then
    error "ABC_TEMP_ALLOC_FAILED" "Failed to create a temporary patch file at ${PATCH_PATH}. Please check directory permissions and available disk space."
fi

printf '{"ok":true,"id":"%s","createdAt":"%s","path":"%s","ttlHours":%s}\n' \
    "$(json_escape "$ID")" \
    "$(json_escape "$CREATED_AT")" \
    "$(json_escape "$PATCH_PATH")" \
    "$TTL_HOURS"
