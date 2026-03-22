import { useAuth } from "./auth/useAuth";
import Navbar from "./components/Navbar";
import AppRoutes from "./routing/AppRoutes";
import ScrollManager from "./routing/ScrollManager";
import { getNavbarVariant } from "./routing/routes";
import "./styles/App.css";

function App() {
  const { loading: authLoading, user: authUser } = useAuth();
  const navbarVariant = getNavbarVariant(authUser);

  return (
    <div className="app-shell">
      <Navbar variant={navbarVariant} />
      <ScrollManager />
      <AppRoutes authLoading={authLoading} authUser={authUser} />
    </div>
  );
}

export default App;
