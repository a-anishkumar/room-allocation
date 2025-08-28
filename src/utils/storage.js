// Keys
const STUDENT_KEY = "studentProfile";
const OCC_KEY = "roomOccupancy"; // { [hostel]: { [floor]: { [roomNo]: [bool,bool,bool] } } }
const ALLOC_KEY = "allocations"; // array of {regNo, hostel, floor, roomNo, bedIndex}

export function saveStudentProfile(profile) {
  localStorage.setItem(STUDENT_KEY, JSON.stringify(profile));
}
export function getStudentProfile() {
  const s = localStorage.getItem(STUDENT_KEY);
  return s ? JSON.parse(s) : null;
}

function _getOccRoot() {
  const raw = localStorage.getItem(OCC_KEY);
  return raw ? JSON.parse(raw) : {};
}
function _saveOccRoot(root) {
  localStorage.setItem(OCC_KEY, JSON.stringify(root));
}

// read occupancy array of 3 booleans for a room; create if missing
export function getRoomBeds(hostel, floor, roomNo) {
  const root = _getOccRoot();
  if (!root[hostel]) root[hostel] = {};
  if (!root[hostel][floor]) root[hostel][floor] = {};
  if (!root[hostel][floor][roomNo]) root[hostel][floor][roomNo] = [false, false, false];
  _saveOccRoot(root);
  return root[hostel][floor][roomNo];
}

export function setRoomBeds(hostel, floor, roomNo, beds) {
  const root = _getOccRoot();
  if (!root[hostel]) root[hostel] = {};
  if (!root[hostel][floor]) root[hostel][floor] = {};
  root[hostel][floor][roomNo] = beds;
  _saveOccRoot(root);
}

export function saveAllocation(rec) {
  const raw = localStorage.getItem(ALLOC_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  arr.push(rec);
  localStorage.setItem(ALLOC_KEY, JSON.stringify(arr));
}
