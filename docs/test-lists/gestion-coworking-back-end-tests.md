# Gestion Coworking back end: tests written so far

The tests of the app-service (Spring Boot), grouped by subject. Each test checks one behaviour and was written before the code it tests (RED, then GREEN).

Run them with `.\mvnw.cmd test` in `backend/app-service` (MariaDB must be running). The test function names are in `gestion-coworking-back-end-test-functions.md`; the front-end tests are in `gestion-coworking-front-end-tests.md`.

57 tests.

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

**15. Search free spaces**: a slot and a type are given.
- Expected: the service returns the spaces the repository finds for them.

**16. Slot with no length**: searching with an end equal to the start.
- Expected: the service raises "La fin doit être après le début" and runs no search.

**17. Reversed slot**: searching with an end before the start.
- Expected: the service raises "La fin doit être après le début" and runs no search.

## C. Space storage

The free-space tests search the slot of Tuesday 1 December 2026, 9:00 to 13:00. The database may hold other data, so each test only looks at its own spaces.

**18. Save and read back**: a space is saved in the database, then read again.
- Expected: the space read back has the same name, type and rates.

**19. Booked space**: a space has a booking from 10:00 to 14:00.
- Expected: it is not among the free spaces.

**20. Booked another day**: a space has a booking on 2 December only.
- Expected: it is among the free spaces.

**21. Bookings that only touch the slot**: a space is booked from 8:00 to 9:00 and from 13:00 to 14:00.
- Expected: it is among the free spaces.

**22. Type filter**: a free room and a free office; the search asks for rooms.
- Expected: only rooms are returned, the room among them, not the office.

**23. No type**: a free room and a free office; the search gives no type.
- Expected: both are returned.

## D. Spaces API (HTTP)

The requests are made by an admin, unless stated otherwise.

**24. Read a space**: `GET /api/spaces/1`.
- Expected: 200 with the space's id, name, type and rates.

**25. Read an unknown space**: `GET /api/spaces/99`.
- Expected: 404 with "Espace introuvable : 99".

**26. Bookings stay hidden**: reading a space that has bookings.
- Expected: 200 without a bookings field.

**27. Create a space**: `POST /api/spaces` with a valid space.
- Expected: 201 with the created space.

**28. Blank name**: creating a space with an empty name.
- Expected: 400 with "Champ obligatoire" on the name field.

**29. Id in the request**: creating a space with an id in the body.
- Expected: 201; the id sent is ignored.

**30. Unknown type**: creating a space with a type that doesn't exist.
- Expected: 400 with "Valeur invalide" on the type field.

**31. Broken JSON**: a request body that isn't valid JSON.
- Expected: 400 with "Format JSON invalide".

**32. List the spaces**: `GET /api/spaces`.
- Expected: 200 with all spaces.

**33. Update a space**: `PUT /api/spaces/1`.
- Expected: 200 with the updated space.

**34. Update an unknown space**: `PUT /api/spaces/99`.
- Expected: 404.

**35. Delete a space**: `DELETE /api/spaces/1`.
- Expected: 204.

**36. Delete an unknown space**: `DELETE /api/spaces/99`.
- Expected: 404.

**37. Delete a space that has bookings**.
- Expected: 409 with "Impossible de supprimer l'espace 1 : il a des réservations".

**38. A client creates a space**.
- Expected: 403 with "Accès refusé".

**39. A client lists the spaces**.
- Expected: 200 (reading is open to everyone).

**40. A client updates a space**.
- Expected: 403 with "Accès refusé".

**41. A client deletes a space**.
- Expected: 403.

**42. Search free spaces**: `GET /api/spaces/available?start=2026-12-01T09:00:00&end=2026-12-01T13:00:00&type=OFFICE`.
- Expected: 200 with the free spaces found for that slot and type.

**43. A guest searches free spaces**: no user, no type.
- Expected: 200 (searching is open to everyone); every type is searched.

**44. Search without start**: only `end` is given.
- Expected: 400 with "Champ obligatoire" on start.

**45. Search with a bad date**: `start=demain`.
- Expected: 400 with "Valeur invalide" on start.

**46. Search with an unknown type**: `type=CAVE`.
- Expected: 400 with "Valeur invalide" on type.

**47. Search with the end before the start**: the service refuses the slot.
- Expected: 400 with "La fin doit être après le début" on end.

## E. Current user and security

**48. Who am I**: `GET /api/me` as a signed-in admin.
- Expected: 200 with the user's id and role.

**49. Who am I, as a guest**: `GET /api/me` with no user.
- Expected: 401.

**50. Placeholder user**: until the auth-service exists, the current user is fixed in the configuration.
- Expected: the provider returns the configured user id.

**51. Allowed front-end origin**: a browser preflight from the React development server (`http://localhost:5173`).
- Expected: 200 with that origin allowed, without being signed in.

**52. Former prototype address**: a preflight from `http://localhost:5500`, the address of the removed HTML prototype.
- Expected: 403, with no origin allowed.

**53. Unknown origin**: a preflight from another site.
- Expected: 403, with no origin allowed.

**54. Delete from the front end**: a preflight for a `DELETE` request.
- Expected: 200 (the method is allowed).

## F. Whole application

**55. Application starts**: the whole Spring context with the database.
- Expected: it starts without error.

**56. Create then read back through the API**: a space is created with `POST`, then read with `GET`, against the real database.
- Expected: the space read back matches the one created.

**57. Free-space search against the database**: a space is booked on 1 December 2026 from 9:00 to 13:00.
- Expected: it is missing from the free spaces from 10:00 to 11:00 that day, and present for the same hours the next day.
