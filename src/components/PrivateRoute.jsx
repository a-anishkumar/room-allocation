// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function PrivateRoute({ children, role }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <p>Loading session...</p>; // Prevent flicker
  }

  // 🚨 If user not logged in → go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚨 If route requires a role and user doesn't match → redirect
  if (role && user.role !== role) {
    return user.role === "admin" ? (
      <Navigate to="/admin-dashboard" replace />
    ) : (
      <Navigate to="/profile" replace />   // ✅ fixed (student home)
    );
  }

  // ✅ User is authorized
  return children;
}
