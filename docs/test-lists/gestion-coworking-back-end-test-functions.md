# Gestion Coworking back end: test functions

Test number and title from `gestion-coworking-back-end-tests.md`, and the Java test method. Files are relative to `backend/app-service/src/test/java/io/github/cyflamant/gestioncoworking/`.

| # | Test | Function (file) |
|---|---|---|
| 1 | Negative rate | `negativeRateIsRejected` (`dto/SpaceRequestValidationTest.java`) |
| 2 | Zero rate | `zeroRateIsAccepted` (`dto/SpaceRequestValidationTest.java`) |
| 3 | Missing type | `missingTypeIsRejected` (`dto/SpaceRequestValidationTest.java`) |
| 4 | Negative monthly rate | `negativeMonthRateIsRejected` (`dto/SpaceRequestValidationTest.java`) |
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
| 15 | Search free spaces | `findAvailableReturnsFreeSpacesFromRepository` (`service/SpaceServiceTest.java`) |
| 16 | Slot with no length | `findAvailableRejectsSlotThatEndsWhenItStarts` (`service/SpaceServiceTest.java`) |
| 17 | Reversed slot | `findAvailableRejectsSlotThatEndsBeforeItStarts` (`service/SpaceServiceTest.java`) |
| 18 | Save and read back | `savedSpaceCanBeFoundById` (`repository/SpaceRepositoryTest.java`) |
| 19 | Booked space | `findAvailableLeavesOutSpaceBookedDuringSlot` (`repository/SpaceRepositoryTest.java`) |
| 20 | Booked another day | `findAvailableReturnsSpaceBookedOnAnotherDay` (`repository/SpaceRepositoryTest.java`) |
| 21 | Bookings that only touch the slot | `findAvailableIgnoresBookingsThatOnlyTouchTheSlot` (`repository/SpaceRepositoryTest.java`) |
| 22 | Type filter | `findAvailableFiltersByType` (`repository/SpaceRepositoryTest.java`) |
| 23 | No type | `findAvailableReturnsEveryTypeWithoutType` (`repository/SpaceRepositoryTest.java`) |
| 24 | Read a space | `findByIdReturnsSpace` (`controller/SpaceControllerTest.java`) |
| 25 | Read an unknown space | `findByIdReturns404WhenSpaceDoesNotExist` (`controller/SpaceControllerTest.java`) |
| 26 | Create a space | `createReturns201WithCreatedSpace` (`controller/SpaceControllerTest.java`) |
| 27 | Blank name | `createReturns400WhenNameIsBlank` (`controller/SpaceControllerTest.java`) |
| 28 | Id in the request | `createIgnoresIdInBody` (`controller/SpaceControllerTest.java`) |
| 29 | Unknown type | `createReturns400WhenTypeIsUnknown` (`controller/SpaceControllerTest.java`) |
| 30 | Broken JSON | `createReturns400WhenJsonIsMalformed` (`controller/SpaceControllerTest.java`) |
| 31 | List the spaces | `findAllReturnsAllSpaces` (`controller/SpaceControllerTest.java`) |
| 32 | Update a space | `updateReturnsUpdatedSpace` (`controller/SpaceControllerTest.java`) |
| 33 | Update an unknown space | `updateReturns404WhenSpaceDoesNotExist` (`controller/SpaceControllerTest.java`) |
| 34 | Delete a space | `deleteReturns204` (`controller/SpaceControllerTest.java`) |
| 35 | Delete an unknown space | `deleteReturns404WhenSpaceDoesNotExist` (`controller/SpaceControllerTest.java`) |
| 36 | Delete a space that has bookings | `deleteReturns409WhenSpaceHasBookings` (`controller/SpaceControllerTest.java`) |
| 37 | A client creates a space | `createReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 38 | A client lists the spaces | `findAllIsAllowedForClient` (`controller/SpaceControllerTest.java`) |
| 39 | A client updates a space | `updateReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 40 | A client deletes a space | `deleteReturns403ForClient` (`controller/SpaceControllerTest.java`) |
| 41 | Search free spaces | `findAvailableReturnsFreeSpaces` (`controller/SpaceControllerTest.java`) |
| 42 | A guest searches free spaces | `findAvailableIsAllowedForGuestWithoutType` (`controller/SpaceControllerTest.java`) |
| 43 | Search without start | `findAvailableReturns400WhenStartIsMissing` (`controller/SpaceControllerTest.java`) |
| 44 | Search with a bad date | `findAvailableReturns400WhenDateIsInvalid` (`controller/SpaceControllerTest.java`) |
| 45 | Search with an unknown type | `findAvailableReturns400WhenTypeIsUnknown` (`controller/SpaceControllerTest.java`) |
| 46 | Search with the end before the start | `findAvailableReturns400WhenEndIsNotAfterStart` (`controller/SpaceControllerTest.java`) |
| 47 | Who am I | `meReturnsIdAndRole` (`controller/MeControllerTest.java`) |
| 48 | Who am I, as a guest | `meReturns401ForGuest` (`controller/MeControllerTest.java`) |
| 49 | Current user | `returnsIdOfSignedInUser` (`security/SecurityContextUserProviderTest.java`) |
| 50 | No signed-in user | `throwsWhenNoUserIsSignedIn` (`security/SecurityContextUserProviderTest.java`) |
| 51 | Allowed front-end origin | `preflightFromAllowedOriginSucceedsWithoutAuthentication` (`security/CorsConfigTest.java`) |
| 52 | Former prototype address | `preflightFromRemovedPrototypeOriginIsRejected` (`security/CorsConfigTest.java`) |
| 53 | Unknown origin | `preflightFromUnknownOriginIsRejected` (`security/CorsConfigTest.java`) |
| 54 | Delete from the front end | `preflightForDeleteIsAllowed` (`security/CorsConfigTest.java`) |
| 55 | Application starts | `contextLoads` (`GestionCoworkingApplicationTests.java`) |
| 56 | Create then read back through the API | `createdSpaceCanBeReadBack` (`integration/SpaceApiIntegrationTest.java`) |
| 57 | Free-space search against the database | `availableSearchLeavesOutBookedSpace` (`integration/SpaceApiIntegrationTest.java`) |
| 58 | Demo spaces | `scriptAddsTheSevenDemoSpacesOfTheMock` (`repository/DemoSpacesScriptTest.java`) |
| 59 | Run twice | `scriptRunTwiceAddsEachSpaceOnce` (`repository/DemoSpacesScriptTest.java`) |
| 60 | No database connection in the shared settings | `sharedSettingsHaveNoDatabaseConnection` (`ConfigurationFilesTest.java`) |
| 61 | Shared settings: no SQL logging, guest | `sharedSettingsDoNotLogSqlAndRunAsGuest` (`ConfigurationFilesTest.java`) |
| 62 | Default profile | `developmentIsTheDefaultProfile` (`ConfigurationFilesTest.java`) |
| 63 | Development settings | `developmentProfileUsesLocalDatabaseLogsSqlAndRunsAsAdmin` (`ConfigurationFilesTest.java`) |
| 64 | Deployed origin allowed | `preflightFromDeployedOriginSucceeds` (`security/DeploymentSettingsTest.java`) |
| 65 | Development origin refused | `preflightFromDevelopmentOriginIsRejectedOnceOriginsAreChanged` (`security/DeploymentSettingsTest.java`) |
| 66 | Role set at deployment | `currentUserHasTheConfiguredRole` (`security/DeploymentSettingsTest.java`) |

Run one test from `backend/app-service`: `.\mvnw.cmd test -Dtest=<Class>#<method>`.
