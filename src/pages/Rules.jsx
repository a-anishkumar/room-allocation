// src/pages/Rules.jsx
import React from "react";

export default function Rules() {
  return (
    <div className="rules-container">
      <div className="header-section">
        <h1>Hostel Rules & Regulations</h1>
        <p className="intro">All residents are expected to abide by the following rules to ensure a safe and harmonious living environment.</p>
      </div>

      <div className="rules-content">
        <div className="rules-section">
          <h2>General Rules for Staying in Hostel</h2>
          <div className="rules-list">
            <div className="rule-item">
              <div className="rule-number">1</div>
              <div className="rule-text">All students must carry their hostel identity card at all times within the hostel premises.</div>
            </div>
            <div className="rule-item">
              <div className="rule-number">2</div>
              <div className="rule-text">Students must maintain discipline and decorum in the hostel premises.</div>
            </div>
            <div className="rule-item">
              <div className="rule-number">3</div>
              <div className="rule-text">Rooms and common areas must be kept clean and tidy at all times.</div>
            </div>
            <div className="rule-item">
              <div className="rule-number">4</div>
              <div className="rule-text">Damage to hostel property will result in fines and disciplinary action.</div>
            </div>
            <div className="rule-item">
              <div className="rule-number">5</div>
              <div className="rule-text">Smoking, consumption of alcohol, and use of drugs is strictly prohibited.</div>
            </div>
            <div className="rule-item">
              <div className="rule-number">6</div>
              <div className="rule-text">Visitors must register at the security desk and are only allowed during specified hours.</div>
            </div>
            <div className="rule-item">
              <div className="rule-number">7</div>
              <div className="rule-text">Students must return to the hostel by the specified curfew time.</div>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h2>Mess Timings</h2>
          <div className="timing-table">
            <div className="timing-row">
              <div className="timing-meal">Breakfast</div>
              <div className="timing-time">7:30 AM - 9:00 AM</div>
            </div>
            <div className="timing-row">
              <div className="timing-meal">Lunch</div>
              <div className="timing-time">12:30 PM - 2:00 PM</div>
            </div>
            <div className="timing-row">
              <div className="timing-meal">Snacks</div>
              <div className="timing-time">4:30 PM - 5:30 PM</div>
            </div>
            <div className="timing-row">
              <div className="timing-meal">Dinner</div>
              <div className="timing-time">7:30 PM - 9:00 PM</div>
            </div>
          </div>
          <div className="notes">
            <p><strong>Note:</strong> Mess will remain closed on the second Sunday of every month.</p>
          </div>
        </div>

        <div className="rules-section">
          <h2>Hostel In and Out Timings</h2>
          <div className="timing-table">
            <div className="timing-row">
              <div className="timing-meal">Gate Opening Time</div>
              <div className="timing-time">5:30 AM</div>
            </div>
            <div className="timing-row">
              <div className="timing-meal">Day Scholars Entry</div>
              <div className="timing-time">9:00 AM - 4:00 PM</div>
            </div>
            <div className="timing-row">
              <div className="timing-meal">Regular Curfew</div>
              <div className="timing-time">9:30 PM (Sunday-Thursday)</div>
            </div>
            <div className="timing-row">
              <div className="timing-meal">Weekend Curfew</div>
              <div className="timing-time">10:30 PM (Friday & Saturday)</div>
            </div>
            <div className="timing-row">
              <div className="timing-meal">Gate Closing Time</div>
              <div className="timing-time">11:00 PM</div>
            </div>
          </div>
          <div className="notes">
            <p><strong>Note:</strong> Late entry after curfew requires prior permission from the warden.</p>
          </div>
        </div>

        <div className="rules-section">
          <h2>Prohibited Items</h2>
          <p className="section-intro">The following items are strictly prohibited in hostel rooms:</p>
          <div className="prohibited-items">
            <div className="item-category">
              <h3>Electrical Appliances</h3>
              <ul>
                <li>Electric iron</li>
                <li>Immersion rod/water heater</li>
                <li>Electric kettle</li>
                <li>Induction cooktop</li>
                <li>Rice cooker</li>
                <li>Toaster oven</li>
              </ul>
            </div>
            <div className="item-category">
              <h3>Entertainment Devices</h3>
              <ul>
                <li>Speakers (except personal headphones)</li>
                <li>Sound systems</li>
                <li>Amplifiers</li>
              </ul>
            </div>
            <div className="item-category">
              <h3>Other Items</h3>
              <ul>
                <li>Candles and incense sticks</li>
                <li>Combustible materials</li>
                <li>Weapons of any kind</li>
                <li>Pets</li>
              </ul>
            </div>
          </div>
          <div className="notes warning">
            <p><strong>Warning:</strong> Possession of prohibited items will result in immediate confiscation and disciplinary action.</p>
          </div>
        </div>

        <div className="rules-section">
          <h2>Consequences of Violations</h2>
          <div className="consequences">
            <div className="consequence-item">
              <h3>First Violation</h3>
              <p>Written warning and fine of ₹500</p>
            </div>
            <div className="consequence-item">
              <h3>Second Violation</h3>
              <p>Fine of ₹1000 and parents notification</p>
            </div>
            <div className="consequence-item">
              <h3>Third Violation</h3>
              <p>Suspension from hostel for 15 days</p>
            </div>
            <div className="consequence-item">
              <h3>Serious Violations</h3>
              <p>Immediate expulsion from hostel</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .rules-container {
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
        }
        
        h1 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 2.2rem;
        }
        
        .intro {
          color: #7f8c8d;
          font-size: 1.1rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .rules-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .rules-section {
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #3498db;
        }
        
        h3 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }
        
        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .rule-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .rule-number {
          background: #3498db;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .rule-text {
          line-height: 1.6;
        }
        
        .timing-table {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .timing-row {
          display: flex;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        .timing-meal {
          font-weight: 600;
          flex: 1;
        }
        
        .timing-time {
          color: #e74c3c;
          font-weight: 500;
        }
        
        .prohibited-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 1.5rem 0;
        }
        
        .item-category {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
        }
        
        .item-category ul {
          margin: 0;
          padding-left: 1.2rem;
        }
        
        .item-category li {
          margin-bottom: 0.5rem;
        }
        
        .consequences {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .consequence-item {
          background: #fff8e1;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
        }
        
        .consequence-item h3 {
          color: #e65100;
          margin-bottom: 0.5rem;
        }
        
        .notes {
          padding: 1rem;
          background: #e8f5e9;
          border-radius: 4px;
          border-left: 4px solid #4caf50;
        }
        
        .notes.warning {
          background: #ffebee;
          border-left: 4px solid #f44336;
        }
        
        .section-intro {
          margin-bottom: 1.5rem;
          color: #7f8c8d;
        }
        
        @media (max-width: 768px) {
          .rules-container {
            padding: 1rem;
          }
          
          .header-section {
            padding: 1.5rem;
          }
          
          h1 {
            font-size: 1.8rem;
          }
          
          .rules-section {
            padding: 1.5rem;
          }
          
          .prohibited-items,
          .consequences {
            grid-template-columns: 1fr;
          }
          
          .timing-row {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}