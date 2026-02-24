import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { AuthStore } from "../utils/authStore";
import { CartStore } from "../utils/cartStore";
import { FavoritesStore } from "../utils/favoritesStore";
import { ProductDisplayHeader } from "./ProductDisplayHeader";
import "./Profile.css";

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

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => AuthStore.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(() => CartStore.getTotalCount());

  useEffect(() => {
    if (!user) navigate("/login?redirect=/profile", { replace: true });
  }, [user, navigate]);

  const orderCount = CartStore.getOrders().length;
  const favCount = FavoritesStore.getCount();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("lh_users_v1") || "[]");
      const stored = users.find((u) => u.id === user.id);
      if (!stored || stored.password !== currentPw) {
        setPwError("Current password is incorrect.");
        setLoading(false);
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
      setLoading(false);
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

      {/* Hero */}
      <div className="prof-hero">
        <div className="prof-hero-inner">
          <div className="prof-avatar">{user.username[0].toUpperCase()}</div>
          <div className="prof-hero-text">
            <div className="prof-hero-name">{user.username}</div>
            <div className="prof-hero-email">{user.email}</div>
            <div className="prof-hero-badge">
              <i className="fa-solid fa-crown" /> Luxury Member
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prof-content">
        {/* Sidebar nav */}
        <nav className="prof-sidebar">
          <Link to="/" className="prof-nav-item">
            <i className="fa-solid fa-house" /> Home
          </Link>
          <Link to="/profile" className="prof-nav-item active">
            <i className="fa-solid fa-user" /> My Profile
          </Link>
          <Link to="/orders" className="prof-nav-item">
            <i className="fa-solid fa-bag-shopping" /> Orders
          </Link>
          <Link to="/favorites" className="prof-nav-item">
            <i className="fa-solid fa-heart" /> Favorites
          </Link>
          <Link to="/checkout" className="prof-nav-item">
            <i className="fa-solid fa-cart-shopping" /> Cart
          </Link>
          <div className="prof-nav-divider" />
          <button className="prof-nav-item danger" onClick={handleSignOut}>
            <i className="fa-solid fa-right-from-bracket" /> Sign Out
          </button>
        </nav>

        {/* Main panel */}
        <div className="prof-panel">
          {/* Stats card */}
          <div className="prof-card">
            <div className="prof-card-header">
              <i className="fa-solid fa-circle-user" />
              <h2 className="prof-card-title">Account Overview</h2>
            </div>
            <div className="prof-stats-row">
              <div className="prof-stat-cell">
                <span className="prof-stat-num">{orderCount}</span>
                <span className="prof-stat-lbl">Orders</span>
              </div>
              <div className="prof-stat-cell">
                <span className="prof-stat-num">{favCount}</span>
                <span className="prof-stat-lbl">Favorites</span>
              </div>
              <div className="prof-stat-cell">
                <span className="prof-stat-num">{cartCount}</span>
                <span className="prof-stat-lbl">In Cart</span>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div className="prof-card">
            <div className="prof-card-header">
              <i className="fa-solid fa-id-card" />
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
                <span
                  className="prof-info-value"
                  style={{ color: "#2e7d32", fontWeight: 700 }}
                >
                  <i
                    className="fa-solid fa-circle-check"
                    style={{ marginRight: 6 }}
                  />{" "}
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="prof-card">
            <div className="prof-card-header">
              <i className="fa-solid fa-lock" />
              <h2 className="prof-card-title">Change Password</h2>
            </div>
            <div className="prof-card-body">
              <div className={`prof-banner error${pwError ? "" : " hidden"}`}>
                <i className="fa-solid fa-triangle-exclamation" />
                <span>{pwError}</span>
              </div>
              <div
                className={`prof-banner success${pwSuccess ? "" : " hidden"}`}
              >
                <i className="fa-solid fa-circle-check" />
                <span>Password updated successfully!</span>
              </div>

              <form onSubmit={handleChangePassword}>
                <div className="prof-field">
                  <label className="prof-label" htmlFor="curr-pw">
                    Current Password
                  </label>
                  <div className="prof-input-wrap">
                    <i className="fa-solid fa-lock prof-input-icon" />
                    <input
                      id="curr-pw"
                      type={showCurrent ? "text" : "password"}
                      className="prof-input"
                      placeholder="Enter your current password"
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="prof-pw-toggle"
                      onClick={() => setShowCurrent((p) => !p)}
                    >
                      <i
                        className={
                          showCurrent
                            ? "fa-solid fa-eye-slash"
                            : "fa-solid fa-eye"
                        }
                      />
                    </button>
                  </div>
                </div>

                <div className="prof-field">
                  <label className="prof-label" htmlFor="new-pw">
                    New Password
                  </label>
                  <div className="prof-input-wrap">
                    <i className="fa-solid fa-key prof-input-icon" />
                    <input
                      id="new-pw"
                      type={showNew ? "text" : "password"}
                      className="prof-input"
                      placeholder="At least 6 characters"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="prof-pw-toggle"
                      onClick={() => setShowNew((p) => !p)}
                    >
                      <i
                        className={
                          showNew ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                        }
                      />
                    </button>
                  </div>
                  {newPw && (
                    <div className="prof-pw-strength">
                      <div
                        className={`prof-pw-bar ${STRENGTH_CLASSES[pwStrength]}`}
                      />
                      <span
                        className={`prof-pw-label ${STRENGTH_CLASSES[pwStrength]}`}
                      >
                        {STRENGTH_LABELS[pwStrength]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="prof-field">
                  <label className="prof-label" htmlFor="confirm-pw">
                    Confirm New Password
                  </label>
                  <div className="prof-input-wrap">
                    <i className="fa-solid fa-key prof-input-icon" />
                    <input
                      id="confirm-pw"
                      type="password"
                      className="prof-input"
                      placeholder="Re-enter your new password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`prof-save-btn${pwSuccess ? " success-btn" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" /> Saving…
                    </>
                  ) : pwSuccess ? (
                    <>
                      <i className="fa-solid fa-check" /> Password Updated
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk" /> Save Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
