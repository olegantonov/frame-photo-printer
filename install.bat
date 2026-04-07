@echo off
REM ========================================
REM Frame Photo Printer - Instalador Automatico
REM ========================================

echo ========================================
echo Frame Photo Printer - Instalacao Automatica
echo ========================================
echo.

REM Solicitar privilegios de admin
NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERRO: Execute como Administrador
    echo Clique com botao direito e selecione "Executar como administrador"
    pause
    exit /b 1
)

echo [1/6] Verificando dependencias...
call scripts\check-dependencies.bat
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo [2/6] Instalando dependencias faltantes...
    call scripts\install-dependencies.bat
)

echo.
echo [3/6] Configurando PostgreSQL...
call scripts\setup-postgres.bat

echo.
echo [4/6] Configurando projeto...
call scripts\setup-project.bat

echo.
echo [5/6] Configurando Cloudflare Tunnel...
call scripts\setup-cloudflare.bat

echo.
echo [6/6] Iniciando sistema...
call start-production.bat

echo.
echo ========================================
echo Instalacao concluida!
echo Acesso local: http://localhost:3000
echo Admin: http://localhost:3000/admin/login
echo.
echo Verifique install.log para detalhes
echo ========================================
pause
