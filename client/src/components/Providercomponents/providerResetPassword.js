//src/components/Providercomponents/providerForgotPassword.js

import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { PROVIDER_RESET_PASSWORD } from "../../graphql/mutations"; // Adjust path if needed
import { useSearchParams } from "react-router-dom"; // Extract token from URL
import "../CSScomponents/Login.css";
import ProviderSignUp from "./ProviderSignUp";

const ProviderResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Get the reset token from the URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetSuccessful, setResetSuccessful] = useState(false); // Track success state

  const [resetPassword] = useMutation(PROVIDER_RESET_PASSWORD);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const { data } = await resetPassword({
        variables: { token, newPassword: password },
      });
      if (data.providerResetPassword.success) {
        setMessage("✅ Password reset successful! You may now close this window.");
        setResetSuccessful(true); // Hide form
      } else {
        setError(data.providerResetPassword.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Error resetting password:", err);
    }
  };

  return (
    <div className="login-container">
      <h1>Reset Your Password</h1>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {!resetSuccessful && ( // Hide form on success
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="form-input"
              required
            />
          </div>
          <button type="submit" className="submit-button">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ProviderResetPassword;

