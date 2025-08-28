import React, { useState } from "react";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
import "../styles/feedback.css";

export default function Feedback() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    roll_no: "",
    department: "",
    room_no: "",
    feedback_type: "feedback",
    message: "",
    urgency: "medium"
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("feedbacks").insert([
        {
          user_id: user?.id || null,
          name: formData.name,
          roll_no: formData.roll_no,
          department: formData.department,
          room_no: formData.room_no || null,
          feedback_type: formData.feedback_type,
          message: formData.message,
          urgency: formData.urgency
        }
      ]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({
        name: "",
        roll_no: "",
        department: "",
        room_no: "",
        feedback_type: "feedback",
        message: "",
        urgency: "medium"
      });
    } catch (err) {
      console.error("Error submitting feedback:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="feedback-container">
        <div className="success-message">
          <h2>Feedback Submitted Successfully!</h2>
          <p>Thank you for your valuable feedback. We will review it and take appropriate action.</p>
          <button className="submit-btn" onClick={resetForm}>
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="header-section">
        <h2>STUDENT FEEDBACK FORM</h2>
        <p className="note">Note: Your feedback helps us improve our services and facilities.</p>
      </div>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name: *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="roll_no">Roll Number: *</label>
            <input
              type="text"
              id="roll_no"
              name="roll_no"
              value={formData.roll_no}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department">Department: *</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="room_no">Room Number:</label>
            <input
              type="text"
              id="room_no"
              name="room_no"
              value={formData.room_no}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="feedback_type">Feedback Type: *</label>
            <select
              id="feedback_type"
              name="feedback_type"
              value={formData.feedback_type}
              onChange={handleChange}
              required
            >
              <option value="feedback">General Feedback</option>
              <option value="complaint">Complaint</option>
              <option value="suggestion">Suggestion</option>
              <option value="appreciation">Appreciation</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="urgency">Urgency: *</label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="message">Message: *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="6"
            placeholder="Please provide your detailed feedback..."
            required
          ></textarea>
        </div>

        <div className="form-note">
          <p><strong>Note:</strong> Your feedback will be reviewed by the appropriate department. For urgent matters, please contact the administration directly.</p>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
