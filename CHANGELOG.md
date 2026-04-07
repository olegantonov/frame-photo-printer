# CHANGELOG - Frame Photo Printer

## [2.0.0] - 2026-04-07

### ✨ Novas Funcionalidades (Arquitetura Admin + Operadores)

#### Autenticação e Autorização
- ✅ NextAuth.js implementado
- ✅ Roles: `admin` e `operator`
- ✅ Proteção de rotas admin
- ✅ Senhas hash com bcryptjs

#### Painel Administrativo Completo
- ✅ **Dashboard** (`/admin/dashboard`)
  - Estatísticas em tempo real
  - Fotos hoje, impressões hoje, pendentes
  - Total de usuários e molduras ativas
  - Ações rápidas para gerenciamento

- ✅ **Gerenciamento de Usuários** (`/admin/users`)
  - CRUD completo
  - Criar admin e operadores
  - Editar perfis e senhas
  - Deletar usuários

- ✅ **Gerenciamento de Molduras** (`/admin/frames`)
  - CRUD completo
  - Upload de molduras customizadas (URL)
  - Configurar dimensões (mm)
  - Configurar borda (pixels)
  - Ativar/desativar molduras
  - Preview visual

- ✅ **Configuração de Impressoras** (`/admin/printers`)
  - Detecção automática de impressoras Windows
  - Teste de impressão
  - Instruções para configuração manual

- ✅ **Histórico de Impressões** (`/admin/prints`)
  - Log completo de todas as impressões
  - Filtros e paginação
  - Status detalhado (sucesso/falha/pendente)
  - Usuário responsável por cada impressão

#### Banco de Dados
- ✅ Migração para Prisma ORM
- ✅ Schema atualizado com novos modelos:
  - `User` (autenticação e roles)
  - `Frame` (molduras customizáveis)
  - `PrintLog` atualizado (user_id)
- ✅ Relacionamentos definidos

#### Deployment Windows
- ✅ **README_WINDOWS.md** - Guia completo de instalação
- ✅ **start.bat** - Script de inicialização Windows
- ✅ **scripts/setup.js** - Setup automático (admin + molduras padrão)
- ✅ Instruções para PM2
- ✅ Instruções para configuração de rede local
- ✅ Instruções para firewall Windows

#### Segurança
- ✅ .env.local commitado (repositório privado)
- ✅ Credenciais de exemplo incluídas
- ✅ Instruções de segurança para produção

#### Documentação
- ✅ **ARQUITETURA.md** - Documentação técnica completa
- ✅ **README_WINDOWS.md** - Guia de instalação Windows
- ✅ **CHANGELOG.md** - Histórico de versões
- ✅ Fluxos de uso documentados
- ✅ Troubleshooting detalhado

### 🔧 Melhorias Técnicas

- ✅ Migração para Prisma 5.x
- ✅ SessionProvider global (Next.js 14)
- ✅ Type-safe com TypeScript
- ✅ Componentes reutilizáveis (AdminNav)
- ✅ API routes RESTful
- ✅ Paginação no histórico
- ✅ Validações server-side

### 🎨 UI/UX

- ✅ Interface admin moderna e responsiva
- ✅ Navegação lateral fixa
- ✅ Cards com hover effects
- ✅ Modais para CRUD
- ✅ Badges de status coloridos
- ✅ Emojis para melhor UX
- ✅ Mobile-friendly (sidebar adaptável)

### 🖨️ Integração de Impressão

- ✅ Suporte a node-printer (Windows)
- ✅ Fallback para PowerShell (scripts/print.ps1)
- ✅ Teste de impressão no painel admin
- ✅ Log detalhado de erros

### 📦 Dependências Adicionadas

```json
{
  "next-auth": "^4.x",
  "bcryptjs": "^2.x",
  "@types/bcryptjs": "^2.x",
  "prisma": "^5.20.0",
  "@prisma/client": "^5.20.0",
  "node-printer": "^1.0.4",
  "pm2": "latest"
}
```

### 🗂️ Estrutura de Arquivos

#### Novos Arquivos

```
app/
├── admin/
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── users/page.tsx
│   ├── frames/page.tsx
│   ├── printers/page.tsx
│   └── prints/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   └── admin/
│       ├── stats/route.ts
│       ├── users/route.ts
│       ├── frames/route.ts
│       └── prints/route.ts

components/
├── AdminNav.tsx
└── Providers.tsx

prisma/
└── schema.prisma

scripts/
├── setup.js
└── print.ps1

types/
└── next-auth.d.ts

.env.local (commitado)
.env.example
start.bat
README_WINDOWS.md
ARQUITETURA.md
CHANGELOG.md
```

### 🐛 Correções

- ✅ Session management no Next.js 14
- ✅ Type definitions para NextAuth
- ✅ Prisma client singleton
- ✅ CORS headers (não necessário em self-hosted)

---

## [1.0.0] - Versão Anterior

### Funcionalidades Base

- Captura de foto via webcam
- Seleção de orientação (retrato/paisagem)
- Aplicação de moldura básica
- Integração com impressora (mock)
- Salvamento no banco PostgreSQL

### Stack

- Next.js 14
- React 18
- PostgreSQL (schema SQL direto)
- Sharp.js (processamento de imagem)

---

## 🎯 Próximas Versões (Roadmap)

### [2.1.0] - Planejado
- [ ] Upload de molduras via drag-and-drop
- [ ] Preview em tempo real da moldura
- [ ] Dark mode
- [ ] Multi-idioma (i18n)

### [2.2.0] - Planejado
- [ ] Fila de impressão com prioridade
- [ ] Integração com impressoras de rede
- [ ] PWA offline-first
- [ ] Estatísticas avançadas (gráficos)

### [3.0.0] - Futuro
- [ ] Multi-tenancy (múltiplas instalações)
- [ ] API externa para integração
- [ ] Mobile app nativo
- [ ] Cloud backup automático

---

**Autor:** OpenClaw Coding Agent  
**Data:** 2026-04-07  
**Versão Atual:** 2.0.0
