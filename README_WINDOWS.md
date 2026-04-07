# Frame Photo Printer - Instalação Windows

Sistema completo de captura, moldura e impressão de fotos com painel administrativo.

## 📋 Pré-requisitos

### 1. Node.js
- Baixar e instalar: https://nodejs.org/ (versão 18 LTS ou superior)
- Durante a instalação, marcar "Add to PATH"

### 2. PostgreSQL
- Baixar e instalar: https://www.postgresql.org/download/windows/
- Durante a instalação:
  - Definir senha do usuário `postgres`
  - Porta padrão: 5432
  - Manter demais configurações padrão

### 3. Git (opcional, para clonar o repositório)
- Baixar e instalar: https://git-scm.com/download/win

---

## 🚀 Instalação

### Passo 1: Obter o Código

Se tiver Git instalado:
```bash
git clone https://github.com/SEU-USUARIO/frame-photo-printer.git
cd frame-photo-printer
```

Ou baixe o ZIP do repositório e extraia em uma pasta.

### Passo 2: Instalar Dependências

Abra o **Prompt de Comando** (cmd) ou **PowerShell** na pasta do projeto:

```bash
npm install
```

### Passo 3: Configurar Banco de Dados

#### 3.1. Criar o banco de dados

Abra o **pgAdmin** (instalado com PostgreSQL) ou use o prompt:

```bash
# Via psql (substitua 'postgres' pela sua senha)
psql -U postgres

# No terminal do psql:
CREATE DATABASE frame_photo_printer;
\q
```

#### 3.2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:
```bash
copy .env.example .env.local
```

Edite o arquivo `.env.local` no Bloco de Notas ou editor de texto:

```env
# Database - Ajuste usuário e senha conforme sua instalação PostgreSQL
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/frame_photo_printer"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-uma-chave-aleatoria-de-pelo-menos-32-caracteres"

# Admin padrão (será criado automaticamente)
DEFAULT_ADMIN_EMAIL="admin@framephoto.local"
DEFAULT_ADMIN_PASSWORD="admin123"
```

💡 **Dica:** Para gerar NEXTAUTH_SECRET, você pode usar este comando no PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

#### 3.3. Inicializar o banco

Execute a migração Prisma:

```bash
npx prisma generate
npx prisma db push
```

#### 3.4. Criar usuário admin inicial

Execute o script de setup:

```bash
npm run setup
```

Ou crie manualmente via Node:

```bash
node -e "const bcrypt = require('bcryptjs'); const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { const hash = await bcrypt.hash('admin123', 10); await prisma.user.create({ data: { email: 'admin@framephoto.local', password_hash: hash, role: 'admin', name: 'Administrador' } }); console.log('Admin criado!'); await prisma.$disconnect(); })();"
```

### Passo 4: Criar Molduras Padrão

```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { await prisma.frame.createMany({ data: [{ name: '15x21 Retrato', width_mm: 150, height_mm: 210, border_px: 40, active: true }, { name: '15x21 Paisagem', width_mm: 210, height_mm: 150, border_px: 40, active: true }] }); console.log('Molduras criadas!'); await prisma.$disconnect(); })();"
```

---

## ▶️ Executar o Sistema

### Modo Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### Modo Produção

```bash
npm run build
npm start
```

---

## 🖨️ Configuração de Impressora

### Windows + Node-Printer

O sistema tentará usar `node-printer` para detectar impressoras Windows automaticamente.

Se houver problemas, você pode:

1. **Configurar manualmente no painel admin:**
   - Login: http://localhost:3000/admin/login
   - Ir em "Impressoras"
   - Adicionar impressora pelo nome exato (conforme aparece no Windows)

2. **Listar impressoras disponíveis:**

```powershell
# PowerShell
Get-Printer | Select-Object Name, DriverName, PortName
```

3. **Alternativa:** Use script PowerShell customizado
   - Edite `lib/printerService.ts` para chamar script PowerShell que envia para impressora

---

## 🔐 Acesso ao Sistema

### Operadores (Captura de Fotos)
- URL: http://localhost:3000
- Não precisa login (ou login como operador, se configurado)

### Admin (Painel Administrativo)
- URL: http://localhost:3000/admin/login
- Email: `admin@framephoto.local` (ou o que você configurou)
- Senha: `admin123` (ou o que você configurou)

### Funcionalidades Admin:
- ✅ Dashboard com estatísticas
- ✅ Gerenciar usuários (criar operadores/admins)
- ✅ Gerenciar molduras (upload, dimensões, ativar/desativar)
- ✅ Configurar impressoras
- ✅ Histórico de impressões

---

## 🔄 Inicialização Automática (Opcional)

### Usando PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "frame-photo-printer" -- start

# Salvar configuração
pm2 save

# Configurar para iniciar com o Windows
pm2 startup
```

### Usando Script Batch

Crie um arquivo `start.bat` na pasta do projeto:

```batch
@echo off
echo Iniciando Frame Photo Printer...
cd /d %~dp0
npm start
pause
```

Para iniciar automaticamente com o Windows:
1. Win+R → `shell:startup`
2. Criar atalho do `start.bat` nesta pasta

---

## 📱 Acesso na Rede Local

Para permitir acesso de outros dispositivos (smartphones, tablets) na mesma rede:

1. **Descobrir IP da máquina Windows:**
   ```powershell
   ipconfig
   # Procure "Endereço IPv4" da rede ativa
   ```

2. **Configurar Firewall:**
   - Abrir "Firewall do Windows Defender"
   - "Configurações avançadas" → "Regras de Entrada" → "Nova Regra"
   - Tipo: Porta
   - TCP: 3000
   - Permitir conexão
   - Nome: "Frame Photo Printer"

3. **Atualizar .env.local:**
   ```env
   NEXTAUTH_URL="http://SEU_IP_LOCAL:3000"
   ```

4. **Acessar de outros dispositivos:**
   ```
   http://SEU_IP_LOCAL:3000
   ```

   Exemplo: `http://192.168.1.100:3000`

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'pg'"
```bash
npm install pg
```

### Erro: "ECONNREFUSED" (PostgreSQL)
- Verifique se PostgreSQL está rodando:
  - Serviços do Windows (Win+R → `services.msc`)
  - Procurar "postgresql" → Iniciar se estiver parado

### Erro: node-printer não funciona
- Reinstalar: `npm uninstall node-printer && npm install node-printer`
- Ou implementar impressão via PowerShell (ver seção abaixo)

### Câmera não aparece
- Navegador precisa de HTTPS (ou localhost)
- Verificar permissões do navegador para câmera
- No Chrome: chrome://settings/content/camera

---

## 🛠️ Impressão via PowerShell (Alternativa)

Se `node-printer` não funcionar, crie um script PowerShell:

**print.ps1:**
```powershell
param(
    [string]$PrinterName,
    [string]$FilePath
)

Start-Process -FilePath $FilePath -ArgumentList "/print", "/p:`"$PrinterName`"" -Wait -NoNewWindow
```

**Integrar no código (lib/printerService.ts):**
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function printFile(printerName: string, filePath: string) {
  const psScript = path.join(process.cwd(), 'scripts', 'print.ps1');
  const command = `powershell -ExecutionPolicy Bypass -File "${psScript}" -PrinterName "${printerName}" -FilePath "${filePath}"`;
  
  await execAsync(command);
}
```

---

## 📊 Estrutura do Projeto

```
frame-photo-printer/
├── app/
│   ├── admin/              # Páginas admin (login, dashboard, etc)
│   ├── api/                # API routes (NextAuth, prints, frames, etc)
│   └── page.tsx            # Página principal (captura)
├── components/             # Componentes React
├── lib/                    # Utilitários (Prisma, serviços)
├── prisma/                 # Schema do banco
├── public/                 # Arquivos estáticos
├── .env.local             # Configurações (NÃO COMMITAR se for privado)
└── README_WINDOWS.md      # Este arquivo
```

---

## 🔒 Segurança

- ⚠️ **Atenção:** Este repositório está configurado como PRIVADO
- ✅ O arquivo `.env.local` está commitado (contém credenciais)
- ⚠️ **NÃO torne o repo público** sem remover `.env.local` antes!

### Para uso em produção:
1. Mudar senhas padrão
2. Gerar novo NEXTAUTH_SECRET
3. Configurar HTTPS (Cloudflare Tunnel ou certificado self-signed)

---

## 📞 Suporte

- Problemas com PostgreSQL: https://www.postgresql.org/docs/
- Problemas com Next.js: https://nextjs.org/docs
- Problemas com Node: https://nodejs.org/docs/

---

## 🎉 Pronto!

Sistema instalado e funcionando. Acesse:
- **Captura:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

Divirta-se! 📸🖨️
