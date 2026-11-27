# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Coworking space management web app (student integration project, EAFC Namur). Specs are in `docs/` (French): `Cahier des charges.md` (requirements), `Plan d'implementation.md` (architecture, planning, class diagram), `pages accueil.md` (UI mockups). The `.docx` originals are kept for reference; edit the `.md` files.

Architecture:
- `backend/app-service` — app-service: Spring Boot 4.1 / Java 21, bookings and spaces.
- `frontend/app` — front end: React 19 (Vite, React Router), tested with Vitest. Bookings, accounts and sign-in still run on an in-browser mock until the backend has them; see `frontend/app/README.md`.
- Auth-service (planned) — separate Spring Boot project with its own DB, issues JWTs. Until it exists, the app-service uses a fixed user id.
- Deployment (planned) — Docker, cloud host (Azure/AWS).

## Commands

Run from `backend/app-service` (Maven wrapper, no global Maven):

```powershell
.\mvnw.cmd test                                         # all tests
.\mvnw.cmd test -Dtest=GestionCoworkingApplicationTests # single test class
.\mvnw.cmd test -Dtest=ClassName#methodName             # single test method
.\mvnw.cmd spring-boot:run                              # run the app
```

Tests and the app need a running MySQL-compatible server at `localhost:3306` with database `gestion_coworking` (locally: XAMPP's MariaDB, user `root`, empty password). `contextLoads` fails with "Communications link failure" if it is not started.

Front end, from `frontend/app`:

```powershell
npm run dev        # development server on http://localhost:5173
npx vitest run     # all tests, once (npm test re-runs them on every save)
npm run lint       # oxlint; keep it clean
npm run build      # production files in dist/
```

## Database / persistence

- Schema is owned by Flyway: migrations in `src/main/resources/db/migration` (`V<n>__*.sql`). Never edit an applied migration; add a new version.
- Hibernate runs with `ddl-auto=validate`: entity mappings in `entity/` must match the schema produced by the migrations, or startup fails. Schema changes need both a migration and the matching entity change.

## Conventions

- TDD: write the failing test first. Whenever new or changed code needs a test, remind the user to write it (and where it goes) before the implementation.
- Documentation and commit messages in English. Existing French docs in `docs/` stay as they are.
- User-facing validation messages are in French (e.g. `"Champ obligatoire"`).
- Git: the user makes all commits and pushes manually. Never commit, tag, push or force push; suggest a commit message instead. Core development happens on `main`; branches only for optional features.
