/**
 * Login.jsx
 *
 * Login page for Luxury Hijabi.
 * Uses AuthStore to validate credentials against the stored users array.
 *
 * Forgot-password flow (Option 2 — no backend needed):
 *   Step 1 "email"  — user enters their registered email.
 *                     We check it exists in lh_users_v1 (localStorage).
 *   Step 2 "lookup" — email matched, user enters + confirms a new password.
 *                     We overwrite the stored password in the users array.
 *   On success: a confirmation message shows, then the view returns to login.
 *
 * resetStage values: "idle" | "email" | "lookup"
 */

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthStore } from "../utils/authStore";
import "./Login.css";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/";
  const reason = searchParams.get("reason");

  /* ── Normal login state ── */
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Forgot-password state ── */
  const [resetStage, setResetStage] = useState("idle"); // "idle" | "email" | "lookup"
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPw, setResetNewPw] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);

  /* Human-readable context shown in the notice banner */
  const reasonText =
    reason === "cart"
      ? "Please log in to add items to your cart."
      : reason === "favorites"
        ? "Please log in to save items to your favorites."
        : null;

  /* ── Normal login submit ── */
  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = AuthStore.login({ identifier, password });
      if (result.success) {
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 400);
  }

  /* ── Reset Step 1: verify the email exists in the users array ── */
  function handleResetLookup(e) {
    e.preventDefault();
    setResetError("");

    const users = JSON.parse(localStorage.getItem("lh_users_v1") || "[]");
    const found = users.find(
      (u) => u.email.toLowerCase() === resetEmail.trim().toLowerCase(),
    );

    if (!found) {
      setResetError("No account found with that email address.");
      return;
    }

    /* Email exists — advance to the new-password step */
    setResetStage("lookup");
  }

  /* ── Reset Step 2: overwrite the password in localStorage ── */
  function handleResetSave(e) {
    e.preventDefault();
    setResetError("");

    if (resetNewPw.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }
    if (resetNewPw !== resetConfirm) {
      setResetError("Passwords do not match.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("lh_users_v1") || "[]");
    const updated = users.map((u) =>
      u.email.toLowerCase() === resetEmail.trim().toLowerCase()
        ? { ...u, password: resetNewPw }
        : u,
    );
    localStorage.setItem("lh_users_v1", JSON.stringify(updated));

    setResetSuccess(true);

    /* Auto-return to normal login view after 2 s */
    setTimeout(() => {
      setResetStage("idle");
      setResetSuccess(false);
      setResetEmail("");
      setResetNewPw("");
      setResetConfirm("");
      setResetError("");
    }, 2000);
  }

  /* ── Cancel the reset flow and go back to normal login ── */
  function handleResetBack() {
    setResetStage("idle");
    setResetError("");
    setResetSuccess(false);
    setResetEmail("");
    setResetNewPw("");
    setResetConfirm("");
  }

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="auth-page">
      {/* ── Left decorative brand panel ── */}
      <div className="auth-brand-panel">
        <div className="shimmer-bar" />

        <div className="brand-logo-wrap">
          <img
            src="../images/logo/Luxury-Hijabi_Brand-Logo-4.png"
            alt="Luxury Hijabi"
          />
        </div>

        <h2 className="brand-tagline">
          {resetStage !== "idle" ? "Reset Your Password" : "Welcome Back"}
        </h2>

        <p className="brand-sub">
          {resetStage !== "idle"
            ? "We'll help you get back into your account in just two steps."
            : "Sign in to continue your luxury shopping experience. Explore our curated collection of hijabs, abayas, and accessories."}
        </p>

        <div className="brand-dots">
          {Array.from({ length: 10 }, (_, i) => (
            <span className="brand-dot" key={i} />
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-box">
          {/* ══════════════════════════════════════════════════
              FORGOT PASSWORD VIEW
              Shown when resetStage is "email" or "lookup"
          ══════════════════════════════════════════════════ */}
          {resetStage !== "idle" && (
            <div>
              {/* Back button */}
              <button
                type="button"
                className="auth-back-btn"
                onClick={handleResetBack}
              >
                <i className="fa-solid fa-arrow-left" /> Back to Sign In
              </button>

              <h1 className="auth-form-title">Reset Password</h1>
              <p className="auth-form-subtitle">
                {resetStage === "email"
                  ? "Enter the email address linked to your account."
                  : "Choose a new password for your account."}
              </p>

              {/* Error banner */}
              <div className={`auth-error${resetError ? "" : " hidden"}`}>
                <i className="fa-solid fa-triangle-exclamation" />
                <span>{resetError}</span>
              </div>

              {/* Success message — shown after password is saved */}
              {resetSuccess && (
                <div className="auth-redirect-notice">
                  <i className="fa-solid fa-circle-check" />
                  <span>Password updated! Returning to sign in…</span>
                </div>
              )}

              {/* Step 1 — email lookup form */}
              {resetStage === "email" && !resetSuccess && (
                <form onSubmit={handleResetLookup}>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="reset-email">
                      Email Address
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        id="reset-email"
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                      <i className="fa-solid fa-envelope auth-input-icon" />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    Find My Account
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                </form>
              )}

              {/* Step 2 — set new password form */}
              {resetStage === "lookup" && !resetSuccess && (
                <form onSubmit={handleResetSave}>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="reset-newpw">
                      New Password
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        id="reset-newpw"
                        type={showResetPw ? "text" : "password"}
                        className="auth-input"
                        placeholder="At least 6 characters"
                        value={resetNewPw}
                        onChange={(e) => setResetNewPw(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <i className="fa-solid fa-lock auth-input-icon" />
                      <button
                        type="button"
                        className="auth-pw-toggle"
                        aria-label={
                          showResetPw ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowResetPw((p) => !p)}
                      >
                        <i
                          className={
                            showResetPw
                              ? "fa-solid fa-eye-slash"
                              : "fa-solid fa-eye"
                          }
                        />
                      </button>
                    </div>
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="reset-confirm">
                      Confirm New Password
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        id="reset-confirm"
                        type={showResetPw ? "text" : "password"}
                        className="auth-input"
                        placeholder="Re-enter your new password"
                        value={resetConfirm}
                        onChange={(e) => setResetConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <i className="fa-solid fa-lock auth-input-icon" />
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    Save New Password
                    <i className="fa-solid fa-arrow-right" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              NORMAL LOGIN VIEW
              Shown only when resetStage is "idle"
          ══════════════════════════════════════════════════ */}
          {resetStage === "idle" && (
            <div>
              <h1 className="auth-form-title">Sign In</h1>
              <p className="auth-form-subtitle">
                Enter your credentials to access your account.
              </p>

              {/* Context notice — shown when redirected from a guarded action */}
              <div
                className={`auth-redirect-notice${reasonText ? "" : " hidden"}`}
              >
                <i className="fa-solid fa-circle-info" />
                <span>{reasonText}</span>
              </div>

              {/* Error banner */}
              <div className={`auth-error${error ? "" : " hidden"}`}>
                <i className="fa-solid fa-triangle-exclamation" />
                <span>{error}</span>
              </div>

              {/* Login form */}
              <form onSubmit={handleSubmit}>
                {/* Email or username field */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="login-identifier">
                    Email or Username
                  </label>
                  <div className="auth-input-wrap">
                    <input
                      id="login-identifier"
                      type="text"
                      className="auth-input"
                      placeholder="you@example.com or your username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      required
                    />
                    <i className="fa-solid fa-user auth-input-icon" />
                  </div>
                </div>

                {/* Password field with show/hide toggle */}
                <div className="auth-field">
                  <label className="auth-label" htmlFor="login-password">
                    Password
                  </label>
                  <div className="auth-input-wrap">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <i className="fa-solid fa-lock auth-input-icon" />
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <i
                        className={
                          showPassword
                            ? "fa-solid fa-eye-slash"
                            : "fa-solid fa-eye"
                        }
                      />
                    </button>
                  </div>
                </div>

                {/* Forgot password — switches to the two-step reset flow */}
                <button
                  type="button"
                  className="auth-forgot"
                  onClick={() => {
                    setResetStage("email");
                    setError("");
                  }}
                >
                  Forgot password?
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <i className="fa-solid fa-arrow-right" />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-divider">
                <span className="auth-divider-line" />
                <span className="auth-divider-text">New to Luxury Hijabi?</span>
                <span className="auth-divider-line" />
              </div>

              <p className="auth-switch">
                Don't have an account?{" "}
                <Link
                  to={`/signup${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}${reason ? `&reason=${reason}` : ""}`}
                >
                  Create one now
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
