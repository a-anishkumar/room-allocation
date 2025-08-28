import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

export default function Details() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current session from Supabase
    supabase.auth.getSession().then((res) => {
      const currentUser = res.data?.session?.user;

      if (!currentUser) {
        // If no user, redirect to login
        navigate("/login");
        return;
      }

      // Restrict to kongu.edu emails
      if (!currentUser.email.endsWith("@kongu.edu")) {
        alert("Only kongu.edu emails are allowed!");
        supabase.auth.signOut();
        navigate("/login");
        return;
      }

      setUser(currentUser);
    });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      <p>Your student portal content goes here.</p>
    </div>
  );
}
