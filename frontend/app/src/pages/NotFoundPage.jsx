import { Link } from "react-router";
import PageTitle from "../components/PageTitle.jsx";
import { t } from "../lib/i18n/index.js";

// Any address that matches no page.
export default function NotFoundPage() {
  return (
    <main className="inner page">
      <PageTitle title={t("pages.notFound")} />
      <div className="page-head__text">
        <h1>{t("pages.notFound")}</h1>
        <p className="lead">{t("notFound.lead")}</p>
      </div>
      <div className="actions">
        <Link className="btn btn--primary" to="/">
          {t("notFound.home")}
        </Link>
      </div>
    </main>
  );
}
