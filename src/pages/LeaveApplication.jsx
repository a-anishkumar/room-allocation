// src/pages/LeaveApplication.jsx
import React, { useState, useRef } from "react";
import { supabase } from "../utils/supabase"; // make sure supabase client is setup

export default function LeaveApplication() {
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    branch: "",
    year: "",
    semester: "",
    hostelName: "",
    roomNumber: "",
    date: "",
    time: "",
    reason: "",
    studentMobile: "",
    parentMobile: "",
    informedAdvisor: "",
    advisorName: "",
    advisorMobile: "",
    studentSignature: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const studentSignatureRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let signatureUrl = null;

      if (formData.studentSignature) {
        const file = formData.studentSignature;
        const filePath = `signatures/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("leave-signatures")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("leave-signatures")
          .getPublicUrl(filePath);

        signatureUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("leave_applications").insert([
        {
          name: formData.name,
          roll_number: formData.rollNumber,
          branch: formData.branch,
          year: formData.year,
          semester: formData.semester,
          hostel_name: formData.hostelName,
          room_number: formData.roomNumber,
          date_of_stay: formData.date,
          time: formData.time,
          reason: formData.reason,
          student_mobile: formData.studentMobile,
          parent_mobile: formData.parentMobile,
          informed_advisor: formData.informedAdvisor,
          advisor_name: formData.advisorName || null,
          advisor_mobile: formData.advisorMobile || null,
          student_signature_url: signatureUrl,
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err.message);
      alert("Failed to submit application: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rollNumber: "",
      branch: "",
      year: "",
      semester: "",
      hostelName: "",
      roomNumber: "",
      date: "",
      time: "",
      reason: "",
      studentMobile: "",
      parentMobile: "",
      informedAdvisor: "",
      advisorName: "",
      advisorMobile: "",
      studentSignature: null,
    });
    if (studentSignatureRef.current) {
      studentSignatureRef.current.value = "";
    }
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="leave-container">
        <div className="success-message">
          <h2>Application Submitted Successfully!</h2>
          <p>Your permission request has been submitted for review.</p>
          <p>
            Please note: This form must be submitted at least two hours before
            the start of class at the Hostel Office.
          </p>
          <button className="submit-btn" onClick={resetForm}>
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="leave-container">
      <div className="header-section">
        <h2>PERMISSION FORM - STAY IN HOSTEL DURING COLLEGE HOURS</h2>
        <p className="note">Note: This form must be submitted at least two hours before the start of class at Hostel Office.</p>
      </div>
      
      <form className="leave-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">1. Name: *</label>
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
            <label htmlFor="rollNumber">2. Roll Number: *</label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="branch">3. Branch: *</label>
            <input
              type="text"
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="year">Year: *</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            >
              <option value="">Select Year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="semester">Semester: *</label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="hostelName">4. Hostel Name: *</label>
            <select
              id="hostelName"
              name="hostelName"
              value={formData.hostelName}
              onChange={handleChange}
              required
            >
              <option value="">Select Hostel</option>
              <option value="Hostel A">Dheeran</option>
              <option value="Hostel B">Ponnar</option>
              <option value="Hostel C">Sankar</option>
              <option value="Hostel D">Valluvar</option>
              <option value="Hostel E">Bharathi</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="roomNumber">5. Room Number: *</label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">6. Date of Stay: *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="time">Time: *</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="reason">7. Reason for Staying in Hostel during College Hours: *</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            placeholder="Please provide a detailed reason for your request..."
            required
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="studentMobile">8. Student Mobile Number: *</label>
            <input
              type="tel"
              id="studentMobile"
              name="studentMobile"
              value={formData.studentMobile}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="parentMobile">9. Parent's Mobile Number: *</label>
            <input
              type="tel"
              id="parentMobile"
              name="parentMobile"
              value={formData.parentMobile}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>10. Informed to Class Advisor about Leave: *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="informedAdvisor"
                value="yes"
                checked={formData.informedAdvisor === "yes"}
                onChange={handleChange}
                required
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="informedAdvisor"
                value="no"
                checked={formData.informedAdvisor === "no"}
                onChange={handleChange}
              />
              No
            </label>
          </div>
        </div>
        
        {formData.informedAdvisor === "yes" && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="advisorName">11. Class Advisor Name:</label>
              <input
                type="text"
                id="advisorName"
                name="advisorName"
                value={formData.advisorName}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="advisorMobile">Mobile No.:</label>
              <input
                type="tel"
                id="advisorMobile"
                name="advisorMobile"
                value={formData.advisorMobile}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
        
        <div className="signature-section">
          <div className="signature-box">
            <label htmlFor="studentSignature">Student Signature: *</label>
            <input
              type="file"
              id="studentSignature"
              name="studentSignature"
              onChange={handleChange}
              accept="image/*"
              required
              ref={studentSignatureRef}
            />
            {formData.studentSignature && (
              <div className="signature-preview">
                <p>Selected file: {formData.studentSignature.name}</p>
              </div>
            )}
            <p className="signature-note">Upload a clear image of your signature</p>
          </div>
        </div>
        
        <div className="form-note">
          <p><strong>Note:</strong> This application will be forwarded to your class advisor and hostel warden for approval.</p>
        </div>
        
        <button type="submit" className="submit-btn">
          Submit Application
        </button>
      </form>
      
      <style jsx>{`
        .leave-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #f8f9fa;
        }
        
        .header-section {
          text-align: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.8rem;
          font-weight: 700;
        }
        
        .note {
          color: #e74c3c;
          font-weight: 500;
          margin-bottom: 0;
          font-size: 0.9rem;
        }
        
        .leave-form {
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .full-width {
          width: 100%;
        }
        
        label {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }
        
        input, select, textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .radio-group {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        
        .radio-group label {
          display: flex;
          align-items: center;
          font-weight: normal;
          cursor: pointer;
        }
        
        .radio-group input[type="radio"] {
          margin-right: 0.5rem;
        }
        
        .signature-section {
          display: flex;
          justify-content: center;
          margin: 2rem 0;
        }
        
        .signature-box {
          width: 100%;
          max-width: 500px;
          padding: 1rem;
          border: 2px dashed #ccc;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
        }
        
        .signature-box label {
          margin-bottom: 1rem;
        }
        
        .signature-preview {
          margin-top: 1rem;
          padding: 0.5rem;
          background-color: #f1f8ff;
          border-radius: 4px;
          border-left: 4px solid #3498db;
        }
        
        .signature-preview p {
          margin: 0;
          font-size: 0.9rem;
          color: #2c3e50;
        }
        
        .signature-note {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #7f8c8d;
          font-style: italic;
        }
        
        .form-note {
          margin: 1.5rem 0;
          padding: 1rem;
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
        }
        
        .form-note p {
          margin: 0;
          color: #856404;
        }
        
        .submit-btn {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-top: 1rem;
          font-weight: 600;
          width: 100%;
        }
        
        .submit-btn:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .success-message {
          text-align: center;
          background-color: white;
          padding: 3rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .success-message h2 {
          color: #27ae60;
          margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 1rem;
          }
          
          .leave-container {
            padding: 1rem;
          }
          
          .leave-form {
            padding: 1.5rem;
          }
          
          h2 {
            font-size: 1.5rem;
          }
          
          .signature-section {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}