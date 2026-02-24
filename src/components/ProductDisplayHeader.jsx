import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { AuthStore } from "../utils/authStore";
import "./ProductDisplayHeader.css";

export function ProductDisplayHeader({
  cartCount = 0,
  searchQuery = "",
  onSearchChange,
}) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const searchInputRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(() =>
    AuthStore.getCurrentUser(),
  );

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1024) setIsDrawerOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (isDrawerOpen) setIsDrawerOpen(false);
        onSearchChange("");
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onSearchChange, isDrawerOpen]);

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  function handleSignOut() {
    AuthStore.logout();
    setCurrentUser(null);
    navigate("/login");
  }

  // Fix issue 6: typing in mobile search closes the drawer so results show
  function handleMobileSearch(val) {
    onSearchChange(val);
    if (val.trim()) setIsDrawerOpen(false);
  }

  const CartBadge = ({ id }) => (
    <span className="count" id={id}>
      {cartCount}
    </span>
  );

  return (
    <>
      <div className="header-container">
        <div className="left-section">
          <Link to="/">
            <img
              src="/images/logo/Luxury-Hijabi_Brand-Logo-4.png"
              alt="Luxury Hijabi"
              className="brand-logo"
            />
          </Link>
        </div>

        {/* Desktop search — hidden below 1024px */}
        <div className="middle-section">
          <div className="search-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products…"
              className="search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search products"
            />
            {searchQuery && (
              <button
                className="search-clear-icon-btn"
                aria-label="Clear search"
                onClick={() => {
                  onSearchChange("");
                  searchInputRef.current?.focus();
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop nav links — hidden below 1024px */}
        <div className="right-section">
          <div className="order-container">
            <Link to="/favorites" className="order">
              <i className="fa-solid fa-heart" />{" "}
              <span className="order-text">Favorites</span>
            </Link>
          </div>
          <div className="order-container">
            <Link to="/orders" className="order">
              <span className="order-text">Orders</span>
            </Link>
          </div>
          <div className="order-container">
            <Link to="/profile" className="order">
              <i className="fa-solid fa-user" />{" "}
              <span className="order-text">Profile</span>
            </Link>
          </div>
          <div className="cart-container">
            <div className="cart-image-container">
              <Link to="/checkout">
                <img
                  src="/images/icons/font-awesome-cart-white.svg"
                  alt="Cart"
                  className="cart-image"
                />
              </Link>
              <div className="cart-count-container">
                <CartBadge id="cartCountDesktop" />
              </div>
            </div>
            <div className="cart-name">
              <Link to="/checkout" className="order">
                Cart
              </Link>
            </div>
          </div>
          {currentUser ? (
            <div className="order-container">
              <button className="header-signout-btn" onClick={handleSignOut}>
                <i className="fa-solid fa-right-from-bracket" />{" "}
                <span className="order-text">Sign out</span>
              </button>
            </div>
          ) : (
            <div className="order-container">
              <Link to="/login" className="order">
                <span className="order-text">Sign In</span>
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger — visible below 1024px */}
        <button
          className={`menu-toggle${isDrawerOpen ? " open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen((p) => !p)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Backdrop — tapping outside closes drawer */}
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={closeDrawer} />
      )}

      {/* Mobile / Tablet Drawer */}
      <div className={`nav-drawer${isDrawerOpen ? " open" : ""}`}>
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            ref={mobileSearchRef}
            type="text"
            placeholder="Search products…"
            className="search-input mobile-search-input"
            value={searchQuery}
            onChange={(e) => handleMobileSearch(e.target.value)}
            aria-label="Search products"
          />
          {searchQuery && (
            <button
              className="search-clear-icon-btn"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        <nav className="mobile-nav">
          <Link
            to="/favorites"
            className="mobile-nav-item"
            onClick={closeDrawer}
          >
            <i className="fa-solid fa-heart" /> Favorites
          </Link>
          <Link to="/orders" className="mobile-nav-item" onClick={closeDrawer}>
            <i className="fa-solid fa-bag-shopping" /> Orders
          </Link>
          <Link to="/profile" className="mobile-nav-item" onClick={closeDrawer}>
            <i className="fa-solid fa-user" /> Profile
          </Link>
          <Link
            to="/checkout"
            className="mobile-nav-item mobile-cart-row"
            onClick={closeDrawer}
          >
            <span className="mobile-cart-left">
              <i className="fa-solid fa-cart-shopping" /> Cart
            </span>
            <span className="mobile-cart-badge">{cartCount}</span>
          </Link>
          {currentUser ? (
            <button
              className="mobile-nav-item mobile-nav-btn"
              onClick={() => {
                handleSignOut();
                closeDrawer();
              }}
            >
              <i className="fa-solid fa-right-from-bracket" /> Sign Out
            </button>
          ) : (
            <Link to="/login" className="mobile-nav-item" onClick={closeDrawer}>
              <i className="fa-solid fa-right-to-bracket" /> Sign In
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
