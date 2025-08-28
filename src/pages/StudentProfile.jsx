// src/pages/StudentProfile.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
import "../styles/StudentProfile.css";

const FLOORS = ["Ground", "First", "Second", "Third", "Dining First", "Dining Second"];
const DEPARTMENTS = [
  "Computer Scince and Design",
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFileChange = (setter) => (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB");
      return;
    }
    setter(file);
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
      if (!form[f]?.trim()) newErrors[f] = "Required";
    });

    if (!passportPhoto) newErrors.passportPhoto = "Upload required";
    if (!idCardPhoto) newErrors.idCardPhoto = "Upload required";
    if (!feesReceipt) newErrors.feesReceipt = "Upload required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user || !user.id) return alert("User not loaded yet.");

    setIsSubmitting(true);

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

      const passportUrl = await uploadFile(passportPhoto, "passport");
      const idCardUrl = await uploadFile(idCardPhoto, "idcard");
      const feesUrl = await uploadFile(feesReceipt, "fees");

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
      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Submit error:", err.message);
      alert("Error saving profile: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-profile-container">
      <h2>Student Profile</h2>
      <form className="student-profile-form" onSubmit={handleSubmit}>
        {/* Floor & Room */}
        <label>Floor *</label>
        <select name="floor" value={form.floor} onChange={onChange}>
          <option value="">Select Floor</option>
          {FLOORS.map(f => <option key={f}>{f}</option>)}
        </select>
        {errors.floor && <span className="error">{errors.floor}</span>}

        <label>Room Number *</label>
        <input type="text" name="roomNo" value={form.roomNo} onChange={onChange} />
        {errors.roomNo && <span className="error">{errors.roomNo}</span>}

        <label>Department *</label>
        <select name="department" value={form.department} onChange={onChange}>
          <option value="">Select Department</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        {errors.department && <span className="error">{errors.department}</span>}

        <label>Roll Number *</label>
        <input type="text" name="rollNo" value={form.rollNo} onChange={onChange} />
        {errors.rollNo && <span className="error">{errors.rollNo}</span>}

        <label>Name *</label>
        <input type="text" name="name" value={form.name} onChange={onChange} />
        {errors.name && <span className="error">{errors.name}</span>}

        <label>Year *</label>
        <select name="year" value={form.year} onChange={onChange}>
          <option value="">Select Year</option>
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>
        {errors.year && <span className="error">{errors.year}</span>}

        <label>Section *</label>
        <select name="section" value={form.section} onChange={onChange}>
          <option value="">Select Section</option>
          {SECTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        {errors.section && <span className="error">{errors.section}</span>}

        <label>Mobile Number *</label>
        <input type="text" name="mobile" value={form.mobile} onChange={onChange} />
        {errors.mobile && <span className="error">{errors.mobile}</span>}

        <label>Whatsapp Number *</label>
        <input type="text" name="whatsapp" value={form.whatsapp} onChange={onChange} />
        {errors.whatsapp && <span className="error">{errors.whatsapp}</span>}

        <label>Email *</label>
        <input type="email" name="email" value={form.email} readOnly />

        <label>Blood Group *</label>
        <select name="bloodGroup" value={form.bloodGroup} onChange={onChange}>
          <option value="">Select Blood Group</option>
          {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
        </select>
        {errors.bloodGroup && <span className="error">{errors.bloodGroup}</span>}

        <label>Father's Name *</label>
        <input type="text" name="fatherName" value={form.fatherName} onChange={onChange} />
        {errors.fatherName && <span className="error">{errors.fatherName}</span>}

        <label>Father's Contact Number *</label>
        <input type="text" name="fatherContact" value={form.fatherContact} onChange={onChange} />
        {errors.fatherContact && <span className="error">{errors.fatherContact}</span>}

        <label>Father's Occupation</label>
        <input type="text" name="fatherOccupation" value={form.fatherOccupation} onChange={onChange} />

        <label>Mother's Name *</label>
        <input type="text" name="motherName" value={form.motherName} onChange={onChange} />
        {errors.motherName && <span className="error">{errors.motherName}</span>}

        <label>Mother's Contact Number *</label>
        <input type="text" name="motherContact" value={form.motherContact} onChange={onChange} />
        {errors.motherContact && <span className="error">{errors.motherContact}</span>}

        <label>Mother's Occupation</label>
        <input type="text" name="motherOccupation" value={form.motherOccupation} onChange={onChange} />

        <label>Date of Birth *</label>
        <input type="date" name="dob" value={form.dob} onChange={onChange} />
        {errors.dob && <span className="error">{errors.dob}</span>}

        <label>Address *</label>
        <textarea name="address" value={form.address} onChange={onChange}></textarea>
        {errors.address && <span className="error">{errors.address}</span>}

        <label>District *</label>
        <input type="text" name="district" value={form.district} onChange={onChange} />
        {errors.district && <span className="error">{errors.district}</span>}

        <label>Mode of Admission *</label>
        <select name="admissionMode" value={form.admissionMode} onChange={onChange}>
          <option value="">Select Mode</option>
          {ADMISSION_MODES.map(m => <option key={m}>{m}</option>)}
        </select>
        {errors.admissionMode && <span className="error">{errors.admissionMode}</span>}

        <label>Mode of Fees Payment *</label>
        <select name="feeMode" value={form.feeMode} onChange={onChange}>
          <option value="">Select Mode</option>
          {FEE_MODES.map(m => <option key={m}>{m}</option>)}
        </select>
        {errors.feeMode && <span className="error">{errors.feeMode}</span>}

        <label>Passport Size Photo *</label>
        <input type="file" accept="image/*" onChange={handleFileChange(setPassportPhoto)} />
        {errors.passportPhoto && <span className="error">{errors.passportPhoto}</span>}

        <label>ID Card Photo (Front & Back) *</label>
        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange(setIdCardPhoto)} />
        {errors.idCardPhoto && <span className="error">{errors.idCardPhoto}</span>}

        <label>Fees Receipt *</label>
        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange(setFeesReceipt)} />
        {errors.feesReceipt && <span className="error">{errors.feesReceipt}</span>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}