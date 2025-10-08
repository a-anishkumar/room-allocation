// src/pages/StudentRoomAllocation.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
import HostelSelector from "../components/HostelSelector";
import FloorSelector from "../components/FloorSelector";
import RoomGrid from "../components/RoomGrid";
import { saveAllocation } from "../utils/storage";
import "../styles/StudentRoomAllocation.css";

const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

export default function StudentRoomAllocation() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [form, setForm] = useState({
    email: user?.email || "",
    name: user?.user_metadata?.full_name || "",
    regNo: "",
    department: "",
    feesStatus: "Paid",
    transactionId: "",
    paymentDate: "",
    hostel: HOSTELS[0],
    floor: FLOORS[0],
  });

  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Room selection states
  const [isLoading, setIsLoading] = useState(false);
  const rooms = useMemo(() => genRooms(form.floor), [form.floor]);
  const [selected, setSelected] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedBeds, setBookedBeds] = useState({});

  // Allocation gating states
  const [existingAllocation, setExistingAllocation] = useState(null);
  const [loadingAllocation, setLoadingAllocation] = useState(true);

  useEffect(() => {
    // Always try to hydrate from auth directly (more reliable than waiting for context)
    const loadAuthAndAllocation = async () => {
      try {
        setLoadingAllocation(true);
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) {
          console.warn("auth.getUser error:", authErr);
          setLoadingAllocation(false);
          return;
        }

        const authUser = authData?.user || null;

        // Update form defaults from auth (if available)
        if (authUser) {
          setForm((prev) => ({
            ...prev,
            email: authUser.email || prev.email,
            name: authUser.user_metadata?.full_name || prev.name,
          }));

          // Check if this user already has an allocation
          const { data, error } = await supabase
            .from("allocations")
            .select("*")
            .eq("user_id", authUser.id)
            .maybeSingle(); // returns { data: null, error: null } when no rows

          if (error) {
            console.warn("allocations check error:", error);
          }
          setExistingAllocation(data || null);
        } else {
          // No logged-in user; we won't block the form here,
          // but you may want to redirect to login elsewhere.
          setExistingAllocation(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAllocation(false);
      }
    };

    loadAuthAndAllocation();
  }, []);

  useEffect(() => {
    if (!user) console.warn("⚠ No logged-in user found in context (using auth fallback).");
  }, [user]);

  // Fetch reservations from Supabase for room grid
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("allocations")
        .select("room_number, bed_number, hostel, floor");

      if (!error && data) {
        const booked = {};
        data.forEach((r) => {
          const key = `${r.hostel}-${r.floor}-${r.room_number}`;
          if (!booked[key]) booked[key] = [false, false, false, false];
          booked[key][r.bed_number - 1] = true;
        });
        setBookedBeds(booked);
      } else if (error) {
        console.warn("fetchReservations error:", error);
      }
      setIsLoading(false);
    };
    fetchReservations();
  }, [form.hostel, form.floor]);

  const getBeds = (roomNo) =>
    bookedBeds[`${form.hostel}-${form.floor}-${roomNo}`] || [false, false, false, false];

  const toggleSelect = (roomNo, bedIndex) => {
    const beds = getBeds(roomNo);
    if (beds[bedIndex]) return;
    setSelected({ roomNo, bedIndex });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, receipt: "File size must be under 5MB" });
        return;
      }
      setReceipt(file);
      setErrors({ ...errors, receipt: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.regNo.trim()) newErrors.regNo = "Registration number is required";
    if (!form.department.trim()) newErrors.department = "Department is required";
    if (!receipt) newErrors.receipt = "Receipt upload is required";
    if (!selected) newErrors.bed = "Please select a bed";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsSubmitting(true);

  try {
    // Upload receipt (mandatory)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(`receipts/${Date.now()}_${receipt.name}`, receipt);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("receipts").getPublicUrl(uploadData.path);

    const receiptUrl = publicUrl;

    // Ensure we use auth.uid()
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      throw new Error("User authentication failed");
    }
    const authUser = authData.user;

    const { roomNo, bedIndex } = selected;
    
    // Upsert (insert or update) the allocation
    const { error: upsertError } = await supabase.from("allocations").upsert(
      {
        user_id: authUser.id,
        email: authUser.email,
        name: form.name,
        reg_no: form.regNo,
        department: form.department,
        fees_status: form.feesStatus,
        receipt_url: receiptUrl,
        transaction_id: form.transactionId,
        payment_date: form.paymentDate,
        hostel: form.hostel,
        floor: form.floor,
        room_number: roomNo,
        bed_number: bedIndex + 1,
        status: 'pending',
      },
      { onConflict: 'user_id' }
    );

    // This is the key change: check if upsertError exists before throwing it.
    // A `Failed to fetch` error is a network issue, not a database error.
    if (upsertError) {
      // Handle specific database errors, e.g., unique key violation
      if (upsertError.code === "23505") { // Unique violation error code
        alert("A record for this user already exists.");
      } else {
        throw upsertError;
      }
    }

    // The rest of the success logic remains the same
    saveAllocation({
      regNo: form.regNo,
      name: form.name,
      department: form.department,
      hostel: form.hostel,
      floor: form.floor,
      roomNo,
      bedIndex,
      date: new Date().toISOString(),
    });

    setShowConfirmation(true);
    setExistingAllocation({
      user_id: authUser.id,
      email: authUser.email,
      name: form.name,
      reg_no: form.regNo,
      department: form.department,
      fees_status: form.feesStatus,
      receipt_url: receiptUrl,
      transaction_id: form.transactionId,
      payment_date: form.paymentDate,
      hostel: form.hostel,
      floor: form.floor,
      room_number: roomNo,
      bed_number: bedIndex + 1,
      status: 'pending',
    });

  } catch (err) {
    console.error("Error during submission:", err);
    alert("Error saving details: " + err.message);
  } finally {
    setIsSubmitting(false);
  }
};
  
  const closeConfirmation = () => {
    setShowConfirmation(false);
    setSelected(null);
    navigate("/dashboard");
  };

  const handleReEdit = () => {
    // Reset state to allow re-editing
    setExistingAllocation(null);
    setForm({
      email: user?.email || "",
      name: user?.user_metadata?.full_name || "",
      regNo: existingAllocation?.reg_no || "",
      department: existingAllocation?.department || "",
      feesStatus: existingAllocation?.fees_status || "Paid",
      transactionId: existingAllocation?.transaction_id || "",
      paymentDate: existingAllocation?.payment_date || "",
      hostel: existingAllocation?.hostel || HOSTELS[0],
      floor: existingAllocation?.floor || FLOORS[0],
    });
    setReceipt(null);
    setSelected({
      roomNo: existingAllocation?.room_number,
      bedIndex: (existingAllocation?.bed_number || 1) - 1,
    });
    setErrors({});
  };

  // -------- RENDER --------
  if (loadingAllocation) {
    return (
      <div className="student-room-allocation">
        <div className="student-details-container">
          <div className="student-details-card">
            <div className="form-content">
              <div className="form-intro">
                <h2>Room Allocation</h2>
                <p>Loading your allocation status...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user already submitted, show summary (keeps your UI feel)
  if (existingAllocation) {
    // The conditional rendering for re-editing.
    // If the status is 'rejected', show the re-edit button and a message.
    if (existingAllocation.status === 'rejected') {
      return (
        <div className="student-room-allocation">
          <div className="student-details-container">
            <div className="student-details-card">
              <div className="form-content">
                <div className="form-intro">
                  <h2>Room Allocation</h2>
                  <p>Your previous application was rejected. Please re-edit and resubmit your details.</p>
                </div>
                <div className="allocation-details">
                  <div className="detail-item">
                    <span className="detail-label">Rejection Reason:</span>
                    <span className="detail-value rejected-reason">{existingAllocation.rejection_reason || 'No reason provided.'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{existingAllocation.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Reg No:</span>
                    <span className="detail-value">{existingAllocation.reg_no}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{existingAllocation.department}</span>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <button onClick={handleReEdit} className="modal-btn">
                    Re-edit Application
                  </button>
                  <button onClick={() => navigate("/dashboard")} className="modal-btn cancel-btn">
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    // If the status is 'pending' or 'approved', show the regular summary.
    return (
      <div className="student-room-allocation">
        <div className="student-details-container">
          <div className="student-details-card">
            <div className="form-content">
              <div className="form-intro">
                <h2>Room Allocation</h2>
                <p>Your allocation has already been submitted. Details are below.</p>
              </div>
              <div className="allocation-details">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{existingAllocation.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Reg No:</span>
                  <span className="detail-value">{existingAllocation.reg_no}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{existingAllocation.department}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hostel:</span>
                  <span className="detail-value">{existingAllocation.hostel}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Floor:</span>
                  <span className="detail-value">{existingAllocation.floor}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Room:</span>
                  <span className="detail-value">{existingAllocation.room_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Bed:</span>
                  <span className="detail-value">{existingAllocation.bed_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Receipt:</span>
                  <span className="detail-value">
                    <a href={existingAllocation.receipt_url} target="_blank" rel="noreferrer">
                      View Receipt
                    </a>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-${existingAllocation.status}`}>{existingAllocation.status.charAt(0).toUpperCase() + existingAllocation.status.slice(1)}</span>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={() => navigate("/dashboard")} className="modal-btn">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Keep confirmation modal behavior if needed */}
        {showConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Allocation Successful!</h3>
              </div>
              <div className="modal-body">
                <div className="success-icon">✓</div>
                <p>Your room allocation has been submitted for review.</p>
              </div>
              <div className="modal-footer">
                <button onClick={closeConfirmation} className="modal-btn">
                  Continue to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fresh users (no existing allocation or rejected status) -> show your original form unchanged
  return (
    <div className="student-room-allocation">
      <div className="student-details-container">
        <div className="student-details-card">
          <div className="form-content">
            <div className="form-intro">
              <h2>Room Allocation</h2>
              <p>Please provide your details and select a room to complete your allocation</p>
            </div>
            <form onSubmit={handleSubmit} className="student-details-form">
              <div className="form-grid">
                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    readOnly
                    disabled
                    className="readonly-input"
                  />
                </div>

                {/* Name */}
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
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
                  {errors.department && <span className="error-text">{errors.department}</span>}
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

                {/* Hostel Selection */}
                <div className="form-group">
                  <label htmlFor="hostel">Select Hostel</label>
                  <HostelSelector
                    value={form.hostel}
                    onChange={(value) => setForm({ ...form, hostel: value })}
                    id="hostel"
                    disabled={isLoading}
                  />
                </div>

                {/* Floor Selection */}
                <div className="form-group">
                  <label htmlFor="floor">Select Floor</label>
                  <FloorSelector
                    value={form.floor}
                    onChange={(value) => setForm({ ...form, floor: value })}
                    id="floor"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Receipt Upload */}
              <div className="form-group full-width">
                <label htmlFor="receipt" className="file-label">
                  Upload Fees Receipt (PDF/Image) <span className="required">*</span>
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
                    Choose File
                  </label>
                  <span className="file-name">{receipt ? receipt.name : "No file chosen"}</span>
                </div>
                <p className="file-hint">Maximum file size: 5MB</p>
                {errors.receipt && <span className="error-text">{errors.receipt}</span>}
                
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

              {/* Room Grid Section */}
              <div className="form-group full-width">
                <label>
                  Room Selection - {form.hostel} Hostel, {form.floor} Floor
                </label>
                {isLoading ? (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading room data...</p>
                  </div>
                ) : (
                  <RoomGrid
                    hostel={form.hostel}
                    floor={form.floor}
                    rooms={rooms}
                    getBeds={getBeds}
                    onSelectFreeBed={toggleSelect}
                    selected={selected}
                  />
                )}
                {errors.bed && <span className="error-text">{errors.bed}</span>}
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
                  "Complete Allocation"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Allocation Submitted Successfully</h3>
            </div>
            <div className="modal-body">
              <div className="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </div>
              <p>Your room allocation request has been submitted for review.</p>
              <div className="allocation-details">
                <div className="detail-item">
                  <span className="detail-label">Hostel:</span>
                  <span className="detail-value">{form.hostel}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Floor:</span>
                  <span className="detail-value">{form.floor}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Room:</span>
                  <span className="detail-value">{selected?.roomNo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Bed:</span>
                  <span className="detail-value">{selected ? selected.bedIndex + 1 : ""}</span>
                </div>
              </div>
              <p className="confirmation-note">
                You will receive a notification once your allocation has been approved by the administrator.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={closeConfirmation} className="modal-btn">
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}