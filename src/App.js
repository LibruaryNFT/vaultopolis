import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserContext from "./context/UserContext";
import routes from "./routes";
import MaintenancePage from "./pages/Maintenance";
import ComingSoon from "./pages/ComingSoon";

/* ——— force HTTPS in prod ——— */
function enforceHTTPS() {
  if (
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost"
  ) {
    window.location.href = `https://${window.location.hostname}${window.location.pathname}${window.location.search}`;
  }
}

/* ——— create router from pure route config ——— */
const router = createBrowserRouter(routes);

function App() {
  useEffect(() => enforceHTTPS(), []);

  const maintenanceMode = process.env.REACT_APP_MAINTENANCE_MODE === "true";
  const comingSoonMode = process.env.REACT_APP_COMING_SOON_MODE === "true";

  if (maintenanceMode) return <MaintenancePage />;
  if (comingSoonMode) return <ComingSoon />;

  return (
    <UserContext>
      <div className="w-full min-h-screen bg-brand-secondary text-brand-text">
        <div className="relative min-h-screen">
          <RouterProvider router={router} />
        </div>
      </div>
    </UserContext>
  );
}

export default App;
