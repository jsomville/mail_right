# mail-right

Simple web interface to check and adapt mail content with AI check.

A production-ready Node.js/TypeScript API built with **Fastify**, **Prisma**, **Zod**, and
JWT authentication (`@fastify/jwt`), following a layered architecture (routes → controllers
→ services → repositories → Prisma). Includes a minimal static login/home UI and a Mocha
test suite.

## Architecture

```
src/
├── config/        Environment loading & validation (Zod)
├── types/          Shared TypeScript types + Fastify module augmentation
├── errors/          Custom AppError hierarchy (401/404/400)
├── schemas/         Zod request/response schemas
├── repositories/     Prisma-backed data access (User, Mail)
├── services/         Business logic (auth, home, check)
├── controllers/       HTTP request/response glue
├── routes/            Fastify route registration
├── middleware/         `authenticate` preHandler + centralized error handler
├── plugins/            Fastify plugins: Prisma, JWT, CORS/Helmet
├── app.ts              Fastify application factory (`buildApp`)
└── server.ts            Bootstrap: listen + graceful shutdown

prisma/
├── schema.prisma        User & Mail models (SQLite by default)
└── seed.ts               Seeds a sample user + sample mails

public/                   Static login page (`index.html`) and home page (`home.html`)
test/                     Mocha unit + integration tests (Chai, Sinon, Supertest, JSDOM)
```

Services and repositories are constructed with explicit constructor dependencies
(no singletons/global state), which makes them easy to unit test with stubs (see
[test/unit/auth.service.spec.ts](test/unit/auth.service.spec.ts)).

## Requirements

- Node.js 20+
- npm

The project uses **SQLite** by default (via Prisma) so it runs with zero external
infrastructure. To use PostgreSQL/MySQL instead, change the `provider` in
[prisma/schema.prisma](prisma/schema.prisma) and set `DATABASE_URL` accordingly.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set a strong JWT_SECRET

npm run prisma:migrate   # creates the SQLite dev database and applies migrations
npm run prisma:seed      # seeds the sample user (safe to re-run)

npm run dev               # starts the API on http://localhost:3000
```

Then open `http://localhost:3000/index.html` in a browser and log in with the
sample credentials below.

### Default sample-user credentials

| Field    | Value                     |
|----------|---------------------------|
| Email    | `demo@mail-right.com`     |
| Password | `Password123!`            |

## Environment variables (`.env`)

See [.env.example](.env.example):

| Variable          | Description                                   |
|-------------------|------------------------------------------------|
| `PORT`            | HTTP port (default `3000`)                     |
| `DATABASE_URL`    | Prisma datasource URL                          |
| `JWT_SECRET`      | Secret used to sign/verify JWTs (never commit) |
| `JWT_EXPIRES_IN`  | Token lifetime, e.g. `1h`                      |

Secrets are never hard-coded and are never logged (request logs redact the
`Authorization` header and `password` fields).

## npm scripts

| Script                     | Purpose                                              |
|----------------------------|-------------------------------------------------------|
| `npm run dev`              | Start the API in watch mode (loads `.env`)            |
| `npm run build`            | Type-check and compile TypeScript to `dist/`          |
| `npm start`                | Run the compiled server (loads `.env`)                |
| `npm run prisma:migrate`   | Create/apply a Prisma migration (dev)                 |
| `npm run prisma:migrate:deploy` | Apply migrations in production                 |
| `npm run prisma:seed`      | Seed the sample user and sample mails                 |
| `npm test`                 | Run the Mocha suite against an isolated test database |
| `npm run lint`             | Type-check without emitting                           |

## API examples

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@mail-right.com","password":"Password123!"}'
```

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "…",
    "email": "demo@mail-right.com",
    "firstname": "Demo",
    "lastname": "User",
    "balance": 100
  }
}
```

Invalid credentials always return a generic `401 Unauthorized` and never reveal
whether the email or the password was wrong, and the `passwordHash` is never
included in any response.

### Get home data (protected)

```bash
curl http://localhost:3000/api/home \
  -H "Authorization: Bearer <token>"
```

Returns the current user and their list of mails. Missing or invalid tokens
return `401 Unauthorized`.

### Check a mail (protected)

```bash
curl -G http://localhost:3000/api/check \
  --data-urlencode "mail_input=Hello there" \
  --data-urlencode "style=formal" \
  -H "Authorization: Bearer <token>"
```

```json
{ "message": "Your mail has been reviewed. It looks good to send!" }
```

## Testing

Tests run against an isolated SQLite database configured via [.env.test](.env.test)
(`DATABASE_URL="file:./test.db"`, separate `JWT_SECRET`). `npm test` automatically
syncs the test database schema (`prisma db push`) before running Mocha.

```bash
npm test
```

Covers:
- Successful login, invalid email/password, malformed login payload
- `GET /api/home` with a valid token, missing token, and invalid token
- `GET /api/check` with valid/missing query parameters and missing token
- `AuthService` unit tests (valid credentials, unknown user, wrong password)
- Logout behavior of the sample UI (`public/js/home.js`) via JSDOM

## Security notes

- Passwords are hashed with `bcrypt` (cost factor 12 in the seed script) and are
  never returned in API responses or logged.
- JWTs are signed with `@fastify/jwt` using `JWT_SECRET`/`JWT_EXPIRES_IN` from
  the environment; the `Authorization` header and password fields are redacted
  from request logs.
- `@fastify/helmet` sets sensible security headers (including a restrictive CSP
  for the static UI) and `@fastify/cors` is configured for cross-origin requests.
- All errors (Zod validation, auth, Prisma/database, unexpected) are normalized
  by a single centralized error handler so internal details are never leaked to
  clients.
