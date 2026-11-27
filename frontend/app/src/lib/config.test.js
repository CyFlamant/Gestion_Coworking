import { loadEnv } from "vite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The folder of the .env files: frontend/app, where Vitest runs.
const ENV_DIR = process.cwd();

// config.js reads the environment once, when it is loaded: load it again after each change.
async function loadConfig() {
  vi.resetModules();
  return import("./config.js");
}

describe("config", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_API_MODE", "real");
    vi.stubEnv("VITE_APP_SERVICE_URL", "https://app.exemple.be");
    vi.stubEnv("VITE_AUTH_SERVICE_URL", "https://auth.exemple.be");
  });

  afterEach(async () => {
    (await loadConfig()).setApiMode(null);
    vi.unstubAllEnvs();
  });

  it("reads the data mode and the service addresses from the environment", async () => {
    const config = await loadConfig();
    expect(config.getApiMode()).toBe("real");
    expect(config.APP_SERVICE_URL).toBe("https://app.exemple.be");
    expect(config.AUTH_SERVICE_URL).toBe("https://auth.exemple.be");
  });

  it("uses the mode chosen in the dev bar during development", async () => {
    const config = await loadConfig();
    config.setApiMode("mock");
    expect(config.getApiMode()).toBe("mock");
  });

  it("ignores a mode chosen in the dev bar in a production build", async () => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("PROD", true);
    const config = await loadConfig();
    config.setApiMode("mock");
    expect(config.getApiMode()).toBe("real");
  });
});

// The VITE_* values a mode gets from the .env files. loadEnv gives priority to process.env,
// where Vitest has already put the test values: they are unset first.
function envFilesOf(mode) {
  Object.keys(process.env)
    .filter((key) => key.startsWith("VITE_"))
    .forEach((key) => vi.stubEnv(key, undefined));
  return loadEnv(mode, ENV_DIR, "VITE_");
}

describe(".env files", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("starts the development server with the real back end", () => {
    expect(envFilesOf("development")).toEqual({
      VITE_API_MODE: "real",
      VITE_APP_SERVICE_URL: "http://localhost:8080",
      VITE_AUTH_SERVICE_URL: "http://localhost:8081",
    });
  });

  it("builds for production with the real back end", () => {
    expect(envFilesOf("production")).toMatchObject({ VITE_API_MODE: "real" });
  });

  it("runs the tests with the mock", () => {
    expect(envFilesOf("test")).toMatchObject({ VITE_API_MODE: "mock" });
  });
});
