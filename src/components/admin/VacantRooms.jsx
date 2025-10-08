// src/components/admin/VacantRooms.jsx
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/StudentRoomAllocation.css";

const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") return Array.from({ length: 40 }, (_, i) => String(i + 1));
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

function normalizeFloor(floor) {
  if (!floor) return "";
  const f = floor.toLowerCase();
  if (f === "0" || f.includes("ground")) return "Ground";
  if (f.startsWith("1")) return "First";
  if (f.startsWith("2")) return "Second";
  if (f.startsWith("3")) return "Third";
  return floor;
}

export default function VacantRooms() {
  const [hostel, setHostel] = useState(HOSTELS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const [bookedBeds, setBookedBeds] = useState({});
  const [adminAllocation, setAdminAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("allocations")
        .select("hostel,floor,room_number,bed_number,user_id")
        .eq('status', 'confirmed');

      if (error) {
        console.warn("Error fetching allocations:", error);
        setLoading(false);
        return;
      }

      // Mark occupied beds
      const booked = {};
      data.forEach((r) => {
        // ✅ FIXED: Normalize room_number to remove leading zeros and ensure keys match
        const normalizedRoomNumber = String(parseInt(r.room_number, 10));
        const key = `${r.hostel}-${normalizeFloor(r.floor)}-${normalizedRoomNumber}`;

        if (!booked[key]) booked[key] = [false, false, false, false];
        if (r.bed_number >= 1 && r.bed_number <= 4) {
          booked[key][r.bed_number - 1] = true;
        }
      });
      setBookedBeds(booked);

      // Get logged-in admin’s allocation
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const myAlloc = data.find((r) => r.user_id === user.id);
        if (myAlloc) {
          setAdminAllocation({
            hostel: myAlloc.hostel,
            floor: normalizeFloor(myAlloc.floor),
            // Use the original room number for display if needed, but normalized for logic
            room: String(parseInt(myAlloc.room_number, 10)),
            bed: myAlloc.bed_number,
          });
        }
      }

      setLoading(false);
    };

    fetchAllocations();
  }, []);

  const rooms = useMemo(() => genRooms(floor), [floor]);
  const getBeds = (roomNo) =>
    bookedBeds[`${hostel}-${floor}-${roomNo}`] || [false, false, false, false];

  return (
    <div className="vacancy-page">
      <div className="vacancy-header">
        <h2>🏨 Hostel Room Vacancy</h2>
        <p>Check availability. Your own allocation is highlighted.</p>
      </div>

      {/* Filters */}
      <div className="vacancy-filters">
        <div className="filter-group">
          <label htmlFor="hostel">Hostel</label>
          <select
            id="hostel"
            value={hostel}
            onChange={(e) => setHostel(e.target.value)}
          >
            {HOSTELS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="floor">Floor</label>
          <select
            id="floor"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          >
            {FLOORS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="vacancy-content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading room data...</p>
          </div>
        ) : (
          <div className="room-grid">
            {rooms.map((r) => {
              const beds = getBeds(r);
              const freeBeds = beds.filter((b) => !b).length;
              const isVacant = freeBeds > 0;

              return (
                <div
                  key={r}
                  className={`room-card ${isVacant ? "available" : "full"}`}
                >
                  <h4>Room {r}</h4>
                  <div className="bed-status">
                    {beds.map((b, i) => {
                      const isAdminBed =
                        adminAllocation &&
                        adminAllocation.hostel === hostel &&
                        adminAllocation.floor === floor &&
                        adminAllocation.room === r && // 'r' is already normalized
                        adminAllocation.bed === i + 1;

                      return (
                        <span
                          key={i}
                          className={`bed ${isAdminBed
                              ? "admin-bed"
                              : b
                                ? "booked"
                                : "free"
                            }`}
                          title={
                            isAdminBed
                              ? `Your Bed (Bed ${i + 1})`
                              : b
                                ? `Bed ${i + 1} Occupied`
                                : `Bed ${i + 1} Available`
                          }
                        >
                          {i + 1}
                        </span>
                      );
                    })}
                  </div>
                  <div className="room-info">
                    {isVacant ? (
                      <span className="vacant">{freeBeds} beds free</span>
                    ) : (
                      <span className="occupied">Full</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}