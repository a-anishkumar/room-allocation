// src/components/admin/MenuEditor.jsx
import React, { useMemo, useState } from "react";
import { getDefaultWeeklyMenu, getWeeklyMenu, saveWeeklyMenu, saveWeeklyMenuToSupabase } from "../../utils/menuStorage";
import "../../styles/MenuEditor.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MenuEditor() {
    const initialMenu = useMemo(() => getWeeklyMenu() || getDefaultWeeklyMenu(), []);
    const [weeklyMenu, setWeeklyMenu] = useState(initialMenu);
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);
    const [saveMessage, setSaveMessage] = useState("");

    const current = weeklyMenu[selectedDay] || { morning: [], breakfast: "", lunch: "", evening: [], dinner: "" };

    function updateDay(part, value) {
        const next = { ...weeklyMenu, [selectedDay]: { ...current, [part]: value } };
        setWeeklyMenu(next);
        // auto-save locally and try to sync to Supabase
        saveWeeklyMenu(next);
        saveWeeklyMenuToSupabase(next);
    }

    function persist() {
        saveWeeklyMenu(weeklyMenu);
        saveWeeklyMenuToSupabase(weeklyMenu);
        setSaveMessage("✓ Menu saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
    }

    function resetDayToDefault() {
        const def = getDefaultWeeklyMenu();
        const next = { ...weeklyMenu, [selectedDay]: def[selectedDay] };
        setWeeklyMenu(next);
        saveWeeklyMenu(next);
        saveWeeklyMenuToSupabase(next);
        setSaveMessage("✓ Reset to default menu");
        setTimeout(() => setSaveMessage(""), 3000);
    }

    return (
        <div className="menu-editor-container">
            {/* Header */}
            <div className="menu-editor-header">
                <h2>Weekly Menu Editor</h2>
                <p>Manage hostel meal menus for each day of the week</p>
            </div>

            {/* Success Message */}
            {saveMessage && (
                <div className="save-success">
                    {saveMessage}
                </div>
            )}

            {/* Day Selector */}
            <div className="days-selector">
                {DAYS.map((d) => (
                    <button
                        key={d}
                        className={`day-btn ${selectedDay === d ? "active" : ""}`}
                        onClick={() => setSelectedDay(d)}
                        type="button"
                    >
                        {d}
                    </button>
                ))}
            </div>

            {/* Menu Form */}
            <form className="menu-form" onSubmit={(e) => { e.preventDefault(); persist(); }}>
                <div className="menu-form-grid">
                    {/* Beverages Row */}
                    <div className="beverages-row">
                        <div className="form-field">
                            <label>
                                Morning Beverages
                            </label>
                            <input
                                type="text"
                                value={(current.morning || []).join(", ")}
                                onChange={(e) => updateDay("morning", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                                placeholder="Coffee, Milk, Tea"
                            />
                            <span className="hint">Separate items with commas</span>
                        </div>
                        <div className="form-field">
                            <label>
                                Evening Beverages
                            </label>
                            <input
                                type="text"
                                value={(current.evening || []).join(", ")}
                                onChange={(e) => updateDay("evening", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                                placeholder="Tea, Milk, Coffee"
                            />
                            <span className="hint">Separate items with commas</span>
                        </div>
                    </div>

                    {/* Breakfast */}
                    <div className="form-field">
                        <label>
                            Breakfast
                        </label>
                        <textarea
                            value={current.breakfast || ""}
                            onChange={(e) => updateDay("breakfast", e.target.value)}
                            placeholder="Idli, Sambar, Coconut Chutney, Podi"
                        />
                    </div>

                    {/* Lunch */}
                    <div className="form-field">
                        <label>
                            Lunch
                        </label>
                        <textarea
                            value={current.lunch || ""}
                            onChange={(e) => updateDay("lunch", e.target.value)}
                            placeholder="Sambar Rice, Rasam, Poriyal, Kootu, Papad, Curd"
                        />
                    </div>

                    {/* Dinner */}
                    <div className="form-field">
                        <label>
                            Dinner
                        </label>
                        <textarea
                            value={current.dinner || ""}
                            onChange={(e) => updateDay("dinner", e.target.value)}
                            placeholder="Puliyodarai, Vadai, Rice, Poriyal, Mor Kuzhambu"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="menu-actions">
                    <button type="button" className="btn-danger" onClick={resetDayToDefault}>
                        Reset to Default
                    </button>
                    <button type="submit" className="btn-primary">
                        Save Menu
                    </button>
                </div>
            </form>

            {/* Menu Preview */}
            <div className="menu-preview">
                <h3>{selectedDay} Menu Preview</h3>
                <div className="preview-grid">
                    <div className="preview-item">
                        <div className="preview-item-label">Morning</div>
                        <div className="preview-item-value">
                            {current.morning && current.morning.length > 0 
                                ? current.morning.join(", ") 
                                : <span className="preview-item-empty">Not set</span>}
                        </div>
                    </div>
                    <div className="preview-item">
                        <div className="preview-item-label">Breakfast</div>
                        <div className="preview-item-value">
                            {current.breakfast || <span className="preview-item-empty">Not set</span>}
                        </div>
                    </div>
                    <div className="preview-item">
                        <div className="preview-item-label">Lunch</div>
                        <div className="preview-item-value">
                            {current.lunch || <span className="preview-item-empty">Not set</span>}
                        </div>
                    </div>
                    <div className="preview-item">
                        <div className="preview-item-label">Evening</div>
                        <div className="preview-item-value">
                            {current.evening && current.evening.length > 0 
                                ? current.evening.join(", ") 
                                : <span className="preview-item-empty">Not set</span>}
                        </div>
                    </div>
                    <div className="preview-item">
                        <div className="preview-item-label">Dinner</div>
                        <div className="preview-item-value">
                            {current.dinner || <span className="preview-item-empty">Not set</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

