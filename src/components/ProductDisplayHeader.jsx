/**
 * ProductDisplayHeader.jsx  (UPDATED)
 *
 * Changes from original:
 *  - Imports ThemeToggle and renders it:
 *      Desktop (>1024px) → right nav section, between Profile and Sign Out
 *      Mobile drawer     → inside mobile-nav, between Profile and Sign Out
 *
 * Placement rationale (UX):
 *  Desktop/Laptop: Right nav is where all global utility actions live
 *    (cart, profile, sign in/out). Theme is a global preference → it belongs
 *    there, not tucked away inside a page. It sits just before Sign Out so
 *    it shares the "user preference" section without pushing cart further away.
 *
 *  Tablet/Mobile: The hamburger drawer mirrors the desktop nav.
 *    The toggle occupies the same relative position inside the drawer —
 *    consistent muscle memory regardless of screen size.
 *    It is NOT a floating FAB or bottom-sheet trigger, which would be
 *    intrusive on a shopping page.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { AuthStore } from "../utils/authStore";
import { ThemeToggle } from "./ThemeToggle";
import "./ProductDisplayHeader.css";

const DEBOUNCE_MS = 280;

export function ProductDisplayHeader({
  cartCount = 0,
  searchQuery = "",
  onSearchChange,
}) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [mobileSearchValue, setMobileSearchValue] = useState(searchQuery);

  const desktopSearchRef = useRef(null);
  const mobileOverlayInputRef = useRef(null);
  const debounceTimer = useRef(null);

  const [currentUser, setCurrentUser] = useState(() =>
    AuthStore.getCurrentUser(),
  );

  useEffect(() => {
    setMobileSearchValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1024) {
        setIsDrawerOpen(false);
        closeMobileSearch();
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      isDrawerOpen && !isMobileSearchActive ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen, isMobileSearchActive]);

  useEffect(() => {
    function handleKey(e) {
      if (
        e.key === "/" &&
        document.activeElement !== desktopSearchRef.current
      ) {
        e.preventDefault();
        desktopSearchRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (isMobileSearchActive) {
          closeMobileSearch();
          return;
        }
        if (isDrawerOpen) {
          setIsDrawerOpen(false);
          return;
        }
        onSearchChange("");
        desktopSearchRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isDrawerOpen, isMobileSearchActive, onSearchChange]);

  const emitSearch = useCallback(
    (value) => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onSearchChange(value);
      }, DEBOUNCE_MS);
    },
    [onSearchChange],
  );

  function handleDesktopSearch(val) {
    onSearchChange(val);
  }

  function openMobileSearch() {
    setIsDrawerOpen(false);
    setIsMobileSearchActive(true);
    requestAnimationFrame(() => {
      mobileOverlayInputRef.current?.focus();
    });
  }

  function closeMobileSearch() {
    setIsMobileSearchActive(false);
    setMobileSearchValue("");
    onSearchChange("");
  }

  function closeDrawer() {
    setIsDrawerOpen(false);
  }

  function handleSignOut() {
    AuthStore.logout();
    setCurrentUser(null);
    navigate("/login");
  }

  const CartBadge = ({ id }) => (
    <span className="count" id={id}>
      {cartCount}
    </span>
  );

  return (
    <>
      {/* ── Fixed header bar ── */}
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

        {/* Desktop search — hidden ≤1024px */}
        <div className="middle-section">
          <div className="search-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon" />
            <input
              ref={desktopSearchRef}
              type="text"
              placeholder="Search products…"
              className="search-input"
              value={searchQuery}
              onChange={(e) => handleDesktopSearch(e.target.value)}
              aria-label="Search products"
            />
            {searchQuery && (
              <button
                className="search-clear-icon-btn"
                aria-label="Clear search"
                onClick={() => {
                  onSearchChange("");
                  desktopSearchRef.current?.focus();
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop nav — hidden ≤1024px */}
        <div className="right-section">
          <div className="order-container">
            <Link to="/favorites" className="order">
              <i className="fa-solid fa-heart" />
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
              <i className="fa-solid fa-user" />
              <span className="order-text">Profile</span>
            </Link>
          </div>

          {/* ── Theme Toggle — desktop nav ──
              Sits between Profile and Sign Out in the "personal" section.
              Uses default variant: icon + label + pill.
              Compact enough not to stretch the header. */}
          <div className="order-container" style={{ padding: "5px 10px" }}>
            <ThemeToggle variant="default" />
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
                <i className="fa-solid fa-right-from-bracket" />
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

        {/* Hamburger — visible ≤1024px */}
        <button
          className={`menu-toggle${isDrawerOpen ? " open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={isDrawerOpen}
          onClick={() => setIsDrawerOpen((p) => !p)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* ── Backdrop (drawer) ── */}
      {isDrawerOpen && !isMobileSearchActive && (
        <div className="drawer-backdrop" onClick={closeDrawer} />
      )}

      {/* ── Mobile / Tablet drawer ── */}
      <div className={`nav-drawer${isDrawerOpen ? " open" : ""}`}>
        <div className="search-wrap" onClick={openMobileSearch}>
          <i className="fa-solid fa-magnifying-glass search-icon" />
          <input
            type="text"
            placeholder="Search products…"
            className="search-input mobile-search-input"
            value={mobileSearchValue}
            readOnly
            aria-label="Open search"
          />
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

          {/* ── Theme Toggle — mobile drawer ──
              Uses "drawer" variant: full-width row matching other drawer items.
              Positioned just before Sign In/Out — consistent with desktop order. */}
          <ThemeToggle variant="drawer" />

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

      {/* ── Mobile search overlay ── */}
      <div
        className={`mobile-search-overlay${isMobileSearchActive ? " active" : ""}`}
      >
        <div className="mobile-search-overlay-row">
          <button
            className="mobile-search-back"
            onClick={closeMobileSearch}
            aria-label="Close search"
          >
            <i className="fa-solid fa-arrow-left" />
          </button>

          <div className="mobile-search-overlay-input-wrap">
            <div className="search-wrap">
              <i className="fa-solid fa-magnifying-glass search-icon" />
              <input
                ref={mobileOverlayInputRef}
                type="text"
                placeholder="Search products…"
                className="search-input mobile-search-input"
                value={mobileSearchValue}
                onChange={(e) => handleMobileSearchChange(e.target.value)}
                aria-label="Search products"
              />
              {mobileSearchValue && (
                <button
                  className="search-clear-icon-btn"
                  aria-label="Clear search"
                  onClick={() => {
                    setMobileSearchValue("");
                    onSearchChange("");
                    mobileOverlayInputRef.current?.focus();
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  function handleMobileSearchChange(val) {
    setMobileSearchValue(val);
    emitSearch(val);
  }
}
