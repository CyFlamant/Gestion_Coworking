// Prototype-only panel: switch the simulated role and data source. Shown in development only (npm run dev).
import { getApiMode, setApiMode } from "../lib/config.js";
import { t } from "../lib/i18n/index.js";
import { HOME_BY_ROLE } from "../lib/auth.js";

import {
  DEMO_ADMIN_ID,
  DEMO_CLIENT_ID,
  getDb,
  resetDb,
  setSessionUserId,
} from "../lib/mock/db.js";

const SESSION_BY_ROLE = {
  GUEST: null,
  CLIENT: DEMO_CLIENT_ID,
  ADMIN: DEMO_ADMIN_ID,
};

export default function DevBar({ role }) {
  const mock = getApiMode() === "mock";
  const nameOf = (id) =>
    getDb().users.find((user) => user.id === id)?.firstName ?? "";

  // Each change reloads the page, so the layout asks again who is signed in.
  function changeRole(event) {
    setSessionUserId(SESSION_BY_ROLE[event.target.value]);
    window.location.href = HOME_BY_ROLE[event.target.value];
  }

  function changeMode(event) {
    setApiMode(event.target.value);
    window.location.reload();
  }

  function reset() {
    resetDb();
    window.location.href = "/";
  }

  return (
    <details className="devbar">
      <summary>
        {t("devbar.title")} · {t(`devbar.short.${role}`)}
      </summary>
      <div className="devbar__body">
        <div className="field">
          <label className="field__label" htmlFor="devbar-role">
            {t("devbar.role")}
          </label>
          <select
            className="select"
            id="devbar-role"
            value={role}
            disabled={!mock}
            onChange={changeRole}
          >
            <option value="GUEST">{t("devbar.roleGuest")}</option>
            <option value="CLIENT">
              {t("devbar.roleClient", { name: nameOf(DEMO_CLIENT_ID) })}
            </option>
            <option value="ADMIN">
              {t("devbar.roleAdmin", { name: nameOf(DEMO_ADMIN_ID) })}
            </option>
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="devbar-mode">
            {t("devbar.mode")}
          </label>
          <select
            className="select"
            id="devbar-mode"
            value={mock ? "mock" : "real"}
            onChange={changeMode}
          >
            <option value="mock">{t("devbar.modeMock")}</option>
            <option value="real">{t("devbar.modeReal")}</option>
          </select>
        </div>
        {!mock && <p className="devbar__note">{t("devbar.realNote")}</p>}
        {mock && (
          <button type="button" className="btn btn--small" onClick={reset}>
            {t("devbar.reset")}
          </button>
        )}
      </div>
    </details>
  );
}
