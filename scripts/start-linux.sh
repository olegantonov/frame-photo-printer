#!/bin/bash
# Frame Photo Printer - Script de inicialização com Hotspot
# Este script inicia o servidor e opcionalmente cria um hotspot Wi-Fi

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Frame Photo Printer - Linux Startup${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

cd "$PROJECT_DIR"

# Verificar Node.js
echo -e "${YELLOW}[1/4] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERRO: Node.js não encontrado!${NC}"
    echo "Instale Node.js de https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}OK - Node.js $(node --version)${NC}"
echo ""

# Verificar PostgreSQL
echo -e "${YELLOW}[2/4] Verificando PostgreSQL...${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}OK - PostgreSQL está rodando${NC}"
else
    echo -e "${YELLOW}Iniciando PostgreSQL...${NC}"
    sudo systemctl start postgresql || true
fi
echo ""

# Perguntar sobre Hotspot
echo -e "${YELLOW}[3/4] Configuração de Hotspot Wi-Fi${NC}"
read -p "Deseja criar um hotspot Wi-Fi para acesso mobile? (s/N): " CREATE_HOTSPOT

if [[ "$CREATE_HOTSPOT" =~ ^[Ss]$ ]]; then
    # Verificar NetworkManager
    if ! command -v nmcli &> /dev/null; then
        echo -e "${RED}ERRO: NetworkManager (nmcli) não encontrado!${NC}"
        echo "Instale com: sudo apt install network-manager"
    else
        # Pegar interface Wi-Fi
        WIFI_IFACE=$(nmcli device status | grep wifi | head -1 | awk '{print $1}')
        
        if [ -z "$WIFI_IFACE" ]; then
            echo -e "${RED}Nenhuma interface Wi-Fi encontrada${NC}"
        else
            echo -e "${GREEN}Interface Wi-Fi: $WIFI_IFACE${NC}"
            
            read -p "Nome da rede (SSID) [FramePhotoPrinter]: " SSID
            SSID=${SSID:-FramePhotoPrinter}
            
            read -p "Senha (mínimo 8 caracteres) [foto1234]: " PASSWORD
            PASSWORD=${PASSWORD:-foto1234}
            
            echo -e "${YELLOW}Criando hotspot...${NC}"
            
            # Parar hotspot existente
            nmcli connection down Hotspot 2>/dev/null || true
            nmcli connection delete Hotspot 2>/dev/null || true
            
            # Criar hotspot
            if nmcli device wifi hotspot ifname "$WIFI_IFACE" ssid "$SSID" password "$PASSWORD"; then
                sleep 2
                IP=$(ip addr show "$WIFI_IFACE" | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
                echo ""
                echo -e "${GREEN}================================================${NC}"
                echo -e "${GREEN}  HOTSPOT CRIADO COM SUCESSO!${NC}"
                echo -e "${GREEN}================================================${NC}"
                echo -e "  📶 Rede: ${BLUE}$SSID${NC}"
                echo -e "  🔑 Senha: ${BLUE}$PASSWORD${NC}"
                echo -e "  🌐 Acesse: ${BLUE}http://$IP:3000${NC}"
                echo -e "${GREEN}================================================${NC}"
                echo ""
            else
                echo -e "${RED}Falha ao criar hotspot${NC}"
            fi
        fi
    fi
fi
echo ""

# Iniciar servidor
echo -e "${YELLOW}[4/4] Iniciando servidor...${NC}"
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "  Servidor rodando em: ${BLUE}http://localhost:3000${NC}"
echo -e "  Admin/Config: ${BLUE}http://localhost:3000/admin/settings${NC}"
echo ""
echo -e "  Pressione ${RED}Ctrl+C${NC} para parar o servidor"
echo -e "${GREEN}================================================${NC}"
echo ""

npm start
