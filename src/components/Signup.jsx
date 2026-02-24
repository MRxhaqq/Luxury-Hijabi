/**
 * Signup.jsx
 *
 * Account creation page for Luxury Hijabi.
 * Uses AuthStore.register() which adds the user to the localStorage users array.
 * Automatically logs the user in on successful registration and redirects.
 */

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthStore } from "../utils/authStore";
import "./Login.css"; // Signup shares the same CSS file as Login

export function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/";
  const reason = searchParams.get("reason");

  // Form field values
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength indicator: 0 (empty), 1 (weak), 2 (medium), 3 (strong)
  function getPasswordStrength(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  const pwStrength = getPasswordStrength(password);
  const pwStrengthLabels = ["", "Weak", "Medium", "Strong"];
  const pwStrengthClasses = ["", "pw-weak", "pw-medium", "pw-strong"];

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side validation before calling AuthStore
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // Small simulated delay for natural UX feel
    setTimeout(() => {
      const result = AuthStore.register({ username, email, password });

      if (result.success) {
        navigate(redirectTo, { replace: true });
      } else {
        setError(result.error);
        setLoading(false);
      }
    }, 400);
  }

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

        <h2 className="brand-tagline">Join the Community</h2>
        <p className="brand-sub">
          Create your account to unlock exclusive access to our curated luxury
          collection, save your favorites, and track your orders.
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
          <h1 className="auth-form-title">Create Account</h1>
          <p className="auth-form-subtitle">
            Join Luxury Hijabi today — it's free and takes only a moment.
          </p>

          {/* Error banner */}
          <div className={`auth-error${error ? "" : " hidden"}`}>
            <i className="fa-solid fa-triangle-exclamation" />
            <span>{error}</span>
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-username">
                Username
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-username"
                  type="text"
                  className="auth-input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
                <i className="fa-solid fa-user auth-input-icon" />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-email">
                Email Address
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-email"
                  type="email"
                  className="auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <i className="fa-solid fa-envelope auth-input-icon" />
              </div>
            </div>

            {/* Password with strength indicator */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-password">
                Password
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <i className="fa-solid fa-lock auth-input-icon" />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <i
                    className={
                      showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                    }
                  />
                </button>
              </div>

              {/* Password strength bar — only visible when user starts typing */}
              {password && (
                <div className="pw-strength-wrap">
                  <div
                    className={`pw-strength-bar ${pwStrengthClasses[pwStrength]}`}
                  />
                  <span
                    className={`pw-strength-label ${pwStrengthClasses[pwStrength]}`}
                  >
                    {pwStrengthLabels[pwStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-confirm">
                Confirm Password
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-confirm"
                  type={showConfirm ? "text" : "password"}
                  className="auth-input"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <i className="fa-solid fa-lock auth-input-icon" />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  <i
                    className={
                      showConfirm ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                    }
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <i className="fa-solid fa-arrow-right" />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">Already have an account?</span>
            <span className="auth-divider-line" />
          </div>

          <p className="auth-switch">
            Already registered?{" "}
            <Link
              to={`/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}${reason ? `&reason=${reason}` : ""}`}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
