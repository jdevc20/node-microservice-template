# Hilitech Service Conventions

This document defines conventions for services created from this template.

## Service responsibilities

Each microservice should have one clear business responsibility.

Examples:

- Auth Service — identity and authentication
- Account Service — account/profile domain
- Notification Service — notification delivery
- Dataset Service — dataset management
- Training Service — model-training orchestration

Avoid turning one service into a general-purpose application.

## Standard structure

~~~text
src/
├── app.ts
├── server.ts
├── configurations/
├── database/
├── middlewares/
├── modules/
└── services/
~~~

Keep the structure consistent across services so developers can move between repositories without relearning the project layout.

## Module structure

A feature should normally contain:

~~~text
modules/<feature>/
├── <feature>.controller.ts
├── <feature>.routes.ts
├── <feature>.service.ts
├── <feature>.schema.ts
└── <feature>.types.ts
~~~

## Controller vs service

Controllers handle HTTP concerns: parameters, request bodies, service calls, status codes, and responses.

Services contain business rules, transactions, database operations, external-service orchestration, and domain validation.

Do not place substantial business logic in route handlers.

## Validation

Use Zod for environment variables, request bodies, query parameters, route parameters, and important external API responses.

Never trust client-provided data.

## API responses

Prefer:

~~~json
{
  "success": true,
  "message": "Request successful.",
  "data": {}
}
~~~

Errors should use:

~~~json
{
  "success": false,
  "message": "Validation failed.",
  "code": "VALIDATION_ERROR"
}
~~~

Do not expose stack traces or internal database errors in production.

## Pagination

Any endpoint returning a potentially large collection should support pagination with a server-side maximum limit.

Recommended shape:

~~~json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
~~~

Avoid loading entire large tables into memory.

## Database

Use Prisma for PostgreSQL access.

Rules:

- keep migrations in source control
- use transactions for multi-step writes
- add indexes for frequently queried fields
- avoid N+1 queries
- do not expose database entities blindly
- keep credentials in environment variables

## Authentication and authorization

Normal Hilitech services should not implement a second identity system.

When authentication is required, integrate with the Hilitech Auth Service and follow the platform JWT issuer/audience contract.

Authorization should be based on the service's actual business requirements.

## Service-to-service calls

External service clients belong under src/services/.

Use environment-configured URLs, explicit timeouts, structured errors, response validation, and request/correlation IDs where possible.

Never hard-code deployment URLs.

## Logging

Use structured Pino logs.

Never log passwords, tokens, cookies, authorization headers, secrets, or complete sensitive request bodies.

## Health and readiness

Every service must expose:

~~~http
GET /health
~~~

If critical dependencies are unavailable, return HTTP 503 when the service cannot perform its core responsibility.

For larger deployments, consider separate /health and /readiness endpoints.

## Graceful shutdown

Handle SIGTERM and SIGINT. Shutdown should stop accepting new requests, allow active requests to finish, close database connections, close external connections, and exit cleanly.

## Configuration

All deployment-specific configuration belongs in environment variables.

Commit .env.example. Never commit .env.

## Docker

The standard image should use a multi-stage build, production dependencies only in the runtime image, a non-root user, and an explicit service port.

Run database migrations as an explicit deployment step rather than implicitly during image startup.

## Testing

Add tests for health, important business rules, validation failures, authorization boundaries, critical database operations, and important integrations.

Use unit tests for business logic and HTTP/integration tests for API behavior.

## Deployment

A normal deployment should follow:

~~~text
Source
  ↓
Install dependencies
  ↓
Type-check
  ↓
Test
  ↓
Build
  ↓
Database migration
  ↓
Start service
  ↓
Health check
~~~

A failed migration should prevent the application from being promoted as healthy.

## Naming

Use kebab-case repository names, camelCase variables, PascalCase TypeScript types/classes where appropriate, and clear service names.

Examples:

- hilitech-auth-service
- hilitech-account-service
- hilitech-notification-service
- hilitech-dataset-service

## What belongs in the template

The template contains infrastructure conventions and safe examples.

It must not contain real credentials, production data, customer secrets, authentication implementation, gateway-specific routing, or application-specific business logic.

Replace the example module when starting a real service.
