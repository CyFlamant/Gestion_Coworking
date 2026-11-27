# Gestion Coworking front end: tests written so far

The tests of the React application, grouped by subject. Each test checks one behaviour and was written before the code it tests (RED, then GREEN).

The tests don't use the demo data of the mock (`lib/mock/db.js`). Each one gives the page its own small set of example spaces and bookings, described at the start of a section when it matters, and a fixed "today" when dates are involved.

Run them with `npm test` in `frontend/app`. The test function names are in `gestion-coworking-front-end-test-functions.md`; the back-end tests are in `gestion-coworking-back-end-tests.md`.

113 tests.

## A. Prices and opening hours

**1. Sunday**: the formulas offered on a Sunday.
- Expected: none (closed).

**2. Saturday formulas**: the formulas offered on a Saturday.
- Expected: hour, half-day and month; no day formula.

**3. Saturday half-days**: the half-days offered on a Saturday.
- Expected: the morning only.

**4. A weekday day**: a "day" booking on a Monday.
- Expected: from 8:00 to 19:00.

**5. A month**: a month booking starting on Monday 16 November.
- Expected: from 16 November at 8:00 to 15 December at 19:00.

**6. Ends at closing time**: 18:00–19:00 on a weekday.
- Expected: within the opening hours.

**7. Ends after closing time**: 18:00–20:00 on a weekday.
- Expected: outside the opening hours.

**8. Saturday afternoon**: 13:00–14:00 on a Saturday.
- Expected: outside the opening hours.

**9. Sunday booking**: any booking on a Sunday.
- Expected: outside the opening hours.

**10. Closed day in a form**: form values set on a Sunday.
- Expected: moved to the next Monday, keeping the formula.

**11. Hourly price**: two hours at 4 € per hour.
- Expected: hourly formula, 2 units, 8 €.

**12. Free formula**: a day at 0 €.
- Expected: day formula, 0 €.

## B. Page frame (header and navigation)

**13. Guest**: no one is signed in.
- Expected: the "Connexion / Inscription" link is shown; no "Déconnexion" button.

**14. Client**: a client is signed in.
- Expected: the "Réserver" and "Mes réservations" links, the client's first name and the "Déconnexion" button.

**15. Admin**: an admin is signed in.
- Expected: the "Réservations" and "Espaces" links.

**16. Page content**: any page.
- Expected: the page is shown inside the frame.

## C. Access by role

**17. Allowed role**: a client opens a client page.
- Expected: the page is shown and receives the signed-in user.

**18. Guest on a client page**.
- Expected: sent to the home page; the client page isn't shown.

**19. Admin on a client page**.
- Expected: sent to the admin home page.

## D. Pages

**20. Horaires**: the opening hours page.
- Expected: the "Horaires" title and the opening hours.

**21. Tab title**: the opening hours page.
- Expected: the browser tab shows "Horaires · L’Échappée".

**22. Contact**: the contact page.
- Expected: the "Contact" title and the postal address.

**23. Mentions légales**: the legal notice page.
- Expected: the "Mentions légales" title and four sections.

**24. Home page for a guest**.
- Expected: the "Voir les espaces disponibles" and "Créer un compte" buttons.

**25. Home page for a client**.
- Expected: the "Réserver un espace" button.

**26. Space types**: the spaces are loaded.
- Expected: for each type, the number of spaces and the lowest hourly price; "0 espace(s)" and no price for a type with no space.

**27. Spaces can't be loaded**: the API fails.
- Expected: an error message with the reason.

## E. Sign-in and sign-up

**28. Sign in**: an admin enters their e-mail and password.
- Expected: the sign-in is sent with those values, then the admin home page is loaded, with "Bienvenue !" saved for it.

**29. Wrong password**: the sign-in is refused.
- Expected: the error message is shown above the form, and the page stays.

**30. Demo account**: the "Remplir : client" button (development only).
- Expected: the form is filled with the demo client's e-mail and password.

**31. Sign up**: a new user fills in the five fields.
- Expected: the account is created with those values, then the home page is loaded, with "Compte créé. Bienvenue !" saved for it.

**32. Sign-up errors**: the API rejects the e-mail.
- Expected: the message is shown under the e-mail field, which is marked as invalid; no message above the form.

## F. Slot fields (formula, date, time)

Shared by the search, booking and admin pages. The examples start on Tuesday 17 November 2026, with the day formula.

**33. Slot description**: the chosen slot.
- Expected: "Mardi 17 novembre 2026, de 8:00 à 19:00" is shown.

**34. Hourly formula**: the "À l’heure" formula is chosen.
- Expected: a start hour (9:00) and a duration (2 h) are asked; the slot becomes 9:00–11:00.

**35. Half-day formula**: the "Demi-journée" formula is chosen.
- Expected: a choice between the morning and the afternoon.

**36. Saturday**: the date is changed to a Saturday.
- Expected: the day formula is disabled, and the hourly formula is selected instead.

**37. Sunday**: the date is changed to a Sunday.
- Expected: the message "L’espace de coworking est fermé ce jour-là." is shown; the date stays as it was, and nothing is passed on.

**38. New values**: the "Mois" formula is chosen.
- Expected: the new values, with the month formula, are passed to the page.

## G. Available spaces

"Today" is fixed on Monday 16 November 2026, so the default search is Tuesday 17, a full day. Openspace 1 is booked.

**39. Spaces and rates**: the page opens.
- Expected: every space is shown with its four rates.

**40. Search**: the page opens.
- Expected: the free spaces are asked for Tuesday 17, 8:00–19:00.

**41. New search**: the formula is changed to "À l’heure".
- Expected: the free spaces are asked again, for 9:00–11:00.

**42. Booked and free**: the search has answered.
- Expected: Openspace 1 shows "Déjà réservé", Openspace 2 shows "Disponible", and "2 espace(s) disponible(s) sur 3" is shown.

**43. Price for the slot**: the day formula is chosen.
- Expected: each space shows its price for the slot (50,00 € for Bureau 1).

**44. Type filter**: "Bureaux individuels" is chosen.
- Expected: only the offices are shown.

**45. Type from the home page**: the page opens from the "Bureaux individuels" panel (`/espaces#office`).
- Expected: only the offices are shown.

**46. Guest**: no one is signed in.
- Expected: free spaces show "Se connecter pour réserver"; booked spaces show no link.

**47. Client books**: a client clicks "Réserver" on a free space.
- Expected: the booking page opens, with the space and the slot remembered.

**48. Search not available**: the search fails (real mode: the endpoint doesn't exist yet).
- Expected: the message is shown, and every space is shown as free.

**49. Spaces can't be loaded**: the API fails.
- Expected: an error message with the reason.

## H. Booking a space

A signed-in client books on the "Réserver" page. "Today" is Monday 16 November 2026; Openspace 1 is booked on the slot.

**50. Choice from the spaces page**: the client clicked "Réserver" on Bureau 1 for a full day.
- Expected: the form starts with Bureau 1 and the day formula.

**51. No previous choice**: the client opens the page directly.
- Expected: the form starts with two hours tomorrow, 9:00–11:00.

**52. A free space is chosen**: the first open space is booked.
- Expected: the free Openspace 2 is selected.

**53. Booked spaces in the list**.
- Expected: "Openspace 1 — déjà réservé" and "Openspace 2" are offered.

**54. Price summary**: a full day on Bureau 1.
- Expected: "1 jour(s)" and a total of 50,00 €.

**55. Chosen space already booked**: the client chose Openspace 1 on the spaces page.
- Expected: "Cet espace est déjà réservé sur ce créneau." is shown, and the booking can't be confirmed.

**56. No space free**: every open space is booked on the slot.
- Expected: "Aucun espace de ce type n’est disponible pour ce créneau." replaces the list, and the booking can't be confirmed.

**57. Book**: the client confirms a full day on Bureau 1.
- Expected: the booking is sent with that space and slot (Tuesday 17, 8:00–19:00), then "Mes réservations" opens, with "Réservation confirmée." saved for it.

**58. Booking refused**: the API refuses the booking.
- Expected: the error message is shown, and the page stays.

## I. My bookings

"Today" is Monday 16 November 2026 at 10:00. The client has a booking tomorrow, one that started this morning, and one last week.

**59. Upcoming bookings**: the page opens.
- Expected: tomorrow's booking is shown with its space, slot and price; the past ones aren't.

**60. Booking in progress**: this morning's booking (9:00–11:00) has started but not ended.
- Expected: it is listed, without an "Annuler" button.

**61. Cancel**: the client clicks "Annuler", then confirms.
- Expected: the booking is cancelled and the list is loaded again; it is gone, the booking in progress is still shown, and "Réservation annulée." is shown.

**62. Keep**: the client clicks "Annuler", then "Garder".
- Expected: the dialog closes; nothing is cancelled and the booking is still shown.

**63. Nothing coming up**: the client has no upcoming booking.
- Expected: "Vous n’avez aucune réservation à venir." and a "Réserver un espace" link.

**64. Bookings can't be loaded**: the API fails.
- Expected: an error message with the reason.

## J. Addresses (routes)

Checks that each address opens its real page for the right role. The pages themselves are tested above; here the API answers with empty lists. A placeholder page has the right heading but no tab title, so the tab title shows the real page is there.

**65–73. Each page at its address**: the page is opened at its address by a user who may see it.

| # | Address | Role | Heading | Tab title |
|---|---|---|---|---|
| 65 | `/` | guest | Espace de coworking | Accueil |
| 66 | `/espaces` | guest | Espaces disponibles | Espaces disponibles |
| 67 | `/connexion` | guest | Connexion | Connexion |
| 68 | `/inscription` | guest | Créer un compte | Inscription |
| 69 | `/reserver` | client | Réserver | Réserver |
| 70 | `/mes-reservations` | client | Mes réservations | Mes réservations |
| 71 | `/contact` | guest | Contact | Contact |
| 72 | `/horaires` | guest | Horaires | Horaires |
| 73 | `/mentions-legales` | guest | Mentions légales | Mentions légales |

- Expected: the page's heading is shown, and the tab title is the one in the table, followed by "· L’Échappée".

**74. Admin pages**: an admin opens `/admin/espaces`, then `/admin/reservations`.
- Expected: each page's heading is shown ("Espaces", "Réservations"), with its tab title ("Espaces · L’Échappée", "Réservations · L’Échappée").

**75. Client page for a guest**: a guest opens `/reserver`.
- Expected: the home page is shown instead.

**76. Unknown address**: `/nimporte-quoi`.
- Expected: the "Page introuvable" page is shown, with its tab title and a "Retour à l’accueil" link to the home page.

## K. Managing spaces (admin)

An admin manages the spaces. The tests use four example spaces (two open spaces, an office and a meeting room); Openspace 1 has two bookings and Bureau 1 one.

**77. List**: the page opens.
- Expected: each space is shown with its rates and its number of bookings (2 for Openspace 1); "4 espace(s)".

**78. Order**: the spaces arrive in any order.
- Expected: they are listed by type (open spaces, offices, rooms), then by name.

**79. Type filter**: "Bureaux individuels" is chosen.
- Expected: only Bureau 1 is listed; "1 espace(s)".

**80. Add**: the admin fills in the "Nouvel espace" form (name, type and four rates) and saves.
- Expected: the space is sent with those values; the dialog closes, "Espace « Bureau 3 » ajouté." is shown and the list is loaded again.

**81. Edit**: the admin changes the name of Bureau 1 and saves.
- Expected: the form opens with the current values; the space is sent with the new name and its other values; "modifié" is shown.

**82. Form errors**: the API rejects the form (name missing).
- Expected: "Champ obligatoire" is shown under the name, which is marked as invalid; the dialog stays open.

**83. Delete**: the admin clicks "Supprimer" on Openspace 2, then confirms.
- Expected: the space is deleted and "supprimé" is shown.

**84. Space with bookings**: the API refuses to delete Openspace 1.
- Expected: the API's message ("… il a des réservations") is shown as an error.

**85. Bookings not available**: the bookings can't be loaded (real mode: the endpoint doesn't exist yet).
- Expected: the spaces are still listed, with 0 bookings, and no error.

**86. Spaces can't be loaded**: the API fails.
- Expected: an error message with the reason.

## L. Month calendar (admin)

The calendar of the admin bookings page. The selected day is Monday 16 November 2026.

**87. Month and first day of the week**: the calendar opens.
- Expected: "Novembre 2026" is shown; the first row starts on Monday 26 October (1 November is a Sunday).

**88. Selected day**.
- Expected: Monday 16 is marked as selected, Tuesday 17 isn't.

**89. Choosing a day**: Tuesday 17 is clicked.
- Expected: that day is passed to the page.

**90. Other months**: "Mois suivant", then "Mois précédent" twice.
- Expected: "Décembre 2026", then "Octobre 2026".

**91. Days with bookings**: Tuesday 17 has a booking.
- Expected: Tuesday 17 has a dot; Monday 16 doesn't.

## M. Day timeline (admin)

The day view of the admin bookings page, with two spaces: Openspace 1 and Bureau 1.

**92. Columns and bookings**: Monday, with Marie Dubois's booking from 9:00 to 12:00.
- Expected: one column per space; the booking shows "Marie Dubois" and "9:00 – 12:00".

**93. Booking over several days**: a monthly booking.
- Expected: it shows the formula ("Mois") instead of times.

**94. Clicking a booking**.
- Expected: that booking is passed to the page (to edit it).

**95. Clicking a free hour**: Bureau 1 at 14:00.
- Expected: the space and the hour are passed to the page (to add a booking).

**96. Opening hours**: a Saturday.
- Expected: free hours from 9:00 to 12:00; none at 13:00.

**97. Sunday**.
- Expected: "L’espace de coworking est fermé ce jour-là." and no buttons.

## N. Managing bookings (admin)

"Today" is Monday 16 November 2026 at 10:00. Marie Dubois has a booking today (Openspace 1, 9:00–12:00) and one last week; Thomas Lambert has one tomorrow (Bureau 1, full day).

**98. Today's bookings**: the page opens.
- Expected: the day view shows Monday 16 November, "1 réservation(s) ce jour" and Marie's booking, 9:00–12:00.

**99. Another day**: Tuesday 17 is chosen in the calendar.
- Expected: the day view shows Tuesday 17 with Thomas's booking, and not Marie's.

**100. Filters**: the type "Open space", then the space "Openspace 1", are chosen.
- Expected: the day view keeps only the open spaces, then only Openspace 1.

**101. List view**: "Liste" is chosen.
- Expected: today's and tomorrow's bookings are listed; last week's only after ticking "Afficher les réservations passées".

**102. Add**: the admin clicks the free hour of Bureau 1 at 14:00, chooses Marie and saves.
- Expected: the booking is sent for Marie, Bureau 1, today 14:00–15:00; the dialog closes, "Réservation ajoutée." is shown and the bookings are loaded again.

**103. Edit**: the admin clicks Marie's booking and changes the duration to 2 hours.
- Expected: the dialog opens with Marie as the client; the booking is sent with 9:00–11:00; "Réservation modifiée." is shown.

**104. Delete**: the admin clicks Marie's booking, then "Supprimer", then confirms.
- Expected: the booking is deleted and "Réservation supprimée." is shown.

**105. Booking refused**: the API refuses the new booking.
- Expected: the error is shown in the dialog, which stays open.

**106. Data can't be loaded**: the bookings can't be loaded (real mode: the endpoint doesn't exist yet).
- Expected: an error message with the reason.

## O. Messages after a page change

Some confirmations are shown on the next page: "Bienvenue !" after signing in, "Réservation confirmée." after booking, "Vous êtes déconnecté." after signing out. The page saves the message before leaving (tests 28, 31 and 57 check that it is saved); the layout shows it on the next page, once.

**107. Message shown**: a message was saved before the page change.
- Expected: it is shown.

**108. Shown once**: the next page after that.
- Expected: the message is no longer shown.

**109. Page change inside the app**: a page saves "Réservation confirmée." and opens another page without a full page load (as "Réserver" does).
- Expected: the next page shows the message.

**110. Sign out**: a signed-in client clicks "Déconnexion".
- Expected: the home page is loaded, with "Vous êtes déconnecté." saved for it.

## P. Navigation menu

More checks on the page frame (section B).

**111. Menu closes on page change**: on a phone, the menu is opened, then a footer link is followed.
- Expected: the next page is shown with the menu closed.

**112. Sign-up page**: a guest is on the Inscription page.
- Expected: the "Connexion / Inscription" link is marked as the current page.

## Q. Opening hours text

The opening hours are written twice: as a sentence on the Horaires page (`fr.js`) and as the rules used for bookings (`config.js`).

**113. Same hours in both places**: the sentence is compared with the rules.
- Expected: Monday to Friday have the same hours, Sunday is closed, and the sentence states the weekday and Saturday hours of the rules. The test fails if one is changed without the other.
