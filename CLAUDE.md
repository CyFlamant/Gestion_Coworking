# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Coworking space management web app (student integration project, EAFC Namur). Specs are in `docs/` (French): `Cahier des charges.md` (requirements), `Plan d'implementation.md` (architecture, planning, class diagram), `pages accueil.md` (UI mockups). The `.docx` originals are kept for reference; edit the `.md` files.

Planned architecture (only the backend app-service exists so far):
- `backend/gestion-coworking-backend` — app-service: Spring Boot 4.1 / Java 21, bookings and spaces.
- Auth-service (planned) — separate Spring Boot project with its own DB, issues JWTs. Until it exists, the app-service uses a fixed user id.
- Front end (planned) — React.
- Deployment (planned) — Docker, cloud host (Azure/AWS).

## Commands

Run from `backend/gestion-coworking-backend` (Maven wrapper, no global Maven):

```powershell
.\mvnw.cmd test                                         # all tests
.\mvnw.cmd test -Dtest=GestionCoworkingApplicationTests # single test class
.\mvnw.cmd test -Dtest=ClassName#methodName             # single test method
.\mvnw.cmd spring-boot:run                              # run the app
```

Tests and the app need a running MySQL-compatible server at `localhost:3306` with database `gestion_coworking` (locally: XAMPP's MariaDB, user `root`, empty password). `contextLoads` fails with "Communications link failure" if it is not started.

## Database / persistence

- Schema is owned by Flyway: migrations in `src/main/resources/db/migration` (`V<n>__*.sql`). Never edit an applied migration; add a new version.
- Hibernate runs with `ddl-auto=validate`: entity mappings in `entity/` must match the schema produced by the migrations, or startup fails. Schema changes need both a migration and the matching entity change.

## Conventions

- TDD: write the failing test first.
- Documentation and commit messages in English. Existing French docs in `docs/` stay as they are.
- User-facing validation messages are in French (e.g. `"Champ obligatoire"`).
- Never tag, push or force push; releases go through the separate release repository.
