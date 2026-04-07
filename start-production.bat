@echo off
REM Inicia servidor em producao + Cloudflare Tunnel

echo ========================================
echo Frame Photo Printer - Iniciando
echo ========================================
echo.

REM Build de producao (se nao existir)
IF NOT EXIST ".next" (
    echo Fazendo build de producao...
    call npm run build
)

REM Ler porta do .env.local
set PORT=3000
IF EXIST .env.local (
    FOR /F "tokens=2 delims==" %%i IN ('findstr "^PORT=" .env.local') DO SET PORT=%%i
)

echo Servidor rodara na porta: %PORT%
echo.

REM Verificar se tunnel esta configurado
set USE_TUNNEL=N
IF EXIST "%USERPROFILE%\.cloudflared\config.yml" (
    set /p USE_TUNNEL="Iniciar com Cloudflare Tunnel? (S/n): "
    if /i "%USE_TUNNEL%"=="" set USE_TUNNEL=S
)

IF /i "%USE_TUNNEL%"=="S" (
    echo.
    echo Iniciando servidor + Cloudflare Tunnel...
    echo.
    
    REM Iniciar servidor em background
    start "Frame Photo Printer Server" /MIN npm start
    
    timeout /t 5 >nul
    
    REM Iniciar tunnel
    echo Iniciando tunnel...
    cloudflared tunnel run frame-photo-printer
) ELSE (
    echo.
    echo Iniciando servidor local apenas...
    echo Acesso local: http://localhost:%PORT%
    echo Admin: http://localhost:%PORT%/admin/login
    echo.
    call npm start
)

pause
