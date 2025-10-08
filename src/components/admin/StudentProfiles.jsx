// src/components/admin/StudentProfiles.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/sa.css";

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

  const formatColumnName = (column) =>
    column
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const formatValue = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const allColumns = [
    "roll_no", "name", "department", "year", "section", 
    "room_no", "floor", "mobile", "whatsapp", "email",
    "blood_group", "father_name", "father_contact", 
    "mother_name", "mother_contact", "dob", "address",
    "district", "admission_mode", "fee_mode", "can_apply"
  ];

  return (
    <div className="student-profiles">
      <div className="header">
        <h2>Student Profiles</h2>
        <div className="actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, roll no, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          <div className="columns-dropdown">
            <button onClick={() => setShowColumnSelector(!showColumnSelector)}>
              Columns
            </button>
            {showColumnSelector && (
              <div className="dropdown">
                <div className="dropdown-header">
                  <strong>Select Columns</strong>
                  <button onClick={() => setShowColumnSelector(false)}>×</button>
                </div>
                <div className="dropdown-body">
                  {allColumns.map((col) => (
                    <label key={col}>
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      {formatColumnName(col)}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading student profiles...</div>
      ) : students.length === 0 ? (
        <div className="empty">No results found.</div>
      ) : (
        <div className="table-wrapper">
          <div className="table-header">
            <span>Showing {students.length} student{students.length !== 1 ? 's' : ''}</span>
            {search && (
              <button className="clear" onClick={() => {
                setSearch("");
                fetchStudents();
              }}>
                Clear Search
              </button>
            )}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {selectedColumns.map(col => (
                    <th key={col}>{formatColumnName(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    {selectedColumns.map(col => (
                      <td key={col}>
                        {col === "can_apply" ? (
                          <span className={`badge ${student[col] ? "yes" : "no"}`}>
                            {student[col] ? "Eligible" : "Not Eligible"}
                          </span>
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
