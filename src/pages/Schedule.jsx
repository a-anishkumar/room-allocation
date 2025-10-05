// src/pages/Schedule.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getDefaultWeeklyMenu, getWeeklyMenu, fetchWeeklyMenuFromSupabase, subscribeWeeklyMenu } from "../utils/menuStorage";

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [weeklyMenu, setWeeklyMenu] = useState(() => getWeeklyMenu() || getDefaultWeeklyMenu());

  useEffect(() => {
    // Initial fetch from Supabase if available
    (async () => {
      const cloud = await fetchWeeklyMenuFromSupabase();
      if (cloud) setWeeklyMenu(cloud);
    })();

    const onCustom = (e) => {
      setWeeklyMenu(e.detail || getWeeklyMenu() || getDefaultWeeklyMenu());
    };
    const onStorage = (e) => {
      if (e.key === "weeklyMenu") {
        setWeeklyMenu(getWeeklyMenu() || getDefaultWeeklyMenu());
      }
    };
    window.addEventListener("weeklyMenuUpdated", onCustom);
    const unsubscribe = subscribeWeeklyMenu((menu) => setWeeklyMenu(menu));
    window.addEventListener("storage", onStorage);
    // Fallback polling in case events are missed across contexts
    const intervalId = setInterval(() => {
      try {
        const latest = getWeeklyMenu() || getDefaultWeeklyMenu();
        setWeeklyMenu(latest);
      } catch (_) {
        // ignore
      }
    }, 1000);
    return () => {
      window.removeEventListener("weeklyMenuUpdated", onCustom);
      window.removeEventListener("storage", onStorage);
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="schedule-container">
      <div className="header-section">
        <h1>Weekly Food Menu </h1>
        <p className="intro">Delicious Tamil Nadu vegetarian meals prepared daily with authentic flavors</p>
      </div>

      <div className="days-selector">
        {daysOfWeek.map(day => (
          <button
            key={day}
            className={`day-btn ${selectedDay === day ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="menu-card">
        <h2 className="day-heading">{selectedDay} Menu</h2>

        <div className="meal-section">
          <h3>Morning Beverages (6:30 AM - 7:30 AM)</h3>
          <div className="beverage-list">
            {weeklyMenu[selectedDay].morning.map((item, index) => (
              <div key={index} className="beverage-item">
                <span className="beverage-icon">☕</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="meal-section">
          <h3>Breakfast (8:00 AM - 9:30 AM)</h3>
          <p>{weeklyMenu[selectedDay].breakfast}</p>
        </div>

        <div className="meal-section">
          <h3>Lunch (12:30 PM - 2:00 PM)</h3>
          <p>{weeklyMenu[selectedDay].lunch}</p>
        </div>

        <div className="meal-section">
          <h3>Evening Beverages (4:30 PM - 5:30 PM)</h3>
          <div className="beverage-list">
            {weeklyMenu[selectedDay].evening.map((item, index) => (
              <div key={index} className="beverage-item">
                <span className="beverage-icon">🫖</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="meal-section">
          <h3>Dinner (7:30 PM - 9:00 PM)</h3>
          <p>{weeklyMenu[selectedDay].dinner}</p>
        </div>
      </div>

      <div className="weekly-overview">
        <h2>Weekly Menu Overview</h2>
        <div className="week-grid">
          {daysOfWeek.map(day => (
            <div key={day} className="day-card" onClick={() => setSelectedDay(day)}>
              <h3>{day}</h3>
              <div className="day-menu-preview">
                <p><strong>Breakfast:</strong> {weeklyMenu[day].breakfast.split(',')[0]}</p>
                <p><strong>Lunch:</strong> {weeklyMenu[day].lunch.split(',')[0]}</p>
                <p><strong>Dinner:</strong> {weeklyMenu[day].dinner.split(',')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .schedule-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #f8f9fa;
        }
        
        .header-section {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          border-left: 4px solid #e74c3c;
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 2.2rem;
        }
        
        .intro {
          color: #7f8c8d;
          font-size: 1.1rem;
        }
        
        .days-selector {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          gap: 8px;
          flex-wrap: wrap;
        }

        .day-btn {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
          color: #111827;
          transition: box-shadow 0.2s, transform 0.08s, background 0.2s;
          min-width: 96px;
        }

        .day-btn:hover {
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .day-btn.active {
          background: #2563eb;
          color: #ffffff;
          border-color: transparent;
        }
        
        .menu-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          border-left: 4px solid #3498db;
        }
        
        .day-heading {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e74c3c;
        }
        
        .meal-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 3px solid #27ae60;
        }
        
        .meal-section h3 {
          color: #e74c3c;
          margin-bottom: 1rem;
        }
        
        .meal-section p {
          line-height: 1.6;
          margin: 0;
          font-size: 1.1rem;
        }
        
        .beverage-list {
          display: flex;
          gap: 1.5rem;
        }
        
        .beverage-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          font-size: 1.1rem;
        }
        
        .beverage-icon {
          font-size: 1.2rem;
        }
        
        .weekly-overview {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #f39c12;
        }
        
        .weekly-overview h2 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .week-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .day-card {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          border: 1px solid #ddd;
        }
        
        .day-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          border-color: #e74c3c;
        }
        
        .day-card h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #ddd;
        }
        
        .day-menu-preview p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          line-height: 1.4;
          text-align: left;
        }
        
        @media (max-width: 768px) {
          .schedule-container {
            padding: 1rem;
          }
          
          .header-section {
            padding: 1.5rem;
          }
          
          h1 {
            font-size: 1.8rem;
          }
          
          .days-selector {
            flex-wrap: wrap;
          }
          
          .day-btn {
            min-width: 80px;
            padding: 0.5rem;
            font-size: 0.9rem;
          }
          
          .beverage-list {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .week-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }
          
          .meal-section p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}