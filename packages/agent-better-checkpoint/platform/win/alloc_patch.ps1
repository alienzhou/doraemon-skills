<#
.SYNOPSIS
    alloc_patch.ps1 — Allocate a temporary patch file for hunk-level checkpoint commits

.DESCRIPTION
    Creates a writable patch path under ~/.vibe-x/agent-better-checkpoint/tmp/
    and returns a one-line JSON payload with id, createdAt, path, and ttlHours.

.PARAMETER Workspace
    Workspace root used to derive a stable temp namespace. Required.

.EXAMPLE
    .\alloc_patch.ps1 -Workspace C:\repo
#>

param(
    [string]$Workspace = "",
    [switch]$Help
)

$ErrorActionPreference = "Stop"
$TTL_HOURS = 48
$TMP_ROOT = Join-Path $HOME ".vibe-x/agent-better-checkpoint/tmp"

function Show-Usage {
    @"
alloc_patch.ps1 — Allocate a temporary patch file for checkpoint hunks

Usage:
  alloc_patch.ps1 -Workspace <path>
  alloc_patch.ps1 -Help

Options:
  -Workspace <path>   Workspace root used to derive a stable temp namespace
  -Help               Show this help message
"@ | Write-Output
}

function Fail-Alloc {
    param(
        [string]$Code,
        [string]$Message
    )

    [Console]::Error.WriteLine("${Code}: ${Message}")
    exit 1
}

function Get-WorkspaceHash {
    param([string]$InputText)

    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($InputText)
        $hashBytes = $sha.ComputeHash($bytes)
        $hex = -join ($hashBytes | ForEach-Object { $_.ToString("x2") })
        return $hex.Substring(0, 8)
    }
    finally {
        $sha.Dispose()
    }
}

function Get-RandomId {
    $bytes = New-Object byte[] 6
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $hex = -join ($bytes | ForEach-Object { $_.ToString("X2") })
    return $hex.Substring(0, 10)
}

function Cleanup-Expired {
    param([string]$Root)

    if (-not (Test-Path $Root -PathType Container)) {
        return
    }

    $cutoff = (Get-Date).ToUniversalTime().AddHours(-$TTL_HOURS)
    Get-ChildItem -Path $Root -Recurse -File -Filter 'patch-*.patch' -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTimeUtc -lt $cutoff } |
        ForEach-Object {
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
        }

    Get-ChildItem -Path $Root -Recurse -Directory -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending |
        ForEach-Object {
            if (-not (Get-ChildItem -Path $_.FullName -Force -ErrorAction SilentlyContinue)) {
                Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
            }
        }
}

if ($Help) {
    Show-Usage
    exit 0
}

if (-not $Workspace) {
    Fail-Alloc -Code "ABC_TEMP_ALLOC_FAILED" -Message "Missing required -Workspace argument. Please provide the workspace root path."
}

try {
    New-Item -ItemType Directory -Path $TMP_ROOT -Force | Out-Null
}
catch {
    Fail-Alloc -Code "ABC_TEMP_ALLOC_FAILED" -Message "Failed to create the temp root at $TMP_ROOT. Please check directory permissions."
}

Cleanup-Expired -Root $TMP_ROOT

$workspaceHash = Get-WorkspaceHash -InputText $Workspace
$workspaceDir = Join-Path $TMP_ROOT $workspaceHash

try {
    New-Item -ItemType Directory -Path $workspaceDir -Force | Out-Null
}
catch {
    Fail-Alloc -Code "ABC_TEMP_ALLOC_FAILED" -Message "Failed to create the workspace temp directory at $workspaceDir. Please check directory permissions."
}

$stamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$createdAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$id = Get-RandomId
$patchPath = Join-Path $workspaceDir "patch-$stamp-$id.patch"

try {
    New-Item -ItemType File -Path $patchPath -Force | Out-Null
}
catch {
    Fail-Alloc -Code "ABC_TEMP_ALLOC_FAILED" -Message "Failed to create a temporary patch file at $patchPath. Please check directory permissions and available disk space."
}

$result = [ordered]@{
    ok = $true
    id = $id
    createdAt = $createdAt
    path = $patchPath
    ttlHours = $TTL_HOURS
}

$result | ConvertTo-Json -Compress | Write-Output
