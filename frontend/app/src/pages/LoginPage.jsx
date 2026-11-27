import { useState } from "react";
import { Link } from "react-router";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageTitle from "../components/PageTitle.jsx";
import TextField from "../components/TextField.jsx";
import { useSubmit } from "../hooks/useSubmit.js";
import { login } from "../lib/api.js";
import { pageAfterSignIn } from "../lib/auth.js";
import { goTo } from "../lib/browser.js";
import { setFlash } from "../lib/flash.js";
import { t } from "../lib/i18n/index.js";
import { DEMO_PASSWORD, getDb } from "../lib/mock/db.js";

// Connexion. Mock: checks the demo accounts; later: the auth-service returns a JWT.
export default function LoginPage() {
  const [values, setValues] = useState({ email: "", password: "" });
  const { submit, errors, submitting } = useSubmit(
    () => login(values),
    (user) => {
      setFlash(t("signIn.welcome"));
      goTo(pageAfterSignIn(user.role));
    },
  );

  // Props every field needs, built from its name: id, label, value, change handler, error.
  const fieldProps = (name) => ({
    id: `signin-${name}`,
    label: t(`signIn.${name}`),
    value: values[name],
    onChange: (event) => setValues({ ...values, [name]: event.target.value }),
    error: errors.fields[name],
  });

  return (
    <main className="inner page">
      <PageTitle title={t("pages.signIn")} />
      <div className="card card--narrow form">
        <h1>{t("signIn.title")}</h1>
        <p className="muted">{t("signIn.lead")}</p>
        <form
          className="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault(); // the form is sent by our code, not by the browser
            submit();
          }}
        >
          <ErrorAlert>{errors.alert}</ErrorAlert>
          <TextField {...fieldProps("email")} type="email" autoComplete="email" />
          <TextField {...fieldProps("password")} type="password" autoComplete="current-password" />
          <div className="actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {t("signIn.submit")}
            </button>
          </div>
        </form>
        <p>
          {t("signIn.noAccount")}{" "}
          <Link to="/inscription">{t("signIn.signUpLink")}</Link>
        </p>
      </div>
      {import.meta.env.DEV && (
        <DemoAccounts
          onFill={(email) => setValues({ email, password: DEMO_PASSWORD })}
        />
      )}
    </main>
  );
}

// Prototype only: the mock's demo accounts, with buttons that fill the form.
function DemoAccounts({ onFill }) {
  const demoEmail = (role) =>
    getDb().users.find((user) => user.role === role)?.email;
  return (
    <aside className="demo-note card--narrow">
      <h2 className="field__label">{t("signIn.demoTitle")}</h2>
      <p>
        {demoEmail("CLIENT")} · {demoEmail("ADMIN")}
      </p>
      <p>{t("signIn.demoText", { password: DEMO_PASSWORD })}</p>
      <div className="actions">
        <button
          type="button"
          className="btn btn--small"
          onClick={() => onFill(demoEmail("CLIENT"))}
        >
          {t("signIn.demoClient")}
        </button>
        <button
          type="button"
          className="btn btn--small"
          onClick={() => onFill(demoEmail("ADMIN"))}
        >
          {t("signIn.demoAdmin")}
        </button>
      </div>
    </aside>
  );
}
