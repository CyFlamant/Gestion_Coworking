import { Route, Routes } from "react-router";
import Layout from "./components/Layout.jsx";
import RequireRole from "./components/RequireRole.jsx";
import AdminBookingsPage from "./pages/AdminBookingsPage.jsx";
import AdminSpacesPage from "./pages/AdminSpacesPage.jsx";
import BookPage from "./pages/BookPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import HoursPage from "./pages/HoursPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import SpacesPage from "./pages/SpacesPage.jsx";

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
          <Route path="/espaces" element={<SpacesPage />} />
        </Route>
        <Route element={<RequireRole roles={["GUEST"]} />}>
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<SignupPage />} />
        </Route>
        <Route element={<RequireRole roles={["CLIENT"]} />}>
          <Route path="/reserver" element={<BookPage />} />
          <Route path="/mes-reservations" element={<MyBookingsPage />} />
        </Route>
        <Route element={<RequireRole roles={["ADMIN"]} />}>
          <Route path="/admin/reservations" element={<AdminBookingsPage />} />
          <Route path="/admin/espaces" element={<AdminSpacesPage />} />
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
