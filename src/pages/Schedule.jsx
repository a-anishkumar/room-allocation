// src/pages/Schedule.jsx
import React, { useState } from "react";

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  const weeklyMenu = {
    Monday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Idli, Sambar, Coconut Chutney",
      lunch: "Sambar Rice, Rasam, Poriyal, Kootu, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Puliyodarai, Vadai, Rice, Poriyal, Mor Kuzhambu"
    },
    Tuesday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Puri, Masala Kuzhambu",
      lunch: "Jeera Rice, Dal, Poriyal, Rasam, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Aviyal, Onion Sambar, Rice, Poriyal"
    },
    Wednesday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Rava Upma, Coconut Chutney",
      lunch: "Curd Rice, Okra Poriyal, Dal, Papad, Pickle",
      evening: ["Tea", "Milk"],
      dinner: "Kootu, Mor Kuzhambu, Rice, Poriyal, Papad"
    },
    Thursday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Paniyaram, Coconut Chutney",
      lunch: "Lemon Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Vathal Kuzhambu, Rice, Poriyal, Mor Kuzhambu"
    },
    Friday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Puttu, Kara Chutney",
      lunch: "Tomato Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Paruppu Kuzhambu, Rice, Poriyal, Rasam"
    },
    Saturday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Masala Dosa, Sambar, Chutney",
      lunch: "Tamarind Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Butter Paneer, Rice, Poriyal, Mor Kuzhambu"
    },
    Sunday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Pongal, Ven Pongal, Sweet Pongal",
      lunch: "Special Meal: Dal, Sambar, Rasam, Three Poriyal, Papad, Vadai, Payasam",
      evening: ["Tea", "Milk"],
      dinner: "Green Gram Kuzhambu, Rice, Poriyal, Mor Kuzhambu"
    }
  };

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
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .day-btn {
          padding: 0.75rem 1rem;
          border: none;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          min-width: 100px;
        }
        
        .day-btn.active {
          background: #e74c3c;
          color: white;
        }
        
        .day-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
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