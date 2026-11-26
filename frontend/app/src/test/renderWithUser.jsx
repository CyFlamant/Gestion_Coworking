import { render } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";

// Renders the given <Route>s starting at `path`, with the signed-in user passed down
// the way Layout and RequireRole do (null = guest). Pages read it with useOutletContext().
export function renderWithUser(routes, { user = null, path = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Outlet context={user} />}>{routes}</Route>
      </Routes>
    </MemoryRouter>,
  );
}
