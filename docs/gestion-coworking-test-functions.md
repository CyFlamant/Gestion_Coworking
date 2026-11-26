# Gestion Coworking: test functions

Test number and title from `gestion-coworking-tests.md`, and the test function.

## Back end

Java test methods; files relative to `backend/app-service/src/test/java/io/github/cyflamant/gestioncoworking/`.

| # | Test | Function (file) |
|---|---|---|
| 1 | Negative rate | `negativeRateIsRejected` (`entity/SpaceValidationTest.java`) |
| 2 | Zero rate | `zeroRateIsAccepted` (`entity/SpaceValidationTest.java`) |
| 3 | Missing type | `missingTypeIsRejected` (`entity/SpaceValidationTest.java`) |
| 4 | Negative monthly rate | `negativeMonthRateIsRejected` (`entity/SpaceValidationTest.java`) |
| 5 | Read an unknown space | `findByIdThrowsWhenSpaceDoesNotExist` (`service/SpaceServiceTest.java`) |
| 6 | Read a space | `findByIdReturnsSpaceWhenItExists` (`service/SpaceServiceTest.java`) |
| 7 | Create a space | `createSavesAndReturnsSpace` (`service/SpaceServiceTest.java`) |
| 8 | List the spaces | `findAllReturnsAllSpaces` (`service/SpaceServiceTest.java`) |
| 9 | List with no space | `findAllReturnsEmptyListWhenNoSpaces` (`service/SpaceServiceTest.java`) |
| 10 | Update an unknown space | `updateThrowsWhenSpaceDoesNotExist` (`service/SpaceServiceTest.java`) |
| 11 | Update a space | `updateCopiesFieldsAndSaves` (`service/SpaceServiceTest.java`) |
| 12 | Delete an unknown space | `deleteThrowsWhenSpaceDoesNotExist` (`service/SpaceServiceTest.java`) |
| 13 | Delete a space | `deleteRemovesSpace` (`service/SpaceServiceTest.java`) |
| 14 | Delete a space that has bookings | `deleteThrowsWhenSpaceHasBookings` (`service/SpaceServiceTest.java`) |
| 15 | Save and read back | `savedSpaceCanBeFoundById` (`repository/SpaceRepositoryTest.java`) |
| 16 | Read a space | `findByIdReturnsSpace` (`controller/SpaceControllerTest.java`) |
| 17 | Read an unknown space | `findByIdReturns404WhenSpaceDoesNotExist` (`controller/SpaceControllerTest.java`) |
| 18 | Bookings stay hidden | `findByIdDoesNotExposeBookings` (`controller/SpaceControllerTest.java`) |
| 19 | Create a space | `createReturns201WithCreatedSpace` (`controller/SpaceControllerTest.java`) |
| 20 | Blank name | `createReturns400WhenNameIsBlank` (`controller/SpaceControllerTest.java`) |
| 21 | Id in the request | `createIgnoresIdInBody` (`controller/SpaceControllerTest.java`) |
| 22 | Unknown type | `createReturns400WhenTypeIsUnknown` (`controller/SpaceControllerTest.java`) |
| 23 | Broken JSON | `createReturns400WhenJsonIsMalformed` (`controller/SpaceControllerTest.java`) |
| 24 | List the spaces | `findAllReturnsAllSpaces` (`controller/SpaceControllerTest.java`) |
| 25 | Update a space | `updateReturnsUpdatedSpace` (`controller/SpaceControllerTest.java`) |
| 26 | Update an unknown space | `updateReturns404WhenSpaceDoesNotExist` (`controller/SpaceControllerTest.java`) |
| 27 | Delete a space | `deleteReturns204` (`controller/SpaceControllerTest.java`) |
| 28 | Delete an unknown space | `deleteReturns404WhenSpaceDoesNotExist` (`controller/SpaceControllerTest.java`) |
| 29 | Delete a space that has bookings | `deleteReturns500WhenSpaceHasBookings` (`controller/SpaceControllerTest.java`) |
| 30 | A client creates a space | `createReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 31 | A client lists the spaces | `findAllIsAllowedForClient` (`controller/SpaceControllerTest.java`) |
| 32 | A client updates a space | `updateReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 33 | A client deletes a space | `deleteReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 34 | Who am I | `meReturnsIdAndRole` (`controller/MeControllerTest.java`) |
| 35 | Who am I, as a guest | `meReturns401ForGuest` (`controller/MeControllerTest.java`) |
| 36 | Placeholder user | `returnsConfiguredUserId` (`security/PlaceholderUserProviderTest.java`) |
| 37 | Allowed front-end origin | `preflightFromAllowedOriginSucceedsWithoutAuthentication` (`security/CorsConfigTest.java`) |
| 38 | React development server | `preflightFromViteDevServerSucceeds` (`security/CorsConfigTest.java`) |
| 39 | Unknown origin | `preflightFromUnknownOriginIsRejected` (`security/CorsConfigTest.java`) |
| 40 | Delete from the front end | `preflightForDeleteIsAllowed` (`security/CorsConfigTest.java`) |
| 41 | Application starts | `contextLoads` (`GestionCoworkingApplicationTests.java`) |
| 42 | Create then read back through the API | `createdSpaceCanBeReadBack` (`integration/SpaceApiIntegrationTest.java`) |

Run one test from `backend/app-service`: `.\mvnw.cmd test -Dtest=<Class>#<method>`.

## Front end

Vitest tests, written as `describe > it`; files relative to `frontend/app/src/`.

| # | Test | Function (file) |
|---|---|---|
| 43 | Sunday | `formulasOn > offers no formula on Sunday` (`lib/pricing.test.js`) |
| 44 | Saturday formulas | `formulasOn > offers no day formula on Saturday` (`lib/pricing.test.js`) |
| 45 | Saturday half-days | `halfDaysOn > offers only the morning on Saturday` (`lib/pricing.test.js`) |
| 46 | A weekday day | `bookingRange > books a weekday DAY from 8:00 to 19:00` (`lib/pricing.test.js`) |
| 47 | A month | `bookingRange > ends a month at closing time on the day before the same date next month` (`lib/pricing.test.js`) |
| 48 | Ends at closing time | `isWithinOpeningHours > accepts a weekday booking that ends at closing time` (`lib/pricing.test.js`) |
| 49 | Ends after closing time | `isWithinOpeningHours > rejects a weekday booking that ends after closing time` (`lib/pricing.test.js`) |
| 50 | Saturday afternoon | `isWithinOpeningHours > rejects a Saturday booking after 13:00` (`lib/pricing.test.js`) |
| 51 | Sunday booking | `isWithinOpeningHours > rejects any booking on Sunday` (`lib/pricing.test.js`) |
| 52 | Closed day in a form | `fitToOpeningHours > moves a Sunday to the next Monday` (`lib/pricing.test.js`) |
| 53 | Hourly price | `computePrice > charges two hours at the hourly rate` (`lib/pricing.test.js`) |
| 54 | Free formula | `computePrice > charges nothing for a formula with a 0 € rate` (`lib/pricing.test.js`) |
| 55 | Guest | `Layout > shows the sign-in link to a guest` (`components/Layout.test.jsx`) |
| 56 | Client | `Layout > shows the client links and first name` (`components/Layout.test.jsx`) |
| 57 | Admin | `Layout > shows the admin links` (`components/Layout.test.jsx`) |
| 58 | Page content | `Layout > shows the page inside the layout` (`components/Layout.test.jsx`) |
| 59 | Allowed role | `RequireRole > shows the page to an allowed role` (`components/RequireRole.test.jsx`) |
| 60 | Guest on a client page | `RequireRole > sends a guest to the home page` (`components/RequireRole.test.jsx`) |
| 61 | Admin on a client page | `RequireRole > sends an admin to the admin home page` (`components/RequireRole.test.jsx`) |
| 62 | Horaires | `HoursPage > shows the opening hours` (`pages/InfoPages.test.jsx`) |
| 63 | Tab title | `HoursPage > sets the browser tab title` (`pages/InfoPages.test.jsx`) |
| 64 | Contact | `ContactPage > shows the postal address` (`pages/InfoPages.test.jsx`) |
| 65 | Mentions légales | `LegalPage > shows the four sections of the legal notice` (`pages/InfoPages.test.jsx`) |
| 66 | Home page for a guest | `HomePage > invites a guest to see the spaces and sign up` (`pages/HomePage.test.jsx`) |
| 67 | Home page for a client | `HomePage > invites a client to book` (`pages/HomePage.test.jsx`) |
| 68 | Space types | `HomePage > shows how many spaces each type has and the lowest hourly price` (`pages/HomePage.test.jsx`) |
| 69 | Spaces can't be loaded | `HomePage > shows an error when the spaces cannot be loaded` (`pages/HomePage.test.jsx`) |

Run one test file from `frontend/app`: `npx vitest run <file>`; one test: `npx vitest run <file> -t "<it text>"`.
