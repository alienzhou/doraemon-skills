#!/usr/bin/env bash
#
# checkpoint.sh — Create semantic Git checkpoint commits
#
# AI provides descriptive content (subject + body). This script:
# 1. Truncates user-prompt (≤60 chars, head+tail)
# 2. Appends metadata via git interpret-trailers
# 3. Runs git add -A && git commit, or applies a selected patch to the index first
#
# Usage:
#   checkpoint.sh <message> [user-prompt] [--type auto|fallback] [--patch-file <path>]

set -euo pipefail

# ============================================================
# Argument parsing
# ============================================================
MESSAGE="${1:-}"
USER_PROMPT="${2:-}"
CHECKPOINT_TYPE="auto"
PATCH_FILE=""

shift 2 2>/dev/null || true
while [[ $# -gt 0 ]]; do
    case "$1" in
        --type)
            CHECKPOINT_TYPE="${2:-auto}"
            shift 2
            ;;
        --patch-file)
            PATCH_FILE="${2:-}"
            shift 2
            ;;
        --help|-h)
            cat <<'EOF'
checkpoint.sh — Create semantic Git checkpoint commits

Usage:
  checkpoint.sh <message> [user-prompt] [--type auto|fallback] [--patch-file <path>]

Options:
  --type <auto|fallback>  Checkpoint type metadata
  --patch-file <path>     Apply only the selected patch hunks to the index before commit
  --help                  Show this help message
EOF
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

if [[ -z "$MESSAGE" ]]; then
    echo "Error: commit message is required" >&2
    echo "Usage: checkpoint.sh <message> [user-prompt] [--type auto|fallback] [--patch-file <path>]" >&2
    exit 1
fi

fail_checkpoint() {
    local code="$1"
    shift
    echo "${code}: $*" >&2
    exit 1
}

# ============================================================
# Platform detection
# ============================================================
detect_platform() {
    # 优先检测运行时环境变量（谁在调用），而非安装态（command -v）
    if [[ -n "${CURSOR_AGENT:-}" ]] || [[ -n "${CURSOR_TRACE_ID:-}" ]] || [[ -n "${CURSOR_VERSION:-}" ]]; then
        echo "cursor"
    elif [[ -n "${CLAUDE_CODE:-}" ]]; then
        echo "claude-code"
    else
        echo "unknown"
    fi
}

AGENT_PLATFORM=$(detect_platform)

# ============================================================
# User-Prompt truncation (≤60 chars, head+tail + ellipsis)
# ============================================================
truncate_prompt() {
    local prompt="$1"
    local max_len=60

    # Ensure UTF-8 character-based (not byte-based) string operations.
    # Without this, ${#prompt} and ${prompt:0:n} count bytes in C locale,
    # which breaks multi-byte characters (e.g., Chinese) mid-character.
    local old_lc_all="${LC_ALL:-}"
    export LC_ALL=en_US.UTF-8

    local len=${#prompt}

    if [[ $len -le $max_len ]]; then
        echo "$prompt"
        # Restore LC_ALL
        if [[ -n "$old_lc_all" ]]; then
            export LC_ALL="$old_lc_all"
        else
            unset LC_ALL
        fi
        return
    fi

    local head_len=$(( (max_len - 3) / 2 ))
    local tail_len=$(( max_len - 3 - head_len ))
    local head="${prompt:0:$head_len}"
    local tail="${prompt:$((len - tail_len)):$tail_len}"

    # Restore LC_ALL
    if [[ -n "$old_lc_all" ]]; then
        export LC_ALL="$old_lc_all"
    else
        unset LC_ALL
    fi

    echo "${head}...${tail}"
}

TRUNCATED_PROMPT=""
if [[ -n "$USER_PROMPT" ]]; then
    TRUNCATED_PROMPT=$(truncate_prompt "$USER_PROMPT")
fi

# ============================================================
# Check for changes
# ============================================================
has_changes() {
    # Staged changes
    if ! git diff --cached --quiet 2>/dev/null; then
        return 0
    fi
    # Unstaged changes
    if ! git diff --quiet 2>/dev/null; then
        return 0
    fi
    # Untracked files
    if [[ -n "$(git ls-files --others --exclude-standard 2>/dev/null)" ]]; then
        return 0
    fi
    return 1
}

has_staged_changes() {
    if ! git diff --cached --quiet 2>/dev/null; then
        return 0
    fi
    return 1
}

if [[ -z "$PATCH_FILE" ]]; then
    if ! has_changes; then
        echo "No changes to commit."
        exit 0
    fi

    # ============================================================
    # git add -A
    # ============================================================
    git add -A
else
    if [[ ! -f "$PATCH_FILE" ]]; then
        fail_checkpoint "ABC_PATCH_FILE_MISSING" "Patch file not found at ${PATCH_FILE}. Please allocate and write the patch file before running checkpoint."
    fi

    if [[ ! -s "$PATCH_FILE" ]]; then
        fail_checkpoint "ABC_PATCH_FILE_EMPTY" "Patch file at ${PATCH_FILE} is empty. Please write at least one selected hunk before running checkpoint."
    fi

    if ! git apply --cached --check "$PATCH_FILE" >/dev/null 2>&1; then
        fail_checkpoint "ABC_PATCH_APPLY_FAILED" "Failed to apply the selected patch cleanly to the Git index. The target hunks may have drifted or overlap with other uncommitted edits."
    fi

    if ! git apply --cached "$PATCH_FILE" >/dev/null 2>&1; then
        fail_checkpoint "ABC_PATCH_APPLY_FAILED" "Failed to apply the selected patch to the Git index after the dry run succeeded. Please verify the patch file and retry."
    fi

    if ! has_staged_changes; then
        fail_checkpoint "ABC_PATCH_NO_STAGED_CHANGES" "The selected patch did not produce any staged changes. The target hunks may already be staged or no longer match the current repository state."
    fi
fi

# ============================================================
# Build trailers and commit
# ============================================================
TRAILER_ARGS=(
    --trailer "Agent: ${AGENT_PLATFORM}"
    --trailer "Checkpoint-Type: ${CHECKPOINT_TYPE}"
)

if [[ -n "$TRUNCATED_PROMPT" ]]; then
    TRAILER_ARGS+=(--trailer "User-Prompt: ${TRUNCATED_PROMPT}")
fi

if ! echo "$MESSAGE" | git interpret-trailers "${TRAILER_ARGS[@]}" | git commit -F -; then
    if [[ -n "$PATCH_FILE" ]]; then
        fail_checkpoint "ABC_PATCH_COMMIT_FAILED" "Git commit failed after staging the selected patch. Review the repository state and retry when ready."
    fi
    exit 1
fi

if [[ -n "$PATCH_FILE" ]]; then
    rm -f "$PATCH_FILE"
fi

echo "Checkpoint committed successfully."
