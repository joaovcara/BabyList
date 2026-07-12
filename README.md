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
├── deploy/                 # IIS + scripts de deploy (Windows)
├── frontend/               # App React
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

A aplicação ficará disponível em **http://localhost:8080** (porta configurável via `APP_PORT` no `.env`).

Comandos úteis:

```bash
npm run docker:down    # para os containers
npm run docker:logs    # acompanha os logs
```

O arquivo `data/database.json` é persistido na pasta `./data` do host via volume montado no container do backend.

### Serviços

| Container | Descrição |
|---|---|
| `babylist-backend` | API Express na porta interna 3001 |
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
| `PORT` | Porta da API | `3001` |
| `JWT_SECRET` | Segredo para tokens JWT | *(obrigatório em produção)* |
| `DATABASE_PATH` | Caminho do `database.json` | `../data/database.json` |

## Execução em desenvolvimento

```bash
# Na raiz – inicia backend e frontend juntos
npm run dev
```

Ou separadamente:

```bash
cd backend && npm run dev   # http://localhost:3001
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

Base: `http://localhost:3001/api`

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

### Deploy no Windows / IIS + Docker

Para servidor com IIS na porta 80 e Docker (sem conflito com outros projetos):

```powershell
copy .env.example .env
# Edite: JWT_SECRET, APP_PORT (ex: 8080), IIS_SITE_PATH (ex: C:\inetpub\babylist)
npm run deploy
```

O script de deploy:
1. Gera `deploy/iis/site/web.config` com reverse proxy para `127.0.0.1:APP_PORT`
2. Copia o `web.config` para `IIS_SITE_PATH`
3. Faz build e sobe os containers Docker

**Pré-requisitos IIS:** URL Rewrite + ARR com proxy habilitado.

Documentação completa: [deploy/README.md](deploy/README.md)

### Deploy manual (sem IIS)

```bash
npm run build
```

- Backend compilado em `backend/dist/`
- Frontend compilado em `frontend/dist/`

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

## Arquitetura

O backend segue o padrão **Controller → Service → Repository**, preparado para futura migração para PostgreSQL sem alterar as regras de negócio.
