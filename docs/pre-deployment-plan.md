# Pre-deployment plan

Front-end and back-end changes needed before the first deployment of Spaces management. The deployment itself (host, HTTPS, packaging, access protection, smoke test) is in `deployment-plan.md`.

Each step starts with tests where code changes, ends with all tests passing, and is committed on its own.

## Starting point

- **Back end:** `application.properties` holds the local database connection (`root`, empty password), `spring.jpa.show-sql=true` and the role `ADMIN`, for every run: a production start would use them too.
- **Front end:** `.env.production` points to `localhost`.

## Steps

| Step | Content | Status |
| --- | --- | --- |
| 1. Development profile | `application.properties` keeps only the settings shared by every environment, with no database connection, no SQL logging and the guest role (empty). `application-dev.properties` holds the local database, `show-sql` and the role `ADMIN`. `dev` is the default profile (`spring.profiles.default`), so `mvnw spring-boot:run`, the tests and the IDE work as before; a production start sets another profile and gets nothing from `dev`. Tests: the content of both files | Done |
| 2. Database connection from the environment | In production, the connection comes from environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`), read by Spring Boot without code. Without them, startup fails. Checked by starting the packaged application with these variables | Done |
| 3. Role and CORS set at deployment | `app.placeholder-user-role` and `app.cors.allowed-origins` can be changed without rebuilding (`APP_PLACEHOLDERUSERROLE`, `APP_CORS_ALLOWEDORIGINS` in the environment). Tests: an overridden origin is accepted and the old one refused; an overridden role is the one `/api/me` answers. Also checked by starting the packaged application with these variables | Done |
| 4. Production addresses | `VITE_APP_SERVICE_URL` and `VITE_AUTH_SERVICE_URL` in `frontend/app/.env.production` set to the deployed addresses. Test 136 checks the mode only; add the addresses once known | Waiting for the host (`deployment-plan.md`) |
| 5. Documentation | Back-end README (profiles, environment variables), test lists, `CLAUDE.md` if the commands change, `to-do.md` (credentials, SQL logging) | Done |

## Decisions

- **Default profile `dev`:** chosen so that every local way of running the back end (Maven, IDE, tests) keeps working without options. The cost: a production start that forgets to set its profile runs with the `dev` settings. The deployment sets `SPRING_PROFILES_ACTIVE=prod` and its smoke test checks it.
- **Role in production:** guest (empty) unless the deployment sets `ADMIN`, which it only does behind the access protection of `deployment-plan.md`.

## References

Project documents to read with this plan (paths from the repository root):

| Document | Content |
| --- | --- |
| `CLAUDE.md` | Architecture, commands, conventions (TDD, test lists, plans, git) |
| `docs/deployment-plan.md` | The deployment that follows this plan |
| `docs/Cahier des charges.md` | Requirements (French) |
| `docs/Plan d'implementation.md` | Architecture, planning, class diagram, planned deployment (French) |
| `docs/backend-connection-plan.md` | Connecting the React app to the app-service (done) |
| `docs/backend-spaces-plan.md` | Back-end work on spaces (done) |
| `docs/to-do.md` | Open items: credentials, SQL logging, deployment (local file, not tracked by git) |
| `docs/test-lists/gestion-coworking-back-end-tests.md` | Back-end tests: behaviours (with `…-back-end-test-functions.md` for the test names) |
| `docs/test-lists/gestion-coworking-front-end-tests.md` | Front-end tests: behaviours (with `…-front-end-test-functions.md` for the test names) |
| `backend/app-service/README.md` | Back end: commands, configuration, endpoints, tests |
| `frontend/app/README.md` | Front end: mock and real modes, `.env` files |
| `backend/app-service/src/main/resources/application.properties` | Back-end settings |
