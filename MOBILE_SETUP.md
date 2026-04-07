# Frame Photo Printer - Mobile Setup Documentation

## ✅ Instalação Completa

**Data:** 2026-04-07  
**Local:** `/home/daniel/.openclaw/workspace-frame-photo-printer/`

### Status de Instalação

#### 1. Setup Inicial ✅
- ✅ Repositório clonado com sucesso
- ✅ Dependências npm instaladas
- ✅ PostgreSQL configurado via Docker
- ✅ `.env.local` criado com DATABASE_URL
- ✅ Banco de dados funcionando

#### 2. Otimizações Mobile Implementadas ✅

**CameraCapture Component:**
- ✅ `facingMode: 'environment'` (câmera traseira por padrão)
- ✅ Botão toggle para alternar câmeras (frontal/traseira)
- ✅ Touch-friendly buttons (mínimo 48px)
- ✅ Resolução otimizada (ideal 1920x1080)
- ✅ Emojis nos botões para UX intuitiva

**CSS Responsivo:**
- ✅ Meta viewport configurado corretamente
- ✅ Mobile-first design
- ✅ Botões grandes (mínimo 48px de altura)
- ✅ Classe `.btn-large` com 56px de altura
- ✅ Layout vertical em mobile, horizontal em desktop
- ✅ Camera preview full-width em mobile (max 60vh)
- ✅ Touch-action manipulation (evita double-tap zoom)
- ✅ Font-size base 16px para acessibilidade

**PWA:**
- ✅ `manifest.json` criado
- ✅ Ícones configurados (192x192, 512x512)
- ✅ Display: standalone
- ✅ Orientação: portrait
- ⚠️  Service worker não implementado (opcional)

#### 3. Ajustes de UX Mobile ✅
- ✅ Feedback visual claro com emojis
- ✅ Loading states (isLoading)
- ✅ Botões grandes e espaçados
- ✅ Fonte mínima 16px (readable em mobile)
- ✅ Auto-seleção de primeira impressora
- ⚠️  Orientação automática via accelerometer (não implementada)

#### 4. Build & Deploy ✅
- ✅ Build de produção funcionando
- ✅ TypeScript types instalados (@types/pg, @types/uuid)
- ✅ Servidor de desenvolvimento rodando
- ✅ Next.js 14 otimizado

#### 5. Ajustes de Integração ⚠️
- ⚠️  Módulo `node-printer` removido (problemas de dependências)
- ✅ Print API mockada (queued status)
- ✅ Printers API retorna mock printer
- **Nota:** Para produção real, integrar com CUPS ou outro serviço de impressão

---

## 🌐 Acesso

### Local Development
```
http://localhost:3000
```

### Rede Local (Mobile Testing)
```
http://192.168.0.56:3000
```

**Importante:** Para testar em dispositivos móveis na rede local, acesse via IP acima.

---

## ⚡ Como Usar

### 1. Iniciar o servidor
```bash
cd /home/daniel/.openclaw/workspace-frame-photo-printer
npm run dev
```

### 2. Acessar de um dispositivo móvel
- Conectar na mesma rede WiFi
- Abrir navegador e acessar: `http://192.168.0.56:3000`
- Permitir acesso à câmera quando solicitado

### 3. Capturar Foto
1. Clicar em "Iniciar Câmera"
2. Permitir acesso (popup do navegador)
3. Trocar câmera se necessário (botão 🔄)
4. Capturar foto (botão 📸)

### 4. Aplicar Moldura
- Escolher orientação: Retrato 📱 ou Paisagem 🖼️

### 5. Imprimir
- Selecionar impressora
- Clicar em "🖨️ Imprimir"

---

## 🚀 Próximos Passos para Deploy

### Opção 1: Vercel (Recomendado para Next.js)
```bash
npm install -g vercel
vercel login
vercel deploy
```

**Configurar variáveis de ambiente na Vercel:**
- `DATABASE_URL`: PostgreSQL connection string

**HTTPS:** Vercel fornece HTTPS automaticamente ✅

---

### Opção 2: Self-Hosted (Servidor Próprio)

#### Com NGINX + SSL (Let's Encrypt)
```bash
# Build de produção
npm run build

# Instalar PM2
npm install -g pm2

# Iniciar com PM2
pm2 start npm --name "frame-photo-printer" -- start
pm2 save
pm2 startup
```

#### Configurar NGINX com SSL
```nginx
server {
    listen 443 ssl http2;
    server_name fotomoldura.dedebru.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/fotomoldura.dedebru.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fotomoldura.dedebru.duckdns.org/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Obter certificado SSL:**
```bash
sudo certbot --nginx -d fotomoldura.dedebru.duckdns.org
```

---

### Opção 3: Docker (Self-Hosted)
```dockerfile
# Criar Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t frame-photo-printer .
docker run -d -p 3000:3000 --env-file .env.local frame-photo-printer
```

---

## ⚠️ IMPORTANTE: HTTPS Obrigatório

**MediaStream API (câmera) só funciona com:**
- ✅ `localhost` (desenvolvimento)
- ✅ HTTPS (produção)
- ❌ HTTP em produção (câmera bloqueada pelo navegador)

**Solução:**
- Desenvolvimento: `http://localhost:3000` (OK)
- Testes mobile rede local: `http://192.168.0.56:3000` (OK temporariamente)
- Produção: **HTTPS obrigatório**

---

## 🔧 Integração de Impressão (TODO)

A impressão atualmente está mockada. Para integrar com impressoras reais:

### Opção A: CUPS (Linux)
```bash
sudo apt install cups libcups2-dev
npm install cups
```

### Opção B: Windows Print Spooler
Usar bibliotecas como `node-printer` (após resolver dependências)

### Opção C: Cloud Print API
- Google Cloud Print (descontinuado)
- Alternativas: PrintNode, Printful API

---

## 📱 Testes Mobile

### Quirks do Mobile Safari (iOS)
- ✅ `playsInline` adicionado ao video
- ✅ `autoPlay` configurado
- ⚠️  Testar orientação (portrait/landscape locks)
- ⚠️  Verificar camera permissions flow

### Testes Android (Chrome)
- ✅ facingMode: 'environment' funciona
- ✅ Camera toggle implementado
- ✅ Touch targets adequados (48px+)

---

## 📊 Build Output

```
Route (app)                              Size     First Load JS
┌ ○ /                                    1.89 kB        89.1 kB
├ ƒ /api/capture                         0 B                0 B
├ ƒ /api/frame                           0 B                0 B
├ ƒ /api/print                           0 B                0 B
└ ○ /api/printers                        0 B                0 B
```

**Total First Load:** 89.1 kB (otimizado para mobile)

---

## 🐛 Issues Conhecidos

1. **node-printer removido:** Dependências conflitantes (grunt). Solução: mock API + integrar com CUPS separadamente.
2. **Service worker não implementado:** PWA básico configurado, mas offline support não adicionado.
3. **Accelerometer orientation:** Detecção automática de orientação não implementada (baixa prioridade).

---

## 📝 Arquivos Modificados

1. `components/CameraCapture.tsx` - Mobile optimizations
2. `styles/globals.css` - Responsive design, touch-friendly
3. `app/layout.tsx` - Viewport + PWA metadata
4. `app/page.tsx` - Button sizes
5. `app/api/print/route.ts` - Removed node-printer
6. `app/api/printers/route.ts` - Mock printer list
7. `public/manifest.json` - PWA config (NEW)
8. `package.json` - Removed node-printer dependency

---

## ✅ Checklist Final

- [x] Clone repositório
- [x] Instalar dependências
- [x] Configurar PostgreSQL (Docker)
- [x] Criar `.env.local`
- [x] Otimizar para mobile (camera, CSS, buttons)
- [x] Implementar PWA manifest
- [x] Build de produção funcionando
- [x] Servidor rodando localmente
- [ ] Deploy com HTTPS (próximo passo)
- [ ] Integrar impressão real (próximo passo)
- [ ] Service worker (opcional)

---

**Status:** ✅ **FUNCIONANDO - Pronto para testes mobile na rede local**

**Próxima ação:** Deploy com HTTPS para teste em produção.
