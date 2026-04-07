@echo off
REM Inicia apenas o Cloudflare Tunnel (servidor deve estar rodando separadamente)

echo ========================================
echo Cloudflare Tunnel - Iniciando
echo ========================================
echo.

REM Verificar se tunnel esta configurado
IF NOT EXIST "%USERPROFILE%\.cloudflared\config.yml" (
    echo ERRO: Tunnel nao configurado
    echo Execute: scripts\setup-cloudflare.bat
    pause
    exit /b 1
)

REM Verificar se servidor esta rodando
powershell -Command "$portTest = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue; if (-not $portTest) { exit 1 }"
IF %ERRORLEVEL% NEQ 0 (
    echo AVISO: Servidor nao parece estar rodando na porta 3000
    echo Iniciando servidor...
    start "Frame Photo Printer Server" /MIN npm start
    timeout /t 10 >nul
)

echo Iniciando Cloudflare Tunnel...
echo.

REM Obter tunnel name do .env.local ou usar padrao
set TUNNEL_NAME=frame-photo-printer
IF EXIST .env.local (
    FOR /F "tokens=2 delims==" %%i IN ('findstr "^TUNNEL_NAME=" .env.local') DO SET TUNNEL_NAME=%%i
)

cloudflared tunnel run %TUNNEL_NAME%
