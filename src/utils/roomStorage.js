import { supabase } from "./supabase";

// Get beds for a specific room
export async function getRoomBeds(hostel, floor, roomNo) {
  const { data, error } = await supabase
    .from("rooms")
    .select("beds")
    .eq("hostel", hostel)
    .eq("floor", floor)
    .eq("room_no", roomNo)
    .single();

  if (error) throw error;
  return data?.beds || [false, false, false, false];
}

// Book a bed
export async function bookBed(hostel, floor, roomNo, bedIndex, student) {
  const beds = await getRoomBeds(hostel, floor, roomNo);

  if (beds[bedIndex]) throw new Error("Bed already occupied");

  beds[bedIndex] = true;

  // Update room in Supabase
  const { error } = await supabase
    .from("rooms")
    .update({ beds })
    .eq("hostel", hostel)
    .eq("floor", floor)
    .eq("room_no", roomNo);

  if (error) throw error;

  // Save allocation
  await supabase.from("allocations").insert([{
    student_id: student.email,
    name: student.name,
    hostel,
    floor,
    room_no: roomNo,
    bed_index: bedIndex,
  }]);
}
