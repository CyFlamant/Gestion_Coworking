# Gestion Coworking front end: tests written so far

The tests of the React application, grouped by subject. Each test checks one behaviour and was written before the code it tests (RED, then GREEN).

Run them with `npm test` in `frontend/app`. The test function names are in `gestion-coworking-front-end-test-functions.md`; the back-end tests are in `gestion-coworking-back-end-tests.md`.

64 tests.

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
- Expected: the sign-in is sent with those values, then the admin home page is loaded.

**29. Wrong password**: the sign-in is refused.
- Expected: the error message is shown above the form, and the page stays.

**30. Demo account**: the "Remplir : client" button (development only).
- Expected: the form is filled with the demo client's e-mail and password.

**31. Sign up**: a new user fills in the five fields.
- Expected: the account is created with those values, then the home page is loaded.

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
- Expected: the booking is sent with that space and slot (Tuesday 17, 8:00–19:00), then "Mes réservations" opens.

**58. Booking refused**: the API refuses the booking.
- Expected: the error message is shown, and the page stays.

## I. My bookings

"Today" is Monday 16 November 2026 at 10:00. The client has a booking tomorrow, one that started this morning, and one last week.

**59. Upcoming bookings**: the page opens.
- Expected: tomorrow's booking is shown with its space, slot and price; the past ones aren't.

**60. Booking in progress**: this morning's booking (9:00–11:00) has started but not ended.
- Expected: it is listed, without an "Annuler" button.

**61. Cancel**: the client clicks "Annuler", then confirms.
- Expected: the booking is cancelled and the list is loaded again; it is gone, and the booking in progress is still shown.

**62. Keep**: the client clicks "Annuler", then "Garder".
- Expected: the dialog closes; nothing is cancelled and the booking is still shown.

**63. Nothing coming up**: the client has no upcoming booking.
- Expected: "Vous n’avez aucune réservation à venir." and a "Réserver un espace" link.

**64. Bookings can't be loaded**: the API fails.
- Expected: an error message with the reason.
