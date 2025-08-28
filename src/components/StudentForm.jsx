import React, { useState } from "react";

function StudentForm({ onSubmit }) {
  const [student, setStudent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (student.trim()) {
      onSubmit(student);
      setStudent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "10px 0" }}>
      <input
        type="text"
        value={student}
        placeholder="Enter student name"
        onChange={(e) => setStudent(e.target.value)}
      />
      <button type="submit">Allocate</button>
    </form>
  );
}

export default StudentForm;
