import React from "react";

function Legend() {
  return (
    <div style={{ marginBottom: "15px" }}>
      <strong>Legend: </strong>
      <span style={{ background: "#d4f8d4", padding: "3px 8px", marginRight: "6px" }}>Empty</span>
      <span style={{ background: "#fff3cd", padding: "3px 8px", marginRight: "6px" }}>Partial</span>
      <span style={{ background: "#f8d7da", padding: "3px 8px" }}>Full</span>
    </div>
  );
}

export default Legend;
