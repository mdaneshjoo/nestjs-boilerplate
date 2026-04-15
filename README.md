# Backend (NestJS 11 Boilerplate)

Opinionated NestJS 11 + TypeORM 0.3 + PostgreSQL boilerplate with JWT auth, Pino logging, Sentry, Zod-validated config, a unified notification module (email/SMS/push/in-app), and a pre-push security checklist.

See [`CLAUDE.md`](./CLAUDE.md) for the full set of project rules Claude Code follows when editing this codebase.

---

## Tech Stack

- **Runtime**: Node.js 22.x, TypeScript 5.x
- **Framework**: NestJS 11.x
- **DB**: PostgreSQL 17 + TypeORM 0.3
- **Auth**: JWT (`@nestjs/jwt` + `@nestjs/passport`)
- **Validation**: `class-validator` for DTOs, **Zod** for env/config
- **Logging**: `nestjs-pino` with daily-rotating files
- **Error tracking**: Sentry (optional, disabled when `SENTRY_DSN` is empty)
- **Mail**: `@nestjs-modules/mailer` (SMTP via nodemailer)
- **CLI**: `nest-commander`
- **Lint / SAST**: ESLint 9 flat config + `eslint-plugin-security`

---

## Requirements

- Node.js **22.x**
- npm **10+**
- PostgreSQL **17** running locally or in Docker (this project does **not** ship Postgres — use your own container or install)
- (Optional) Docker — used by the pre-push hook to run `gitleaks`

---

## Setup

```bash
git clone <repo>
cd backend
npm install
cp .env.example .env
# edit .env with your own DB credentials, SECRET, SMTP settings, etc.
```

### Create the database

PostgreSQL does not auto-create databases. After setting `DB_*` env vars:

```bash
npm run db:create
```

This connects to the Postgres server's maintenance `postgres` database and creates `DB_NAME` if it doesn't exist. Idempotent.

### Run the app

```bash
# Dev server with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production build + run
npm run build
npm run start:prod
```

The server listens on `PORT` (default `3100`). Swagger docs served at `http://localhost:3100/docs`.

---

## CLI commands

Bootstrapping scripts run through `nest-commander`:

```bash
npm run db:create              # create the Postgres database
npm run create:permissions     # seed all permissions
npm run create:default-role    # create the default "user" role
npm run create:superuser       # interactive prompt to create an admin
```

To add your own command:

1. Create `src/commands/<name>.command.ts` extending `CommandRunner` with `@Command({ name: 'x:y' })`.
2. Register the class as a provider in `src/commands/privileges.module.ts`.
3. Optionally expose it as an npm script that calls `npm run console -- x:y`.

---

## Docker

```bash
docker build -t backend .
docker run --env-file .env -p 3100:3100 backend
```

The `Dockerfile` is multi-stage (deps → build → prod-deps → runtime), runs as a non-root user, and ships only `dist/` + production `node_modules`.

---

## Environment variables

All env vars are validated at boot by Zod schemas (`src/config/*/config.schema.ts`). If anything is missing or malformed, the process fails fast with a readable report:

```
Error: Invalid environment configuration:
  • PORT: Expected number, received nan
  • MODE: Required
```

See [`.env.example`](./.env.example) for the canonical list. Summary:

| Var | Required | Description |
|---|---|---|
| `PORT` | ✅ | HTTP port |
| `MODE` | ✅ | `DEV` or `PROD` |
| `APP_NAME` | ✅ | Human name used in emails/Swagger |
| `CLIENT_URL` | ✅ | Frontend base URL (used in email links) |
| `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USERNAME`/`DB_PASSWORD` | ✅ | Postgres connection |
| `SYNC` | ✅ | `true` to let TypeORM sync entities (dev only) |
| `SECRET` | ✅ | JWT signing secret |
| `EXPIRE` | ✅ | JWT TTL — e.g. `60s`, `15m`, `1h`, `1d`, `1y` |
| `MAIL_HOST`/`MAIL_PORT`/`MAIL_USERNAME`/`MAIL_PASSWORD`/`MAIL_FROM` | ✅ | SMTP transport |
| `SENTRY_DSN` | optional | empty string disables Sentry |

---

## Tests

```bash
npm test              # unit tests
npm run test:watch
npm run test:cov
npm run test:e2e
```

---

## Lint & format

```bash
npm run lint          # ESLint (flat config, with eslint-plugin-security)
npm run format        # Prettier
```

---

## Pre-push security checklist

Husky runs `scripts/security-check.sh` before every push. It enforces:

1. No `.env*` files committed (except `.env.example`)
2. No sensitive files (`*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.pfx`, `*.keystore`, `.npmrc` with auth tokens)
3. Secret regex scan on pushed commits (AWS / GitHub / Slack / JWT / Stripe / SendGrid / GCP / Sentry DSN)
4. `gitleaks` deeper scan — uses local binary if installed, else Docker fallback (`zricethezav/gitleaks`)
5. Unsafe code patterns (e.g. `eval`, dynamic `Function`, unsafe subprocess invocations, insecure HTML sinks)
6. `helmet()` applied in `main.ts`
7. `npm audit --audit-level=high --omit=dev`
8. License compliance — blocks GPL/AGPL/SSPL/BUSL in prod deps
9. `eslint-plugin-security` SAST + general lint (`--max-warnings=0`)
10. `tsc --noEmit`
11. `nest build`

Run ad-hoc:

```bash
npm run security-check
```

---

## Project layout

```
src/
├── main.ts                       # HTTP server entry
├── instrument.ts                 # Sentry init (loaded first)
├── console.ts                    # nest-commander entry (most commands)
├── db-console.ts                 # lightweight entry for db:create
├── cli.module.ts                 # CLI root module
├── app.module.ts                 # HTTP root module
├── app/                          # feature modules
│   ├── auth/
│   ├── user/
│   ├── roles/
│   └── profile/
├── commands/                     # nest-commander commands
├── config/                       # Zod-validated config
│   ├── app/        ├── auth/
│   ├── database/   ├── mailman/
│   └── validate-env.ts
└── shared/
    ├── decorator/
    ├── dto/
    ├── entities/                 # common/base entity
    ├── interfaces/
    └── module/
        ├── error/                # global exception filter
        ├── logger/               # HttpLogger / WsLogger (pino)
        ├── mail/                 # MailerModule SMTP wiring
        └── notification/         # unified NotificationService
            ├── channels/
            ├── interfaces/
            └── notification.enum.ts
```

---

## Notifications

Send through a single service that fans out to registered channels:

```typescript
import { NotificationChannel } from 'src/shared/module/notification/notification.enum';
import { NotificationService } from 'src/shared/module/notification/notification.service';

await this.notifications.send({
  channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
  recipient: { email, deviceTokens, userId },
  payload: { subject, body, html },
});
```

Only `EmailChannel` is wired up for real (via SMTP). SMS / Push / InApp are stubs — replace the `TODO`s in `src/shared/module/notification/channels/` with your providers (Twilio, FCM, DB + WebSocket, etc.).

---

## License

UNLICENSED — private project.
