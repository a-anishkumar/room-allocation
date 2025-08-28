// src/components/admin/FeedbackManagement.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/FeedbackManagement.css";

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "resolved", "pending"
  const [urgencyFilter, setUrgencyFilter] = useState("all"); // "all", "high", "medium", "low"

  useEffect(() => {
    fetchFeedbacks();
  }, [filter, urgencyFilter]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    let query = supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
    
    // Apply filters
    if (filter !== "all") {
      query = query.eq("resolved", filter === "resolved");
    }
    
    if (urgencyFilter !== "all") {
      query = query.eq("urgency", urgencyFilter);
    }
    
    const { data, error } = await query;
    if (!error) setFeedbacks(data);
    setLoading(false);
  };

  const markResolved = async (id) => {
    const { error } = await supabase.from("feedbacks").update({ resolved: true }).eq("id", id);
    if (!error) {
      fetchFeedbacks();
    } else {
      alert("Failed to update feedback");
    }
  };

  const markUnresolved = async (id) => {
    const { error } = await supabase.from("feedbacks").update({ resolved: false }).eq("id", id);
    if (!error) {
      fetchFeedbacks();
    } else {
      alert("Failed to update feedback");
    }
  };

  const deleteFeedback = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      const { error } = await supabase.from("feedbacks").delete().eq("id", id);
      if (!error) {
        fetchFeedbacks();
      } else {
        alert("Failed to delete feedback");
      }
    }
  };

  const getUrgencyBadgeClass = (urgency) => {
    switch (urgency) {
      case "high": return "urgency-badge urgency-high";
      case "medium": return "urgency-badge urgency-medium";
      case "low": return "urgency-badge urgency-low";
      default: return "urgency-badge";
    }
  };

  const getStatusBadgeClass = (resolved) => {
    return resolved ? "status-badge status-resolved" : "status-badge status-pending";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="feedback-management-container">
      <div className="feedback-header">
        <h2>Feedback Management</h2>
        <p>Manage and respond to student feedback</p>
      </div>

      <div className="feedback-controls">
        <div className="filter-section">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Feedback</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Urgency:</label>
            <select 
              value={urgencyFilter} 
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <button onClick={fetchFeedbacks} className="refresh-btn">
            ↻ Refresh
          </button>
        </div>
        
        <div className="stats-section">
          <div className="stat-card">
            <span className="stat-number">{feedbacks.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{feedbacks.filter(f => !f.resolved).length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{feedbacks.filter(f => f.resolved).length}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading feedback...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No feedback found</h3>
          <p>There are no feedback entries matching your current filters.</p>
        </div>
      ) : (
        <div className="feedback-table-container">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Message</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map(feedback => (
                <tr key={feedback.id} className={feedback.resolved ? "resolved" : "pending"}>
                  <td>
                    <div className="student-info">
                      <div className="student-name">{feedback.name}</div>
                      {feedback.email && (
                        <div className="student-email">{feedback.email}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="feedback-message">
                      {feedback.message}
                    </div>
                  </td>
                  <td>
                    <span className={getUrgencyBadgeClass(feedback.urgency)}>
                      {feedback.urgency}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(feedback.resolved)}>
                      {feedback.resolved ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="feedback-date">
                      {formatDate(feedback.created_at)}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!feedback.resolved ? (
                        <button 
                          onClick={() => markResolved(feedback.id)}
                          className="action-btn resolve-btn"
                          title="Mark as resolved"
                        >
                          ✓
                        </button>
                      ) : (
                        <button 
                          onClick={() => markUnresolved(feedback.id)}
                          className="action-btn unresolve-btn"
                          title="Mark as pending"
                        >
                          ↩
                        </button>
                      )}
                      <button 
                        onClick={() => deleteFeedback(feedback.id)}
                        className="action-btn delete-btn"
                        title="Delete feedback"
                      >
                        🗑
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