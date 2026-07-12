# Deploy BabyList — Docker + IIS (Windows)

Este diretório contém os artefatos de build e deploy para servidor Windows com **Docker** e **IIS na porta 80**.

## Arquitetura

```
Internet → IIS Default Web Site :80
              → /BabyList/ (aplicação virtual + web.config)
                    → 127.0.0.1:8081 (container nginx)
                          → backend:3002 (rede Docker interna)
```

O frontend é buildado com `base: /BabyList/` para que assets e API usem o prefixo correto.

## Pré-requisitos no servidor

1. **Docker Desktop** ou Docker Engine + Compose
2. **IIS** com:
   - [URL Rewrite Module](https://www.iis.net/downloads/microsoft/url-rewrite)
   - [Application Request Routing (ARR)](https://www.iis.net/downloads/microsoft/application-request-routing)
3. Habilitar proxy no ARR:
   - IIS Manager → servidor → **Application Request Routing Cache** → **Server Proxy Settings** → **Enable proxy**

## Configuração

```powershell
copy .env.example .env
notepad .env
```

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Segredo forte para tokens JWT |
| `APP_PORT` | Porta no host para o container (padrão: `8081`). **Não use 80** |
| `IIS_SITE_PATH` | Pasta física do site IIS (ex: `C:\inetpub\babylist`) |
| `IIS_DEPLOY_MODE` | `subfolder` (aplicação virtual, padrão) ou `root` (site dedicado) |
| `IIS_SUBPATH` | Alias da aplicação no IIS (padrão: `BabyList`) |
| `VITE_BASE_PATH` | Base path do build frontend (padrão: `/BabyList/`) |

Verifique porta livre:

```powershell
netstat -ano | findstr :8081
```

## Deploy

Na raiz do projeto:

```powershell
npm run deploy
```

Ou passo a passo:

```powershell
npm run deploy:iis      # gera deploy/iis/site/web.config
npm run deploy:build    # docker compose build
npm run deploy:up       # docker compose up -d
```

## Configurar o IIS (aplicação virtual)

1. No **Default Web Site**, crie uma **Aplicação** chamada `BabyList` (mesmo nome de `IIS_SUBPATH`)
2. **Physical path**: pasta com o `web.config` (valor de `IIS_SITE_PATH`)
3. O script `deploy` copia o `web.config` automaticamente
4. Teste:
   - `http://127.0.0.1:8081/` → container direto (sem prefixo)
   - `https://srv-web.ddns.net/BabyList/` → via IIS

**Importante:** acesse sempre com o prefixo `/BabyList/`. A raiz do domínio (`/`) pertence ao site pai.

## Evitar conflito com outro Docker

- BabyList usa `name: babylist` no compose (rede isolada)
- Containers: `babylist-backend`, `babylist-frontend`
- Backend **não** publica porta no host
- Frontend publica apenas `127.0.0.1:APP_PORT` — escolha porta diferente do outro projeto

## Arquivos gerados

| Arquivo | Descrição |
|---|---|
| `deploy/iis/site/web.config` | Gerado a partir do `.env` (não editar manualmente) |
| `deploy/iis/web.config.template` | Template para site na raiz |
| `deploy/iis/web.config.application.template` | Template para aplicação virtual IIS |

## Atualização

```powershell
git pull
npm run deploy
```

Os dados persistem em `./data/database.json`.
