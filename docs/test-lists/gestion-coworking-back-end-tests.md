# Gestion Coworking back end: tests written so far

The tests of the app-service (Spring Boot), grouped by subject. Each test checks one behaviour and was written before the code it tests (RED, then GREEN).

Run them with `.\mvnw.cmd test` in `backend/app-service` (MariaDB must be running). The test function names are in `gestion-coworking-back-end-test-functions.md`; the front-end tests are in `gestion-coworking-front-end-tests.md`.

42 tests.

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
- Expected: 409 with "Impossible de supprimer l'espace 1 : il a des réservations".

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

**37. Allowed front-end origin**: a browser preflight from the React development server (`http://localhost:5173`).
- Expected: 200 with that origin allowed, without being signed in.

**38. Former prototype address**: a preflight from `http://localhost:5500`, the address of the removed HTML prototype.
- Expected: 403, with no origin allowed.

**39. Unknown origin**: a preflight from another site.
- Expected: 403, with no origin allowed.

**40. Delete from the front end**: a preflight for a `DELETE` request.
- Expected: 200 (the method is allowed).

## F. Whole application

**41. Application starts**: the whole Spring context with the database.
- Expected: it starts without error.

**42. Create then read back through the API**: a space is created with `POST`, then read with `GET`, against the real database.
- Expected: the space read back matches the one created.
