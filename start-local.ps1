param([ValidateRange(1, 65535)][int]$Port = 4173)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js 22 oder neuer wurde nicht gefunden."
}

$nodeMajor = [int]((node --version).TrimStart("v").Split(".")[0])
if ($nodeMajor -lt 22) {
    throw "Node.js 22 oder neuer ist erforderlich."
}

if ([System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners().Port -contains $Port) {
    throw "Port $Port ist bereits belegt. Vermutlich läuft noch die alte Docker-Version. Stoppe sie zuerst oder starte mit -Port 4180."
}

if (-not (Test-Path ".env.local")) {
    @(
        "DATA_DIR=./data"
        "SESSION_COOKIE_SECURE=false"
    ) | Set-Content -Path ".env.local" -Encoding utf8
}

Write-Host "[.ABSEITS 0.4.0] Abhängigkeiten werden geprüft ..."
npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) {
    throw "npm install ist mit Exitcode $LASTEXITCODE fehlgeschlagen."
}

Write-Host "[.ABSEITS 0.4.0] Startet unter http://localhost:$Port"
Write-Host "[.ABSEITS 0.4.0] Redaktion: http://localhost:$Port/redaktion"
Write-Host "[.ABSEITS 0.4.0] Beim ersten Aufruf wird das Redaktionskonto eingerichtet."
Write-Host "[.ABSEITS] Beenden mit Strg+C"
npm run dev -- --port $Port
if ($LASTEXITCODE -ne 0) {
    throw ".ABSEITS ist mit Exitcode $LASTEXITCODE beendet worden."
}
