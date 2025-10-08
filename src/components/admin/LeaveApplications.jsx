import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/LeaveManagement.css";

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSignature, setAdminSignature] = useState(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "pending", "approved", "rejected"
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adminSignatureUrl");
    if (saved) setAdminSignature(saved);
    fetchLeaves();
  }, []);

  // ✅ Fetch all leave applications
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leave_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeaves(data || []);
      setMessage("");
    } catch (error) {
      console.error("Fetch error:", error.message);
      setMessage(`Failed to fetch leave applications: ${error.message}`);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Signature upload handler
  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignatureUploading(true);
    setMessage("Uploading signature...");
    const filePath = `admin_signatures/${Date.now()}_${file.name}`;

    try {
      const { data: uploaded, error: uploadError } = await supabase.storage
        .from("leave-signatures")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/png",
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData, error: publicUrlError } =
        await supabase.storage
          .from("leave-signatures")
          .getPublicUrl(uploaded?.path || filePath);

      if (publicUrlError || !publicUrlData?.publicUrl) {
        throw new Error("Could not get public URL for signature.");
      }

      setAdminSignature(publicUrlData.publicUrl);
      localStorage.setItem("adminSignatureUrl", publicUrlData.publicUrl);
      setMessage("✅ Signature uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error.message);
      setMessage(`Failed to upload signature: ${error.message}`);
    } finally {
      setSignatureUploading(false);
    }
  };

  // ✅ Update leave status (approve/reject)
  const updateLeave = async (id, status) => {
    // Signature is optional; allow approval without it
    if (status === "approved" && signatureUploading) {
      setMessage("Signature upload is still in progress. Please wait.");
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("leave_applications")
        .update({
          status,
          updated_at: new Date(),
          admin_signature_url: status === "approved" ? adminSignature : null,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      if (status === "approved") {
        await generateVerifiedForm(id, adminSignature);
      }

      await fetchLeaves();
      setMessage(`Leave application ${status} successfully!`);
    } catch (error) {
      console.error("Update error:", error.message);
      setMessage(`Failed to update leave: ${error.message}`);
    }
  };

  // ✅ Generate verified form
  const generateVerifiedForm = async (leaveId, signatureUrl) => {
    const leave = leaves.find((l) => l.id === leaveId);
    if (!leave) {
      console.warn("Leave not found in local state for id:", leaveId);
      return;
    }

    const formContent = `
      Leave Application Verified Form

      Name: ${leave.name}
      Roll No: ${leave.roll_number}
      Branch: ${leave.branch}
      Year: ${leave.year}
      Semester: ${leave.semester}
      Hostel: ${leave.hostel_name}, Room: ${leave.room_number}
      Date of Stay: ${leave.date_of_stay} at ${leave.time}
      Reason: ${leave.reason}

      Approved & Signed by Admin ✅
    `;

    try {
      const { error: insertError } = await supabase
        .from("verified_forms")
        .insert([
          {
            leave_id: leaveId,
            user_id: leave.user_id,
            content: formContent,
            signature_url: signatureUrl || null,
          },
        ]);

      if (insertError) throw insertError;
      setMessage("Verified form created successfully.");
    } catch (error) {
      console.error("Insert verified_forms error:", error.message);
      setMessage(`Failed to generate verified form: ${error.message}`);
    }
  };

  // View leave details
  const viewLeaveDetails = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };

  // Filter leaves based on status
  const filteredLeaves = filter === "all" 
    ? leaves 
    : leaves.filter(leave => leave.status === filter);

  // Get stats for dashboard
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length
  };

  if (loading) {
    return (
      <div className="leave-management-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading leave applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leave-management-container">
      <div className="leave-management-header">
        <h2>Leave Applications Management</h2>
        <p>Review and manage student leave applications</p>
      </div>

      {message && (
        <div className={`message-alert ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon total"></div>
          <div className="stat-content">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Leaves</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"></div>
          <div className="stat-content">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved"></div>
          <div className="stat-content">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected"></div>
          <div className="stat-content">
            <span className="stat-number">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Signature upload section */}
      <div className="signature-section">
        <div className="section-header">
          <h3>Admin Signature</h3>
          <p>Upload your signature to approve leave applications</p>
        </div>
        <div className="signature-upload">
          <label className="file-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
              disabled={signatureUploading}
            />
            <span className="file-upload-button">
              {signatureUploading ? "Uploading..." : "Choose Signature File"}
            </span>
          </label>
          {adminSignature && (
            <div className="signature-preview">
              <span>Uploaded Signature:</span>
              <a href={adminSignature} target="_blank" rel="noreferrer" className="signature-link">
                View Signature
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button onClick={fetchLeaves} className="refresh-button">
          ↻ Refresh
        </button>
      </div>

      {/* Leaves table */}
      {filteredLeaves.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No leave applications found</h3>
          <p>{filter !== "all" ? `No ${filter} applications` : "No leave applications submitted yet"}</p>
        </div>
      ) : (
        <div className="leaves-table-container">
          <table className="leaves-table">
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Academic Info</th>
                <th>Leave Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className={`status-${leave.status}`}>
                  <td>
                    <div className="student-info">
                      <div className="student-name">{leave.name}</div>
                      <div className="student-roll">{leave.roll_number}</div>
                    </div>
                  </td>
                  <td>
                    <div className="academic-info">
                      <div>{leave.branch}</div>
                      <div>Year {leave.year}, Sem {leave.semester}</div>
                    </div>
                  </td>
                  <td>
                    <div className="leave-details">
                      <div className="leave-date">{leave.date_of_stay}</div>
                      <div className="leave-time">{leave.time}</div>
                      <button 
                        onClick={() => viewLeaveDetails(leave)}
                        className="view-reason-btn"
                      >
                        View Reason
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${leave.status}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {leave.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateLeave(leave.id, "approved")}
                            className="action-btn approve-btn"
                            disabled={signatureUploading}
                            title={"Approve leave"}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeave(leave.id, "rejected")}
                            className="action-btn reject-btn"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {leave.status !== "pending" && (
                        <span className="action-completed">
                          Processed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for leave details */}
      {showModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave Application Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Student Name:</label>
                  <span>{selectedLeave.name}</span>
                </div>
                <div className="detail-item">
                  <label>Roll Number:</label>
                  <span>{selectedLeave.roll_number}</span>
                </div>
                <div className="detail-item">
                  <label>Branch:</label>
                  <span>{selectedLeave.branch}</span>
                </div>
                <div className="detail-item">
                  <label>Year/Semester:</label>
                  <span>Year {selectedLeave.year}, Sem {selectedLeave.semester}</span>
                </div>
                <div className="detail-item">
                  <label>Hostel & Room:</label>
                  <span>{selectedLeave.hostel_name}, Room {selectedLeave.room_number}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Stay:</label>
                  <span>{selectedLeave.date_of_stay}</span>
                </div>
                <div className="detail-item">
                  <label>Time:</label>
                  <span>{selectedLeave.time}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Reason:</label>
                  <p className="leave-reason">{selectedLeave.reason}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}