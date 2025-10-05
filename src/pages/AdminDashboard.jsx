// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import RoomRequests from "../components/admin/RoomRequests";
import StudentProfiles from "../components/admin/StudentProfiles";
import FeedbackManagement from "../components/admin/FeedbackManagement";
import LeaveApplications from "../components/admin/LeaveApplications";
import VacantRooms from "../components/admin/VacantRooms";
import MenuEditor from "../components/admin/MenuEditor";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("roomRequests");

  const renderTab = () => {
    switch (activeTab) {
      case "roomRequests":
        return <RoomRequests />;
      case "studentProfiles":
        return <StudentProfiles />;
      case "feedback":
        return <FeedbackManagement />;
      case "leaveApplications":
        return <LeaveApplications />;
      case "vacantRooms":
        return <VacantRooms />;
      case "menuEditor":
        return <MenuEditor />;
      default:
        return <RoomRequests />;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <nav className="admin-tabs">
          <button
            className={activeTab === "roomRequests" ? "active" : ""}
            onClick={() => setActiveTab("roomRequests")}
          >
            Room Requests
          </button>
          <button
            className={activeTab === "studentProfiles" ? "active" : ""}
            onClick={() => setActiveTab("studentProfiles")}
          >
            Student Profiles
          </button>
          <button
            className={activeTab === "feedback" ? "active" : ""}
            onClick={() => setActiveTab("feedback")}
          >
            Feedback
          </button>
          <button
            className={activeTab === "leaveApplications" ? "active" : ""}
            onClick={() => setActiveTab("leaveApplications")}
          >
            Leave Applications
          </button>
          <button
            className={activeTab === "vacantRooms" ? "active" : ""}
            onClick={() => setActiveTab("vacantRooms")}
          >
            Vacant Rooms
          </button>
          <button
            className={activeTab === "menuEditor" ? "active" : ""}
            onClick={() => setActiveTab("menuEditor")}
          >
            Menu Editor
          </button>
        </nav>
      </header>

      <main className="admin-tab-content">
        {renderTab()}
      </main>
    </div>
  );
}
