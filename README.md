# mail-right

Simple web interface to check and adapt mail content with AI check.

A small Node.js/TypeScript app built with **Fastify** and **Zod**. A single static page
sends the mail to `GET /api/check`, which rewrites it through an LLM (via OpenRouter)
using the prompt in [src/services/prompt.md](src/services/prompt.md).

## Architecture

```
src/
├── config/        Environment loading & validation (Zod)
├── schemas/       Zod request/response schemas for /api/check
├── services/      Check logic + OpenRouter agent and prompt
├── routes/        Fastify route registration
├── middleware/    Centralized error handler
├── app.ts         Fastify application factory (`buildApp`)
└── server.ts      Bootstrap: listen + graceful shutdown

public/            Static UI (`index.html`)
test/              Mocha integration tests (Chai, Supertest)
```

## Requirements

- Node.js 20+
- npm
- An OpenRouter API key

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set OPENROUTER_API_KEY

npm run dev    # starts the app on http://localhost:3000
```

Then open `http://localhost:3000` in a browser.

## Environment variables (`.env`)

See [.env.example](.env.example):

| Variable             | Description                                        |
|----------------------|----------------------------------------------------|
| `PORT`               | HTTP port (default `3000`)                         |
| `OPENROUTER_API_KEY` | OpenRouter API key used for the mail check         |
| `MODEL`              | OpenRouter model id (default `openai/gpt-5.6-luna`) |

## npm scripts

| Script          | Purpose                                      |
|-----------------|----------------------------------------------|
| `npm run dev`   | Start the app in watch mode (loads `.env`)   |
| `npm run build` | Type-check and compile TypeScript to `dist/` |
| `npm start`     | Run the compiled server (loads `.env`)       |
| `npm test`      | Run the Mocha suite (no LLM calls)           |
| `npm run lint`  | Type-check without emitting                  |

## API

### Check a mail

```bash
curl -G http://localhost:3000/api/check \
  --data-urlencode "mail_input=Hello there" \
  --data-urlencode "style=formal"
```

```json
{ "message": "…the improved mail…" }
```

Missing parameters return `400` with a `VALIDATION_ERROR` body.

## Testing

```bash
npm test
```

In the test environment (`NODE_ENV=test`) the check returns a static message, so no
LLM call is made.
