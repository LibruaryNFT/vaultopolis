import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UserDataProvider from "./context/UserContext";
import { AllDayProvider } from "./context/AllDayContext";
import { AnnouncementProvider } from "./context/AnnouncementContext";
import routes from "./routes";
import MaintenancePage from "./pages/Maintenance";
import ComingSoon from "./pages/ComingSoon";

/* ——— create router from pure route config ——— */
const router = createBrowserRouter(routes);

function App() {
  const maintenanceMode = process.env.REACT_APP_MAINTENANCE_MODE === "true";
  const comingSoonMode = process.env.REACT_APP_COMING_SOON_MODE === "true";

  if (maintenanceMode) return <MaintenancePage />; // real 503 handled at edge
  if (comingSoonMode) return <ComingSoon />;

  return (
    <UserDataProvider>
      <AllDayProvider>
        <AnnouncementProvider>
          <div className="w-full min-h-screen bg-brand-secondary text-brand-text">
            <div className="relative min-h-screen">
              <RouterProvider router={router} />
            </div>
          </div>
        </AnnouncementProvider>
      </AllDayProvider>
    </UserDataProvider>
  );
}

export default App;
