@echo off
REM Configura o projeto Node.js

echo Configurando projeto...
echo.

REM Detectar configuracoes do sistema
echo Detectando configuracoes da maquina...
powershell -ExecutionPolicy Bypass -File scripts\detect-system.ps1

REM Ler configuracoes
FOR /F "tokens=*" %%i IN ('powershell -Command "(Get-Content system-config.json | ConvertFrom-Json).ip"') DO SET LOCAL_IP=%%i
FOR /F "tokens=*" %%i IN ('powershell -Command "(Get-Content system-config.json | ConvertFrom-Json).computerName"') DO SET COMPUTER_NAME=%%i
FOR /F "tokens=*" %%i IN ('powershell -Command "(Get-Content system-config.json | ConvertFrom-Json).port"') DO SET PORT=%%i
FOR /F "tokens=*" %%i IN ('powershell -Command "(Get-Content system-config.json | ConvertFrom-Json).defaultPrinter"') DO SET DEFAULT_PRINTER=%%i

REM Gerar NEXTAUTH_SECRET
FOR /F "tokens=*" %%i IN ('powershell -Command "[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))"') DO SET NEXTAUTH_SECRET=%%i

REM Adicionar variaveis ao .env.local
echo. >> .env.local
echo NEXTAUTH_SECRET=%NEXTAUTH_SECRET% >> .env.local
echo NEXTAUTH_URL=http://localhost:%PORT% >> .env.local
echo LOCAL_IP=%LOCAL_IP% >> .env.local
echo COMPUTER_NAME=%COMPUTER_NAME% >> .env.local
echo DEFAULT_PRINTER=%DEFAULT_PRINTER% >> .env.local
echo PORT=%PORT% >> .env.local

echo Instalando dependencias npm...
call npm install

echo Gerando Prisma client...
call npx prisma generate

echo Aplicando schema ao banco...
call npx prisma db push --skip-generate

echo Criando usuario admin e molduras padrao...
call npm run setup

echo.
echo Projeto configurado com sucesso!
echo Configuracoes salvas em .env.local
exit /b 0
