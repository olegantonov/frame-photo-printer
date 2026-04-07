# Frame Photo Printer

Sistema web para captura, moldura e impressão de fotos em dimensões 15x21 cm.

## Características

- Captura de foto via webcam do navegador
- Aplicação automática de moldura 15x21 (vertical/horizontal)
- Seleção manual de orientação (retrato/paisagem)
- Salvamento em banco de dados
- Integração com impressora local
- Configuração de impressora pelo usuário
- Interface simples, moderna e funcional

## Stack

- **Frontend:** Next.js 14+ (React, TypeScript)
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL
- **Impressão:** node-printer / CUPS
- **Hospedagem:** Vercel ou self-hosted

## Estrutura do Projeto

```
frame-photo-printer/
├── frontend/              # Next.js app (React + TS)
│   ├── app/
│   │   ├── page.tsx       # Home
│   │   ├── layout.tsx     # Layout global
│   │   └── api/
│   │       ├── capture.ts # POST photo
│   │       ├── frame.ts   # POST apply frame
│   │       ├── print.ts   # POST send to printer
│   │       └── printers.ts # GET available printers
│   ├── components/
│   │   ├── CameraCapture.tsx
│   │   ├── FrameSelector.tsx
│   │   ├── FramePreview.tsx
│   │   └── PrinterSettings.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── lib/
│   │   ├── frameRenderer.ts
│   │   └── api.ts
│   ├── package.json
│   └── tsconfig.json
├── backend/               # Express server (optional, for heavy lifting)
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── print.ts
│   │   │   └── printers.ts
│   │   ├── services/
│   │   │   ├── frameService.ts
│   │   │   ├── printerService.ts
│   │   │   └── photoService.ts
│   │   └── db/
│   │       ├── schema.sql
│   │       └── connection.ts
│   ├── package.json
│   └── tsconfig.json
├── database/
│   └── schema.sql
├── .env.example
├── docker-compose.yml     # PostgreSQL
└── package.json           # Root

```

## Setup Rápido

### 1. Pré-requisitos

- Node.js 18+
- npm/yarn
- PostgreSQL 14+
- Docker (opcional)

### 2. Instalação

```bash
# Clone o repositório
git clone https://github.com/olegantonov/frame-photo-printer.git
cd frame-photo-printer

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
```

### 3. Banco de dados

```bash
# Com Docker
docker-compose up -d

# Ou instale PostgreSQL manualmente
# Crie o banco
createdb frame_photo_printer

# Execute schema
psql -d frame_photo_printer -f database/schema.sql
```

### 4. Desenvolvimento

```bash
npm run dev
# Acesse http://localhost:3000
```

## Variáveis de Ambiente (.env.local)

```
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/frame_photo_printer

# Impressão
PRINTER_SERVICE_URL=http://localhost:9100
CUPS_ENABLED=true

# App
NEXT_PUBLIC_MAX_UPLOAD_SIZE=10485760  # 10MB
```

## API Endpoints

### POST /api/capture
Recebe foto da câmera (base64)
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "orientation": "portrait" | "landscape"
}
```

### POST /api/frame
Aplica moldura à foto
```json
{
  "photoId": "uuid",
  "frameType": "15x21",
  "orientation": "portrait" | "landscape"
}
```

### POST /api/print
Envia para impressora
```json
{
  "photoId": "uuid",
  "printerName": "string"
}
```

### GET /api/printers
Lista impressoras disponíveis
```json
[
  { "name": "Brother_HL_L8360CDW", "status": "idle" },
  { "name": "Canon_imagePROGRAF", "status": "idle" }
]
```

## Banco de Dados Schema

```sql
-- Fotos
CREATE TABLE photos (
  id UUID PRIMARY KEY,
  image_data BYTEA NOT NULL,
  frame_applied BOOLEAN DEFAULT false,
  framed_image_data BYTEA,
  orientation VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  printed_at TIMESTAMP
);

-- Configuração de impressoras
CREATE TABLE printer_config (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  driver VARCHAR(100),
  status VARCHAR(20),
  last_used TIMESTAMP
);

-- Log de impressões
CREATE TABLE print_logs (
  id UUID PRIMARY KEY,
  photo_id UUID REFERENCES photos(id),
  printer_name VARCHAR(255),
  status VARCHAR(20),
  printed_at TIMESTAMP DEFAULT NOW()
);
```

## Componentes Frontend

### CameraCapture
- Acessa webcam via MediaStream API
- Captura foto em alta resolução
- Preview antes de salvar

### FrameSelector
- Escolhe entre retrato/paisagem
- Preview em tempo real
- Dimensões 15x21 cm (padrão)

### FramePreview
- Mostra foto com moldura aplicada
- Zoom e preview final
- Confirmação antes de imprimir

### PrinterSettings
- Lista impressoras conectadas
- Seleção de impressora
- Testes de conexão

## Desenvolvimento

```bash
# Build
npm run build

# Lint
npm run lint

# Test
npm run test

# Deploy (Vercel)
vercel deploy
```

## Troubleshooting

### Câmera não aparece
- Verifique permissões do navegador
- HTTPS é necessário (exceto localhost)

### Impressora não encontrada
- Verifique CUPS está rodando: `sudo systemctl status cups`
- Configure impressora: `lpstat -p -d`

### Banco de dados
- Verifique conexão: `psql $DATABASE_URL`

## Licença

MIT

## Contato

olegantonov@github.com
