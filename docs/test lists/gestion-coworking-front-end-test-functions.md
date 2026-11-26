# Gestion Coworking front end: test functions

Test number and title from `gestion-coworking-front-end-tests.md`, and the Vitest test, written as `describe > it`. Files are relative to `frontend/app/src/`.

| # | Test | Function (file) |
|---|---|---|
| 1 | Sunday | `formulasOn > offers no formula on Sunday` (`lib/pricing.test.js`) |
| 2 | Saturday formulas | `formulasOn > offers no day formula on Saturday` (`lib/pricing.test.js`) |
| 3 | Saturday half-days | `halfDaysOn > offers only the morning on Saturday` (`lib/pricing.test.js`) |
| 4 | A weekday day | `bookingRange > books a weekday DAY from 8:00 to 19:00` (`lib/pricing.test.js`) |
| 5 | A month | `bookingRange > ends a month at closing time on the day before the same date next month` (`lib/pricing.test.js`) |
| 6 | Ends at closing time | `isWithinOpeningHours > accepts a weekday booking that ends at closing time` (`lib/pricing.test.js`) |
| 7 | Ends after closing time | `isWithinOpeningHours > rejects a weekday booking that ends after closing time` (`lib/pricing.test.js`) |
| 8 | Saturday afternoon | `isWithinOpeningHours > rejects a Saturday booking after 13:00` (`lib/pricing.test.js`) |
| 9 | Sunday booking | `isWithinOpeningHours > rejects any booking on Sunday` (`lib/pricing.test.js`) |
| 10 | Closed day in a form | `fitToOpeningHours > moves a Sunday to the next Monday` (`lib/pricing.test.js`) |
| 11 | Hourly price | `computePrice > charges two hours at the hourly rate` (`lib/pricing.test.js`) |
| 12 | Free formula | `computePrice > charges nothing for a formula with a 0 € rate` (`lib/pricing.test.js`) |
| 13 | Guest | `Layout > shows the sign-in link to a guest` (`components/Layout.test.jsx`) |
| 14 | Client | `Layout > shows the client links and first name` (`components/Layout.test.jsx`) |
| 15 | Admin | `Layout > shows the admin links` (`components/Layout.test.jsx`) |
| 16 | Page content | `Layout > shows the page inside the layout` (`components/Layout.test.jsx`) |
| 17 | Allowed role | `RequireRole > shows the page to an allowed role` (`components/RequireRole.test.jsx`) |
| 18 | Guest on a client page | `RequireRole > sends a guest to the home page` (`components/RequireRole.test.jsx`) |
| 19 | Admin on a client page | `RequireRole > sends an admin to the admin home page` (`components/RequireRole.test.jsx`) |
| 20 | Horaires | `HoursPage > shows the opening hours` (`pages/InfoPages.test.jsx`) |
| 21 | Tab title | `HoursPage > sets the browser tab title` (`pages/InfoPages.test.jsx`) |
| 22 | Contact | `ContactPage > shows the postal address` (`pages/InfoPages.test.jsx`) |
| 23 | Mentions légales | `LegalPage > shows the four sections of the legal notice` (`pages/InfoPages.test.jsx`) |
| 24 | Home page for a guest | `HomePage > invites a guest to see the spaces and sign up` (`pages/HomePage.test.jsx`) |
| 25 | Home page for a client | `HomePage > invites a client to book` (`pages/HomePage.test.jsx`) |
| 26 | Space types | `HomePage > shows how many spaces each type has and the lowest hourly price` (`pages/HomePage.test.jsx`) |
| 27 | Spaces can't be loaded | `HomePage > shows an error when the spaces cannot be loaded` (`pages/HomePage.test.jsx`) |
| 28 | Sign in | `LoginPage > signs in and goes to the role's home page` (`pages/AccountPages.test.jsx`) |
| 29 | Wrong password | `LoginPage > shows the error and stays on the page when the password is wrong` (`pages/AccountPages.test.jsx`) |
| 30 | Demo account | `LoginPage > fills in a demo account` (`pages/AccountPages.test.jsx`) |
| 31 | Sign up | `SignupPage > creates the account and goes to the home page` (`pages/AccountPages.test.jsx`) |
| 32 | Sign-up errors | `SignupPage > shows the API's errors next to the fields` (`pages/AccountPages.test.jsx`) |

Run one test file from `frontend/app`: `npx vitest run <file>`; one test: `npx vitest run <file> -t "<it text>"`.
