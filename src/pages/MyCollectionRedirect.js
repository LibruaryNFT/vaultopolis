import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as fcl from "@onflow/fcl";
import { useState } from "react";

/**
 * Redirect component for /my-collection route
 * Redirects to user's own profile with collection tab active
 */
function MyCollectionRedirect() {
  const navigate = useNavigate();
  const [viewer, setViewer] = useState(null);
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    fcl.currentUser().subscribe((u) => {
      setViewer(u);
      setViewerReady(true);
    });
  }, []);

  useEffect(() => {
    if (viewerReady) {
      if (viewer?.addr) {
        // Redirect to user's own profile with collection tab
        navigate(`/profile/${viewer.addr.toLowerCase()}?tab=collection`, { replace: true });
      } else {
        // Not logged in, redirect to profile page (which will prompt to connect)
        navigate("/profile?tab=collection", { replace: true });
      }
    }
  }, [viewer, viewerReady, navigate]);

  // Show loading state while determining redirect
  return (
    <div className="w-full text-brand-text text-center py-8">
      <p>Redirecting to your collection...</p>
    </div>
  );
}

export default MyCollectionRedirect;

