@echo off
cls
echo ================================================
echo   Frame Photo Printer - Windows Startup
echo ================================================
echo.

cd /d %~dp0

echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Instale Node.js de https://nodejs.org/
    pause
    exit /b 1
)
echo OK - Node.js instalado
echo.

echo [2/3] Verificando PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo AVISO: psql nao encontrado no PATH
    echo Certifique-se que PostgreSQL esta rodando
) else (
    echo OK - PostgreSQL instalado
)
echo.

echo [3/3] Iniciando servidor...
echo.
echo Servidor rodando em: http://localhost:3000
echo Admin: http://localhost:3000/admin/login
echo.
echo Pressione Ctrl+C para parar o servidor
echo ================================================
echo.

npm start

pause
