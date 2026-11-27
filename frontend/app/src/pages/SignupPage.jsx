import { useState } from "react";
import { Link } from "react-router";
import ErrorAlert from "../components/ErrorAlert.jsx";
import PageTitle from "../components/PageTitle.jsx";
import TextField from "../components/TextField.jsx";
import { useSubmit } from "../hooks/useSubmit.js";
import { register } from "../lib/api.js";
import { pageAfterSignIn } from "../lib/auth.js";
import { goTo } from "../lib/browser.js";
import { setFlash } from "../lib/flash.js";
import { t } from "../lib/i18n/index.js";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  passwordConfirm: "",
};

// Inscription. Mock: creates a CLIENT account and signs it in; later: the auth-service.
export default function SignupPage() {
  const [values, setValues] = useState(EMPTY);
  const { submit, errors, submitting } = useSubmit(
    () => register(values),
    () => {
      setFlash(t("signUp.created"));
      goTo(pageAfterSignIn("CLIENT")); // a new account is always a client
    },
  );

  // Props every field needs, built from its name: id, label, value, change handler, error.
  const fieldProps = (name) => ({
    id: `signup-${name}`,
    label: t(`signUp.${name}`),
    value: values[name],
    onChange: (event) => setValues({ ...values, [name]: event.target.value }),
    error: errors.fields[name],
  });

  return (
    <main className="inner page">
      <PageTitle title={t("pages.signUp")} />
      <div className="card card--narrow form">
        <h1>{t("signUp.title")}</h1>
        <p className="muted">{t("signUp.lead")}</p>
        <form
          className="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <ErrorAlert>{errors.alert}</ErrorAlert>
          <div className="field-row">
            <TextField
              {...fieldProps("firstName")}
              type="text"
              autoComplete="given-name"
            />
            <TextField
              {...fieldProps("lastName")}
              type="text"
              autoComplete="family-name"
            />
          </div>
          <TextField {...fieldProps("email")} type="email" autoComplete="email" />
          <TextField
            {...fieldProps("password")}
            type="password"
            autoComplete="new-password"
            hint={t("signUp.passwordHint")}
          />
          <TextField
            {...fieldProps("passwordConfirm")}
            type="password"
            autoComplete="new-password"
          />
          <div className="actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {t("signUp.submit")}
            </button>
          </div>
        </form>
        <p>
          {t("signUp.hasAccount")}{" "}
          <Link to="/connexion">{t("signUp.signInLink")}</Link>
        </p>
      </div>
    </main>
  );
}
