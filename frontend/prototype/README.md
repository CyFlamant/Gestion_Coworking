# UI prototype

Static HTML/CSS/JS prototype of the coworking web app. It covers every page for the three roles. Bookings and accounts run on mock data until the backend supports them. It will be ported to React.

## Run it

The pages use ES modules, so they need an HTTP server. Opening the files with `file://` does not work. Pick one:

- VS Code: install the **Live Server** extension, right-click `index.html` and choose "Open with Live Server".
- Node: `npx serve frontend/prototype` (from the repo root), then open the URL it prints.

## Prototype dev bar

The dark "Prototype" panel at the bottom right is not part of the app. It lets you:

- **Rôle simulé**: switch between Visiteur, Client (Marie Dubois) and Admin. In mock mode this sets the mock session.
- **Données**: choose between "Simulées (mock)", the default, and "Backend réel" (`http://localhost:8080`).
- **Réinitialiser les données**: restore the seed data. Mock data is kept in `localStorage`.

Demo accounts for the sign-in page: `marie.dubois@exemple.be` and `admin@exemple.be`, both with the password `demo1234`.

## Mock vs real backend

`js/api.js` has one function per endpoint. Each request goes through `send()`:

- In **mock** mode, `js/mock/handlers.js` answers in the browser. It reproduces the app-service's status codes and `ProblemDetail` bodies: 400 with an `errors` map, 401, 403 "Accès refusé", 404, and 500 when deleting a space that has bookings.
- In **real** mode it calls `fetch`. The existing endpoints are `/api/me` and `/api/spaces`. Endpoints marked *planned* throw a 501 "Pas encore disponible".

The planned endpoints are a proposal for the next backend steps:

| Function | Request |
| --- | --- |
| `getAvailableSpaces` | `GET /api/spaces/available?start=&end=&type=` |
| `getBookings` (admin) | `GET /api/bookings` |
| `getMyBookings` | `GET /api/bookings/me` |
| `createBooking` | `POST /api/bookings` with `{ spaceId, userId (admin only), startDateTime, endDateTime }` |
| `updateBooking` (admin) | `PUT /api/bookings/{id}` |
| `deleteBooking` (owner or admin) | `DELETE /api/bookings/{id}` |
| `getClients` (admin) | `GET /api/users?role=CLIENT` (auth-service) |
| `login`, `register`, `logout` | `/auth/...` (auth-service) |

A booking response adds `spaceName`, `spaceType`, `userName`, `formula` and `price` (computed by the server).

## Assumptions to confirm

- **Opening hours** are 8:00–22:00. A half-day is 8:00–13:00 or 13:00–18:00, and a day is 8:00–18:00. These values live in `js/config.js`.
- **A month** runs from the start date to the day before the same date next month.
- **A rate of 0 €** means "formule non proposée" for that space. For example, meeting rooms have no monthly rate.
- **The price** is rate × quantity for the formula inferred from start and end (`js/pricing.js`). The backend will need the same rule.
- **Cancellation:** a client can cancel a booking only before it starts. An admin can delete any booking.

## Structure and the React port

| Prototype | React |
| --- | --- |
| `*.html` + `js/pages/*.js` | one route component per page |
| `js/layout.js` (`mountLayout`) | `<Layout>` + route guard by role |
| `js/components/*.js` | components (`bookingForm`, `spaceForm`, `monthCalendar`, `dayTimeline`, dialog, toast) |
| `js/dom.js` (`h()`) | JSX |
| `js/api.js`, `js/pricing.js`, `js/dates.js` | reused almost as they are |
| `js/i18n/` (`t('key')`) | i18n library; add `nl.js` and `en.js` with the same keys |
| `css/tokens.css` | theme variables (light and dark) |
| `js/brand.js` | brand name, tagline, logo |

`js/pricing.js` and the mock handlers are the first candidates for unit tests once the code is ported.
