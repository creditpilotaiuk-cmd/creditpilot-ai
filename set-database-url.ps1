param([switch]$FromClipboard, [switch]$NonInteractive)

$ErrorActionPreference = "Stop"
$connectionString = if ($FromClipboard) { Get-Clipboard -Raw } else { Read-Host "Paste the Neon database connection string" }
$connectionString = $connectionString -replace "&channel_binding=require", ""

if ([string]::IsNullOrWhiteSpace($connectionString)) {
  Write-Host "No connection string was entered. Nothing was changed."
  if (-not $NonInteractive) { Read-Host "Press Enter to close" }
  exit 1
}

$environment = @"
DATABASE_URL="$connectionString"
AUTH_SECRET="replace-this-before-enabling-production-auth"
AUTH_URL="http://localhost:3000"
"@

$envPath = Join-Path $PSScriptRoot ".env"
[System.IO.File]::WriteAllText($envPath, $environment, [System.Text.UTF8Encoding]::new($false))
Write-Host "Database connection saved. You can close this window and return to Codex."
if (-not $NonInteractive) { Read-Host "Press Enter to close" }
