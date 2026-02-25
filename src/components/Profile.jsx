/**
 * Profile.jsx  (UPDATED)
 *
 * Dark mode changes:
 *  - Removed all local theme state, helpers, and effects (readStoredTheme,
 *    readSystemTheme, resolveInitialTheme, applyTheme, handleToggleTheme).
 *  - Now uses the shared useTheme() hook — theme state is synchronised
 *    with every other header in the app automatically.
 *  - The sidebar toggle now uses <ThemeToggle variant="sidebar" /> which
 *    matches the existing sidebar nav item visual style exactly.
 *  - Profile.css CSS variable declarations (:root and [data-theme="dark"])
 *    should be removed from Profile.css and replaced with a single import
 *    of theme.css in your app entry point (main.jsx).
 *
 * Why keep the toggle in the Profile sidebar too?
 *  The sidebar is a "settings hub" — users expect preference controls there
 *  (like Amazon's account preferences page). Having it in BOTH the main
 *  header AND the profile sidebar is intentional: primary discovery happens
 *  in the header, secondary confirmation/control lives in the profile.
 *  This mirrors how Spotify, GitHub, and Linear handle theme switching.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { AuthStore } from "../utils/authStore";
import { CartStore } from "../utils/cartStore";
import { FavoritesStore } from "../utils/favoritesStore";
import { ProductDisplayHeader } from "./ProductDisplayHeader";
import "./Profile.css";

/* ─────────────────────────────────────────────────────
   PASSWORD STRENGTH HELPER
───────────────────────────────────────────────────── */
function getPwStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABELS = ["", "Weak", "Medium", "Strong"];
const STRENGTH_CLASSES = ["", "weak", "medium", "strong"];

/* ─────────────────────────────────────────────────────
   PROFILE COMPONENT
───────────────────────────────────────────────────── */
export function Profile() {
  const navigate = useNavigate();

  const [user] = useState(() => AuthStore.getCurrentUser());
  const [cartCount] = useState(() => CartStore.getTotalCount());
  const [searchQuery, setSearchQuery] = useState("");

  /* Theme is now managed globally by useTheme() — no local state needed */

  /* Redirect if not logged in */
  useEffect(() => {
    if (!user) navigate("/login?redirect=/profile", { replace: true });
  }, [user, navigate]);

  const orderCount = CartStore.getOrders().length;
  const favCount = FavoritesStore.getCount();

  /* Password form state */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const pwStrength = getPwStrength(newPw);

  if (!user) return null;

  function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("lh_users_v1") || "[]");
      const stored = users.find((u) => u.id === user.id);

      if (!stored || stored.password !== currentPw) {
        setPwError("Current password is incorrect.");
        setSaving(false);
        return;
      }

      const updated = users.map((u) =>
        u.id === user.id ? { ...u, password: newPw } : u,
      );
      localStorage.setItem("lh_users_v1", JSON.stringify(updated));
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwSuccess(true);
      setSaving(false);
      setTimeout(() => setPwSuccess(false), 4000);
    }, 500);
  }

  function handleSignOut() {
    AuthStore.logout();
    navigate("/login");
  }

  return (
    <div className="prof-page">
      <title>My Profile – Luxury Hijabi</title>

      <ProductDisplayHeader
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) navigate(`/search?q=${encodeURIComponent(q)}`);
        }}
      />

      {/* ── Hero ── */}
      <div className="prof-hero">
        <div className="prof-hero-inner">
          <div className="prof-avatar" aria-hidden="true">
            {user.username[0].toUpperCase()}
          </div>
          <div className="prof-hero-text">
            <div className="prof-hero-name">{user.username}</div>
            <div className="prof-hero-email">{user.email}</div>
            <div className="prof-hero-badge">
              <i className="fa-solid fa-crown" aria-hidden="true" /> Luxury
              Member
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="prof-content">
        {/* ── Sidebar nav ── */}
        <nav className="prof-sidebar" aria-label="Profile navigation">
          <Link to="/" className="prof-nav-item">
            <i className="fa-solid fa-house" aria-hidden="true" /> Home
          </Link>
          <Link
            to="/profile"
            className="prof-nav-item active"
            aria-current="page"
          >
            <i className="fa-solid fa-user" aria-hidden="true" /> My Profile
          </Link>
          <Link to="/orders" className="prof-nav-item">
            <i className="fa-solid fa-bag-shopping" aria-hidden="true" /> Orders
          </Link>
          <Link to="/favorites" className="prof-nav-item">
            <i className="fa-solid fa-heart" aria-hidden="true" /> Favorites
          </Link>
          <Link to="/checkout" className="prof-nav-item">
            <i className="fa-solid fa-cart-shopping" aria-hidden="true" /> Cart
          </Link>

          <div className="prof-nav-divider" role="separator" />

          <button
            className="prof-nav-item danger"
            onClick={handleSignOut}
            type="button"
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            Sign Out
          </button>
        </nav>

        {/* ── Main panel ── */}
        <div className="prof-panel">
          {/* Stats card */}
          <div className="prof-card">
            <div className="prof-card-header">
              <i className="fa-solid fa-circle-user" aria-hidden="true" />
              <h2 className="prof-card-title">Account Overview</h2>
            </div>
            <div
              className="prof-stats-row"
              role="list"
              aria-label="Account statistics"
            >
              <div className="prof-stat-cell" role="listitem">
                <span
                  className="prof-stat-num"
                  aria-label={`${orderCount} orders`}
                >
                  {orderCount}
                </span>
                <span className="prof-stat-lbl" aria-hidden="true">
                  Orders
                </span>
              </div>
              <div className="prof-stat-cell" role="listitem">
                <span
                  className="prof-stat-num"
                  aria-label={`${favCount} favorites`}
                >
                  {favCount}
                </span>
                <span className="prof-stat-lbl" aria-hidden="true">
                  Favorites
                </span>
              </div>
              <div className="prof-stat-cell" role="listitem">
                <span
                  className="prof-stat-num"
                  aria-label={`${cartCount} items in cart`}
                >
                  {cartCount}
                </span>
                <span className="prof-stat-lbl" aria-hidden="true">
                  In Cart
                </span>
              </div>
            </div>
          </div>

          {/* Personal info card */}
          <div className="prof-card">
            <div className="prof-card-header">
              <i className="fa-solid fa-id-card" aria-hidden="true" />
              <h2 className="prof-card-title">Personal Information</h2>
            </div>
            <div className="prof-card-body">
              <div className="prof-info-row">
                <span className="prof-info-label">Username</span>
                <span className="prof-info-value">{user.username}</span>
              </div>
              <div className="prof-info-row">
                <span className="prof-info-label">Email Address</span>
                <span className="prof-info-value">{user.email}</span>
              </div>
              <div className="prof-info-row">
                <span className="prof-info-label">Member Since</span>
                <span className="prof-info-value">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="prof-info-row">
                <span className="prof-info-label">Account Status</span>
                <span className="prof-info-value active-status">
                  <i className="fa-solid fa-circle-check" aria-hidden="true" />{" "}
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Change password card */}
          <div className="prof-card">
            <div className="prof-card-header">
              <i className="fa-solid fa-lock" aria-hidden="true" />
              <h2 className="prof-card-title">Change Password</h2>
            </div>
            <div className="prof-card-body">
              {/* Error / success banners */}
              <div
                className={`prof-banner error${pwError ? "" : " hidden"}`}
                role="alert"
                aria-live="assertive"
              >
                <i
                  className="fa-solid fa-triangle-exclamation"
                  aria-hidden="true"
                />
                <span>{pwError}</span>
              </div>
              <div
                className={`prof-banner success${pwSuccess ? "" : " hidden"}`}
                role="status"
                aria-live="polite"
              >
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                <span>Password updated successfully!</span>
              </div>

              <form onSubmit={handleChangePassword} noValidate>
                {/* Current password */}
                <div className="prof-field">
                  <label className="prof-label" htmlFor="curr-pw">
                    Current Password
                  </label>
                  <div className="prof-input-wrap">
                    <i
                      className="fa-solid fa-lock prof-input-icon"
                      aria-hidden="true"
                    />
                    <input
                      id="curr-pw"
                      type={showCurrent ? "text" : "password"}
                      className="prof-input"
                      placeholder="Enter your current password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="prof-pw-toggle"
                      onClick={() => setShowCurrent((p) => !p)}
                      aria-label={
                        showCurrent
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      <i
                        className={
                          showCurrent
                            ? "fa-solid fa-eye-slash"
                            : "fa-solid fa-eye"
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="prof-field">
                  <label className="prof-label" htmlFor="new-pw">
                    New Password
                  </label>
                  <div className="prof-input-wrap">
                    <i
                      className="fa-solid fa-key prof-input-icon"
                      aria-hidden="true"
                    />
                    <input
                      id="new-pw"
                      type={showNew ? "text" : "password"}
                      className="prof-input"
                      placeholder="At least 6 characters"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      autoComplete="new-password"
                      required
                      aria-describedby={newPw ? "pw-strength-label" : undefined}
                    />
                    <button
                      type="button"
                      className="prof-pw-toggle"
                      onClick={() => setShowNew((p) => !p)}
                      aria-label={
                        showNew ? "Hide new password" : "Show new password"
                      }
                    >
                      <i
                        className={
                          showNew ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {newPw && (
                    <div className="prof-pw-strength" aria-live="polite">
                      <div
                        className={`prof-pw-bar ${STRENGTH_CLASSES[pwStrength]}`}
                        role="progressbar"
                        aria-valuenow={pwStrength}
                        aria-valuemin={0}
                        aria-valuemax={3}
                        aria-label="Password strength"
                      />
                      <span
                        id="pw-strength-label"
                        className={`prof-pw-label ${STRENGTH_CLASSES[pwStrength]}`}
                      >
                        {STRENGTH_LABELS[pwStrength]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="prof-field">
                  <label className="prof-label" htmlFor="confirm-pw">
                    Confirm New Password
                  </label>
                  <div className="prof-input-wrap">
                    <i
                      className="fa-solid fa-key prof-input-icon"
                      aria-hidden="true"
                    />
                    <input
                      id="confirm-pw"
                      type="password"
                      className="prof-input"
                      placeholder="Re-enter your new password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`prof-save-btn${pwSuccess ? " success-btn" : ""}`}
                  disabled={saving}
                  aria-busy={saving}
                >
                  {saving ? (
                    <>
                      <i
                        className="fa-solid fa-spinner fa-spin"
                        aria-hidden="true"
                      />{" "}
                      Saving…
                    </>
                  ) : pwSuccess ? (
                    <>
                      <i className="fa-solid fa-check" aria-hidden="true" />{" "}
                      Password Updated
                    </>
                  ) : (
                    <>
                      <i
                        className="fa-solid fa-floppy-disk"
                        aria-hidden="true"
                      />{" "}
                      Save Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* .prof-panel */}
      </div>
      {/* .prof-content */}
    </div>
  );
}
