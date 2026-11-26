import { useState } from "react";
import { Link } from "react-router";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageTitle from "../components/PageTitle.jsx";
import TextField from "../components/TextField.jsx";
import { login } from "../lib/api.js";
import { HOME_BY_ROLE } from "../lib/auth.js";
import { goTo } from "../lib/browser.js";
import { formErrors, NO_ERRORS } from "../lib/forms.js";
import { t } from "../lib/i18n/index.js";
import { DEMO_PASSWORD, getDb } from "../lib/mock/db.js";

// Connexion. Mock: checks the demo accounts; later: the auth-service returns a JWT.
export default function LoginPage() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState(NO_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  const change = (name) => (event) =>
    setValues({ ...values, [name]: event.target.value });

  async function submit(event) {
    event.preventDefault(); // the form is sent by our code, not by the browser
    setErrors(NO_ERRORS);
    setSubmitting(true);
    try {
      const user = await login(values);
      goTo(HOME_BY_ROLE[user.role]);
    } catch (error) {
      setErrors(formErrors(error));
      setSubmitting(false);
    }
  }

  return (
    <main className="inner page">
      <PageTitle title={t("pages.signIn")} />
      <div className="card card--narrow form">
        <h1>{t("signIn.title")}</h1>
        <p className="muted">{t("signIn.lead")}</p>
        <form className="form" noValidate onSubmit={submit}>
          <ErrorAlert>{errors.alert}</ErrorAlert>
          <TextField
            id="signin-email"
            label={t("signIn.email")}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={change("email")}
            error={errors.fields.email}
          />
          <TextField
            id="signin-password"
            label={t("signIn.password")}
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={change("password")}
            error={errors.fields.password}
          />
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
