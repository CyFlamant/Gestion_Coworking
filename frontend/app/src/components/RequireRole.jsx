import { Navigate, Outlet, useOutletContext } from "react-router";
import { HOME_BY_ROLE, roleOf } from "../lib/auth.js";

// Layout route: shows the nested pages only to the given roles; anyone else goes to their own home page.
export default function RequireRole({ roles }) {
  const user = useOutletContext();
  const role = roleOf(user);
  if (!roles.includes(role))
    return <Navigate to={HOME_BY_ROLE[role]} replace />;
  return <Outlet context={user} />;
}
