// src/components/admin/MenuEditor.jsx
import React, { useMemo, useState } from "react";
import { getDefaultWeeklyMenu, getWeeklyMenu, saveWeeklyMenu, saveWeeklyMenuToSupabase } from "../../utils/menuStorage";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MenuEditor() {
    const initialMenu = useMemo(() => getWeeklyMenu() || getDefaultWeeklyMenu(), []);
    const [weeklyMenu, setWeeklyMenu] = useState(initialMenu);
    const [selectedDay, setSelectedDay] = useState(DAYS[0]);

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
    }

    function resetDayToDefault() {
        const def = getDefaultWeeklyMenu();
        const next = { ...weeklyMenu, [selectedDay]: def[selectedDay] };
        setWeeklyMenu(next);
        saveWeeklyMenu(next);
    }

    return (
        <div className="menu-editor">
            <h2>Menu Editor (Day-wise)</h2>

            <div className="days-selector" style={{ marginBottom: 12 }}>
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

            <form className="menu-form" onSubmit={(e) => { e.preventDefault(); persist(); saveWeeklyMenuToSupabase(weeklyMenu); }}>
                <div className="form-row">
                    <label>
                        Morning Beverages (comma separated)
                        <input
                            type="text"
                            value={(current.morning || []).join(", ")}
                            onChange={(e) => updateDay("morning", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                            placeholder="Coffee, Milk"
                        />
                    </label>
                    <label>
                        Breakfast
                        <input
                            type="text"
                            value={current.breakfast || ""}
                            onChange={(e) => updateDay("breakfast", e.target.value)}
                            placeholder="Idli, Sambar, Coconut Chutney"
                        />
                    </label>
                    <label>
                        Lunch
                        <input
                            type="text"
                            value={current.lunch || ""}
                            onChange={(e) => updateDay("lunch", e.target.value)}
                            placeholder="Sambar Rice, Rasam, Poriyal, Kootu, Papad, Curd"
                        />
                    </label>
                    <label>
                        Evening Beverages (comma separated)
                        <input
                            type="text"
                            value={(current.evening || []).join(", ")}
                            onChange={(e) => updateDay("evening", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                            placeholder="Tea, Milk"
                        />
                    </label>
                    <label>
                        Dinner
                        <input
                            type="text"
                            value={current.dinner || ""}
                            onChange={(e) => updateDay("dinner", e.target.value)}
                            placeholder="Puliyodarai, Vadai, Rice, Poriyal, Mor Kuzhambu"
                        />
                    </label>
                    <button type="submit" className="primary">Save</button>
                    <button type="button" className="secondary" onClick={resetDayToDefault}>Reset Day</button>
                </div>
            </form>
        </div>
    );
}

