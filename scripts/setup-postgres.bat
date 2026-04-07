@echo off
REM Configura PostgreSQL e cria database

echo Configurando PostgreSQL...
echo.

REM Verificar se PostgreSQL esta rodando
sc query postgresql-x64-16 | find "RUNNING" >nul
IF %ERRORLEVEL% NEQ 0 (
    echo Iniciando servico PostgreSQL...
    net start postgresql-x64-16
    timeout /t 5 >nul
)

REM Solicitar senha do postgres
set /p POSTGRES_PASSWORD="Digite a senha do usuario postgres (ou deixe em branco para 'postgres'): "
if "%POSTGRES_PASSWORD%"=="" set POSTGRES_PASSWORD=postgres

REM Criar database
echo Criando database frame_photo_printer...
psql -U postgres -c "CREATE DATABASE frame_photo_printer;" 2>nul
IF %ERRORLEVEL% EQU 0 (
    echo [OK] Database criado com sucesso
) ELSE (
    echo [AVISO] Database pode ja existir
)

REM Salvar senha no .env.local
echo DATABASE_URL=postgresql://postgres:%POSTGRES_PASSWORD%@localhost:5432/frame_photo_printer > .env.local

echo.
echo PostgreSQL configurado!
exit /b 0
