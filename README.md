# Node Microservice Template

A reusable production-oriented Node.js + TypeScript microservice template for the Hilitech platform.

This template follows the conventions used by the Hilitech API Gateway and Auth Service:

- Node.js 22+
- TypeScript with ESM
- Express 5
- Zod environment validation
- Helmet and CORS
- Pino structured logging
- PostgreSQL with Prisma
- Layered `configurations`, `database`, `middlewares`, `modules`, and `services` structure
- Health endpoint
- Graceful shutdown
- Docker support
- Environment-based configuration
- Clear separation between infrastructure and business modules

> **Template rule:** Rename the service, database, module names, and environment variables before using this repository for a real service. Do not copy credentials or service-specific business logic into the template.

## Architecture

```text
src/
├── app.ts
├── server.ts
├── configurations/
│   └── env.ts
├── database/
│   └── prisma.ts
├── middlewares/
│   ├── error-handler.ts
│   ├── not-found.ts
│   └── request-id.ts
├── modules/
│   └── example/
│       ├── example.controller.ts
│       ├── example.routes.ts
│       └── example.service.ts
└── services/
    └── health.service.ts

prisma/
└── schema.prisma
```

### Responsibilities

| Layer | Responsibility |
| --- | --- |
| `configurations` | Environment variables and application configuration |
| `database` | Shared Prisma client/database access |
| `middlewares` | Cross-cutting HTTP concerns |
| `modules` | Business/domain features |
| `services` | Shared infrastructure or external-service integrations |
| `app.ts` | Express application composition |
| `server.ts` | Process startup and graceful shutdown |
| `prisma` | Database schema and migrations |

Business logic should live inside modules. Avoid putting feature logic directly in `app.ts` or `server.ts`.

## Technology

- Node.js 22+
- TypeScript 5.9+
- Express 5
- Prisma 7
- PostgreSQL
- Zod
- Helmet
- CORS
- Pino
- Pino HTTP
- Vitest
- Supertest
- Docker

## Getting started

### 1. Create a service from this template

Use GitHub's **Use this template** feature, or clone this repository and rename it.

Example:

```bash
git clone https://github.com/jdevc20/node-microservice-template.git my-service
cd my-service
```

Then update:

- `package.json` name and description
- `README.md`
- `.env.example`
- Prisma database name/schema
- service display name
- example module
- Docker image/service name

### 2. Install dependencies

```bash
npm install
```

For reproducible CI/deployment installs, generate and commit `package-lock.json` after the first dependency install. Then use `npm ci` in CI. The template Dockerfile uses `npm install` initially because this repository does not commit a generated lockfile.

### 3. Configure environment

Copy the example environment:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

At minimum configure:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/my_service
CORS_ORIGINS=http://localhost:3000
```

The application validates required environment variables during startup.

### 4. Prepare PostgreSQL

Generate Prisma Client:

```bash
npm run prisma:generate
```

Create/apply a development migration:

```bash
npm run prisma:migrate
```

For a deployed environment:

```bash
npx prisma migrate deploy
```

### 5. Run locally

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Node Microservice is running.",
  "service": "node-microservice",
  "environment": "development"
}
```

## API conventions

Successful responses use:

```json
{
  "success": true,
  "message": "Request successful.",
  "data": {}
}
```

Errors use:

```json
{
  "success": false,
  "message": "Request failed.",
  "code": "ERROR_CODE"
}
```

The example endpoint is:

```http
GET /api/example
```

Replace this example module with the first real domain feature.

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `3000` | HTTP port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `CORS_ORIGINS` | No | localhost | Comma-separated allowed origins |
| `LOG_LEVEL` | No | `info` | Pino log level |
| `SERVICE_NAME` | No | `node-microservice` | Service name used in logs/responses |

Never commit `.env`.

## Database

Prisma is included because Hilitech backend services commonly use PostgreSQL.

Commands:

| Command | Description |
| --- | --- |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create/apply development migration |
| `npm run prisma:deploy` | Apply committed migrations |
| `npm run prisma:studio` | Open Prisma Studio |

Do not edit generated Prisma Client files manually.

## Docker

Build:

```bash
docker build -t node-microservice .
```

Run:

```bash
docker run --rm -p 3000:3000 --env-file .env node-microservice
```

The container expects PostgreSQL to be reachable through `DATABASE_URL`. Database migrations are intentionally not executed automatically by the image.

For production, run migrations as a deployment step before starting the service.

## Graceful shutdown

The server handles `SIGTERM` and `SIGINT`, closes the HTTP server, disconnects Prisma, and exits cleanly.

This is important for Docker, Render, Kubernetes, and other managed runtimes where instances can be terminated during deployments or scaling.

## Adding a new module

Create a module under:

```text
src/modules/<feature>/
```

Recommended structure:

```text
<feature>/
├── <feature>.controller.ts
├── <feature>.routes.ts
├── <feature>.service.ts
├── <feature>.schema.ts
└── <feature>.types.ts
```

Use the following flow:

```text
HTTP request
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Prisma / external service
   ↓
Response
```

Controllers should handle HTTP concerns. Services should contain business rules. Database and external integrations should remain isolated from HTTP transport.

## Service-to-service communication

For calls to another Hilitech service:

1. Add the service URL to `.env.example`.
2. Put reusable HTTP integration code under `src/services/`.
3. Use timeouts.
4. Validate external responses.
5. Do not hard-code URLs.
6. Never expose internal service credentials to clients.
7. Prefer the API Gateway for client-facing traffic when the platform architecture requires it.

Example:

```env
AUTH_SERVICE_URL=http://localhost:3001
ACCOUNT_SERVICE_URL=http://localhost:3002
```

## Authentication

This template deliberately does **not** implement authentication.

When a service requires authentication, integrate with the Hilitech Auth Service rather than duplicating login, password, refresh-token, or identity-management logic.

A service that validates JWTs should configure the same issuer/audience contract used by the platform and keep its JWT secret/configuration outside source control.

## Logging

Pino is used for structured logs.

Example:

```ts
logger.info({ userId, operation: "example" }, "Example operation completed");
```

Do not log:

- passwords
- access tokens
- refresh tokens
- authorization headers
- cookies
- database credentials
- other secrets

## Testing

Run tests:

```bash
npm test
```

Run tests once in CI:

```bash
npm run test:run
```

Type-check:

```bash
npm run check
```

Build:

```bash
npm run build
```

Recommended test layers:

- unit tests for business services
- controller/API tests with Supertest
- database integration tests where required
- health/readiness tests
- service-to-service contract tests for important integrations

## Production checklist

Before deploying a service created from this template:

- [ ] Rename the package/service.
- [ ] Replace all example environment variables.
- [ ] Configure a production PostgreSQL database.
- [ ] Commit Prisma migrations.
- [ ] Run `prisma migrate deploy` during deployment.
- [ ] Configure CORS explicitly.
- [ ] Configure production logging.
- [ ] Add authentication/authorization if required.
- [ ] Add automated tests.
- [ ] Add request validation for every public endpoint.
- [ ] Add service-to-service timeouts and error handling.
- [ ] Add readiness/dependency checks if required.
- [ ] Configure health checks in the hosting platform.
- [ ] Do not commit `.env`, secrets, database dumps, or generated build artifacts.
- [ ] Generate and commit `package-lock.json`.
- [ ] Verify the service can start from a clean checkout using `npm ci`.

## Deployment

The template is suitable for managed Node.js hosts such as Render and for Docker-based deployments.

Typical deployment flow:

```text
Git push
   ↓
CI / platform build
   ↓
npm ci
   ↓
npm run build
   ↓
Database migration
   ↓
node dist/server.js
   ↓
/health check
```

For Render, configure:

- Build command: `npm ci && npm run build`
- Start command: `npm run prisma:deploy && npm start`
- Health check path: `/health`

Use a managed PostgreSQL instance and provide its connection string through the platform's environment configuration.

## Relationship to Hilitech services

This template is intentionally generic but follows the same backend conventions currently used by:

- Hilitech API Gateway
- Hilitech Auth Service

The goal is that a new Hilitech backend service should look familiar to someone maintaining the existing platform.

The template is **not** intended to contain:

- gateway proxy rules
- authentication flows
- user registration
- password handling
- JWT issuing
- refresh-token storage
- application-specific database models
- project-specific business logic

## License

ISC
