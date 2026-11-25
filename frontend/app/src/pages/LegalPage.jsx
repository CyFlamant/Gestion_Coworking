import PageTitle from "../components/PageTitle.jsx";
import { t } from "../lib/i18n/index.js";

// One heading and text per section (stubs.legal in fr.js).
const SECTIONS = ["editor", "host", "data", "student"];

export default function LegalPage() {
  return (
    <main className="inner page">
      <PageTitle title={t("pages.legal")} />
      <div className="page-head__text">
        <h1>{t("pages.legal")}</h1>
      </div>
      {SECTIONS.map((section) => (
        <section key={section} className="stub__section">
          <h2>{t(`stubs.legal.${section}Title`)}</h2>
          <p className="stub__text">{t(`stubs.legal.${section}`)}</p>
        </section>
      ))}
    </main>
  );
}
