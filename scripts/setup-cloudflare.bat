@echo off
REM Configura Cloudflare Tunnel para acesso remoto HTTPS

echo ========================================
echo Cloudflare Tunnel - Configuracao
echo ========================================
echo.

REM Verificar se cloudflared esta instalado
where cloudflared >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERRO: cloudflared nao encontrado
    echo Instalando via winget...
    winget install Cloudflare.cloudflared -e --silent
    IF %ERRORLEVEL% NEQ 0 (
        echo ERRO: Falha ao instalar cloudflared
        echo Por favor, instale manualmente: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
        pause
        exit /b 1
    )
)

echo cloudflared encontrado!
cloudflared --version
echo.

REM Verificar se ja existe tunnel configurado
IF EXIST "%USERPROFILE%\.cloudflared\cert.pem" (
    echo Tunnel ja configurado anteriormente.
    set /p RECONFIG="Deseja reconfigurar? (s/N): "
    if /i not "%RECONFIG%"=="s" exit /b 0
)

echo Para configurar o Cloudflare Tunnel:
echo 1. Voce sera redirecionado para login no Cloudflare
echo 2. Faca login na sua conta Cloudflare
echo 3. Autorize o tunnel
echo.
pause

REM Login no Cloudflare
echo Iniciando login...
cloudflared tunnel login

IF %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha no login do Cloudflare
    pause
    exit /b 1
)

echo.
echo Login realizado com sucesso!
echo.

REM Criar tunnel
set TUNNEL_NAME=frame-photo-printer
echo Criando tunnel '%TUNNEL_NAME%'...
cloudflared tunnel create %TUNNEL_NAME%

IF %ERRORLEVEL% NEQ 0 (
    echo AVISO: Tunnel pode ja existir
)

REM Listar tunnels
echo.
echo Tunnels disponiveis:
cloudflared tunnel list

REM Obter tunnel ID
FOR /F "tokens=1" %%i IN ('cloudflared tunnel list ^| findstr /C:"%TUNNEL_NAME%"') DO SET TUNNEL_ID=%%i

echo.
echo Tunnel ID: %TUNNEL_ID%
echo Tunnel Name: %TUNNEL_NAME%

REM Criar arquivo de configuracao
echo Criando arquivo de configuracao...
(
echo tunnel: %TUNNEL_ID%
echo credentials-file: %USERPROFILE%\.cloudflared\%TUNNEL_ID%.json
echo.
echo ingress:
echo   - hostname: "*"
echo     service: http://localhost:3000
echo   - service: http_status:404
) > %USERPROFILE%\.cloudflared\config.yml

echo.
echo Configuracao salva em: %USERPROFILE%\.cloudflared\config.yml
echo.

echo ========================================
echo Proximo passo: Configurar DNS
echo ========================================
echo.
echo 1. Acesse: https://dash.cloudflare.com
echo 2. Selecione seu dominio
echo 3. Va em DNS
echo 4. Adicione registro CNAME:
echo.
echo    Nome: frame-photo-printer
echo    Destino: %TUNNEL_ID%.cfargotunnel.com
echo    Proxy: Ativado (laranja)
echo.
echo OU execute:
echo cloudflare tunnel route dns %TUNNEL_NAME% frame-photo-printer.seudominio.com
echo.

REM Salvar configuracoes no .env.local
IF EXIST .env.local (
    echo. >> .env.local
    echo TUNNEL_ID=%TUNNEL_ID% >> .env.local
    echo TUNNEL_NAME=%TUNNEL_NAME% >> .env.local
)

echo.
echo Configuracao concluida!
echo Para iniciar o tunnel, execute: start-tunnel.bat
pause
exit /b 0
