# Backend Claude Rules (Gold Backend)

Scope: this applies only to the `backend/` subtree of the Gold project.

---

## Clean Code & SOLID (MUST FOLLOW)

- **No magic numbers/strings** — extract to named constants, enums, or config.
- **No hardcoded values** — URLs, sizes, timeouts, messages must come from constants or env vars.
- **SRP** — each function/module does ONE thing. If you need "and" to describe it, split it.
- **OCP** — extend via composition or patterns — not by modifying existing working code.
- **DRY** — no copy-paste code. Three similar blocks = refactor.
- **Small functions** — max ~30 lines per function, max ~200 lines per file.
- **Meaningful names** — describe intent (`isUserSubscribed`), no abbreviations (`usr`, `cfg`).
- **Minimal nesting** — max 3 levels deep. Use early returns, guard clauses.
- **No dead code** — remove unused imports/vars/functions. No commented-out blocks.
- **Backward compatible** — avoid breaking changes when practical.
- **Stable pagination** — every `ORDER BY` used with `LIMIT`/`OFFSET` MUST include a deterministic tiebreaker column (e.g., `id`) as the final sort key.

## Conventions

- **Conventional commits**: `type(scope): description` — types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **TS**: kebab-case files, PascalCase types, camelCase vars, ESLint+Prettier, no `any`
- **Git flow**: `feature/xxx` → develop → qa → master/main
- **Branches**: `feature/`, `fix/`, `imp/`, `chore/`, `hotfix/`, `docs/`
- **Protected**: develop, qa, master/main — never force push

## Do NOT (Anti-Patterns)

- Do NOT start work without clear scope.
- Do NOT commit `.env`, credentials, or secrets.
- Do NOT use `git add .` or `git add -A` — add specific files.
- Do NOT skip pre-commit hooks (`--no-verify`).
- Do NOT force push to protected branches.
- Do NOT create files unless necessary.

### Backend-specific

- Do NOT use human-readable constraint names — use hash-based (`PK_{hash}`, `FK_{hash}`).
- Do NOT write raw SQL — use TypeORM QueryBuilder.
- Do NOT skip DTO validation (class-validator on DTOs; Zod on config).
- Do NOT modify past DB migrations if possible.
- Do NOT use `@deprecated` methods — check JSDoc and use the replacement.

## Git Branch & Worktree Workflow (MUST FOLLOW)

Before making ANY code changes:

1. **Ask for Jira ticket** — if not provided, ask for it (branch naming + PR).
2. **Ask for base branch** — prompt from protected branches (`develop`, `qa`, `master`/`main`). Never assume.
3. **Ask worktree or branch** — "Create a worktree (isolated copy) or branch on the main worktree?"
   - Worktree: `git-worktree-manager -b <base-branch> <new-branch>` inside project dir.
   - Branch: `git checkout -b <branch> <base-branch>` in the main worktree.
4. **Only after branch/worktree is created** — start code changes.

Tool: `git-worktree-manager` (https://github.com/mdaneshjoo/git-work-tree-manager). Always use `-b` flag; always `cd` into the project dir.

## Workflow

For non-trivial tasks: **Plan → Implement → Test → Review**. Skip planning only for trivial tasks (1 file, ≤10 lines, no API/DB/UI impact).

---

# Backend (NestJS) Rules

You are a Senior Backend Developer and an Expert in NestJS, TypeScript, Node.js, PostgreSQL, TypeORM, and modern backend architecture patterns. Produce optimized, secure, and maintainable NestJS code following clean architecture principles.

## Tech Stack

- Node.js 22.x, NestJS 11.x, TypeScript 5.x
- PostgreSQL + TypeORM 0.3
- class-validator + class-transformer for DTO validation
- Zod for config/env validation
- JWT authentication (Passport)
- Sentry for monitoring
- Pino for logging (via `nestjs-pino`)
- nest-commander for CLI commands
- `@nestjs-modules/mailer` for email

## Naming Conventions

- Files & folders: kebab-case
- Controllers: `[feature].controller.ts` | Services: `[feature].service.ts` | Modules: `[feature].module.ts`
- Entities: `[entity-name].entity.ts` | DTOs: `[action-name].dto.ts` | Repos: `[entity-name].repository.ts`
- Tests: `[file-name].spec.ts` | Decorators: `[decorator-name].decorator.ts`
- Classes: PascalCase | Enums: PascalCase name, UPPER_SNAKE_CASE values | Constants: UPPER_SNAKE_CASE
- Variables/functions: camelCase | DB tables: snake_case | DB columns: camelCase (TypeORM default)

## Architecture Patterns

- Each feature has its own module. Use `forwardRef()` for circular deps.
- Import only necessary modules; export services used by other modules.
- Use global modules sparingly (logger, config).
- Add `@ApiProperty()`/`@ApiPropertyOptional()` for Swagger on DTOs.
- Use `timestamptz` for date columns.
- Keep complex queries in repository classes using QueryBuilder.
- Keep business logic in services; throw NestJS HTTP exceptions with meaningful messages and error codes.
- Feature modules follow the existing layout under `src/app/<feature>/` (controllers, services, repositories, dto, entities, interfaces).

## DTOs & Validation

- Separate DTO class per endpoint.
- Validate DTOs with **class-validator** + **class-transformer** decorators.
- Add Swagger decorators to all DTOs.
- Validate dates with timezone awareness.
- Validate **environment/config** with **Zod** schemas passed to `ConfigModule.forRoot({ validate })`.

## Authentication & Authorization

- JWT via `@nestjs/jwt` + `@nestjs/passport`.
- Use `@Public()` decorator to mark routes that skip `JwtAuthGuard`.
- Use `@RequirePermissions(...)` for permission-based access with `PermissionsGuard`.

## Database & Migrations

- Migrations for ALL schema changes. Soft deletes via `@DeleteDateColumn`. Proper indexing.
- Small, focused, reversible migrations.
- Never modify already-run migrations — create new ones.
- TypeORM hash-based constraint names (default behavior).

## Entity Column Patterns

```typescript
@Column({ type: 'enum', enum: MY_STATUS }) status: MY_STATUS;
@Column({ type: 'jsonb', nullable: true }) metadata?: Record<string, unknown>;

@ManyToOne(() => User, (user) => user.features, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'userId' })
user: User;
```

## Pagination

**Stable Sort Rule:** every paginated query MUST include a deterministic tiebreaker as the final `ORDER BY` (e.g., `.addOrderBy(\`${alias}.id\`, 'ASC')`).

**Pagination E2E Test Rule:** every e2e test for a paginated endpoint MUST include a stability test — fetch all pages with small `size`, assert:
1. no duplicates across pages
2. no missing items — `uniqueIds.size === pagination.totalItems`

## Configuration Access

Always use typed `AppConfigService` getters. Never use `process.env` directly in feature code. Config values are validated once at bootstrap via Zod.

```typescript
constructor(private readonly appConfig: AppConfigService) {}
this.appConfig.PORT;
this.appConfig.MODE; // DEV | PROD
```

## Logging

- Inject `PinoLogger` (from `nestjs-pino`) or use project wrappers (`HttpLoggerService`, `WsLoggerService`).
- Never use `console.log` in production paths.
- Redact sensitive fields (passwords, auth headers) in log output.

## Error Handling

- Throw `HttpException` subclasses with clear message + error code.
- Log errors with context.
- Global exception filter emits consistent error responses.

## Sentry

- Instrumentation file (`instrument.ts`) is imported at the very top of `main.ts` (before any other module).
- `@sentry/nestjs` intercepts unhandled exceptions automatically.
- Add `Sentry.captureException(err)` in catch blocks where context would be lost.

## Testing

- Jest. Mock external dependencies. Test error scenarios.
- Test files: `[file-name].spec.ts` colocated with source.
- Always run related tests when modifying code with test files.

## Code Quality

- Single quotes, semicolons, trailing commas in multiline objects.
- Avoid `any`. Strict type checking. SOLID.
- No `console.log` in production. Fix all lint warnings.
- Small, focused functions. JSDoc for non-obvious logic.

## Git Conventions

### Commit Messages

Conventional commits. Imperative mood, subject <50 chars, no capitalization, no trailing period.

**Types:** `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore`

**Scopes:** `auth`, `config`, `common`, `api`, `dto`, `entity`, `service`, `repository`, `deps`, `ci`

Format: `{type}({scope}): {brief-description}`. Append `!` for breaking changes.

### Branch Naming

| Prefix     | PR Label      | Description               |
| ---------- | ------------- | ------------------------- |
| `fix/`     | `fix`         | Bug fixes                 |
| `feature/` | `feature`     | New features              |
| `imp/`     | `improvement` | Enhancements, refactoring |

Format: `{type}/{descriptive-name}` (kebab-case).

### PR Creation

- Target: `develop`
- Title: `{type}({scope}): {brief-description}`
- Assign to self, add reviewers, add label matching branch type.

## Build Commands

```bash
npm run start:dev       # dev server, hot reload
npm run build
npm run start:prod

npm run console -- create:superuser
npm run console -- create:permissions
npm run console -- create:default-role

npm run test
npm run test:e2e
npm run test:cov

npm run lint
npm run format
```
