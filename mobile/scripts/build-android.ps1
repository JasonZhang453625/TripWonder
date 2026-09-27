param([switch]$Release)
$ErrorActionPreference = 'Stop'
$mobileRoot = Split-Path $PSScriptRoot -Parent
if (-not $env:JAVA_HOME) {
    $installedJdk = Get-ChildItem 'D:\Android\tripwonder-tools\java' -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($installedJdk) { $env:JAVA_HOME = $installedJdk.FullName }
}
if (-not $env:ANDROID_HOME -and (Test-Path 'D:\Android\tripwonder-tools\sdk')) { $env:ANDROID_HOME = 'D:\Android\tripwonder-tools\sdk' }
if (-not $env:JAVA_HOME -or -not $env:ANDROID_HOME) { throw 'Please configure JAVA_HOME (JDK 21) and ANDROID_HOME (SDK 36).' }
# Avoid the Windows short-path AF_UNIX socket failure without changing system settings.
$socketDirectory = if ($env:TRIPWONDER_SOCKET_DIR) { $env:TRIPWONDER_SOCKET_DIR } else { Join-Path (Split-Path $env:ANDROID_HOME -Parent) 'tmp' }
New-Item -ItemType Directory -Force $socketDirectory | Out-Null
$previousJavaOptions = $env:JAVA_TOOL_OPTIONS
$env:JAVA_TOOL_OPTIONS = "$previousJavaOptions -Djdk.net.unixdomain.tmpdir=$($socketDirectory.Replace('\','/'))"
try {
    Push-Location $mobileRoot
    & npm.cmd run sync
    if ($LASTEXITCODE -ne 0) { throw 'Web bundle build failed.' }
    ('sdk.dir=' + $env:ANDROID_HOME.Replace('\','/')) | Set-Content -Encoding ascii 'android/local.properties'
    $variant = if ($Release) { 'Release' } else { 'Debug' }
    if ($Release -and -not (Test-Path 'android/signing.properties')) { throw 'Release signing is not configured. See mobile/README.md.' }
    & ./android/gradlew.bat -p android "assemble$variant" --no-daemon --console=plain
    if ($LASTEXITCODE -ne 0) { throw 'Android build failed.' }
    $apkSource = "android/app/build/outputs/apk/$($variant.ToLower())/app-$($variant.ToLower()).apk"
    $releaseInfo = Get-Content release.json -Raw | ConvertFrom-Json
    New-Item -ItemType Directory -Force artifacts | Out-Null
    $apkDestination = "artifacts/TripWonder-$($releaseInfo.versionName)-$($variant.ToLower()).apk"
    Copy-Item -LiteralPath $apkSource -Destination $apkDestination
    Get-Item -LiteralPath $apkDestination | Select-Object FullName,Length
} finally {
    Pop-Location
    $env:JAVA_TOOL_OPTIONS = $previousJavaOptions
}
