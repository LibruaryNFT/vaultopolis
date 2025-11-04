import React from "react";
import { Navigate } from "react-router-dom";

function WhatIsTSHOT() {
  // Redirect to TSHOT page
  return <Navigate to="/tshot" replace />;
}

export default WhatIsTSHOT;
