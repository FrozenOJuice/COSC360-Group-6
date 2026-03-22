import { Navigate, Outlet } from "react-router-dom";
import { getLandingPath, routePaths } from "./routes";

function RouteGuard({
  authLoading,
  authUser,
  publicOnly = false,
  requiredRole = "",
}) {
  const shouldWaitForSession = authLoading && (publicOnly || requiredRole);

  if (shouldWaitForSession) {
    return <main className="page-status">Checking session...</main>;
  }

  if (requiredRole) {
    if (!authUser) {
      return <Navigate to={routePaths.login} replace />;
    }

    if (authUser.role !== requiredRole) {
      return <Navigate to={getLandingPath(authUser.role)} replace />;
    }
  }

  if (publicOnly && authUser) {
    return <Navigate to={getLandingPath(authUser.role)} replace />;
  }

  return <Outlet />;
}

export default RouteGuard;
