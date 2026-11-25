import PageTitle from "../components/PageTitle.jsx";
import { t } from "../lib/i18n/index.js";

export default function ContactPage() {
  return (
    <main className="inner page">
      <PageTitle title={t("pages.contact")} />
      <div className="page-head__text">
        <h1>{t("pages.contact")}</h1>
        <address className="lead stub__text">{t("stubs.contact")}</address>
      </div>
    </main>
  );
}
