$ErrorActionPreference = "Continue"

function Pause-End {
  Write-Host ""
  Read-Host "Press ENTER to close"
}

try {
  # ===== Paths =====
  $ROOT = Join-Path $env:USERPROFILE "lumariq"
  $BACKEND1 = Join-Path $ROOT "backend-server"
  $BACKEND2 = Join-Path $ROOT "services"

  $APP = Join-Path $ROOT "apps\native-mobile"
  $NC  = Join-Path $APP "composeApp\src\androidMain\kotlin\com\lumariq\android\NetworkClient.kt"

  # Android SDK / adb
  $SDK = $env:ANDROID_SDK_ROOT
  if (-not $SDK) { $SDK = $env:ANDROID_HOME }
  if (-not $SDK) { $SDK = Join-Path $env:LOCALAPPDATA "Android\Sdk" }
  $ADB = Join-Path $SDK "platform-tools\adb.exe"

  # Pick backend dir that has gradlew.bat
  $BACKEND = $null
  if (Test-Path (Join-Path $BACKEND1 "gradlew.bat")) { $BACKEND = $BACKEND1 }
  elseif (Test-Path (Join-Path $BACKEND2 "gradlew.bat")) { $BACKEND = $BACKEND2 }
  else {
    Write-Host "❌ No backend gradlew.bat found in backend-server/ or services/"
    Write-Host "backend-server exists? " (Test-Path $BACKEND1)
    Write-Host "services exists? " (Test-Path $BACKEND2)
    Pause-End
    return
  }
  $GW  = Join-Path $BACKEND "gradlew.bat"

  # Logs (separate OUT/ERR)
  $OUT = Join-Path $ROOT "backend.out.log"
  $ERR = Join-Path $ROOT "backend.err.log"

  Write-Host "=============================="
  Write-Host "🧱 LUMARIQ ONE-SHOT: FIX URL + PORT + START + TEST"
  Write-Host "=============================="
  Write-Host "ROOT=$ROOT"
  Write-Host "BACKEND=$BACKEND"
  Write-Host "GW=$GW"
  Write-Host "ADB=$ADB"
  Write-Host "NC=$NC"
  Write-Host "OUT=$OUT"
  Write-Host "ERR=$ERR"
  Write-Host ""

  # ===== [1] Force BASE_URL to 10.0.2.2 =====
  Write-Host "== [1] Force Android BASE_URL -> http://10.0.2.2:8080 =="
  if (Test-Path $NC) {
    $s = Get-Content $NC -Raw
    $s2 = $s -replace "http://127\.0\.0\.1:8080","http://10.0.2.2:8080"
    $s2 = $s2 -replace "http://localhost:8080","http://10.0.2.2:8080"
    Set-Content -Path $NC -Value $s2 -Encoding UTF8
    (Select-String -Path $NC -Pattern "BASE_URL").Line
  } else {
    Write-Host "⚠️ NetworkClient.kt not found at $NC"
  }
  Write-Host ""

  # ===== [2] Kill 8080 listener =====
  Write-Host "== [2] Kill LISTEN 8080 (PID only) =="
  $pids = @(Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique)
  if ($pids.Count -gt 0) {
    Write-Host ("KILLING: " + ($pids -join ", "))
    foreach ($x in $pids) { Stop-Process -Id $x -Force -ErrorAction SilentlyContinue }
  } else {
    Write-Host "NO_LISTENER"
  }
  Write-Host ""

  # ===== [3] Start backend detached -> logs =====
  Write-Host "== [3] Start backend (detached) -> logs =="
  Remove-Item $OUT, $ERR -ErrorAction SilentlyContinue
  Set-Location $BACKEND

  # NOTE: pass -D props BEFORE task (more Gradle-friendly)
  $arg = @("-Dio.ktor.development=false","-Dktor.deployment.host=0.0.0.0","-Dktor.deployment.port=8080","run","--no-daemon")
  Start-Process -FilePath $GW -ArgumentList $arg -WorkingDirectory $BACKEND -WindowStyle Hidden -RedirectStandardOutput $OUT -RedirectStandardError $ERR
  Write-Host "✅ STARTED (background)"
  Write-Host ""

  # ===== [4] Wait for listen =====
  Write-Host "== [4] Wait for LISTEN 8080 (max 60s) =="
  $listen = $false
  for ($i=1; $i -le 60; $i++) {
    if ((Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue).Count -gt 0) { $listen = $true; break }
    Start-Sleep -Seconds 1
  }
  if (-not $listen) {
    Write-Host "❌ NOT LISTENING on 8080"
    Write-Host "`n--- ERR (tail 120) ---"
    if (Test-Path $ERR) { Get-Content $ERR -Tail 120 } else { Write-Host "NO_ERR_LOG" }
    Write-Host "`n--- OUT (tail 120) ---"
    if (Test-Path $OUT) { Get-Content $OUT -Tail 120 } else { Write-Host "NO_OUT_LOG" }
    Pause-End
    return
  }

  Write-Host "✅ LISTENING on 8080"
  Write-Host "LISTEN DETAILS:"
  (Get-NetTCPConnection -LocalPort 8080 -State Listen) | Select LocalAddress,LocalPort,OwningProcess | Format-Table -Auto
  Write-Host ""

  # ===== [5] Host test =====
  Write-Host "== [5] HOST curl (localhost) =="
  try {
    $r = Invoke-WebRequest -UseBasicParsing "http://localhost:8080/" -TimeoutSec 4
    Write-Host ("HOST_OK: " + $r.StatusCode + "  " + ($r.Content.Trim()))
  } catch { Write-Host "HOST_FAIL" }
  Write-Host ""

  # ===== [6] Emulator test (curl) =====
  Write-Host "== [6] EMULATOR curl (10.0.2.2) =="
  if (Test-Path $ADB) {
    & $ADB devices | Out-Host
    & $ADB shell "curl -sS http://10.0.2.2:8080/ || /system/bin/curl -sS http://10.0.2.2:8080/ || echo EMU_NO_CURL" | Out-Host
  } else {
    Write-Host "⚠️ adb.exe not found at $ADB"
  }
  Write-Host ""

  # ===== [7] Log tails =====
  Write-Host "== [7] LOG TAILS =="
  Write-Host "--- backend.err.log (tail 80) ---"
  if (Test-Path $ERR) { Get-Content $ERR -Tail 80 } else { Write-Host "NO_ERR_LOG" }
  Write-Host ""
  Write-Host "--- backend.out.log (tail 80) ---"
  if (Test-Path $OUT) { Get-Content $OUT -Tail 80 } else { Write-Host "NO_OUT_LOG" }

  Write-Host ""
  Write-Host "=============================="
  Write-Host "DONE"
  Write-Host "=============================="
  Pause-End

} catch {
  Write-Host "❌ SCRIPT CRASHED: $($_.Exception.Message)"
  Pause-End
}
