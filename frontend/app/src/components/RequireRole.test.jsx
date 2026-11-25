import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useOutletContext,
} from "react-router";
import { describe, expect, it } from "vitest";
import RequireRole from "./RequireRole.jsx";

const CLIENT = { id: "2", role: "CLIENT", firstName: "Marie" };
const ADMIN = { id: "1", role: "ADMIN", firstName: "Gérant" };

// A page that shows who it received from the guard.
function WhoAmI() {
  const user = useOutletContext();
  return <p>Page client de {user.firstName}</p>;
}

// The outer route stands in for Layout: it passes the user down, as Layout does.
function renderAt(path, user) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Outlet context={user} />}>
          <Route path="/" element={<p>Accueil</p>} />
          <Route path="/admin/reservations" element={<p>Accueil admin</p>} />
          <Route element={<RequireRole roles={["CLIENT"]} />}>
            <Route path="/reserver" element={<WhoAmI />} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireRole", () => {
  it("shows the page to an allowed role", () => {
    renderAt("/reserver", CLIENT);
    expect(screen.getByText("Page client de Marie")).toBeInTheDocument();
  });

  it("sends a guest to the home page", () => {
    renderAt("/reserver", null);
    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.queryByText(/Page client/)).not.toBeInTheDocument();
  });

  it("sends an admin to the admin home page", () => {
    renderAt("/reserver", ADMIN);
    expect(screen.getByText("Accueil admin")).toBeInTheDocument();
  });
});
