import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSpace, deleteSpace, getAvailableSpaces, getSpace, getSpaces } from "./api.js";
import { getCurrentUser } from "./auth.js";
import { BASE_URL, setApiMode } from "./config.js";

// Contract tests: api.js in real mode, against answers recorded from the app-service
// (Spring Boot, 27 November 2026). If the back end changes its answers, record them again here.
const RECORDED = {
  me: '{"id":"00000000-0000-0000-0000-000000000001","role":"CLIENT"}',
  list: '[{"id":53,"name":"Contrat test","type":"OFFICE","hourRate":4.50,"halfDayRate":14.00,"dayRate":25.00,"monthRate":250.00}]',
  created:
    '{"id":53,"name":"Contrat test","type":"OFFICE","hourRate":4.5,"halfDayRate":14,"dayRate":25,"monthRate":250}',
  invalidFields:
    '{"detail":"Données invalides","instance":"/api/spaces","status":400,"title":"Bad Request","errors":{"type":"Champ obligatoire","hourRate":"Le tarif ne peut pas être négatif","name":"Champ obligatoire"}}',
  notJson:
    '{"detail":"Format JSON invalide","instance":"/api/spaces","status":400,"title":"Bad Request"}',
  forbidden:
    '{"detail":"Accès refusé","instance":"/api/spaces","status":403,"title":"Forbidden"}',
  notFound:
    '{"detail":"Espace introuvable : 999999","instance":"/api/spaces/999999","status":404,"title":"Not Found"}',
  hasBookings:
    '{"detail":"Impossible de supprimer l\'espace 53 : il a des réservations","instance":"/api/spaces/53","status":409,"title":"Conflict"}',
  available:
    '[{"id":118,"name":"Contrat test","type":"OFFICE","hourRate":4.50,"halfDayRate":14.00,"dayRate":25.00,"monthRate":250.00}]',
  invalidSlot:
    '{"detail":"Données invalides","instance":"/api/spaces/available","status":400,"title":"Bad Request","errors":{"end":"La fin doit être après le début"}}',
};

const SPACE = { name: "Contrat test", type: "OFFICE", hourRate: 4.5, halfDayRate: 14, dayRate: 25, monthRate: 250 };

// The next fetch answers with this status and body; errors come as application/problem+json.
function answer(status, body) {
  const type = status >= 400 ? "application/problem+json" : "application/json";
  fetch.mockResolvedValue(new Response(body ?? null, { status, headers: body ? { "Content-Type": type } : {} }));
}

// Runs the call and returns what it throws.
async function errorOf(call) {
  try {
    await call();
  } catch (error) {
    return error;
  }
  throw new Error("the call did not fail");
}

beforeEach(() => {
  setApiMode("real");
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  setApiMode(null);
  vi.unstubAllGlobals();
});

describe("api (real back end)", () => {
  it("reads the space list, with the rates as numbers", async () => {
    answer(200, RECORDED.list);
    expect(await getSpaces()).toEqual([{ id: 53, ...SPACE }]);
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/spaces`, expect.objectContaining({ method: "GET" }));
  });

  it("sends a new space as JSON and returns it with its id", async () => {
    answer(201, RECORDED.created);
    expect(await createSpace(SPACE)).toEqual({ id: 53, ...SPACE });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/api/spaces`);
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toEqual(SPACE);
  });

  it("returns nothing once a space is deleted", async () => {
    answer(204);
    expect(await deleteSpace(53)).toBeNull();
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/spaces/53`, expect.objectContaining({ method: "DELETE" }));
  });

  it("gives the message of each invalid field", async () => {
    answer(400, RECORDED.invalidFields);
    const error = await errorOf(() => createSpace({ ...SPACE, name: "", type: undefined, hourRate: -1 }));
    expect(error).toMatchObject({ status: 400, detail: "Données invalides" });
    expect(error.errors).toEqual({
      type: "Champ obligatoire",
      hourRate: "Le tarif ne peut pas être négatif",
      name: "Champ obligatoire",
    });
  });

  it("gives the message of a request the back end cannot read, with no field errors", async () => {
    answer(400, RECORDED.notJson);
    const error = await errorOf(() => createSpace(SPACE));
    expect(error).toMatchObject({ status: 400, detail: "Format JSON invalide", errors: {} });
  });

  it("gives the back end's message when a client is refused", async () => {
    answer(403, RECORDED.forbidden);
    expect(await errorOf(() => createSpace(SPACE))).toMatchObject({ status: 403, detail: "Accès refusé" });
  });

  it("gives the back end's message when a guest must sign in first", async () => {
    answer(401);
    expect(await errorOf(() => createSpace(SPACE))).toMatchObject({
      status: 401,
      detail: "Vous devez être connecté.",
    });
  });

  it("gives the back end's message for a space that does not exist", async () => {
    answer(404, RECORDED.notFound);
    expect(await errorOf(() => getSpace(999999))).toMatchObject({
      status: 404,
      detail: "Espace introuvable : 999999",
    });
  });

  it("gives the back end's message when a space with bookings cannot be deleted", async () => {
    answer(409, RECORDED.hasBookings);
    expect(await errorOf(() => deleteSpace(53))).toMatchObject({
      status: 409,
      detail: "Impossible de supprimer l'espace 53 : il a des réservations",
    });
  });

  it("searches the free spaces of a slot, with the type when given", async () => {
    answer(200, RECORDED.available);
    const found = await getAvailableSpaces({ start: "2026-12-01T09:00:00", end: "2026-12-01T13:00:00", type: "OFFICE" });
    expect(found).toEqual([{ id: 118, ...SPACE }]);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(`${url.origin}${url.pathname}`).toBe(`${BASE_URL}/api/spaces/available`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      start: "2026-12-01T09:00:00",
      end: "2026-12-01T13:00:00",
      type: "OFFICE",
    });
  });

  it("gives the message of a search slot whose end is not after its start", async () => {
    answer(400, RECORDED.invalidSlot);
    const error = await errorOf(() => getAvailableSpaces({ start: "2026-12-01T13:00:00", end: "2026-12-01T09:00:00" }));
    expect(error).toMatchObject({ status: 400, detail: "Données invalides" });
    expect(error.errors).toEqual({ end: "La fin doit être après le début" });
  });

  it("says the server cannot be reached", async () => {
    fetch.mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await errorOf(() => getSpaces())).toMatchObject({
      status: 0,
      detail: "Impossible de joindre le serveur.",
    });
  });
});

describe("getCurrentUser (real back end)", () => {
  it("returns the signed-in user's id and role", async () => {
    answer(200, RECORDED.me);
    expect(await getCurrentUser()).toEqual({ id: "00000000-0000-0000-0000-000000000001", role: "CLIENT" });
    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/me`, expect.objectContaining({ method: "GET" }));
  });

  it("returns null for a guest", async () => {
    answer(401);
    expect(await getCurrentUser()).toBeNull();
  });
});

describe("getAvailableSpaces (mock)", () => {
  beforeEach(() => setApiMode("mock"));

  it("refuses a slot whose end is not after its start, like the back end", async () => {
    const error = await errorOf(() => getAvailableSpaces({ start: "2026-12-01T13:00:00", end: "2026-12-01T09:00:00" }));
    expect(error).toMatchObject({ status: 400, detail: "Données invalides" });
    expect(error.errors).toEqual({ end: "La fin doit être après le début" });
  });
});
