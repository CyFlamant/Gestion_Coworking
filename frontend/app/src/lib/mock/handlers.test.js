import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteSpace, getAvailableSpaces } from "../api.js";
import { setApiMode } from "../config.js";
import { DEMO_ADMIN_ID, resetDb, setSessionUserId } from "./db.js";

// The mock answers like the app-service, so both modes behave the same way (see api.test.js for the back end's answers).
// The calls go through api.js, in mock mode.

// Runs the call and returns what it throws.
async function errorOf(call) {
  try {
    await call();
  } catch (error) {
    return error;
  }
  throw new Error("the call did not fail");
}

beforeEach(() => setApiMode("mock"));
afterEach(() => setApiMode(null));

describe("getAvailableSpaces (mock)", () => {
  it("refuses a slot whose end is not after its start, like the back end", async () => {
    const error = await errorOf(() => getAvailableSpaces({ start: "2026-12-01T13:00:00", end: "2026-12-01T09:00:00" }));
    expect(error).toMatchObject({ status: 400, detail: "Données invalides" });
    expect(error.errors).toEqual({ end: "La fin doit être après le début" });
  });
});

describe("deleteSpace (mock)", () => {
  beforeEach(() => setSessionUserId(DEMO_ADMIN_ID));
  afterEach(() => resetDb()); // demo data and signed-in user back to the start

  it("refuses to delete a space with bookings, naming it like the back end", async () => {
    expect(await errorOf(() => deleteSpace(1))).toMatchObject({
      status: 409,
      detail: "Impossible de supprimer l'espace « Openspace 1 » : il a des réservations",
    });
  });
});
