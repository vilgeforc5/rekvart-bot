# Recvart Monorepo
<img width="1595" height="957" alt="image" src="https://github.com/user-attachments/assets/9f479a7e-902e-4571-a05a-acbfe2d28eec" />
<img width="532" height="743" alt="image" src="https://github.com/user-attachments/assets/984eb1b7-4d61-4565-8391-71bb9198518a" />

A monorepo containing the backend and frontend applications for Recvart.

## Tech Stack

- **Package Manager**: pnpm 10.17.1
- **Backend**: NestJS (TypeScript)
- **Frontend**: React + Vite (TypeScript)
- **Database**: PostgreSQL 18
- **Telegram Bot**: nestjs-telegraf

## Prerequisites

- Node.js
- pnpm 10.17.1
- Docker and Docker Compose

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

Copy the example environment file and configure your database settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=recvart
POSTGRES_PORT=5432
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 2.1. Telegram Bot Setup

To set up the Telegram bot:

1. Create a new bot by messaging [@BotFather](https://t.me/botfather) on Telegram
2. Use the `/newbot` command and follow the instructions
3. Copy the bot token provided by BotFather
4. Add the token to your `.env` file as `TELEGRAM_BOT_TOKEN`

The bot will respond to `/ping` with `pong` when the backend is running.

Start the PostgreSQL database:

```bash
./start-docker.sh
```

This will start a PostgreSQL 18 container in detached mode using the configuration from your `.env` file.

### 3. Start Development Servers

**Backend** (NestJS):

```bash
cd apps/backend
pnpm start:dev
```

**Frontend** (React + Vite):

```bash
cd apps/frontend
pnpm dev
```

## Project Structure

```
recvart-monorepo/
├── apps/
│   ├── backend/          # NestJS backend application
│   └── frontend/         # React frontend application
├── docker-compose.dev.yml # Docker Compose configuration for development
├── start-docker.sh       # Script to start PostgreSQL container
├── .env.example          # Example environment variables
└── pnpm-workspace.yaml   # pnpm workspace configuration
```

## Available Scripts

### Root Level

- `pnpm typecheck` - Type check all apps
- `pnpm test` - Run tests (placeholder)

### Backend (`apps/backend`)

- `pnpm start:dev` - Start development server with watch mode
- `pnpm build` - Build for production
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm lint` - Lint and fix code

### Frontend (`apps/frontend`)

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm typecheck` - Type check without emitting files
- `pnpm lint` - Lint code

## Docker

The project includes a development Docker Compose setup for PostgreSQL 18.

**Start database:**

```bash
./start-docker.sh
```

**Stop database:**

```bash
docker-compose -f docker-compose.dev.yml down
```

**Stop and remove volumes:**

```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DB` - PostgreSQL database name
- `POSTGRES_PORT` - PostgreSQL port (default: 5432)
- `TELEGRAM_BOT_TOKEN` - Telegram bot token from BotFather

## License

ISC
