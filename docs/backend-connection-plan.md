# Back-end connection plan: spaces

The React application (`frontend/app`) runs on an in-browser mock. This plan connects it to the existing back end (`backend/app-service`) for what the back end already offers: the spaces (list, read, create, update, delete) and the current user (`/api/me`). Bookings, accounts and sign-in come later, with the booking endpoints and the auth-service.

As for the React port, each step starts with tests where code changes, ends with all tests passing, and is committed on its own.

## Starting point

- **What already matches:** the space fields (`name`, `type`, the four rates), numbers sent as JSON numbers, and the error format (`detail`, plus an `errors` map for invalid fields). The front end already sends real requests for spaces when the mock is switched off, and the back end already allows the React development address (CORS).
- **What is missing:** the back-end address and the mock/real mode are written in the code (`config.js`); the database has no spaces to show.
- **Limits of the current back end:** every request is made as one fixed user, whose role (admin or client) is set in `application.properties`, so there is no guest and no sign-in yet; `/api/me` has no first name; the booking endpoints do not exist, so the pages that need bookings cannot work with the real back end.

## Steps

| Step | Content | Status |
| --- | --- | --- |
| 1. Contract tests | Front-end tests of the API layer against the real answers of the app-service: a space list, a created space, invalid fields (400), access refused (403), not found (404), space with bookings (500), server unreachable | To do |
| 2. Configuration | Back-end address and mock/real mode set per environment (development, production) instead of in the code; the development panel can still switch between mock and real | To do |
| 3. Demo spaces in the database | The same seven demo spaces as the mock, loaded in the development database only, never in production | To do |
| 4. Spaces with the real back end | Check every space screen with the real back end: home page, Espaces disponibles (catalogue and prices), admin Espaces (add, edit, delete, errors), as admin and as client | To do |
| 5. Booking screens in real mode | Decide and implement what the booking screens do while the booking endpoints do not exist (see Decisions) | To do |
| 6. Back-end adjustments | "Space has bookings" answered with 409 instead of 500 (already in `to-do.md`) | To do |
| 7. Documentation | Update the front-end README, the test lists and `to-do.md` | To do |

## Decisions to make

- **Step 3, demo data:** load the demo spaces with a Flyway migration that only runs in development (separate folder, enabled by a development profile), or with an SQL script run by hand. Recommended: the development-only migration, so every developer gets the same data automatically.
- **Step 5, booking screens:** with the real back end, "Réserver", "Mes réservations" and admin "Réservations" cannot load their data. Options: keep the current error messages; hide the booking links and buttons in real mode; or show a "bientôt disponible" message on those pages. Recommended: a clear "bientôt disponible" message, so the screens stay visible for the demonstration but nobody starts a booking that cannot be saved.
- **Role for testing:** the role of the fixed user is changed in `application.properties` (`app.placeholder-user-role`), then the back end is restarted. Guest screens can only be tested with the mock until the auth-service exists.

## Out of scope (later)

- Bookings with the real back end: needs the booking endpoints (list, search for free spaces, create, update, cancel), with the opening-hours and cancellation rules already used by the front end.
- Accounts and sign-in: needs the auth-service; then `/api/me` returns the first name and the front end sends the JWT with each request.
- Deployment: see the deployment items in `to-do.md`.

## References

Project documents to read with this plan (paths from the repository root):

| Document | Content |
| --- | --- |
| `CLAUDE.md` | Architecture, commands, conventions (TDD, test lists, plans, git) |
| `docs/Cahier des charges.md` | Requirements (French) |
| `docs/Plan d'implementation.md` | Architecture, planning, class diagram (French) |
| `docs/pages accueil.md` | UI mockups (French) |
| `docs/react_porting-plan.md` | Previous plan: the port of the HTML prototype to React (done) |
| `docs/to-do.md` | Open items, including deployment and back-end rules (local file, not tracked by git) |
| `docs/test-lists/gestion-coworking-back-end-tests.md` | Back-end tests: behaviours (with `…-back-end-test-functions.md` for the test names) |
| `docs/test-lists/gestion-coworking-front-end-tests.md` | Front-end tests: behaviours (with `…-front-end-test-functions.md` for the test names) |
| `frontend/app/README.md` | Front end: commands, mock and real modes, endpoints, structure, business rules |
| `backend/app-service/src/main/resources/application.properties` | Back-end settings: database, placeholder user and role, CORS origins |
