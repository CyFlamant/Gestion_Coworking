# Gestion Coworking back end: test functions

Test number and title from `gestion-coworking-back-end-tests.md`, and the Java test method. Files are relative to `backend/app-service/src/test/java/io/github/cyflamant/gestioncoworking/`.

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
| 29 | Delete a space that has bookings | `deleteReturns409WhenSpaceHasBookings` (`controller/SpaceControllerTest.java`) |
| 30 | A client creates a space | `createReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 31 | A client lists the spaces | `findAllIsAllowedForClient` (`controller/SpaceControllerTest.java`) |
| 32 | A client updates a space | `updateReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 33 | A client deletes a space | `deleteReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 34 | Who am I | `meReturnsIdAndRole` (`controller/MeControllerTest.java`) |
| 35 | Who am I, as a guest | `meReturns401ForGuest` (`controller/MeControllerTest.java`) |
| 36 | Placeholder user | `returnsConfiguredUserId` (`security/PlaceholderUserProviderTest.java`) |
| 37 | Allowed front-end origin | `preflightFromAllowedOriginSucceedsWithoutAuthentication` (`security/CorsConfigTest.java`) |
| 38 | Former prototype address | `preflightFromRemovedPrototypeOriginIsRejected` (`security/CorsConfigTest.java`) |
| 39 | Unknown origin | `preflightFromUnknownOriginIsRejected` (`security/CorsConfigTest.java`) |
| 40 | Delete from the front end | `preflightForDeleteIsAllowed` (`security/CorsConfigTest.java`) |
| 41 | Application starts | `contextLoads` (`GestionCoworkingApplicationTests.java`) |
| 42 | Create then read back through the API | `createdSpaceCanBeReadBack` (`integration/SpaceApiIntegrationTest.java`) |

Run one test from `backend/app-service`: `.\mvnw.cmd test -Dtest=<Class>#<method>`.
