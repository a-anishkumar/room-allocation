// src/pages/RoomSelection.jsx
import React, { useMemo, useState, useEffect } from "react";
import HostelSelector from "../components/HostelSelector";
import FloorSelector from "../components/FloorSelector";
import RoomGrid from "../components/RoomGrid";
import {
  getStudentProfile,
  getRoomBeds,
  setRoomBeds,
  saveAllocation,
} from "../utils/storage";
import { supabase } from "../utils/supabase";
import "../styles/RoomSelection.css";

const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") {
    return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  }
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

export default function RoomSelection() {
  const student = getStudentProfile();
  const [hostel, setHostel] = useState(HOSTELS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const rooms = useMemo(() => genRooms(floor), [floor]);
  const [selected, setSelected] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedBeds, setBookedBeds] = useState({}); // ✅ store Supabase reservations

  // ✅ Fetch existing reservations from Supabase when hostel/floor changes
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("reservations")
        .select("room_number, bed_number, hostel, floor");

      if (!error && data) {
        const booked = {};
        data.forEach((r) => {
          const key = `${r.hostel}-${r.floor}-${r.room_number}`;
          if (!booked[key]) booked[key] = [false, false, false, false];
          booked[key][r.bed_number - 1] = true;
        });
        setBookedBeds(booked);
      }
      setIsLoading(false);
    };

    fetchReservations();
  }, [hostel, floor]);

  const getBeds = (roomNo) => {
    const key = `${hostel}-${floor}-${roomNo}`;
    return bookedBeds[key] || [false, false, false, false];
  };

  const toggleSelect = (roomNo, bedIndex) => {
    const beds = getBeds(roomNo);
    if (beds[bedIndex]) return; // already booked
    setSelected({ roomNo, bedIndex });
  };

  const handleHostelChange = (newHostel) => {
    setIsLoading(true);
    setTimeout(() => {
      setHostel(newHostel);
      setSelected(null);
      setIsLoading(false);
    }, 200);
  };

  const handleFloorChange = (newFloor) => {
    setIsLoading(true);
    setTimeout(() => {
      setFloor(newFloor);
      setSelected(null);
      setIsLoading(false);
    }, 200);
  };

  const confirm = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const { roomNo, bedIndex } = selected;

      // ✅ Double-check in Supabase
      const { data: existing } = await supabase
        .from("reservations")
        .select("*")
        .eq("hostel", hostel)
        .eq("floor", floor)
        .eq("room_number", roomNo)
        .eq("bed_number", bedIndex + 1);

      if (existing && existing.length > 0) {
        alert("Sorry, this bed is already taken. Please select another.");
        setIsLoading(false);
        return;
      }

      // ✅ Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: studentRow } = await supabase
          .from("students")
          .select("id")
          .eq("email", user.email)
          .single();

        if (studentRow) {
          await supabase.from("reservations").insert([
            {
              student_id: studentRow.id,
              room_number: roomNo,
              bed_number: bedIndex + 1,
              hostel,
              floor,
            },
          ]);
        }
      }

      // ✅ Update UI (local + state)
      const newBeds = [...getBeds(roomNo)];
      newBeds[bedIndex] = true;
      setBookedBeds((prev) => ({
        ...prev,
        [`${hostel}-${floor}-${roomNo}`]: newBeds,
      }));

      saveAllocation({
        regNo: student?.regNo || "",
        name: student?.name || "",
        department: student?.department || "",
        hostel,
        floor,
        roomNo,
        bedIndex,
        date: new Date().toISOString(),
      });

      setShowConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setSelected(null);
  };

  return (
    <div className="room-selection-container">
      <div className="room-selection-header">
        <h1>Room Selection</h1>
        <p>Select a hostel, floor, and available bed to complete your allocation</p>
        <div className="header-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>
      </div>

      <div className="selection-section">
        <div className="selection-card">
          <div className="selection-header">
            <div className="header-icon">🏠</div>
            <h3>Selection Criteria</h3>
          </div>
          <div className="selection-body">
            <div className="form-group">
              <label htmlFor="hostel-select">
                <span className="label-icon">🏢</span> Select Hostel
              </label>
              <HostelSelector
                value={hostel}
                onChange={handleHostelChange}
                id="hostel-select"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="floor-select">
                <span className="label-icon">📶</span> Select Floor
              </label>
              <FloorSelector
                value={floor}
                onChange={handleFloorChange}
                id="floor-select"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="selection-info">
        <div className="info-card">
          <div className="info-header">
            <div className="header-icon">📋</div>
            <h3>Current Selection</h3>
          </div>
          <div className="info-body">
            <div className="info-item">
              <span className="info-label">Hostel:</span>
              <span className="info-value">{hostel}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Floor:</span>
              <span className="info-value">{floor}</span>
            </div>
            {selected && (
              <div className="selected-bed-info">
                <div className="info-item highlight">
                  <span className="info-label">Selected:</span>
                  <span className="info-value">Room {selected.roomNo}, Bed {selected.bedIndex + 1}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="room-grid-section">
        <div className="section-header">
          <h3>
            {hostel} Hostel - {floor} Floor
          </h3>
          {isLoading && <span className="loading-indicator">Loading...</span>}
        </div>
        {isLoading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading room data...</p>
          </div>
        ) : (
          <RoomGrid
            hostel={hostel}
            floor={floor}
            rooms={rooms}
            getBeds={getBeds}
            onSelectFreeBed={toggleSelect}
            selected={selected}
          />
        )}
      </div>

      <div className="confirmation-section">
        <button
          onClick={confirm}
          disabled={!selected || isLoading}
          className={`confirm-btn ${!selected ? "disabled" : ""} ${isLoading ? "loading" : ""}`}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : selected ? (
            `Confirm Selection: Room ${selected.roomNo}, Bed ${selected.bedIndex + 1}`
          ) : (
            "Select a bed to continue"
          )}
        </button>
      </div>

      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Allocation Successful!</h3>
            </div>
            <div className="modal-body">
              <div className="success-icon">✓</div>
              <p>You have been allocated:</p>
              <div className="allocation-details">
                <div className="detail-item">
                  <span className="detail-label">Hostel:</span>
                  <span className="detail-value">{hostel}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Floor:</span>
                  <span className="detail-value">{floor}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Room:</span>
                  <span className="detail-value">{selected.roomNo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Bed:</span>
                  <span className="detail-value">{selected.bedIndex + 1}</span>
                </div>
              </div>
              <p className="confirmation-note">
                Your room allocation has been confirmed. You can view your allocation details in your student portal.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={closeConfirmation} className="modal-btn">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}