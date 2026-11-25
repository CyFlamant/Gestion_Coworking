import { Route, Routes } from "react-router";
import Layout from "./components/Layout.jsx";
import HoursPage from "./pages/HoursPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";

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
        <Route path="/" element={<Placeholder title="Accueil" />} />
        <Route
          path="/espaces"
          element={<Placeholder title="Espaces disponibles" />}
        />
        <Route path="/connexion" element={<Placeholder title="Connexion" />} />
        <Route
          path="/inscription"
          element={<Placeholder title="Inscription" />}
        />
        <Route path="/reserver" element={<Placeholder title="Réserver" />} />
        <Route
          path="/mes-reservations"
          element={<Placeholder title="Mes réservations" />}
        />
        <Route
          path="/admin/reservations"
          element={<Placeholder title="Réservations" />}
        />
        <Route
          path="/admin/espaces"
          element={<Placeholder title="Espaces" />}
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/horaires" element={<HoursPage />} />
        <Route path="/mentions-legales" element={<LegalPage />} />
        <Route path="*" element={<Placeholder title="Page introuvable" />} />
      </Route>
    </Routes>
  );
}
