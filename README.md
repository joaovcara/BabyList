# BabyList – Enxoval do Bebê

Aplicativo web para controle de enxoval de bebê. Permite cadastrar itens, acompanhar o progresso e disponibilizar uma página pública para reserva de presentes por familiares e amigos.

## Tecnologias

- **Frontend:** React, Vite, Material UI, Axios, React Router, DayJS, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Persistência:** arquivo JSON único (`data/database.json`)

## Estrutura do Projeto

```
baylist/
├── data/
│   └── database.json       # criado automaticamente no primeiro start
├── backend/                # API Express
├── frontend/               # App React
├── .github/workflows/      # deploy via GitHub Actions
├── docker-compose.yml
└── package.json            # scripts para rodar ambos
```

## Pré-requisitos

- Node.js 18+ e npm *(desenvolvimento local)*
- Docker e Docker Compose *(execução com containers)*

## Execução com Docker

```bash
# Na raiz do projeto
cp .env.example .env   # ajuste JWT_SECRET se necessário
npm run docker:up
```

A aplicação ficará disponível em **http://localhost:8081** (porta configurável via `APP_PORT` no `.env`).

Comandos úteis:

```bash
npm run docker:down    # para os containers
npm run docker:logs    # acompanha os logs
```

O arquivo `data/database.json` é persistido na pasta `./data` do host via volume montado no container do backend.

### Serviços

| Container | Descrição |
|---|---|
| `babylist-backend` | API Express na porta interna 3002 |
| `babylist-frontend` | Nginx servindo o React e fazendo proxy de `/api` para o backend |

## Instalação (desenvolvimento local)

```bash
# Na raiz do projeto
npm install
npm run install:all
```

### Configuração do backend

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp backend/.env.example backend/.env
```

Variáveis disponíveis:

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta da API | `3002` |
| `JWT_SECRET` | Segredo para tokens JWT | *(obrigatório em produção)* |
| `DATABASE_PATH` | Caminho do `database.json` | `../data/database.json` |

## Execução em desenvolvimento

```bash
# Na raiz – inicia backend e frontend juntos
npm run dev
```

Ou separadamente:

```bash
cd backend && npm run dev   # http://localhost:3002
cd frontend && npm run dev  # http://localhost:5173
```

O frontend usa proxy do Vite: requisições `/api` são encaminhadas para o backend.

## Primeiro acesso

1. Acesse `http://localhost:5173`
2. Na primeira execução, acesse `/setup` para criar a conta de administrador
3. Após o setup, use `/login` para acessar a área administrativa

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Página pública (lista de enxoval + reservas) |
| `/setup` | Cadastro inicial do admin (apenas no primeiro acesso) |
| `/login` | Login administrativo |
| `/admin` | Dashboard |
| `/admin/produtos` | CRUD de produtos |
| `/admin/categorias` | CRUD de categorias |
| `/admin/reservas` | Gestão de reservas |
| `/admin/configuracoes` | Título, nome do bebê e senha |

## API

Base: `http://localhost:3002/api` *(dev local)* ou `http://localhost:8081/api` *(Docker)*

- `GET /setup/status` – verifica se precisa de setup
- `POST /setup` – cadastra admin
- `POST /login` – autenticação
- `GET /produtos` – lista produtos (público)
- `POST /produtos` – cria produto (auth)
- `PUT /produtos/:id` – atualiza produto (auth)
- `DELETE /produtos/:id` – exclui produto (auth)
- `PATCH /produtos/:id/receber` – registra presente recebido (auth)
- `GET /reservas` – lista reservas (auth)
- `POST /reservas` – cria reserva (público)
- `DELETE /reservas/:id` – cancela reserva (auth)
- `GET /categorias` – lista categorias
- `POST/PUT/DELETE /categorias` – CRUD (auth)
- `GET /dashboard` – métricas (auth)
- `GET/PUT /configuracoes` – configurações

## Modelo de dados (`database.json`)

```json
{
  "usuarios": [],
  "produtos": [],
  "reservas": [],
  "configuracoes": {
    "tituloLista": "Enxoval do Bebê",
    "nomeBebe": "",
    "categorias": ["Roupas", "Banho", "..."]
  }
}
```

## Deploy (GitHub Actions)

Deploy automático no servidor on-prem via **self-hosted runner** (labels `self-hosted` e `babylist`).

**Trigger:** push em `main` ou execução manual (Actions → Deploy → Run workflow).

### Pré-requisitos no servidor

1. Self-hosted runner instalado e online no GitHub (Settings → Actions → Runners).
2. Clone do repositório em `/opt/apps/babylist` com remote apontando para este repo.
3. Arquivo `/opt/apps/babylist/.env` presente (a partir de `.env.example`), com `JWT_SECRET` real, `APP_PORT=8081` e `VITE_BASE_PATH=/BabyList/`.
4. Usuário do runner com permissão para `sudo docker compose` (NOPASSWD para Docker ou grupo `docker`).

### O que o pipeline faz

1. Atualiza o código em `/opt/apps/babylist` (`git reset --hard origin/main`)
2. Confirma que `.env` existe (não sobrescreve)
3. `sudo docker compose --env-file .env up -d --build`
4. Health check em `http://127.0.0.1:8081/BabyList/`

O volume `./data` (incluindo `database.json`) **não é apagado** pelo deploy. Não use `docker compose down -v` em produção.

URL pública: `https://srv-web.ddns.net/BabyList/` (Nginx do host → `127.0.0.1:8081`).

## Arquitetura

O backend segue o padrão **Controller → Service → Repository**, preparado para futura migração para PostgreSQL sem alterar as regras de negócio.
