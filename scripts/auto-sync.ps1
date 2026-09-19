param(
    [string]$ProjectPath = (Split-Path -Parent $PSScriptRoot),
    [int]$PollSeconds = 5,
    [int]$QuietSeconds = 15
)

$ErrorActionPreference = 'Stop'
$gitDirectory = Join-Path $ProjectPath '.git'
$logPath = Join-Path $gitDirectory 'auto-sync.log'
$lockPath = Join-Path $gitDirectory 'auto-sync.lock'

function Write-SyncLog {
    param([string]$Message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -LiteralPath $logPath -Value "[$timestamp] $Message" -Encoding UTF8
}

function Invoke-Git {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $output = & git -C $ProjectPath @Arguments 2>&1
    $gitExitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousPreference
    if ($gitExitCode -ne 0) {
        throw "git $($Arguments -join ' ') failed: $($output -join [Environment]::NewLine)"
    }
    return $output
}

if (-not (Test-Path -LiteralPath $gitDirectory)) {
    throw "Not a Git repository: $ProjectPath"
}

if (Test-Path -LiteralPath $lockPath) {
    $existingPid = Get-Content -LiteralPath $lockPath -ErrorAction SilentlyContinue
    if ($existingPid -and (Get-Process -Id $existingPid -ErrorAction SilentlyContinue)) {
        exit 0
    }
}

Set-Content -LiteralPath $lockPath -Value $PID -Encoding ASCII

try {
    Write-SyncLog "Watcher started for $ProjectPath"
    $lastSignature = ''
    $lastChangeAt = Get-Date

    while ($true) {
        try {
            $statusLines = @(Invoke-Git status --porcelain=v1 --untracked-files=all)
            $signature = $statusLines -join "`n"

            if ($signature -ne $lastSignature) {
                $lastSignature = $signature
                $lastChangeAt = Get-Date
            }

            if ($signature -and ((Get-Date) - $lastChangeAt).TotalSeconds -ge $QuietSeconds) {
                Invoke-Git add --all | Out-Null
                $staged = @(Invoke-Git diff --cached --name-only)
                if ($staged.Count -gt 0) {
                    $commitMessage = "chore: auto-sync $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
                    Invoke-Git commit -m $commitMessage | Out-Null
                    Write-SyncLog "Committed: $($staged -join ', ')"
                }
                $lastSignature = ''
            }

            $ahead = Invoke-Git rev-list --count '@{upstream}..HEAD'
            if ([int]$ahead -gt 0) {
                Invoke-Git push | Out-Null
                Write-SyncLog "Pushed $ahead commit(s) to origin/main"
            }
        }
        catch {
            Write-SyncLog "ERROR: $($_.Exception.Message)"
        }

        Start-Sleep -Seconds $PollSeconds
    }
}
finally {
    Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
    Write-SyncLog 'Watcher stopped'
}
