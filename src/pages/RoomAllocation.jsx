// src/pages/RoomAllocation.jsx
import React, { useState, useEffect, useMemo } from "react";
import HostelSelector from "../components/HostelSelector";
import FloorSelector from "../components/FloorSelector";
import { supabase } from "../utils/supabase";
import "../styles/RoomAllocation.css";

const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

export default function RoomAllocation() {
  const [hostel, setHostel] = useState(HOSTELS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const [roomsData, setRoomsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const rooms = useMemo(() => genRooms(floor), [floor]);

  // Fetch all beds for selected hostel and floor
  const fetchRooms = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("hostel", hostel)
      .eq("floor", floor);

    if (error) console.error(error);
    else setRoomsData(data);

    setIsLoading(false);
  };

  // Real-time subscription
  useEffect(() => {
    fetchRooms();

    const subscription = supabase
      .from(`rooms:hostel=eq.${hostel}&floor=eq.${floor}`)
      .on("UPDATE", payload => {
        setRoomsData(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
      })
      .subscribe();

    return () => supabase.removeSubscription(subscription);
  }, [hostel, floor]);

  const handleHostelChange = (newHostel) => setHostel(newHostel);
  const handleFloorChange = (newFloor) => setFloor(newFloor);

  return (
    <div className="room-allocation-container">
      <div className="room-allocation-header">
        <h1>Hostel Room Overview</h1>
        <p>Select a hostel and floor to view room availability</p>
      </div>

      {/* Selection Toolbar */}
      <div className="selection-toolbar">
        <div className="selection-card">
          <div className="selection-header"><h3>Selection Criteria</h3></div>
          <div className="selection-body">
            <div className="form-group">
              <label htmlFor="hostel-select">Select Hostel</label>
              <HostelSelector value={hostel} onChange={handleHostelChange} id="hostel-select" disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="floor-select">Select Floor</label>
              <FloorSelector value={floor} onChange={handleFloorChange} id="floor-select" disabled={isLoading} />
            </div>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="room-grid-section">
        <div className="section-header">
          <h3>{hostel} Hostel - {floor} Floor {isLoading && <span className="loading-indicator">Loading...</span>}</h3>
        </div>

        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading room data...</p>
          </div>
        ) : (
          <div className="room-grid">
            {rooms.map(roomNo => (
              <div key={roomNo} className="room-card">
                <h4>Room {roomNo}</h4>
                <div className="beds">
                  {Array.from({ length: 4 }).map((_, bedIndex) => {
                    const room = roomsData.find(r => r.room_no === roomNo && r.bed_index === bedIndex);
                    const occupied = room?.occupied_by;

                    return (
                      <div
                        key={bedIndex}
                        className={`bed ${occupied ? 'reserved' : 'available'}`}
                      >
                        Bed {bedIndex + 1} {occupied ? " (Reserved)" : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="legend-section">
        <div className="section-header"><h3>Room Status Legend</h3></div>
        <div className="legend-items">
          <div className="legend-item available">Available</div>
          <div className="legend-item reserved">Reserved</div>
        </div>
      </div>
    </div>
  );
}
