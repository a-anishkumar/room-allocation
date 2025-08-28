import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

export default function Allocations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending allocations
  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("allocations")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching allocations:", error.message);
    } else {
      setRequests(data);
    }
    setLoading(false);
  };

  const handleDecision = async (id, decision) => {
    const { error } = await supabase
      .from("allocations")
      .update({ status: decision })
      .eq("id", id);

    if (error) {
      console.error("Error updating allocation:", error.message);
      return;
    }

    fetchAllocations(); // refresh list
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Room Allocations</h2>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No pending requests ✅</p>
      ) : (
        <table className="w-full border bg-white shadow-md rounded-lg text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Reg No</th>
              <th className="p-2">Name</th>
              <th className="p-2">Dept</th>
              <th className="p-2">Email</th>
              <th className="p-2">Hostel</th>
              <th className="p-2">Floor</th>
              <th className="p-2">Room</th>
              <th className="p-2">Bed</th>
              <th className="p-2">Fees</th>
              <th className="p-2">Receipt</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t">
                <td className="p-2">{req.reg_no}</td>
                <td className="p-2">{req.name}</td>
                <td className="p-2">{req.department}</td>
                <td className="p-2">{req.email}</td>
                <td className="p-2">{req.hostel}</td>
                <td className="p-2">{req.floor}</td>
                <td className="p-2">{req.room_number}</td>
                <td className="p-2">{req.bed_number}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      req.fees_status === "Paid"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {req.fees_status}
                  </span>
                </td>
                <td className="p-2">
                  <a
                    href={req.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => handleDecision(req.id, "confirmed")}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleDecision(req.id, "rejected")}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
