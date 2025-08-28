import { supabase } from "./supabase";
import jsPDF from "jspdf";

// Replace with your actual logo file path (from /public or Supabase Storage)
const COLLEGE_LOGO_URL = "../src/keclogo.png"; 

export async function generateVerifiedForm(leaveId, adminSignature) {
  // Fetch leave details
  const { data: leave, error } = await supabase
    .from("leave_applications")
    .select("*")
    .eq("id", leaveId)
    .single();

  if (error) throw error;

  const doc = new jsPDF();

  // --- HEADER WITH LOGO ---
  if (COLLEGE_LOGO_URL) {
    const logoBase64 = await getImageBase64(COLLEGE_LOGO_URL);
    doc.addImage(logoBase64, "PNG", 85, 10, 40, 40); // centered logo
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Kongu Engineering College", 105, 60, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Perundurai, Erode - 638060, Tamil Nadu", 105, 68, { align: "center" });

  doc.setFontSize(14);
  doc.text("Verified Leave Certificate", 105, 85, { align: "center" });

  // --- LEAVE DETAILS ---
  doc.setFontSize(12);
  let y = 105;
  doc.text(`Name: ${leave.name}`, 20, y); y += 10;
  doc.text(`Roll No: ${leave.roll_number}`, 20, y); y += 10;
  doc.text(`Branch: ${leave.branch}`, 20, y); y += 10;
  doc.text(`Year/Sem: ${leave.year} - ${leave.semester}`, 20, y); y += 10;
  doc.text(`Hostel: ${leave.hostel_name} / Room: ${leave.room_number}`, 20, y); y += 10;
  doc.text(`Date of Stay: ${leave.date_of_stay}`, 20, y); y += 10;
  doc.text(`Reason: ${leave.reason}`, 20, y); y += 10;
  doc.text(`Status: ${leave.status}`, 20, y); y += 20;

  // --- SIGNATURES ---
  doc.text("Student Signature:", 20, y);
  if (leave.student_signature_url) {
    const studentImg = await getImageBase64(leave.student_signature_url);
    doc.addImage(studentImg, "PNG", 70, y - 5, 40, 20);
  }
  y += 40;

  doc.text("Admin Signature:", 20, y);
  if (adminSignature) {
    const adminImg = await getImageBase64(adminSignature);
    doc.addImage(adminImg, "PNG", 70, y - 5, 40, 20);
  }

  // --- FOOTER ---
  doc.setFontSize(10);
  doc.text("This certificate is system generated and does not require a seal.", 105, 280, { align: "center" });

  // Save PDF as Blob
  const pdfBlob = doc.output("blob");
  const filePath = `certificates/leave_${leaveId}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("leave-certificates")
    .upload(filePath, pdfBlob, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("leave-certificates")
    .getPublicUrl(filePath);

  const certificateUrl = urlData.publicUrl;

  await supabase
    .from("leave_applications")
    .update({ certificate_url: certificateUrl })
    .eq("id", leaveId);

  return certificateUrl;
}

async function getImageBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
