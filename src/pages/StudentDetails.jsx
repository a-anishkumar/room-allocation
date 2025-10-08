// src/pages/StudentDetails.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
import "../styles/StudentDetails.css";

export default function StudentDetails() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    regNo: "",
    department: "",
    feesStatus: "Paid",
    transactionId: "",
    paymentDate: "",
  });

  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      console.warn("⚠ No logged-in user found.");
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      console.log("Selected file:", file);
      setReceipt(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.regNo.trim()) newErrors.regNo = "Registration number is required";
    if (!form.department.trim()) newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let receiptUrl = null;

      // Handle receipt upload
      if (receipt) {
        console.log("Uploading receipt...");
        // Optional: check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets.find((b) => b.name === "receipts")) {
          await supabase.storage.createBucket("receipts", { public: true });
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(`receipts/${Date.now()}_${receipt.name}`, receipt);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("receipts")
          .getPublicUrl(uploadData.path);

        receiptUrl = publicUrl;
      }

      // Insert student details
      const { data: studentData, error: insertError } = await supabase
        .from("students")
        .insert([
          {
            name: form.name,
            regNo: form.regNo,
            department: form.department,
            feesStatus: form.feesStatus,
            receiptUrl: receiptUrl,
            transactionId: form.transactionId,
            paymentDate: form.paymentDate,
            user_id: user.id,
          },
        ])
        .select();

      if (insertError) throw insertError;

      alert("Student details saved successfully!");
      navigate("/rooms");
    } catch (err) {
      console.error(err);
      alert("Error saving student details: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-details-container">
      <div className="student-details-overlay"></div>

      <div className="student-details-card">
        <div className="student-details-header">
          <div className="university-logo">
            <h2>Kongu Engineering College</h2>
            <p>Hostel Management System</p>
          </div>
        </div>

        <div className="form-content">
          <div className="form-intro">
            <h2>Student Information</h2>
            <p>Please provide your details to proceed with room allocation</p>
          </div>

          <form onSubmit={onSubmit} className="student-details-form">
            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  className={errors.name ? "error" : ""}
                  placeholder="Enter your full name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              {/* Reg No */}
              <div className="form-group">
                <label htmlFor="regNo">Registration Number</label>
                <input
                  id="regNo"
                  name="regNo"
                  value={form.regNo}
                  onChange={onChange}
                  required
                  className={errors.regNo ? "error" : ""}
                  placeholder="e.g., 23CDR005"
                />
                {errors.regNo && <span className="error-text">{errors.regNo}</span>}
              </div>

              {/* Department */}
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={onChange}
                  className={errors.department ? "error select-input" : "select-input"}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science and Design">Computer Science and Design</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electronics and Communication">Electronics and Communication</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Automobile Engineering">Automobile Engineering</option>
                  <option value="Food Technology">Food Technology</option>
                </select>
                {errors.department && (
                  <span className="error-text">{errors.department}</span>
                )}
              </div>

              {/* Fees */}
              <div className="form-group">
                <label htmlFor="feesStatus">Fees Status</label>
                <select
                  id="feesStatus"
                  name="feesStatus"
                  value={form.feesStatus}
                  onChange={onChange}
                  className="select-input"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="form-group full-width">
              <label htmlFor="receipt" className="file-label">
                Upload Fees Receipt (PDF/Image)
              </label>
              <div className="file-input-container">
                <input
                  id="receipt"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ opacity: 0, position: "absolute", zIndex: -1 }}
                />
                <label htmlFor="receipt" className="file-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                  </svg>
                  Choose File
                </label>
                <span className="file-name">{receipt ? receipt.name : "No file chosen"}</span>
              </div>
              <p className="file-hint">Maximum file size: 5MB</p>

              {/* Transaction ID and Payment Date */}
              <div className="form-grid" style={{ marginTop: "20px" }}>
                <div className="form-group">
                  <label htmlFor="transactionId">Transaction ID</label>
                  <input
                    id="transactionId"
                    name="transactionId"
                    value={form.transactionId}
                    onChange={onChange}
                    className={errors.transactionId ? "error" : ""}
                    placeholder="Enter transaction ID"
                  />
                  {errors.transactionId && <span className="error-text">{errors.transactionId}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="paymentDate">Payment Date</label>
                  <input
                    id="paymentDate"
                    name="paymentDate"
                    type="date"
                    value={form.paymentDate}
                    onChange={onChange}
                    className={errors.paymentDate ? "error" : ""}
                  />
                  {errors.paymentDate && <span className="error-text">{errors.paymentDate}</span>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                "Save & Continue to Room Selection"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
