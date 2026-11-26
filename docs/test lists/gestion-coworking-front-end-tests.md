# Gestion Coworking front end: tests written so far

The tests of the React application, grouped by subject. Each test checks one behaviour and was written before the code it tests (RED, then GREEN).

Run them with `npm test` in `frontend/app`. The test function names are in `gestion-coworking-front-end-test-functions.md`; the back-end tests are in `gestion-coworking-back-end-tests.md`.

32 tests.

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
