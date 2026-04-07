# Frame Photo Printer - Guia de Instalação

## 📋 Pré-requisitos

- **Node.js** 18+ (recomendado: v20+)
- **PostgreSQL** 14+
- **Impressora Térmica** compatível com ESC/POS (ex: Epson TM-T20, compatíveis genéricas)
- **Webcam** (USB ou integrada)

## 🚀 Instalação Rápida

### 1. Clone o repositório

```bash
git clone https://github.com/olegantonov/frame-photo-printer.git
cd frame-photo-printer
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

#### Opção A: Docker (Recomendado)

```bash
docker-compose up -d
```

Isso criará um container PostgreSQL na porta 5432.

#### Opção B: PostgreSQL local

Se você já tem PostgreSQL instalado:

```bash
# Crie o banco de dados
createdb frame_printer

# Execute o schema
psql frame_printer < database/schema.sql
```

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e ajuste:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/frame_printer"
NEXT_PUBLIC_CAMERA_DEVICE_ID=""  # Deixe vazio para usar câmera padrão
PRINTER_PORT=""  # Ex: /dev/usb/lp0 ou COM3 (Windows)
```

### 5. Execute as migrações (se aplicável)

```bash
npm run db:migrate
# OU
psql frame_printer < database/schema.sql
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🖨️ Configuração da Impressora

### Linux

1. Conecte a impressora USB
2. Verifique o dispositivo:
   ```bash
   ls -l /dev/usb/lp*
   # OU
   dmesg | grep -i printer
   ```

3. Dê permissões (se necessário):
   ```bash
   sudo chmod 666 /dev/usb/lp0
   ```

4. Atualize `.env`:
   ```env
   PRINTER_PORT="/dev/usb/lp0"
   ```

### Windows

1. Conecte a impressora
2. Verifique em **Gerenciador de Dispositivos → Portas (COM & LPT)**
3. Anote a porta (ex: `COM3`)
4. Atualize `.env`:
   ```env
   PRINTER_PORT="COM3"
   ```

### macOS

1. Conecte a impressora
2. Verifique:
   ```bash
   ls /dev/tty.usb*
   ```

3. Atualize `.env`:
   ```env
   PRINTER_PORT="/dev/tty.usbserial-XXXX"
   ```

---

## 📸 Configuração da Câmera

### Testar câmera disponível

Abra o navegador em **http://localhost:3000**, clique em "Testar Câmera" e permita o acesso.

### Selecionar câmera específica

Se você tem múltiplas câmeras:

1. Abra o console do navegador (F12)
2. Execute:
   ```javascript
   navigator.mediaDevices.enumerateDevices().then(devices => {
     console.log(devices.filter(d => d.kind === 'videoinput'));
   });
   ```

3. Copie o `deviceId` desejado
4. Atualize `.env`:
   ```env
   NEXT_PUBLIC_CAMERA_DEVICE_ID="seu-device-id-aqui"
   ```

---

## 🐛 Troubleshooting

### Erro: "Câmera não encontrada"

- **Verifique permissões do navegador:** Alguns navegadores bloqueiam acesso à câmera em HTTP (use HTTPS ou `localhost`)
- **Teste em outro navegador:** Chrome/Edge têm melhor suporte para WebRTC
- **Verifique hardware:**
  ```bash
  # Linux
  ls /dev/video*
  
  # Windows: Gerenciador de Dispositivos
  ```

### Erro: "Banco de dados não conecta"

1. **Verifique se o PostgreSQL está rodando:**
   ```bash
   # Docker
   docker ps | grep postgres
   
   # Serviço local
   sudo systemctl status postgresql
   ```

2. **Teste a conexão:**
   ```bash
   psql "postgresql://postgres:postgres@localhost:5432/frame_printer"
   ```

3. **Verifique a `DATABASE_URL` no `.env`**

### Erro: "Impressora não responde"

- **Linux:** Verifique permissões (`sudo chmod 666 /dev/usb/lp0`)
- **Windows:** Instale drivers oficiais do fabricante
- **Teste manual:**
  ```bash
  # Linux
  echo "Teste" > /dev/usb/lp0
  ```

### Erro: "Module not found: Can't resolve 'escpos'"

```bash
npm install escpos escpos-usb --save
```

### Porta 3000 já em uso

```bash
# Mude a porta
PORT=3001 npm run dev
```

---

## 📦 Build de Produção

```bash
npm run build
npm start
```

Ou com Docker:

```bash
docker build -t frame-photo-printer .
docker run -p 3000:3000 --env-file .env frame-photo-printer
```

---

## 🔧 Manutenção

### Backup do banco

```bash
pg_dump frame_printer > backup_$(date +%Y%m%d).sql
```

### Limpar fotos antigas

```bash
# Deletar fotos com mais de 30 dias
psql frame_printer -c "DELETE FROM photos WHERE created_at < NOW() - INTERVAL '30 days';"
```

---

## 📚 Recursos Adicionais

- **Documentação API:** Ver `API.md`
- **Roadmap:** Ver `ROADMAP.md`
- **Issues:** https://github.com/olegantonov/frame-photo-printer/issues

---

## 🆘 Ajuda

Se precisar de ajuda:

1. Verifique os [Issues](https://github.com/olegantonov/frame-photo-printer/issues)
2. Abra uma nova issue com:
   - Versão do Node.js (`node --version`)
   - Sistema operacional
   - Logs de erro completos
   - Passos para reproduzir

---

**Desenvolvido com ❤️ para otimizar o fluxo de fotografia + impressão instantânea**
