import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function VaultContents() {
  const navigate = useNavigate();

  // Redirect to new vault URLs
  useEffect(() => {
    navigate("/vaults/tshot", { replace: true });
  }, [navigate]);

  // This component now just redirects to the new vault URLs
  return null;
}

export default VaultContents; 