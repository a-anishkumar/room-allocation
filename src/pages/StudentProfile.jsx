// src/pages/StudentProfile.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
import "../styles/StudentProfile.css";

const FLOORS = ["Ground", "First", "Second", "Third", "Dining First", "Dining Second"];
const DEPARTMENTS = [
  "Computer Science and Design",
  "Computer Science",
  "Information Technology",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electronics and Communication",
  "Electrical Engineering",
  "Automobile Engineering",
  "Food Technology",
];
const YEARS = ["I", "II", "III", "IV"];
const SECTIONS = ["A", "B", "C", "D"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ADMISSION_MODES = ["Regular", "Lateral"];
const FEE_MODES = ["Online", "Cash", "Cheque"];

export default function StudentProfile() {
  const { user } = useUser();

  const [form, setForm] = useState({
    floor: "",
    roomNo: "",
    department: "",
    rollNo: "",
    name: "",
    year: "",
    section: "",
    mobile: "",
    whatsapp: "",
    email: "",
    bloodGroup: "",
    fatherName: "",
    fatherContact: "",
    fatherOccupation: "",
    motherName: "",
    motherContact: "",
    motherOccupation: "",
    dob: "",
    address: "",
    district: "",
    admissionMode: "",
    feeMode: "",
  });

  const [passportPhoto, setPassportPhoto] = useState(null);
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [feesReceipt, setFeesReceipt] = useState(null);
  const [passportPreview, setPassportPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [feesPreview, setFeesPreview] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load existing profile
  useEffect(() => {
    if (!user) return;

    setForm(prev => ({ ...prev, email: user.email || "" }));

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        if (data) {
          setForm({
            floor: data.floor || "",
            roomNo: data.room_no || "",
            department: data.department || "",
            rollNo: data.roll_no || "",
            name: data.name || "",
            year: data.year || "",
            section: data.section || "",
            mobile: data.mobile || "",
            whatsapp: data.whatsapp || "",
            email: data.email || "",
            bloodGroup: data.blood_group || "",
            fatherName: data.father_name || "",
            fatherContact: data.father_contact || "",
            fatherOccupation: data.father_occupation || "",
            motherName: data.mother_name || "",
            motherContact: data.mother_contact || "",
            motherOccupation: data.mother_occupation || "",
            dob: data.dob || "",
            address: data.address || "",
            district: data.district || "",
            admissionMode: data.admission_mode || "",
            feeMode: data.fee_mode || "",
          });
          
          // Set preview URLs if they exist
          if (data.passport_photo_url) setPassportPreview(data.passport_photo_url);
          if (data.id_card_photo_url) setIdCardPreview(data.id_card_photo_url);
          if (data.fees_receipt_url) setFeesPreview(data.fees_receipt_url);
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      }
    };

    fetchProfile();
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (setter, setPreview) => (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB");
      return;
    }
    
    setter(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "floor", "roomNo", "department", "rollNo", "name", "year", "section",
      "mobile", "whatsapp", "bloodGroup", "fatherName", "fatherContact",
      "motherName", "motherContact", "dob", "address", "district",
      "admissionMode", "feeMode"
    ];

    requiredFields.forEach(f => {
      if (!form[f]?.trim()) newErrors[f] = "This field is required";
    });

    if (form.mobile && !/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Enter a valid 10-digit number";
    if (form.whatsapp && !/^\d{10}$/.test(form.whatsapp)) newErrors.whatsapp = "Enter a valid 10-digit number";
    if (form.fatherContact && !/^\d{10}$/.test(form.fatherContact)) newErrors.fatherContact = "Enter a valid 10-digit number";
    if (form.motherContact && !/^\d{10}$/.test(form.motherContact)) newErrors.motherContact = "Enter a valid 10-digit number";

    if (!passportPhoto && !passportPreview) newErrors.passportPhoto = "Upload required";
    if (!idCardPhoto && !idCardPreview) newErrors.idCardPhoto = "Upload required";
    if (!feesReceipt && !feesPreview) newErrors.feesReceipt = "Upload required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user || !user.id) return alert("User not loaded yet.");

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const uploadFile = async (file, folder) => {
        if (!file) return null;
        const fileName = `${user.id}_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("student-files")
          .upload(`${folder}/${fileName}`, file, { upsert: true });

        if (error) throw error;

        const { data: publicData } = supabase.storage
          .from("student-files")
          .getPublicUrl(`${folder}/${fileName}`);

        return publicData.publicUrl;
      };

      const passportUrl = passportPhoto ? await uploadFile(passportPhoto, "passport") : passportPreview;
      const idCardUrl = idCardPhoto ? await uploadFile(idCardPhoto, "idcard") : idCardPreview;
      const feesUrl = feesReceipt ? await uploadFile(feesReceipt, "fees") : feesPreview;

      const { error } = await supabase
        .from("student_profiles")
        .upsert([{
          user_id: user.id,
          floor: form.floor,
          room_no: form.roomNo,
          department: form.department,
          roll_no: form.rollNo,
          name: form.name,
          year: form.year,
          section: form.section,
          mobile: form.mobile,
          whatsapp: form.whatsapp,
          email: form.email,
          blood_group: form.bloodGroup,
          father_name: form.fatherName,
          father_contact: form.fatherContact,
          father_occupation: form.fatherOccupation,
          mother_name: form.motherName,
          mother_contact: form.motherContact,
          mother_occupation: form.motherOccupation,
          dob: form.dob,
          address: form.address,
          district: form.district,
          admission_mode: form.admissionMode,
          fee_mode: form.feeMode,
          passport_photo_url: passportUrl,
          id_card_photo_url: idCardUrl,
          fees_receipt_url: feesUrl,
        }]);

      if (error) throw error;
      setSuccessMessage("Profile saved successfully!");
    } catch (err) {
      console.error("Submit error:", err.message);
      alert("Error saving profile: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-profile-container">
      <div className="header-section">
        <h2>STUDENT PROFILE FORM</h2>
        <p className="note">Please complete all required fields to finalize your student profile</p>
      </div>
      
      {successMessage && (
        <div className="success-message">
          <h2>Profile Updated Successfully!</h2>
          <p>Your student profile has been successfully saved.</p>
          <button className="submit-btn" onClick={() => setSuccessMessage("")}>
            Continue Editing
          </button>
        </div>
      )}
      
      <form className="student-profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name: *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                className={errors.name ? 'error' : ''}
                required
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="rollNo">Roll Number: *</label>
              <input
                type="text"
                id="rollNo"
                name="rollNo"
                value={form.rollNo}
                onChange={onChange}
                className={errors.rollNo ? 'error' : ''}
                required
              />
              {errors.rollNo && <span className="error-text">{errors.rollNo}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department: *</label>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={onChange}
                className={errors.department ? 'error' : ''}
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="error-text">{errors.department}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="year">Year: *</label>
              <select
                id="year"
                name="year"
                value={form.year}
                onChange={onChange}
                className={errors.year ? 'error' : ''}
                required
              >
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.year && <span className="error-text">{errors.year}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="section">Section: *</label>
              <select
                id="section"
                name="section"
                value={form.section}
                onChange={onChange}
                className={errors.section ? 'error' : ''}
                required
              >
                <option value="">Select Section</option>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.section && <span className="error-text">{errors.section}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dob">Date of Birth: *</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={form.dob}
                onChange={onChange}
                className={errors.dob ? 'error' : ''}
                required
              />
              {errors.dob && <span className="error-text">{errors.dob}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="bloodGroup">Blood Group: *</label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={onChange}
                className={errors.bloodGroup ? 'error' : ''}
                required
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              {errors.bloodGroup && <span className="error-text">{errors.bloodGroup}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address: *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                readOnly
                className="read-only"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mobile">Mobile Number: *</label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={form.mobile}
                onChange={onChange}
                className={errors.mobile ? 'error' : ''}
                required
              />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp Number: *</label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={form.whatsapp}
                onChange={onChange}
                className={errors.whatsapp ? 'error' : ''}
                required
              />
              {errors.whatsapp && <span className="error-text">{errors.whatsapp}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Residence Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="floor">Floor: *</label>
              <select
                id="floor"
                name="floor"
                value={form.floor}
                onChange={onChange}
                className={errors.floor ? 'error' : ''}
                required
              >
                <option value="">Select Floor</option>
                {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.floor && <span className="error-text">{errors.floor}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="roomNo">Room Number: *</label>
              <input
                type="text"
                id="roomNo"
                name="roomNo"
                value={form.roomNo}
                onChange={onChange}
                className={errors.roomNo ? 'error' : ''}
                required
              />
              {errors.roomNo && <span className="error-text">{errors.roomNo}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Parent Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fatherName">Father's Name: *</label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={form.fatherName}
                onChange={onChange}
                className={errors.fatherName ? 'error' : ''}
                required
              />
              {errors.fatherName && <span className="error-text">{errors.fatherName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="fatherContact">Father's Contact Number: *</label>
              <input
                type="text"
                id="fatherContact"
                name="fatherContact"
                value={form.fatherContact}
                onChange={onChange}
                className={errors.fatherContact ? 'error' : ''}
                required
              />
              {errors.fatherContact && <span className="error-text">{errors.fatherContact}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="fatherOccupation">Father's Occupation:</label>
              <input
                type="text"
                id="fatherOccupation"
                name="fatherOccupation"
                value={form.fatherOccupation}
                onChange={onChange}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="motherName">Mother's Name: *</label>
              <input
                type="text"
                id="motherName"
                name="motherName"
                value={form.motherName}
                onChange={onChange}
                className={errors.motherName ? 'error' : ''}
                required
              />
              {errors.motherName && <span className="error-text">{errors.motherName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="motherContact">Mother's Contact Number: *</label>
              <input
                type="text"
                id="motherContact"
                name="motherContact"
                value={form.motherContact}
                onChange={onChange}
                className={errors.motherContact ? 'error' : ''}
                required
              />
              {errors.motherContact && <span className="error-text">{errors.motherContact}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="motherOccupation">Mother's Occupation:</label>
              <input
                type="text"
                id="motherOccupation"
                name="motherOccupation"
                value={form.motherOccupation}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="address">Complete Address: *</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={onChange}
                className={errors.address ? 'error' : ''}
                rows="3"
                required
              ></textarea>
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="district">District: *</label>
              <input
                type="text"
                id="district"
                name="district"
                value={form.district}
                onChange={onChange}
                className={errors.district ? 'error' : ''}
                required
              />
              {errors.district && <span className="error-text">{errors.district}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Admission Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="admissionMode">Mode of Admission: *</label>
              <select
                id="admissionMode"
                name="admissionMode"
                value={form.admissionMode}
                onChange={onChange}
                className={errors.admissionMode ? 'error' : ''}
                required
              >
                <option value="">Select Mode</option>
                {ADMISSION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.admissionMode && <span className="error-text">{errors.admissionMode}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="feeMode">Mode of Fees Payment: *</label>
              <select
                id="feeMode"
                name="feeMode"
                value={form.feeMode}
                onChange={onChange}
                className={errors.feeMode ? 'error' : ''}
                required
              >
                <option value="">Select Mode</option>
                {FEE_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.feeMode && <span className="error-text">{errors.feeMode}</span>}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Document Uploads</h3>
          <div className="form-row documents-grid">
            <div className="form-group document-upload">
              <label htmlFor="passportPhoto">Passport Size Photo (JPG/PNG, max 10MB): *</label>
              <input
                type="file"
                id="passportPhoto"
                name="passportPhoto"
                onChange={handleFileChange(setPassportPhoto, setPassportPreview)}
                className={errors.passportPhoto ? 'error' : ''}
                accept="image/*"
                required
              />
              {errors.passportPhoto && <span className="error-text">{errors.passportPhoto}</span>}
              {passportPreview && (
                <div className="preview-container">
                  <img src={passportPreview} alt="Passport preview" className="preview-image" />
                </div>
              )}
            </div>
            
            <div className="form-group document-upload">
              <label htmlFor="idCardPhoto">ID Card Photo (Front & Back, JPG/PNG/PDF, max 10MB): *</label>
              <input
                type="file"
                id="idCardPhoto"
                name="idCardPhoto"
                onChange={handleFileChange(setIdCardPhoto, setIdCardPreview)}
                className={errors.idCardPhoto ? 'error' : ''}
                accept="image/*,application/pdf"
                required
              />
              {errors.idCardPhoto && <span className="error-text">{errors.idCardPhoto}</span>}
              {idCardPreview && (
                <div className="preview-container">
                  {idCardPreview.endsWith('.pdf') ? (
                    <a href={idCardPreview} target="_blank" rel="noopener noreferrer" className="document-link">View PDF</a>
                  ) : (
                    <img src={idCardPreview} alt="ID Card preview" className="preview-image" />
                  )}
                </div>
              )}
            </div>
            
            <div className="form-group document-upload">
              <label htmlFor="feesReceipt">Fees Receipt (JPG/PNG/PDF, max 10MB): *</label>
              <input
                type="file"
                id="feesReceipt"
                name="feesReceipt"
                onChange={handleFileChange(setFeesReceipt, setFeesPreview)}
                className={errors.feesReceipt ? 'error' : ''}
                accept="image/*,application/pdf"
                required
              />
              {errors.feesReceipt && <span className="error-text">{errors.feesReceipt}</span>}
              {feesPreview && (
                <div className="preview-container">
                  {feesPreview.endsWith('.pdf') ? (
                    <a href={feesPreview} target="_blank" rel="noopener noreferrer" className="document-link">View PDF</a>
                  ) : (
                    <img src={feesPreview} alt="Fees receipt preview" className="preview-image" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-note">
          <p><strong>Note:</strong> All fields marked with an asterisk (*) are required.</p>
        </div>
        
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Saving Profile..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}