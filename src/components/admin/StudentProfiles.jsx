// src/components/admin/StudentProfiles.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/StudentProfile.css";

export default function StudentProfiles() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState([
    "roll_no", "name", "department", "year", "section", 
    "room_no", "floor", "mobile", "email", "can_apply"
  ]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);

    let query = supabase.from("student_profiles").select("*");

    if (search.trim() !== "") {
      query = query.or(
        `name.ilike.%${search}%,roll_no.ilike.%${search}%,department.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (!error) setStudents(data);
    else console.error("Error fetching students:", error);

    setLoading(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      fetchStudents();
    }
  };

  const toggleColumn = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const formatColumnName = (column) => {
    return column
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  // All columns based on your schema
  const allColumns = [
    "roll_no", "name", "department", "year", "section", 
    "room_no", "floor", "mobile", "whatsapp", "email",
    "blood_group", "father_name", "father_contact", 
    "mother_name", "mother_contact", "dob", "address",
    "district", "admission_mode", "fee_mode", "can_apply"
  ];

  return (
    <div className="student-profiles-container">
      <div className="student-profiles-header">
        <h2>Student Profiles</h2>
        <div className="controls-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, roll no, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleSearch}
                className="search-input"
              />
            </div>
            <button onClick={handleSearch} className="search-btn">
              Search
            </button>
          </div>
          
          <div className="column-selector-container">
            <button 
              className="column-toggle-btn"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
            >
              <span>📋</span>
              Columns
            </button>
            {showColumnSelector && (
              <div className="column-dropdown">
                <div className="dropdown-header">
                  <h4>Select Columns</h4>
                  <button 
                    className="close-dropdown"
                    onClick={() => setShowColumnSelector(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="column-checkboxes">
                  {allColumns.map((col) => (
                    <label key={col} className="column-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      <span>{formatColumnName(col)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading student profiles...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍🎓</div>
          <h3>No students found</h3>
          <p>{search ? `No results for "${search}"` : "No student profiles available"}</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-info">
            <span>Showing {students.length} student{students.length !== 1 ? 's' : ''}</span>
            {search && (
              <button 
                className="clear-search"
                onClick={() => {
                  setSearch("");
                  fetchStudents();
                }}
              >
                Clear search
              </button>
            )}
          </div>
          <div className="table-scroll-wrapper">
            <table className="student-profiles-table">
              <thead>
                <tr>
                  {selectedColumns.map((col) => (
                    <th key={col}>{formatColumnName(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="student-row">
                    {selectedColumns.map((col) => (
                      <td key={col} data-label={formatColumnName(col)}>
                        {col === "can_apply" ? (
                          <span className={`status-badge ${student[col] ? "status-eligible" : "status-ineligible"}`}>
                            {student[col] ? "Eligible" : "Not Eligible"}
                          </span>
                        ) : col.includes("_url") && student[col] ? (
                          <a 
                            href={student[col]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            View
                          </a>
                        ) : (
                          formatValue(student[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}