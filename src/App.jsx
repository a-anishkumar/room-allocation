// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./styles/App.css";

import Login from "./pages/Login";
import StudentRoomAllocation from "./pages/StudentRoomAllocation";
import StudentProfile from "./pages/StudentProfile";
import Feedback from "./pages/Feedback";
import LeaveApplication from "./pages/LeaveApplication";
import Schedule from "./pages/Schedule";
import Rules from "./pages/Rules";

import AdminDashboard from "./pages/AdminDashboard"; // ✅ new admin page
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import { UserProvider, useUser } from "./contexts/UserContext";

function AppRoutes() {
  const { user, loading } = useUser();
  const location = useLocation();

  console.log("🟢 AppRoutes:", { user, loading, pathname: location.pathname });

  if (loading) return <p style={{ color: "white" }}>⏳ Loading session...</p>;

  return (
    <Routes>
      {/* 🔑 Login Route */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin-dashboard" : "/profile"}
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* ================== STUDENT ROUTES ================== */}
      <Route
        path="/profile"
        element={
          <PrivateRoute role="student">
            <StudentProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/room-allocation"
        element={
          <PrivateRoute role="student">
            <StudentRoomAllocation />
          </PrivateRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <PrivateRoute role="student">
            <Feedback />
          </PrivateRoute>
        }
      />
      <Route
        path="/leave"
        element={
          <PrivateRoute role="student">
            <LeaveApplication />
          </PrivateRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <PrivateRoute role="student">
            <Schedule />
          </PrivateRoute>
        }
      />
      <Route
        path="/rules"
        element={
          <PrivateRoute role="student">
            <Rules />
          </PrivateRoute>
        }
      />

      {/* ================== ADMIN ROUTES ================== */}
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* 🔀 Default Route */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin-dashboard" : "/profile"}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ❌ Catch-all Route */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate
              to={user.role === "admin" ? "/admin-dashboard" : "/profile"}
              replace
            />
          ) : (
            <Navigate to="/login" replace state={{ from: location }} />
          )
        }
      />
    </Routes>
  );
}

function AppContent() {
  const { user, loading } = useUser();

  console.log("🟢 AppContent:", { user, loading });

  if (loading) {
    return <p style={{ color: "white" }}>⏳ Checking session...</p>;
  }

  return (
    <>
      {/* ✅ Show Navbar only for students */}
      {user && user.role === "student" && <Navbar />}
      <div
        style={{
          paddingTop: user && user.role === "student" ? "70px" : "0",
        }}
      >
        <AppRoutes />
      </div>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}
