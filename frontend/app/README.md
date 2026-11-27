# Gestion Coworking: front end

React application of the coworking booking site "L’Échappée": guests browse the spaces, clients book and cancel, the admin manages spaces and bookings. Built with Vite, React 19 and React Router; tested with Vitest and Testing Library.

## Commands

Run from `frontend/app` (Node.js and npm required):

```powershell
npm install        # once, and after pulling new dependencies
npm run dev        # development server on http://localhost:5173
npm test           # tests, re-run on every save (press q to quit)
npx vitest run     # tests, once
npm run lint       # code checks (oxlint); keep it clean before committing
npm run build      # production files in dist/
```

## Data: mock or real

`src/lib/api.js` has one function per backend endpoint. Each call goes either to the in-browser mock or to the real services:

- **Mock** (default): `src/lib/mock/` answers in the browser, with demo spaces, clients and bookings kept in `localStorage`. It returns the same status codes and error bodies as the app-service.
- **Real**: calls the app-service at `http://localhost:8080` (and later the auth-service at `http://localhost:8081`). The backend must allow `http://localhost:5173` in its CORS settings.

The mode is set by `API_MODE` in `src/lib/config.js`. In development (`npm run dev`), the **Prototype** bar at the bottom right switches between mock and real, switches the simulated role (guest, client, admin) and resets the demo data. It is not part of a production build.

Demo accounts (mock only): `marie.dubois@exemple.be` (client) and `admin@exemple.be` (admin), password `demo1234`.

### Backend endpoints

Only `/api/me` and `/api/spaces` exist in the app-service so far. The other functions are marked *planned* in `api.js`: in real mode they fail with "Pas encore disponible" (501) until the backend has them.

| Function | Request | State |
| --- | --- | --- |
| `getMe` | `GET /api/me` | exists |
| `getSpaces`, `getSpace`, `createSpace`, `updateSpace`, `deleteSpace` | `/api/spaces`, `/api/spaces/{id}` | exists |
| `getAvailableSpaces` | `GET /api/spaces/available?start=&end=&type=` | planned |
| `getBookings` (admin), `getMyBookings` | `GET /api/bookings`, `GET /api/bookings/me` | planned |
| `createBooking`, `updateBooking` (admin), `deleteBooking` | `POST /api/bookings`, `PUT` / `DELETE /api/bookings/{id}` | planned |
| `getClients` (admin) | `GET /api/users?role=CLIENT` (auth-service) | planned |
| `login`, `register`, `logout` | `/auth/...` (auth-service) | planned |

## Structure

| Folder | Content |
| --- | --- |
| `src/pages/` | one component per page (`HomePage`, `SpacesPage`, `BookPage`, `AdminBookingsPage`…) |
| `src/components/` | shared components: layout, forms, dialogs, calendar, day timeline… |
| `src/hooks/` | custom React hooks: `useSubmit` (sends a form and keeps its errors), `useFreeSpaces` (searches the free spaces of a slot) |
| `src/lib/` | plain JavaScript, no React: API calls, prices and opening hours, dates, texts (`i18n/fr.js`), mock |
| `src/styles/` | CSS: design tokens, base styles, components |
| `src/test/` | test helpers |
| `public/` | files served as they are (logo) |

`src/App.jsx` lists the pages and which roles may open them. Tests sit next to the file they test (`BookPage.jsx` → `BookPage.test.jsx`); the list of all tests is in `docs/test-lists/`.

## Business rules

Set in `src/lib/config.js` and `src/lib/pricing.js`:

- **Opening hours:** Monday to Friday 8:00–19:00, Saturday 9:00–13:00, closed on Sunday.
- **Formulas:** by the hour, half-day (8:00–13:00 or 13:00–19:00; Saturday morning only), day (8:00–19:00, weekdays) and month (from the start date to the day before the same date next month).
- **Price:** rate × quantity for the formula; a 0 € rate means the formula is free.
- **Cancellation:** a client can cancel a booking only before it starts; the admin can delete any booking.

The backend will need the same rules when the booking endpoints are built.
