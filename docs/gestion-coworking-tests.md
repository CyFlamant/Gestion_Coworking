# Gestion Coworking: tests written so far

The tests of the app-service (Spring Boot back end) and of the React front end, grouped by subject. Each test checks one behaviour and was written before the code it tests (RED, then GREEN).

The back-end tests run with `.\mvnw.cmd test` in `backend/app-service` (MariaDB must be running); the front-end tests with `npm test` in `frontend/app`. The test function names are in `gestion-coworking-test-functions.md`.

Back end: 42 tests. Front end: 27 tests.

# Back end (app-service)

## A. Space data rules

**1. Negative rate**: a space with a negative hourly rate.
- Expected: validation rejects the space.

**2. Zero rate**: a space with a rate of 0 €.
- Expected: validation accepts the space (a free formula).

**3. Missing type**: a space without a type.
- Expected: validation rejects it with the message "Champ obligatoire".

**4. Negative monthly rate**: a space with a negative monthly rate.
- Expected: validation rejects the space.

## B. Space business logic

**5. Read an unknown space**: asking for a space that doesn't exist.
- Expected: the service raises "space not found".

**6. Read a space**: asking for an existing space.
- Expected: the service returns that space.

**7. Create a space**: a new space is created.
- Expected: the service saves it and returns it.

**8. List the spaces**: two spaces exist.
- Expected: the service returns both.

**9. List with no space**: no space exists.
- Expected: the service returns an empty list.

**10. Update an unknown space**.
- Expected: the service raises "space not found" and saves nothing.

**11. Update a space**: new name, type and rates.
- Expected: the service copies every field onto the existing space and saves it.

**12. Delete an unknown space**.
- Expected: the service raises "space not found" and deletes nothing.

**13. Delete a space**.
- Expected: the service deletes it.

**14. Delete a space that has bookings**.
- Expected: the service raises "space has bookings".

## C. Space storage

**15. Save and read back**: a space is saved in the database, then read again.
- Expected: the space read back has the same name, type and rates.

## D. Spaces API (HTTP)

The requests are made by an admin, unless stated otherwise.

**16. Read a space**: `GET /api/spaces/1`.
- Expected: 200 with the space's id, name, type and rates.

**17. Read an unknown space**: `GET /api/spaces/99`.
- Expected: 404 with "Espace introuvable : 99".

**18. Bookings stay hidden**: reading a space that has bookings.
- Expected: 200 without a bookings field.

**19. Create a space**: `POST /api/spaces` with a valid space.
- Expected: 201 with the created space.

**20. Blank name**: creating a space with an empty name.
- Expected: 400 with "Champ obligatoire" on the name field.

**21. Id in the request**: creating a space with an id in the body.
- Expected: 201; the id sent is ignored.

**22. Unknown type**: creating a space with a type that doesn't exist.
- Expected: 400 with "Valeur invalide" on the type field.

**23. Broken JSON**: a request body that isn't valid JSON.
- Expected: 400 with "Format JSON invalide".

**24. List the spaces**: `GET /api/spaces`.
- Expected: 200 with all spaces.

**25. Update a space**: `PUT /api/spaces/1`.
- Expected: 200 with the updated space.

**26. Update an unknown space**: `PUT /api/spaces/99`.
- Expected: 404.

**27. Delete a space**: `DELETE /api/spaces/1`.
- Expected: 204.

**28. Delete an unknown space**: `DELETE /api/spaces/99`.
- Expected: 404.

**29. Delete a space that has bookings**.
- Expected: 500 with "Impossible de supprimer l'espace 1 : il a des réservations".

**30. A client creates a space**.
- Expected: 403 with "Accès refusé".

**31. A client lists the spaces**.
- Expected: 200 (reading is open to everyone).

**32. A client updates a space**.
- Expected: 403 with "Accès refusé".

**33. A client deletes a space**.
- Expected: 403.

## E. Current user and security

**34. Who am I**: `GET /api/me` as a signed-in admin.
- Expected: 200 with the user's id and role.

**35. Who am I, as a guest**: `GET /api/me` with no user.
- Expected: 401.

**36. Placeholder user**: until the auth-service exists, the current user is fixed in the configuration.
- Expected: the provider returns the configured user id.

**37. Allowed front-end origin**: a browser preflight from the prototype's address.
- Expected: 200 with that origin allowed, without being signed in.

**38. React development server**: a preflight from `http://localhost:5173`.
- Expected: 200 with that origin allowed.

**39. Unknown origin**: a preflight from another site.
- Expected: 403, with no origin allowed.

**40. Delete from the front end**: a preflight for a `DELETE` request.
- Expected: 200 (the method is allowed).

## F. Whole application

**41. Application starts**: the whole Spring context with the database.
- Expected: it starts without error.

**42. Create then read back through the API**: a space is created with `POST`, then read with `GET`, against the real database.
- Expected: the space read back matches the one created.

# Front end (React)

## G. Prices and opening hours

**43. Sunday**: the formulas offered on a Sunday.
- Expected: none (closed).

**44. Saturday formulas**: the formulas offered on a Saturday.
- Expected: hour, half-day and month; no day formula.

**45. Saturday half-days**: the half-days offered on a Saturday.
- Expected: the morning only.

**46. A weekday day**: a "day" booking on a Monday.
- Expected: from 8:00 to 19:00.

**47. A month**: a month booking starting on Monday 16 November.
- Expected: from 16 November at 8:00 to 15 December at 19:00.

**48. Ends at closing time**: 18:00–19:00 on a weekday.
- Expected: within the opening hours.

**49. Ends after closing time**: 18:00–20:00 on a weekday.
- Expected: outside the opening hours.

**50. Saturday afternoon**: 13:00–14:00 on a Saturday.
- Expected: outside the opening hours.

**51. Sunday booking**: any booking on a Sunday.
- Expected: outside the opening hours.

**52. Closed day in a form**: form values set on a Sunday.
- Expected: moved to the next Monday, keeping the formula.

**53. Hourly price**: two hours at 4 € per hour.
- Expected: hourly formula, 2 units, 8 €.

**54. Free formula**: a day at 0 €.
- Expected: day formula, 0 €.

## H. Page frame (header and navigation)

**55. Guest**: no one is signed in.
- Expected: the "Connexion / Inscription" link is shown; no "Déconnexion" button.

**56. Client**: a client is signed in.
- Expected: the "Réserver" and "Mes réservations" links, the client's first name and the "Déconnexion" button.

**57. Admin**: an admin is signed in.
- Expected: the "Réservations" and "Espaces" links.

**58. Page content**: any page.
- Expected: the page is shown inside the frame.

## I. Access by role

**59. Allowed role**: a client opens a client page.
- Expected: the page is shown and receives the signed-in user.

**60. Guest on a client page**.
- Expected: sent to the home page; the client page isn't shown.

**61. Admin on a client page**.
- Expected: sent to the admin home page.

## J. Pages

**62. Horaires**: the opening hours page.
- Expected: the "Horaires" title and the opening hours.

**63. Tab title**: the opening hours page.
- Expected: the browser tab shows "Horaires · L’Échappée".

**64. Contact**: the contact page.
- Expected: the "Contact" title and the postal address.

**65. Mentions légales**: the legal notice page.
- Expected: the "Mentions légales" title and four sections.

Tests 66 to 69 belong to the home page, still in progress (not committed yet).

**66. Home page for a guest**.
- Expected: the "Voir les espaces disponibles" and "Créer un compte" buttons.

**67. Home page for a client**.
- Expected: the "Réserver un espace" button.

**68. Space types**: the spaces are loaded.
- Expected: for each type, the number of spaces and the lowest hourly price; "0 espace(s)" and no price for a type with no space.

**69. Spaces can't be loaded**: the API fails.
- Expected: an error message with the reason.
