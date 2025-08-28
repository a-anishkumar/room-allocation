// src/components/admin/RoomRequests.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/RoomRequests.css";

export default function RoomRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "pending", "confirmed", "rejected"

  // Fetch all room allocation requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("allocations")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching allocations:", err);
      alert("Failed to fetch room requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  // Update allocation status and student can_apply
  const updateStatus = async (uuid, status) => {
    if (!uuid) return alert("Invalid allocation ID");

    try {
      // ✅ Update allocation status
      const { data: updatedAllocations, error: updateError } = await supabase
        .from("allocations")
        .update({ status })
        .eq("id", uuid)
        .select();

      if (updateError) throw updateError;
      if (!updatedAllocations || updatedAllocations.length === 0) {
        return alert("Allocation not found");
      }

      const allocation = updatedAllocations[0];

      // ✅ Update student's can_apply
      // Set can_apply to false only if the status is "confirmed"
      const canApplyValue = status === "confirmed" ? false : true;
      const { error: studentError } = await supabase
        .from("student_profiles")
        .update({ can_apply: canApplyValue })
        .eq("roll_no", allocation.reg_no);

      if (studentError) throw studentError;

      alert(`Status updated to "${status}"`);
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-badge status-confirmed";
      case "rejected":
        return "status-badge status-rejected";
      default:
        return "status-badge status-pending";
    }
  };

  if (loading) {
    return (
      <div className="room-requests-container">
        <div className="loading-spinner"></div>
        <p>Loading room requests...</p>
      </div>
    );
  }

  return (
    <div className="room-requests-container">
      <div className="room-requests-header">
        <h2>Room Allocation Requests</h2>
        <div className="filter-controls">
          <span>Filter by status:</span>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No room requests found</h3>
          <p>There are currently no room allocation requests{filter !== "all" ? ` with status "${filter}"` : ""}.</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="room-requests-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Registration No</th>
                <th>Hostel</th>
                <th>Room</th>
                <th>Bed</th>
                <th>Status</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="request-row">
                  <td>
                    <div className="student-info">
                      <div className="student-name">{r.name}</div>
                    </div>
                  </td>
                  <td>{r.reg_no}</td>
                  <td>{r.hostel}</td>
                  <td>
                    <span className="room-badge">{r.room_number}</span>
                  </td>
                  <td>
                    <span className="bed-badge">{r.bed_number}</span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(r.status)}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.receipt_url && (
                      <a 
                        href={r.receipt_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="document-link"
                      >
                        View Document
                      </a>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => updateStatus(r.id, "confirmed")}
                        className="btn-confirm"
                        disabled={r.status === "confirmed"}
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => updateStatus(r.id, "rejected")}
                        className="btn-reject"
                        disabled={r.status === "rejected"}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}