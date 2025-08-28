// src/pages/Profile.jsx
import React from "react";
export default function Profile() {
  const student = JSON.parse(localStorage.getItem("studentProfile"));
  return (
    <div style={{ padding: "20px" }}>
      <h1>Profile</h1>
      <p>Name: {student?.name}</p>
      <p>Email: {student?.email}</p>
    </div>
  );
}
