import { Navigate, Route, Routes } from "react-router-dom";
import AdminPage from "../pages/AdminPage";
import AdminProfilePage from "../pages/AdminProfilePage";
import EmployerPage from "../pages/EmployerPage";
import EmployerProfilePage from "../pages/EmployerProfilePage";
import HomePage from "../pages/HomePage";
import JobDetailsPage from "../pages/JobDetailsPage";
import JobSeekerPage from "../pages/JobSeekerPage";
import JobSeekerProfilePage from "../pages/JobSeekerProfilePage";
import JobsPage from "../pages/JobsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RouteGuard from "./RouteGuard";
import { routePaths } from "./routes";

function AppRoutes({ authLoading, authUser }) {
  return (
    <Routes>
      <Route path={routePaths.home} element={<HomePage />} />
      <Route path={routePaths.jobs} element={<JobsPage />} />
      <Route path={routePaths.jobDetails} element={<JobDetailsPage />} />

      <Route
        element={(
          <RouteGuard
            authLoading={authLoading}
            authUser={authUser}
            publicOnly
          />
        )}
      >
        <Route path={routePaths.login} element={<LoginPage />} />
        <Route path={routePaths.register} element={<RegisterPage />} />
      </Route>

      <Route
        element={(
          <RouteGuard
            authLoading={authLoading}
            authUser={authUser}
            requiredRole="admin"
          />
        )}
      >
        <Route path={routePaths.admin} element={<AdminPage />} />
        <Route path={routePaths.adminProfile} element={<AdminProfilePage />} />
      </Route>

      <Route
        element={(
          <RouteGuard
            authLoading={authLoading}
            authUser={authUser}
            requiredRole="employer"
          />
        )}
      >
        <Route path={routePaths.employer} element={<EmployerPage />} />
        <Route
          path={routePaths.employerProfile}
          element={<EmployerProfilePage />}
        />
        <Route
          path={routePaths.jobSeekerProfileById}
          element={<JobSeekerProfilePage />}
        />
      </Route>

      <Route
        element={(
          <RouteGuard
            authLoading={authLoading}
            authUser={authUser}
            requiredRole="seeker"
          />
        )}
      >
        <Route path={routePaths.jobSeeker} element={<JobSeekerPage />} />
        <Route
          path={routePaths.jobSeekerProfile}
          element={<JobSeekerProfilePage />}
        />
      </Route>

      <Route path="*" element={<Navigate to={routePaths.home} replace />} />
    </Routes>
  );
}

export default AppRoutes;
