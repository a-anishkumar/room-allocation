// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (!user) return null;

  return (
    <nav className="navbar">
      {/* Branding */}
      <div className="navbar-brand">
        <img src={logo} alt="Kongu Hostel Logo" className="navbar-logo" />
        <h1 className="navbar-title">KONGU HOSTELS</h1>
      </div>

      {/* Navigation Links */}
      <ul className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
        <li>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMenuOpen(false)}>Profile</NavLink>
        </li>
        <li>
          <NavLink to="/room-allocation" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMenuOpen(false)}>Rooms</NavLink>
        </li>
        <li>
          <NavLink to="/feedback" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMenuOpen(false)}>Feedback</NavLink>
        </li>
        <li>
          <NavLink to="/leave" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMenuOpen(false)}>Leave</NavLink>
        </li>
        <li>
          <NavLink to="/schedule" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMenuOpen(false)}>Menu</NavLink>
        </li>
        <li>
          <NavLink to="/rules" className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setIsMenuOpen(false)}>Rules</NavLink>
        </li>
      </ul>

      {/* User Info */}
      <div className="navbar-user">
        <span className="user-welcome">Welcome, {user.email}</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Hamburger Toggle */}
      <div className={`navbar-toggle ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
    </nav>
  );
}
