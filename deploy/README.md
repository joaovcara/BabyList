# Deploy BabyList — Docker + IIS (Windows)

Este diretório contém os artefatos de build e deploy para servidor Windows com **Docker** e **IIS na porta 80**.

## Arquitetura

```
Internet → IIS :80 (web.config reverse proxy)
              → 127.0.0.1:APP_PORT (container nginx)
                    → backend:3001 (rede Docker interna)
```

O IIS **não** serve os arquivos do React diretamente. Ele apenas faz proxy para o container Docker.

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
| `APP_PORT` | Porta no host para o container (ex: `8080`). **Não use 80** |
| `IIS_SITE_PATH` | Pasta física do site IIS (ex: `C:\inetpub\babylist`) |
| `IIS_DEPLOY_MODE` | `root` (site inteiro) ou `subfolder` (subpasta) |
| `IIS_SUBPATH` | Nome da subpasta se `IIS_DEPLOY_MODE=subfolder` |

Verifique porta livre:

```powershell
netstat -ano | findstr :8080
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

## Configurar o site no IIS

1. Crie a pasta `C:\inetpub\babylist` (ou o valor de `IIS_SITE_PATH`)
2. O script `deploy` copia o `web.config` automaticamente se `IIS_SITE_PATH` estiver definido
3. No **IIS Manager**:
   - Adicione um novo **Site** ou reconfigure o existente
   - **Physical path**: `C:\inetpub\babylist`
   - **Binding**: porta `80`, hostname desejado
4. Teste:
   - `http://127.0.0.1:8080` → container direto
   - `http://seu-dominio/` → via IIS

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
| `deploy/iis/web.config.subfolder.template` | Template para subpasta |

## Atualização

```powershell
git pull
npm run deploy
```

Os dados persistem em `./data/database.json`.
