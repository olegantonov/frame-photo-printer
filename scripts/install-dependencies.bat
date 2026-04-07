@echo off
REM Instala dependencias faltantes usando winget

echo Instalando dependencias via winget...
echo.

REM Verificar se winget existe
where winget >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERRO: winget nao encontrado
    echo Por favor, instale manualmente:
    echo - Node.js: https://nodejs.org/
    echo - PostgreSQL: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

REM Instalar Node.js
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Instalando Node.js...
    winget install OpenJS.NodeJS.LTS -e --silent
)

REM Instalar PostgreSQL
where psql >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Instalando PostgreSQL...
    winget install PostgreSQL.PostgreSQL.16 -e --silent
    echo IMPORTANTE: Configure senha do PostgreSQL apos instalacao
)

REM Instalar cloudflared
where cloudflared >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Instalando Cloudflare Tunnel...
    winget install Cloudflare.cloudflared -e --silent
)

echo.
echo Dependencias instaladas. Por favor, reinicie o terminal.
pause
exit /b 0
