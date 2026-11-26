import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import PageTitle from "../components/PageTitle.jsx";
import ShapeIcon from "../components/ShapeIcon.jsx";
import { getSpaces } from "../lib/api.js";
import { roleOf } from "../lib/auth.js";
import { brand } from "../lib/brand.js";
import { SPACE_TYPES } from "../lib/config.js";
import { formatMoney } from "../lib/dates.js";
import { t } from "../lib/i18n/index.js";

// Accueil: guests and clients (the admin home is the bookings page).
export default function HomePage() {
  const user = useOutletContext();
  const [spaces, setSpaces] = useState(null); // null until loaded
  const [error, setError] = useState(null);

  useEffect(() => {
    getSpaces()
      .then(setSpaces)
      .catch((err) => setError(t("common.loadError", { detail: err.detail })));
  }, []);

  return (
    <main>
      <PageTitle title={t("pages.home")} />
      <section className="hero">
        <div className="inner hero__inner">
          <p className="eyebrow">{brand.name}</p>
          <h1 className="hero__title">{t("home.title")}</h1>
          <p className="lead">{t("home.lead")}</p>
          <div className="actions">
            {roleOf(user) === "CLIENT" ? (
              <>
                <Link className="btn btn--primary" to="/reserver">
                  {t("home.ctaBook")}
                </Link>
                <Link className="btn" to="/mes-reservations">
                  {t("home.ctaMyBookings")}
                </Link>
              </>
            ) : (
              <>
                <Link className="btn btn--primary" to="/espaces">
                  {t("home.ctaSpaces")}
                </Link>
                <Link className="btn" to="/inscription">
                  {t("home.ctaSignUp")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="inner section">
        <h2>{t("home.spacesTitle")}</h2>
        {error && (
          <p className="alert alert--error" role="alert">
            {error}
          </p>
        )}
        {spaces && (
          <div className="type-panels">
            {SPACE_TYPES.map((type) => (
              <TypePanel
                key={type}
                type={type}
                spaces={spaces.filter((space) => space.type === type)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="inner section">
        <h2>{t("home.howTitle")}</h2>
        <ol className="steps">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <h3>{t(`home.step${n}Title`)}</h3>
              <p>{t(`home.step${n}`)}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

// One coloured panel per space type, linking to the spaces page filtered on that type.
function TypePanel({ type, spaces }) {
  const hourly = spaces.map((space) => Number(space.hourRate));
  return (
    <Link
      className={`type-panel type-panel--${type.toLowerCase()}`}
      to={`/espaces#${type.toLowerCase()}`}
    >
      <ShapeIcon type={type} />
      <h3>{t(`typesPlural.${type}`)}</h3>
      <p>{t(`typesDesc.${type}`)}</p>
      <p className="type-panel__meta">
        {t("home.spacesCount", { n: spaces.length })}
        {hourly.length > 0 &&
          ` · ${t("home.fromPrice", { price: formatMoney(Math.min(...hourly)) })}`}
      </p>
      <span className="link-arrow">{t("home.seeAvailability")}</span>
    </Link>
  );
}
