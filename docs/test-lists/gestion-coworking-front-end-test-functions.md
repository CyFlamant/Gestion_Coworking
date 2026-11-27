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
| 33 | Slot description | `SlotFields > describes the chosen slot` (`components/SlotFields.test.jsx`) |
| 34 | Hourly formula | `SlotFields > asks for the start hour and duration with the hourly formula` (`components/SlotFields.test.jsx`) |
| 35 | Half-day formula | `SlotFields > offers the morning and the afternoon with the half-day formula` (`components/SlotFields.test.jsx`) |
| 36 | Saturday | `SlotFields > disables the day formula on a Saturday` (`components/SlotFields.test.jsx`) |
| 37 | Sunday | `SlotFields > refuses a Sunday and keeps the previous date` (`components/SlotFields.test.jsx`) |
| 38 | New values | `SlotFields > gives the new values to its parent` (`components/SlotFields.test.jsx`) |
| 39 | Spaces and rates | `SpacesPage > shows every space with its rates` (`pages/SpacesPage.test.jsx`) |
| 40 | Search | `SpacesPage > searches for the free spaces on the chosen slot` (`pages/SpacesPage.test.jsx`) |
| 41 | New search | `SpacesPage > searches again when the slot changes` (`pages/SpacesPage.test.jsx`) |
| 42 | Booked and free | `SpacesPage > marks which spaces are booked and counts the free ones` (`pages/SpacesPage.test.jsx`) |
| 43 | Price for the slot | `SpacesPage > shows the price of each space for the chosen slot` (`pages/SpacesPage.test.jsx`) |
| 44 | Type filter | `SpacesPage > filters the spaces by type` (`pages/SpacesPage.test.jsx`) |
| 45 | Type from the home page | `SpacesPage > preselects the type chosen on the home page` (`pages/SpacesPage.test.jsx`) |
| 46 | Guest | `SpacesPage > invites a guest to sign in to book a free space` (`pages/SpacesPage.test.jsx`) |
| 47 | Client books | `SpacesPage > takes a client to the booking page with the chosen space and slot` (`pages/SpacesPage.test.jsx`) |
| 48 | Search not available | `SpacesPage > shows every space as free when the search is not available` (`pages/SpacesPage.test.jsx`) |
| 49 | Spaces can't be loaded | `SpacesPage > shows an error when the spaces cannot be loaded` (`pages/SpacesPage.test.jsx`) |
| 50 | Choice from the spaces page | `BookPage > starts from the space and slot chosen on the spaces page` (`pages/BookPage.test.jsx`) |
| 51 | No previous choice | `BookPage > starts with two hours tomorrow when nothing was chosen` (`pages/BookPage.test.jsx`) |
| 52 | A free space is chosen | `BookPage > chooses a free space of the type` (`pages/BookPage.test.jsx`) |
| 53 | Booked spaces in the list | `BookPage > marks the booked spaces in the list` (`pages/BookPage.test.jsx`) |
| 54 | Price summary | `BookPage > shows the price of the booking` (`pages/BookPage.test.jsx`) |
| 55 | Chosen space already booked | `BookPage > warns when the chosen space is already booked` (`pages/BookPage.test.jsx`) |
| 56 | No space free | `BookPage > says so when no space of the type is free` (`pages/BookPage.test.jsx`) |
| 57 | Book | `BookPage > books the space and goes to the client's bookings` (`pages/BookPage.test.jsx`) |
| 58 | Booking refused | `BookPage > shows the API's error and stays on the page when the booking fails` (`pages/BookPage.test.jsx`) |
| 59 | Upcoming bookings | `MyBookingsPage > lists the upcoming bookings` (`pages/MyBookingsPage.test.jsx`) |
| 60 | Booking in progress | `MyBookingsPage > shows a booking in progress, without the cancel option` (`pages/MyBookingsPage.test.jsx`) |
| 61 | Cancel | `MyBookingsPage > cancels a booking once the client confirms` (`pages/MyBookingsPage.test.jsx`) |
| 62 | Keep | `MyBookingsPage > keeps the booking when the client changes their mind` (`pages/MyBookingsPage.test.jsx`) |
| 63 | Nothing coming up | `MyBookingsPage > invites the client to book when nothing is coming up` (`pages/MyBookingsPage.test.jsx`) |
| 64 | Bookings can't be loaded | `MyBookingsPage > shows an error when the bookings cannot be loaded` (`pages/MyBookingsPage.test.jsx`) |
| 65 | Page at `/` | `App > shows the page at / to a guest` (`App.test.jsx`) |
| 66 | Page at `/espaces` | `App > shows the page at /espaces to a guest` (`App.test.jsx`) |
| 67 | Page at `/connexion` | `App > shows the page at /connexion to a guest` (`App.test.jsx`) |
| 68 | Page at `/inscription` | `App > shows the page at /inscription to a guest` (`App.test.jsx`) |
| 69 | Page at `/reserver` | `App > shows the page at /reserver to a client` (`App.test.jsx`) |
| 70 | Page at `/mes-reservations` | `App > shows the page at /mes-reservations to a client` (`App.test.jsx`) |
| 71 | Page at `/contact` | `App > shows the page at /contact to a guest` (`App.test.jsx`) |
| 72 | Page at `/horaires` | `App > shows the page at /horaires to a guest` (`App.test.jsx`) |
| 73 | Page at `/mentions-legales` | `App > shows the page at /mentions-legales to a guest` (`App.test.jsx`) |
| 74 | Admin pages | `App > shows the admin pages to an admin` (`App.test.jsx`) |
| 75 | Client page for a guest | `App > sends a guest who opens a client page to the home page` (`App.test.jsx`) |
| 76 | Unknown address | `App > says when a page does not exist` (`App.test.jsx`) |
| 77 | List | `AdminSpacesPage > lists the spaces with their rates and number of bookings` (`pages/AdminSpacesPage.test.jsx`) |
| 78 | Order | `AdminSpacesPage > sorts the spaces by type, then by name` (`pages/AdminSpacesPage.test.jsx`) |
| 79 | Type filter | `AdminSpacesPage > filters the spaces by type` (`pages/AdminSpacesPage.test.jsx`) |
| 80 | Add | `AdminSpacesPage > adds a space` (`pages/AdminSpacesPage.test.jsx`) |
| 81 | Edit | `AdminSpacesPage > edits a space` (`pages/AdminSpacesPage.test.jsx`) |
| 82 | Form errors | `AdminSpacesPage > shows the API's errors in the form and keeps it open` (`pages/AdminSpacesPage.test.jsx`) |
| 83 | Delete | `AdminSpacesPage > deletes a space once the admin confirms` (`pages/AdminSpacesPage.test.jsx`) |
| 84 | Space with bookings | `AdminSpacesPage > explains why a space with bookings cannot be deleted` (`pages/AdminSpacesPage.test.jsx`) |
| 85 | Bookings not available | `AdminSpacesPage > still lists the spaces when the bookings are not available` (`pages/AdminSpacesPage.test.jsx`) |
| 86 | Spaces can't be loaded | `AdminSpacesPage > shows an error when the spaces cannot be loaded` (`pages/AdminSpacesPage.test.jsx`) |
| 87 | Month and first day of the week | `MonthCalendar > shows the month of the selected day, with weeks starting on Monday` (`components/MonthCalendar.test.jsx`) |
| 88 | Selected day | `MonthCalendar > highlights the selected day` (`components/MonthCalendar.test.jsx`) |
| 89 | Choosing a day | `MonthCalendar > gives the clicked day to its parent` (`components/MonthCalendar.test.jsx`) |
| 90 | Other months | `MonthCalendar > moves to the next and previous months` (`components/MonthCalendar.test.jsx`) |
| 91 | Days with bookings | `MonthCalendar > puts a dot on the days that have bookings` (`components/MonthCalendar.test.jsx`) |
| 92 | Columns and bookings | `DayTimeline > shows one column per space, with its bookings and their times` (`components/DayTimeline.test.jsx`) |
| 93 | Booking over several days | `DayTimeline > shows the formula instead of times for a booking over several days` (`components/DayTimeline.test.jsx`) |
| 94 | Clicking a booking | `DayTimeline > gives the clicked booking to its parent` (`components/DayTimeline.test.jsx`) |
| 95 | Clicking a free hour | `DayTimeline > gives the space and hour of a clicked free slot to its parent` (`components/DayTimeline.test.jsx`) |
| 96 | Opening hours | `DayTimeline > follows the opening hours of the day` (`components/DayTimeline.test.jsx`) |
| 97 | Sunday | `DayTimeline > says the coworking space is closed on Sunday` (`components/DayTimeline.test.jsx`) |
| 98 | Today's bookings | `AdminBookingsPage > shows today's bookings in the day view` (`pages/AdminBookingsPage.test.jsx`) |
| 99 | Another day | `AdminBookingsPage > shows the bookings of the day chosen in the calendar` (`pages/AdminBookingsPage.test.jsx`) |
| 100 | Filters | `AdminBookingsPage > filters the day view by type and by space` (`pages/AdminBookingsPage.test.jsx`) |
| 101 | List view | `AdminBookingsPage > lists the bookings that are not over, and the past ones on request` (`pages/AdminBookingsPage.test.jsx`) |
| 102 | Add | `AdminBookingsPage > adds a booking for a client from a free hour of the day view` (`pages/AdminBookingsPage.test.jsx`) |
| 103 | Edit | `AdminBookingsPage > edits a booking clicked in the day view` (`pages/AdminBookingsPage.test.jsx`) |
| 104 | Delete | `AdminBookingsPage > deletes a booking once the admin confirms` (`pages/AdminBookingsPage.test.jsx`) |
| 105 | Booking refused | `AdminBookingsPage > shows the API's error in the dialog and keeps it open` (`pages/AdminBookingsPage.test.jsx`) |
| 106 | Data can't be loaded | `AdminBookingsPage > shows an error when the data cannot be loaded` (`pages/AdminBookingsPage.test.jsx`) |
| 107 | Message shown | `FlashMessage > shows the message saved before the page change` (`components/FlashMessage.test.jsx`) |
| 108 | Shown once | `FlashMessage > shows it only once` (`components/FlashMessage.test.jsx`) |
| 109 | Page change inside the app | `Layout > shows a message saved by the previous page` (`components/Layout.test.jsx`) |
| 110 | Sign out | `Layout > signs out and says so on the next page` (`components/Layout.test.jsx`) |
| 111 | Menu closes on page change | `Layout > closes the mobile menu when the page changes` (`components/Layout.test.jsx`) |
| 112 | Sign-up page | `Layout > marks the sign-in link as current on the sign-up page too` (`components/Layout.test.jsx`) |
| 113 | Same hours in both places | `HoursPage > states the same opening hours as the booking rules` (`pages/InfoPages.test.jsx`) |
| 114 | Choice kept | `SpacesPage > keeps a guest's choice for after sign-in` (`pages/SpacesPage.test.jsx`) |
| 115 | After signing in | `LoginPage > goes on to the booking page when a space was chosen before signing in` (`pages/AccountPages.test.jsx`) |
| 116 | After signing up | `SignupPage > goes on to the booking page when a space was chosen before signing up` (`pages/AccountPages.test.jsx`) |

Run one test file from `frontend/app`: `npx vitest run <file>`; one test: `npx vitest run <file> -t "<it text>"`.
