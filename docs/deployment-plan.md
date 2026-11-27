# Deployment plan

Not drafted yet: the items below are collected for the plan, which will turn them into steps and decisions.

Goal: deploy the full stack (front end, app-service, database) for Spaces management, to check it works before the auth-service and Bookings management are added.

## Items to plan

- **Access protection:** until the auth-service exists, every request runs as the fixed user. With `ADMIN`, anyone with the URL can create and delete spaces; with an empty role, the site is read-only and admin Espaces is unreachable. Option: keep `ADMIN` and protect the whole site with HTTP basic auth at the web server (or an IP allow-list), removed when the auth-service arrives.
- **Host:** Azure or AWS (`docs/Plan d'implementation.md`).
- **HTTPS on both sides:** a front end served over `https` cannot call a back end over `http` (the browser blocks mixed content).
- **CORS:** the deployed `https` front-end address in `APP_CORS_ALLOWEDORIGINS` (`pre-deployment-plan.md`, step 3).
- **Packaging:** container for the app-service, container or static hosting for the front end, MariaDB managed by the host or in a container; `.gitattributes` for shell scripts when Docker is added (`docs/to-do.md`).
- **Database:** Flyway creates the tables on first start. The demo spaces script is for development only: on the deployed site the admin creates the spaces.
- **Front-end hosting:** the server answers `index.html` for every path that is not a file (SPA fallback), or refreshing `/horaires` gives a 404; keep crawlers out (`robots.txt` or `X-Robots-Tag`, `docs/to-do.md`).
- **Smoke test after each deployment:** the front page loads; `GET /api/spaces` answers 200; a CORS preflight from the deployed origin is accepted; as admin, a space is created then deleted; the back-end log says the profile `prod` is active (not `dev`, see `pre-deployment-plan.md`).
- **Continuous integration (optional):** run both test suites on each push (GitHub Actions, with a MariaDB service for the back-end tests).
- **Later:** browser end-to-end tests (Playwright) once bookings and sign-in exist.
- **Not blocking:** Mockito self-attach warning; early error for a missing `VITE_API_MODE` (both in `docs/to-do.md`).

## References

Project documents to read with this plan (paths from the repository root):

| Document | Content |
| --- | --- |
| `CLAUDE.md` | Architecture, commands, conventions (TDD, test lists, plans, git) |
| `docs/Cahier des charges.md` | Requirements (French) |
| `docs/Plan d'implementation.md` | Architecture, planning, class diagram, planned deployment (French) |
| `docs/pages accueil.md` | UI mockups (French) |
| `docs/pre-deployment-plan.md` | Front-end and back-end changes done before this deployment (profiles, environment variables, production addresses) |
| `docs/backend-connection-plan.md` | Connecting the React app to the app-service (done) |
| `docs/backend-spaces-plan.md` | Back-end work on spaces (done) |
| `docs/react_porting-plan.md` | Port of the HTML prototype to React (done) |
| `docs/to-do.md` | Open items, including deployment, credentials, SQL logging (local file, not tracked by git) |
| `docs/test-lists/gestion-coworking-back-end-tests.md` | Back-end tests: behaviours (with `…-back-end-test-functions.md` for the test names) |
| `docs/test-lists/gestion-coworking-front-end-tests.md` | Front-end tests: behaviours (with `…-front-end-test-functions.md` for the test names) |
| `frontend/app/README.md` | Front end: commands, mock and real modes, `.env` files, endpoints |
| `backend/app-service/README.md` | Back end: commands, configuration, demo spaces script, endpoints, schema, tests |
| `backend/app-service/src/main/resources/application.properties` | Back-end settings: database, placeholder user and role, CORS origins |
