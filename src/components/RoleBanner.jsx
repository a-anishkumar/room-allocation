// src/components/RoleBanner.jsx
import React from "react";
import { useUser } from "../contexts/UserContext";
import "./RoleBanner.css";

export default function RoleBanner() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className={`role-banner ${user.role}`}>
      {user.role === "admin" ? "🛠 Logged in as Admin" : "👤 Logged in as Student"}
    </div>
  );
}
