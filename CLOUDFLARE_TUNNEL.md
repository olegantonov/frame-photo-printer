# Cloudflare Tunnel - Guia Completo

## O que é Cloudflare Tunnel?

Cloudflare Tunnel permite expor seu servidor local para a internet de forma segura via HTTPS, **sem abrir portas** no firewall ou precisar de IP público fixo.

**Vantagens:**
- ✅ HTTPS automático (certificado SSL gratuito)
- ✅ Não precisa abrir portas no roteador
- ✅ Não precisa IP público fixo
- ✅ Proteção DDoS da Cloudflare
- ✅ Acesso de qualquer lugar
- ✅ Gratuito

---

## Pré-requisitos

1. Conta Cloudflare (gratuita): https://dash.cloudflare.com/sign-up
2. Domínio configurado no Cloudflare (opcional, mas recomendado)
3. `cloudflared` instalado (instalador automático instala)

---

## Instalação Automática

### Opção 1: Durante a Instalação Completa

Execute `install.bat` — ele já configura o tunnel automaticamente.

### Opção 2: Configurar Apenas o Tunnel

```batch
scripts\setup-cloudflare.bat
```

Esse script:
1. Instala `cloudflared` (se necessário)
2. Faz login no Cloudflare (abre navegador)
3. Cria o tunnel `frame-photo-printer`
4. Gera arquivo de configuração

---

## Configuração Manual (Alternativa)

### 1. Instalar cloudflared

```batch
winget install Cloudflare.cloudflared
```

### 2. Login no Cloudflare

```batch
cloudflared tunnel login
```

Isso abre o navegador para autorizar. Após login, um certificado é salvo em `%USERPROFILE%\.cloudflared\cert.pem`.

### 3. Criar Tunnel

```batch
cloudflared tunnel create frame-photo-printer
```

Isso gera um UUID (ex: `abc123...`) que é o ID do tunnel.

### 4. Criar Arquivo de Configuração

Crie `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\<SEU_USUARIO>\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: "*"
    service: http://localhost:3000
  - service: http_status:404
```

### 5. Configurar DNS (Obrigatório com Domínio)

**Opção A: Via Dashboard**
1. Acesse https://dash.cloudflare.com
2. Selecione seu domínio
3. Vá em **DNS** → **Records**
4. Adicione registro CNAME:
   - **Nome:** `frame-photo-printer` (ou outro)
   - **Destino:** `<TUNNEL_ID>.cfargotunnel.com`
   - **Proxy status:** ✅ Proxied (laranja)

**Opção B: Via CLI**
```batch
cloudflared tunnel route dns frame-photo-printer frame-photo-printer.seudominio.com
```

### 6. Iniciar Tunnel

```batch
cloudflared tunnel run frame-photo-printer
```

---

## Uso Diário

### Iniciar Servidor + Tunnel

```batch
start-production.bat
```

Esse script pergunta se você quer iniciar com tunnel. Se sim:
- Inicia o servidor Next.js em background
- Inicia o Cloudflare Tunnel

### Iniciar Apenas Tunnel (Servidor Já Rodando)

```batch
start-tunnel.bat
```

---

## Acesso Remoto

### Com Domínio Configurado

```
https://frame-photo-printer.seudominio.com
```

### Sem Domínio (Tunnel Temporário)

Cloudflare gera uma URL temporária automaticamente. Para ativar:

```batch
cloudflared tunnel --url http://localhost:3000
```

Isso gera uma URL tipo: `https://abc123.trycloudflare.com`

⚠️ **Importante:** URLs temporárias expiram quando o tunnel é parado.

---

## Troubleshooting

### Erro: "tunnel credentials file not found"

**Solução:** Execute o login novamente:
```batch
cloudflared tunnel login
```

### Erro: "no such host"

**Solução:** Configure o DNS no painel Cloudflare (passo 5).

### Servidor não responde via tunnel

**Verificar:**
1. Servidor está rodando? `http://localhost:3000`
2. Tunnel está ativo? Verificar logs
3. DNS configurado corretamente?

### Tunnel desconecta sozinho

**Solução:** Use serviço Windows para manter rodando:
```batch
cloudflared service install
cloudflared service start
```

---

## Configuração de Serviço (Iniciar com Windows)

Para o tunnel iniciar automaticamente com Windows:

```batch
REM Instalar como servico
cloudflared service install

REM Iniciar servico
net start cloudflared

REM Verificar status
sc query cloudflared
```

---

## URLs de Referência

- Dashboard: https://dash.cloudflare.com
- Documentação oficial: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- Tunnel CLI Reference: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/

---

## Exemplo de Fluxo Completo

1. ✅ Executar `install.bat` (instala tudo)
2. ✅ Login no Cloudflare (navegador abre automaticamente)
3. ✅ Configurar DNS no dashboard (1 vez apenas)
4. ✅ Executar `start-production.bat` (servidor + tunnel)
5. ✅ Acessar `https://frame-photo-printer.seudominio.com`

---

## Segurança

- ✅ Tráfego criptografado via HTTPS
- ✅ Proteção DDoS da Cloudflare
- ✅ Firewall local permanece fechado
- ⚠️ Configure autenticação no painel admin (`/admin/login`)
- ⚠️ Use senhas fortes para usuários

---

## Custos

**Cloudflare Tunnel:** Gratuito (até 50 usuários simultâneos)

**Plano pago** (opcional):
- Zero Trust com autenticação avançada
- Logs detalhados
- SLA garantido

Para uso pessoal/pequeno gabinete, o plano gratuito é suficiente.
