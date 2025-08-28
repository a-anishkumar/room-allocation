// src/components/admin/VacantRooms.jsx
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../utils/supabase";
import "../../styles/StudentRoomAllocation.css"; // Reuse the same styles

const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

export default function VacantRooms() {
  const [hostel, setHostel] = useState(HOSTELS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const [bookedBeds, setBookedBeds] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("allocations")
        .select("hostel,floor,room_number,bed_number");

      if (!error && data) {
        const booked = {};
        data.forEach((r) => {
          const key = `${r.hostel}-${r.floor}-${r.room_number}`;
          if (!booked[key]) booked[key] = [false, false, false]; // Only 3 beds
          if (r.bed_number <= 3) { // Ensure we only consider beds 1-3
            booked[key][r.bed_number - 1] = true;
          }
        });
        setBookedBeds(booked);
      } else if (error) {
        console.warn("Error fetching allocations:", error);
      }
      setLoading(false);
    };
    fetchAllocations();
  }, []);

  const rooms = useMemo(() => genRooms(floor), [floor]);
  const getBeds = (roomNo) =>
    bookedBeds[`${hostel}-${floor}-${roomNo}`] || [false, false, false]; // Only 3 beds

  return (
    <div className="student-room-allocation">
      <div className="student-details-container">
        <div className="student-details-card">
          <div className="form-content">
            <div className="form-intro">
              <h2>Room Vacancy Status</h2>
              <p>Check current availability of hostel rooms</p>
            </div>

            {/* Filters */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="hostel">Select Hostel</label>
                <select
                  id="hostel"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  className="select-input"
                >
                  {HOSTELS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="floor">Select Floor</label>
                <select
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="select-input"
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
            <div className="form-group full-width">
              <label>
                Room Availability - {hostel} Hostel, {floor} Floor
                <span className="legend">
                  <span className="legend-item">
                    <span className="legend-color free"></span> Vacant
                  </span>
                  <span className="legend-item">
                    <span className="legend-color booked"></span> Occupied
                  </span>
                </span>
              </label>
              {loading ? (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <p>Loading room data...</p>
                </div>
              ) : (
                <div className="room-grid">
                  {rooms.map((r) => {
                    const beds = getBeds(r);
                    const freeBeds = beds.filter((b) => !b).length;
                    const occupiedBeds = beds.filter((b) => b).length;
                    const isVacant = freeBeds > 0;
                    
                    return (
<div 
  key={r} 
  className={`room-card ${isVacant ? 'room-available' : 'room-full'}`}
  style={{
    backgroundColor: isVacant ? '#f0fff4' : '#fed7d7', // Vacant = green tint, Full = red tint
    borderColor: isVacant ? '#9ae6b4' : '#feb2b2'
  }}
>

                        <h4>Room {r}</h4>
                        <div className="beds">
                          {beds.map((b, i) => (
                            <div
                              key={i}
                              className={`bed ${b ? "booked" : "free"}`}
                              title={b ? `Bed ${i+1} Occupied` : `Bed ${i+1} Available`}
                            />
                          ))}
                        </div>
                        <div className="vacancy-info">
                          {isVacant ? (
                            <span className="status-vacant">
                              {freeBeds} Vacant
                            </span>
                          ) : (
                            <span className="status-full">Full</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}