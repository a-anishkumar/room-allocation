// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../styles/login.css";
import { useUser } from "../contexts/UserContext";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useUser(); // current supabase user
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Allowed admin emails
  const ADMIN_EMAILS = ["admin1@kongu.edu", "warden@kongu.edu"];

  useEffect(() => {
    if (user) {
      // 🚨 Strict domain check
      if (!user.email.endsWith("@kongu.edu")) {
        // not kongu domain → logout immediately
        supabase.auth.signOut();
        alert("Only kongu.edu emails are allowed.");
        return;
      }

      // valid kongu user → continue
      createOrUpdateProfile(user);
    }
  }, [user, navigate]);

  const createOrUpdateProfile = async (user) => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("profiles")
        .select("id, role, email")
        .eq("id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching profile:", fetchError.message);
        return;
      }

      let role = "student";

      // ✅ Assign role
      if (ADMIN_EMAILS.includes(user.email)) {
        role = "admin";
      } else {
        role = "student";
      }

      if (!existing) {
        // Insert new profile
        const { error: insertError } = await supabase.from("profiles").insert([
          { id: user.id, email: user.email, role },
        ]);
        if (insertError) {
          console.error("Error inserting profile:", insertError.message);
        }
      } else if (existing.role !== role) {
        // Sync role if different
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role })
          .eq("id", user.id);
        if (updateError) {
          console.error("Error updating profile:", updateError.message);
        }
      }

      // ✅ Redirect after login
      if (role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/room-allocation", { replace: true });
      }
    } catch (err) {
      console.error("Unexpected error in createOrUpdateProfile:", err);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            hd: "kongu.edu", // 🔒 restrict to kongu.edu domain
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <div className="university-brand">
            <h1>Kongu Engineering College</h1>
            <p>Hostels Portal Login</p>
          </div>
        </div>

        <div className="login-form">
          <button
            onClick={handleGoogleLogin}
            className={`google-btn ${isLoading ? "disabled" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Signing in...
              </>
            ) : (
              <>
                <svg
                  className="google-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24px"
                  height="24px"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="login-footer">
          <p>
            Need help? Contact{" "}
            <a href="mailto:akashl.23csd@kongu.edu">IT Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
