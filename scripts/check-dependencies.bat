@echo off
REM Verifica se dependencias estao instaladas

echo Verificando Node.js...
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [FALTA] Node.js nao encontrado
    exit /b 1
)
node --version

echo Verificando npm...
where npm >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [FALTA] npm nao encontrado
    exit /b 1
)
npm --version

echo Verificando PostgreSQL...
where psql >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [FALTA] PostgreSQL nao encontrado
    exit /b 1
)
psql --version

echo Verificando Git...
where git >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Git nao encontrado (opcional)
)

echo.
echo [OK] Todas as dependencias essenciais estao instaladas
exit /b 0
