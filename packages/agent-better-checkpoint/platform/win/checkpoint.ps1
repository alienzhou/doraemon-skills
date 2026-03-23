<#
.SYNOPSIS
    checkpoint.ps1 — Create semantic Git checkpoint commits (Windows PowerShell)

.DESCRIPTION
    AI provides descriptive content (subject + body). This script:
    1. Truncates user-prompt (≤60 chars, head+tail)
    2. Appends metadata via git interpret-trailers
    3. Runs git add -A && git commit, or applies a selected patch to the index first

.PARAMETER Message
    Full commit message (subject + blank line + body). Required.

.PARAMETER UserPrompt
    The user's original prompt/request. Optional.

.PARAMETER Type
    Checkpoint type: "auto" (default) or "fallback".

.PARAMETER PatchFile
    Optional patch file path. When provided, only the selected hunks are staged before commit.

.EXAMPLE
    .\checkpoint.ps1 "checkpoint(auth): add JWT refresh" "implement token refresh"
#>

param(
    [Parameter(Position = 0)]
    [string]$Message = "",

    [Parameter(Position = 1)]
    [string]$UserPrompt = "",

    [string]$Type = "auto",

    [string]$PatchFile = "",

    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Usage {
    @"
checkpoint.ps1 — Create semantic Git checkpoint commits

Usage:
  checkpoint.ps1 <message> [user-prompt] [-Type auto|fallback] [-PatchFile <path>]
  checkpoint.ps1 -Help

Options:
  -Type <auto|fallback>  Checkpoint type metadata
  -PatchFile <path>      Apply only the selected patch hunks to the index before commit
  -Help                  Show this help message
"@ | Write-Output
}

function Fail-Checkpoint {
    param(
        [string]$Code,
        [string]$MessageText
    )

    [Console]::Error.WriteLine("${Code}: ${MessageText}")
    exit 1
}

if ($Help) {
    Show-Usage
    exit 0
}

if (-not $Message) {
    [Console]::Error.WriteLine("Error: commit message is required")
    [Console]::Error.WriteLine("Usage: checkpoint.ps1 <message> [user-prompt] [-Type auto|fallback] [-PatchFile <path>]")
    exit 1
}

# ============================================================
# Platform detection
# ============================================================

function Detect-Platform {
    # 优先检测运行时环境变量（谁在调用），而非安装态（Get-Command）
    if ($env:CURSOR_AGENT -or $env:CURSOR_TRACE_ID -or $env:CURSOR_VERSION) {
        return "cursor"
    }
    if ($env:CLAUDE_CODE) {
        return "claude-code"
    }
    return "unknown"
}

$AgentPlatform = Detect-Platform

# ============================================================
# User-Prompt truncation (≤60 chars, head+tail + ellipsis)
# ============================================================

function Truncate-Prompt {
    param([string]$Prompt)

    $MaxLen = 60
    if ($Prompt.Length -le $MaxLen) {
        return $Prompt
    }

    $HeadLen = [math]::Floor(($MaxLen - 3) / 2)
    $TailLen = $MaxLen - 3 - $HeadLen
    $Head = $Prompt.Substring(0, $HeadLen)
    $Tail = $Prompt.Substring($Prompt.Length - $TailLen, $TailLen)
    return "${Head}...${Tail}"
}

$TruncatedPrompt = ""
if ($UserPrompt) {
    $TruncatedPrompt = Truncate-Prompt -Prompt $UserPrompt
}

# ============================================================
# Check for changes
# ============================================================

function Test-HasChanges {
    # Staged changes
    git diff --cached --quiet 2>$null
    if ($LASTEXITCODE -ne 0) { return $true }

    # Unstaged changes
    git diff --quiet 2>$null
    if ($LASTEXITCODE -ne 0) { return $true }

    # Untracked files
    $untracked = git ls-files --others --exclude-standard 2>$null
    if ($untracked) { return $true }

    return $false
}

function Test-HasStagedChanges {
    git diff --cached --quiet 2>$null
    return $LASTEXITCODE -ne 0
}

if (-not $PatchFile) {
    if (-not (Test-HasChanges)) {
        Write-Host "No changes to commit."
        exit 0
    }

    # ============================================================
    # git add -A
    # ============================================================
    git add -A
}
else {
    if (-not (Test-Path $PatchFile -PathType Leaf)) {
        Fail-Checkpoint -Code "ABC_PATCH_FILE_MISSING" -MessageText "Patch file not found at $PatchFile. Please allocate and write the patch file before running checkpoint."
    }

    $patchInfo = Get-Item $PatchFile
    if ($patchInfo.Length -le 0) {
        Fail-Checkpoint -Code "ABC_PATCH_FILE_EMPTY" -MessageText "Patch file at $PatchFile is empty. Please write at least one selected hunk before running checkpoint."
    }

    git apply --cached --check -- $PatchFile 2>$null
    if ($LASTEXITCODE -ne 0) {
        Fail-Checkpoint -Code "ABC_PATCH_APPLY_FAILED" -MessageText "Failed to apply the selected patch cleanly to the Git index. The target hunks may have drifted or overlap with other uncommitted edits."
    }

    git apply --cached -- $PatchFile 2>$null
    if ($LASTEXITCODE -ne 0) {
        Fail-Checkpoint -Code "ABC_PATCH_APPLY_FAILED" -MessageText "Failed to apply the selected patch to the Git index after the dry run succeeded. Please verify the patch file and retry."
    }

    if (-not (Test-HasStagedChanges)) {
        Fail-Checkpoint -Code "ABC_PATCH_NO_STAGED_CHANGES" -MessageText "The selected patch did not produce any staged changes. The target hunks may already be staged or no longer match the current repository state."
    }
}

# ============================================================
# Build trailers and commit
# ============================================================

$TrailerArgs = @(
    "--trailer", "Agent: $AgentPlatform",
    "--trailer", "Checkpoint-Type: $Type"
)

if ($TruncatedPrompt) {
    $TrailerArgs += @("--trailer", "User-Prompt: $TruncatedPrompt")
}

$Message | git interpret-trailers @TrailerArgs | git commit -F -
if ($LASTEXITCODE -ne 0) {
    if ($PatchFile) {
        Fail-Checkpoint -Code "ABC_PATCH_COMMIT_FAILED" -MessageText "Git commit failed after staging the selected patch. Review the repository state and retry when ready."
    }
    exit $LASTEXITCODE
}

if ($PatchFile -and (Test-Path $PatchFile -PathType Leaf)) {
    Remove-Item $PatchFile -Force -ErrorAction SilentlyContinue
}

Write-Host "Checkpoint committed successfully."
