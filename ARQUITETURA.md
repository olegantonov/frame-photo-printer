# ARQUITETURA.md - Frame Photo Printer

## 📐 Visão Geral

Sistema web self-hosted para captura, moldura e impressão de fotos 15x21cm, rodando em máquina Windows com impressora local.

## 🏗️ Componentes Principais

### 1. Frontend (Next.js 14 + React)

#### Rotas Públicas (Operadores)
- **`/`** - Página de captura de fotos
  - Acesso webcam via MediaStream API
  - Seleção de moldura e orientação
  - Envio para impressão

#### Rotas Admin (Protegidas)
- **`/admin/login`** - Login administrativo
- **`/admin/dashboard`** - Dashboard com estatísticas
- **`/admin/users`** - CRUD de usuários (admin + operadores)
- **`/admin/frames`** - CRUD de molduras (upload, dimensões, ativar/desativar)
- **`/admin/printers`** - Configuração de impressoras Windows
- **`/admin/prints`** - Histórico de impressões

### 2. Backend (Next.js API Routes)

#### Autenticação
- **NextAuth.js** (JWT strategy)
- Roles: `admin` | `operator`
- Senha hash: bcryptjs

#### API Endpoints

**Públicas:**
- `POST /api/capture` - Salvar foto capturada
- `POST /api/frame` - Aplicar moldura
- `POST /api/print` - Enviar para impressão
- `GET /api/printers` - Listar impressoras disponíveis

**Admin (autenticadas):**
- `GET /api/admin/stats` - Estatísticas do dashboard
- `GET|POST|PUT|DELETE /api/admin/users` - CRUD usuários
- `GET|POST|PUT|DELETE /api/admin/frames` - CRUD molduras
- `GET /api/admin/prints` - Histórico de impressões
- `POST /api/admin/test-print` - Teste de impressão

### 3. Banco de Dados (PostgreSQL)

**Schema Prisma:**

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password_hash String
  role          String   // "admin" | "operator"
  name          String?
  print_logs    PrintLog[]
}

model Photo {
  id                  String   @id @default(uuid())
  image_data          Bytes
  orientation         String   // "portrait" | "landscape"
  frame_applied       Boolean
  framed_image_data   Bytes?
  print_logs          PrintLog[]
}

model Frame {
  id         String   @id @default(uuid())
  name       String
  width_mm   Float
  height_mm  Float
  border_px  Int
  image_url  String?  // URL da moldura customizada (opcional)
  active     Boolean  // Moldura ativa para uso
}

model PrintLog {
  id            String   @id @default(uuid())
  photo_id      String
  printer_name  String
  status        String   // "pending" | "printing" | "success" | "failed"
  error_message String?
  user_id       String?
  printed_at    DateTime
  photo         Photo    @relation
  user          User?    @relation
}

model PrinterConfig {
  id         String    @id @default(uuid())
  name       String    @unique
  driver     String?
  status     String
  last_used  DateTime?
}
```

### 4. Impressão Windows

**Integração nativa:**

Opção 1: **node-printer** (NPM)
- Detecta impressoras Windows via CUPS/bindings nativos
- Limitação: pode não funcionar em todos os ambientes

Opção 2: **PowerShell Script** (fallback)
```powershell
# scripts/print.ps1
param([string]$PrinterName, [string]$FilePath)
Start-Process -FilePath $FilePath -ArgumentList "/print", "/p:`"$PrinterName`"" -Wait
```

**Fluxo:**
1. Foto capturada → Salva no banco (BYTEA)
2. Moldura aplicada → Sharp.js (processamento de imagem)
3. Conversão para formato de impressão (PDF ou PNG)
4. Envio para impressora via node-printer ou PowerShell

---

## 🔐 Autenticação e Autorização

### Roles

| Role      | Permissões                                      |
|-----------|-------------------------------------------------|
| `admin`   | Acesso total (dashboard, CRUD users/frames/printers) |
| `operator`| Apenas captura de fotos                         |

### Flow de Login

1. User acessa `/admin/login`
2. POST `/api/auth/signin` (NextAuth)
3. Credenciais validadas contra banco (bcrypt)
4. JWT gerado com `role` e `id`
5. Middleware protege rotas `/admin/*` (exceto login)

---

## 🚀 Deployment Windows

### Stack Completo

```
┌─────────────────────────────────────┐
│  Máquina Windows                    │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │ PostgreSQL   │  │ Node.js     │ │
│  │ :5432        │  │ Next.js     │ │
│  └──────────────┘  │ :3000       │ │
│                    └─────────────┘ │
│  ┌──────────────────────────────┐  │
│  │ Impressora Local             │  │
│  │ (Driver Windows)             │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         ↑
    Acesso LAN
    http://192.168.X.X:3000
```

### Inicialização

**Opção 1: PM2 (recomendado)**
```bash
npm install -g pm2
pm2 start npm --name "frame-photo" -- start
pm2 save
pm2 startup  # Windows: criar serviço
```

**Opção 2: Script Batch**
```batch
start.bat
```

**Opção 3: Manual**
```bash
npm start
```

### Portas

- **3000**: Next.js (HTTP)
- **5432**: PostgreSQL (localhost only)

### Firewall

Permitir porta 3000 TCP para acesso na rede local.

---

## 📂 Estrutura de Arquivos

```
frame-photo-printer/
├── app/
│   ├── admin/                    # Páginas admin
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── frames/page.tsx
│   │   ├── printers/page.tsx
│   │   └── prints/page.tsx
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── admin/
│   │   │   ├── stats/route.ts
│   │   │   ├── users/route.ts
│   │   │   ├── frames/route.ts
│   │   │   └── prints/route.ts
│   │   ├── capture/route.ts
│   │   ├── frame/route.ts
│   │   ├── print/route.ts
│   │   └── printers/route.ts
│   ├── layout.tsx
│   └── page.tsx                  # Página de captura (operadores)
├── components/
│   ├── AdminNav.tsx
│   ├── CameraCapture.tsx
│   ├── FrameSelector.tsx
│   ├── PrinterSettings.tsx
│   └── Providers.tsx             # SessionProvider
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── frameRenderer.ts          # Sharp.js para molduras
│   └── printerService.ts         # Integração impressora
├── prisma/
│   └── schema.prisma             # Schema do banco
├── scripts/
│   ├── setup.js                  # Setup inicial (admin + molduras)
│   └── print.ps1                 # PowerShell fallback
├── types/
│   └── next-auth.d.ts            # Type extensions
├── .env.local                    # Credenciais (commitado, repo privado)
├── .env.example                  # Template
├── start.bat                     # Batch script Windows
├── README.md
├── README_WINDOWS.md             # Instruções completas Windows
└── ARQUITETURA.md                # Este arquivo
```

---

## 🔧 Tecnologias

| Camada       | Tecnologia            | Versão   |
|--------------|-----------------------|----------|
| Runtime      | Node.js               | 18+      |
| Framework    | Next.js               | 14+      |
| UI           | React                 | 18+      |
| Database     | PostgreSQL            | 14+      |
| ORM          | Prisma                | 5+       |
| Auth         | NextAuth.js           | 4+       |
| Password     | bcryptjs              | 2+       |
| Images       | Sharp                 | 0.32+    |
| Printer      | node-printer          | 1.0+     |
| TypeScript   | TypeScript            | 5+       |

---

## 🛡️ Segurança

### Implementado

✅ Autenticação JWT (NextAuth)  
✅ Senhas hash (bcryptjs, salt rounds: 10)  
✅ Roles e proteção de rotas  
✅ Sanitização de inputs (Prisma escapa SQL injection)  
✅ Session server-side (JWT em cookie httpOnly)  

### Recomendações Produção

⚠️ Mudar `NEXTAUTH_SECRET` (usar string aleatória 32+ chars)  
⚠️ Mudar senha padrão do admin  
⚠️ HTTPS via Cloudflare Tunnel ou certificado self-signed  
⚠️ Rate limiting nas APIs (next-rate-limit)  
⚠️ Backup automático do PostgreSQL  

---

## 🎯 Fluxo de Uso

### Operador (Captura de Fotos)

1. Acessa `http://localhost:3000`
2. Câmera é ativada automaticamente
3. Clica "📸 Capturar Foto"
4. Seleciona orientação (retrato/paisagem)
5. Moldura é aplicada automaticamente
6. Seleciona impressora
7. Clica "🖨️ Imprimir"
8. Foto é salva no banco e enviada para impressão

### Admin (Gerenciamento)

1. Acessa `http://localhost:3000/admin/login`
2. Login: `admin@framephoto.local` / `admin123`
3. Dashboard mostra estatísticas em tempo real
4. Pode:
   - Criar/editar/deletar usuários
   - Criar/editar molduras customizadas
   - Configurar/testar impressoras
   - Ver histórico completo de impressões

---

## 📊 Estatísticas do Dashboard

- **Fotos Hoje**: Count de fotos criadas hoje
- **Impressões Hoje**: Count de impressões com status `success` hoje
- **Pendentes**: Count de impressões com status `pending`
- **Usuários**: Count total de usuários cadastrados
- **Molduras Ativas**: Count de molduras com `active = true`

---

## 🧪 Testes

### Teste Manual de Impressão

1. Admin → Impressoras
2. Selecionar impressora
3. Clicar "🚀 Enviar Teste"
4. Verifica se página de teste foi impressa

### Teste de Moldura

1. Criar moldura custom
2. Fazer upload de imagem PNG transparente (opcional)
3. Capturar foto e verificar aplicação

---

## 🔄 Próximas Melhorias (Roadmap)

- [ ] Upload de molduras via drag-and-drop
- [ ] Preview em tempo real da moldura antes de capturar
- [ ] Fila de impressão com prioridade
- [ ] Integração com impressoras via rede (não só local)
- [ ] Estatísticas avançadas (gráficos, relatórios)
- [ ] Multi-idioma (i18n)
- [ ] Dark mode
- [ ] PWA completo (offline-first)
- [ ] Backup automático de fotos para nuvem

---

## 📞 Troubleshooting

Ver `README_WINDOWS.md` seção completa de troubleshooting.

---

**Última atualização:** 2026-04-07  
**Versão:** 2.0.0 (Arquitetura Admin + Operadores)
