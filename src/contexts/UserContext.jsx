// src/contexts/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Allowed admin emails (kongu domain only)
  const ADMIN_EMAILS = ["akashl.23csd@kongu.edu", "warden@kongu.edu"];

  // 🔒 Strict domain check
  const validateUser = async (currentUser) => {
    if (!currentUser.email.endsWith("@kongu.edu")) {
      // ❌ invalid domain → force logout
      await supabase.auth.signOut();
      setUser(null);
      return null;
    }

    // ✅ Determine role
    const role = ADMIN_EMAILS.includes(currentUser.email)
      ? "admin"
      : "student";

    const validUser = { ...currentUser, role };
    setUser(validUser);
    return validUser;
  };

  useEffect(() => {
    // 1. Load session on first render
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error.message);
      }
      if (data?.session) {
        await validateUser(data.session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    getSession();

    // 2. Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await validateUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
