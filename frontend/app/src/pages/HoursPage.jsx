import PageTitle from "../components/PageTitle.jsx";
import { t } from "../lib/i18n/index.js";

export default function HoursPage() {
  return (
    <main className="inner page">
      <PageTitle title={t("pages.hours")} />
      <div className="page-head__text">
        <h1>{t("pages.hours")}</h1>
        <p className="lead">{t("stubs.hours")}</p>
      </div>
    </main>
  );
}
