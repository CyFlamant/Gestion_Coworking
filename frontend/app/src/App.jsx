import { Route, Routes } from "react-router";
import Layout from "./components/Layout.jsx";
import RequireRole from "./components/RequireRole.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import HoursPage from "./pages/HoursPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";

// Temporary: replaced by the real pages one by one.
function Placeholder({ title }) {
  return (
    <main className="inner page">
      <h1>{title}</h1>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<RequireRole roles={["GUEST", "CLIENT"]} />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/espaces"
            element={<Placeholder title="Espaces disponibles" />}
          />
        </Route>
        <Route element={<RequireRole roles={["GUEST"]} />}>
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<SignupPage />} />
        </Route>
        <Route element={<RequireRole roles={["CLIENT"]} />}>
          <Route path="/reserver" element={<Placeholder title="Réserver" />} />
          <Route
            path="/mes-reservations"
            element={<Placeholder title="Mes réservations" />}
          />
        </Route>
        <Route element={<RequireRole roles={["ADMIN"]} />}>
          <Route
            path="/admin/reservations"
            element={<Placeholder title="Réservations" />}
          />
          <Route
            path="/admin/espaces"
            element={<Placeholder title="Espaces" />}
          />
        </Route>
        {/* Open to everyone */}
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/horaires" element={<HoursPage />} />
        <Route path="/mentions-legales" element={<LegalPage />} />
        <Route path="*" element={<Placeholder title="Page introuvable" />} />
      </Route>
    </Routes>
  );
}
