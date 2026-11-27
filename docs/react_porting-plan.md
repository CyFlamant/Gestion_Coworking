# React porting plan

The HTML/CSS/JS prototype (`frontend/prototype`) was ported to a React application (`frontend/app`, Vite + React Router + Vitest). The port was done step by step: each step started with tests, ended with all tests passing, and was committed on its own. The prototype was kept as a reference until the last step, then removed; it remains in the git history.

Bookings, accounts and sign-in do not exist in the backend yet, so the React app keeps the prototype's simulated (mock) API for them, with a switch between simulated and real data.

## Steps

| Step | Content | Status |
| --- | --- | --- |
| 1. Setup | Create the React project, set up the test tools, move the pricing and opening-hours logic with its tests, allow the new development address in the backend (CORS) | Done |
| 2. Skeleton | Reuse the prototype's styles, texts and API layer; one address (URL) per page, with temporary placeholder pages | Done |
| 3. Layout | Header, navigation adapted to the user's role, user name, footer, and the prototype panel to switch roles during development | Done |
| 4. Information pages | Horaires, Contact, Mentions légales | Done |
| 5. Access by role | Each page is only shown to the roles allowed to use it; other users are sent to their own home page | Done |
| 6. Home page | Presentation, the three space types with their number of spaces and lowest price, how booking works | Done |
| 7. Sign-in and sign-up | The Connexion and Inscription forms | Done |
| 8. Available spaces | Search for free spaces by date, formula and type, with the price of each space | Done |
| 9. Client bookings | Book a space and see or cancel one's own bookings | Done |
| 10. Administration | Manage spaces and bookings: calendar, day view, forms in dialogs; tables adapted to phones | Done |
| 11. Clean-up | Remove the temporary pages and the prototype folder, update the documentation | Done |

## After the port

- Connect the sign-in and booking pages to the real backend as the auth-service and the booking endpoints are developed.
- Add the Dutch and English translations.
- Deployment: see the deployment items in `to-do.md`.
