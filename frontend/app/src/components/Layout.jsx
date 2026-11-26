// Page shell: user bar, header with role-based navigation, footer. The current page renders in <Outlet />.
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { logout } from "../lib/api.js";
import { getCurrentUser, roleOf } from "../lib/auth.js";
import { brand } from "../lib/brand.js";
import { getLanguage, LANGUAGES, t } from "../lib/i18n/index.js";
import DevBar from "./DevBar.jsx";

const YEAR = new Date().getFullYear();
const NAV = {
  GUEST: [
    { to: "/espaces", label: "nav.spaces" },
    { to: "/connexion", label: "nav.signIn" },
  ],
  CLIENT: [
    { to: "/reserver", label: "nav.book" },
    { to: "/mes-reservations", label: "nav.myBookings" },
  ],
  ADMIN: [
    { to: "/admin/reservations", label: "nav.adminBookings" },
    { to: "/admin/espaces", label: "nav.adminSpaces" },
  ],
};

export default function Layout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Runs once after the first render: asks the API who is signed in.
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null)) // backend unreachable in real mode: carry on as a guest
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  const role = roleOf(user);

  async function signOut() {
    try {
      await logout();
    } catch {
      // No auth-service yet in real mode: nothing to sign out from.
    }
    window.location.href = "/"; // full reload: the layout asks again who is signed in
  }

  return (
    <>
      {user && (
        <div className="user-bar">
          <div className="inner">
            <UserBadge user={user} />
          </div>
        </div>
      )}
      <header className="site-header">
        <div className="inner site-header__inner">
          <Link className="brand" to="/">
            {brand.logo ? (
              <img className="brand__logo" src={brand.logo} alt={brand.name} />
            ) : (
              <span className="brand__wordmark">{brand.name}</span>
            )}
            <span className="brand__tagline">{brand.tagline}</span>
          </Link>
          <button
            type="button"
            className="btn btn--small nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {t("nav.menu")}
          </button>
          <nav
            className={menuOpen ? "site-nav is-open" : "site-nav"}
            id="site-nav"
            aria-label={t("nav.main")}
          >
            <ul className="site-nav__list">
              {NAV[role].map((item) => (
                <li key={item.to}>
                  <NavLink
                    className="site-nav__link"
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(item.label)}
                  </NavLink>
                </li>
              ))}
              {user && (
                <li>
                  <button
                    type="button"
                    className="site-nav__link"
                    onClick={signOut}
                  >
                    {t("nav.logout")}
                  </button>
                </li>
              )}
            </ul>
          </nav>
          <LanguageSwitch />
        </div>
      </header>

      <Outlet context={user} />

      <footer className="site-footer">
        <div className="inner site-footer__inner">
          <ul className="site-footer__links">
            <li>
              <Link to="/mentions-legales">{t("footer.legal")}</Link>
            </li>
            <li>
              <Link to="/contact">{t("footer.contact")}</Link>
            </li>
            <li>
              <Link to="/horaires">{t("footer.hours")}</Link>
            </li>
          </ul>
          <p className="muted">
            © {YEAR} {brand.name}
          </p>
        </div>
      </footer>

      {import.meta.env.DEV && <DevBar role={role} />}
    </>
  );
}

function UserBadge({ user }) {
  return (
    <span className="user-badge">
      <span className="user-badge__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </span>
      {user.firstName}
    </span>
  );
}

// Visual only for now: French is the only language.
function LanguageSwitch() {
  return (
    <div className="lang-switch" role="group" aria-label={t("nav.language")}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          className="lang-switch__btn"
          lang={lang}
          aria-pressed={lang === getLanguage()}
          title={lang === getLanguage() ? undefined : t("nav.languageSoon")}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
