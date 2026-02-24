/**
 * Favorites.jsx
 *
 * Favorites page — shows all items the logged-in user has saved.
 * Allows the user to remove items from favorites or add them to cart.
 *
 * Guards: only accessible to logged-in users. If not logged in,
 * the user is redirected to the Login page (handled via router guard).
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FavoritesStore } from "../utils/favoritesStore";
import { CartStore } from "../utils/cartStore";
import { AuthStore } from "../utils/authStore";
import "./Favorites.css";

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ stars }) {
  const full = Math.floor(stars);
  const half = stars % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <>
      {Array.from({ length: full }, (_, i) => (
        <i key={`f${i}`} className="fa-solid fa-star" />
      ))}
      {half && <i className="fa-solid fa-star-half-stroke" />}
      {Array.from({ length: empty }, (_, i) => (
        <i key={`e${i}`} className="fa-regular fa-star" />
      ))}
    </>
  );
}

// ─── Single Favorite Card ─────────────────────────────────────────────────────
function FavCard({ product, onRemove, onAddToCart, isRemoving }) {
  const [isAdded, setIsAdded] = useState(false);
  const [beatingRemove, setBeatingRemove] = useState(false);

  function handleAddToCart() {
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  }

  function handleRemove() {
    // Small heartbeat animation before removal
    setBeatingRemove(true);
    setTimeout(() => onRemove(product.id), 150);
  }

  return (
    <div
      className={`fav-card anim-up${isRemoving ? " fav-card-removing" : ""}`}
    >
      {/* Remove from favorites button */}
      <button
        className={`fav-remove-btn${beatingRemove ? " beating" : ""}`}
        aria-label="Remove from favorites"
        onClick={handleRemove}
        title="Remove from favorites"
      >
        <i className="fa-solid fa-heart-crack" />
      </button>

      {/* Product image */}
      <div className="fav-card-img-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="fav-card-img"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/300x220/f8f3ec/5a3626?text=Item";
          }}
        />
      </div>

      <div className="fav-card-body">
        <p className="fav-card-name">{product.name}</p>

        {/* Star rating */}
        {product.rating && (
          <div className="fav-card-rating">
            <div className="fav-card-stars">
              <StarRating stars={product.rating.stars} />
            </div>
            <span className="fav-card-rating-count">
              (
              {product.rating.count > 1000
                ? `${product.rating.count / 1000}k`
                : product.rating.count}
              )
            </span>
          </div>
        )}

        <p className="fav-card-price">${product.price.toFixed(2)}</p>

        {/* Add to cart button */}
        <button
          className={`fav-add-btn${isAdded ? " btn-added" : ""}`}
          onClick={handleAddToCart}
        >
          <i
            className={isAdded ? "fa-solid fa-check" : "fa-solid fa-cart-plus"}
          />
          <span>{isAdded ? "Added ✓" : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main Favorites Component ─────────────────────────────────────────────────
export function Favorites() {
  const navigate = useNavigate();
  const user = AuthStore.getCurrentUser();

  const [favorites, setFavorites] = useState(() => FavoritesStore.getItems());
  const [cartCount, setCartCount] = useState(() => CartStore.getTotalCount());
  const [removingIds, setRemovingIds] = useState(new Set());
  const [toast, setToast] = useState({
    visible: false,
    exiting: false,
    message: "",
  });
  const toastTimerRef = useRef(null);

  /* p3 fix — hamburger drawer state for mobile */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /* Close drawer on Escape */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, exiting: false, message });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, exiting: true }));
      setTimeout(
        () => setToast({ visible: false, exiting: false, message: "" }),
        320,
      );
    }, 2800);
  }, []);

  // ── Remove from favorites ──────────────────────────────────────────────────
  function handleRemove(id) {
    setRemovingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      FavoritesStore.removeItem(id);
      setFavorites(FavoritesStore.getItems());
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 520); // matches cardSlideOut animation duration
  }

  // ── Add to cart from favorites ──────────────────────────────────────────────
  function handleAddToCart(product) {
    CartStore.addItem(product, 1);
    setCartCount(CartStore.getTotalCount());
    showToast(`${product.name} added to cart!`);
  }

  const isEmpty = favorites.length === 0;

  return (
    <>
      <title>Favorites – Luxury Hijabi</title>

      {/* ── Header ── */}
      <header className="fav-header">
        <div className="fav-header-inner">
          <Link to="/" className="fav-brand">
            <img
              src="../images/logo/Luxury-Hijabi_Brand-Logo-4.png"
              alt="Luxury Hijabi"
              className="fav-brand-logo"
            />
          </Link>

          <div className="fav-header-center">
            <h1 className="fav-heading">My Favorites</h1>
            <span className="fav-count-badge">
              {favorites.length} {favorites.length === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Desktop nav links */}
          <nav className="fav-header-nav">
            <Link to="/orders" className="fav-nav-link">
              <i className="fa-solid fa-bag-shopping" />
              <span>Orders</span>
            </Link>
            <Link to="/checkout" className="fav-nav-link">
              <i className="fa-solid fa-cart-shopping" />
              <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
            </Link>
            <button
              className="fav-nav-link"
              onClick={() => {
                AuthStore.logout();
                navigate("/login");
              }}
            >
              <i className="fa-solid fa-right-from-bracket" />
              <span>Sign out</span>
            </button>
          </nav>

          {/* Hamburger button — only visible on mobile (p3 fix) */}
          <button
            className={`fav-menu-toggle${drawerOpen ? " open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile drawer — slides down on mobile when hamburger is tapped */}
      <div className={`fav-nav-drawer${drawerOpen ? " open" : ""}`}>
        <Link
          to="/orders"
          className="fav-drawer-link"
          onClick={() => setDrawerOpen(false)}
        >
          <i className="fa-solid fa-bag-shopping" />
          Orders
        </Link>

        <Link
          to="/checkout"
          className="fav-drawer-link"
          onClick={() => setDrawerOpen(false)}
        >
          <i className="fa-solid fa-cart-shopping" />
          Cart
          {cartCount > 0 && (
            <span className="fav-drawer-badge">{cartCount}</span>
          )}
        </Link>

        <button
          className="fav-drawer-btn"
          onClick={() => {
            AuthStore.logout();
            navigate("/login");
            setDrawerOpen(false);
          }}
        >
          <i className="fa-solid fa-right-from-bracket" />
          Sign out
        </button>
      </div>

      {/* ── Main content ── */}
      <main className="fav-main">
        <div className="fav-title-row anim-up delay-1">
          <h2 className="fav-page-title">Saved Items</h2>
          {!isEmpty && (
            <span className="fav-page-count">
              {favorites.length} {favorites.length === 1 ? "item" : "items"}{" "}
              saved
            </span>
          )}
        </div>

        {/* Favorites grid */}
        {!isEmpty ? (
          <div className="fav-grid">
            {favorites.map((product, i) => (
              <FavCard
                key={product.id}
                product={product}
                isRemoving={removingIds.has(product.id)}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="fav-empty">
            <div className="fav-empty-icon">
              <i className="fa-regular fa-heart" />
            </div>
            <h3 className="fav-empty-title">No favorites yet</h3>
            <p className="fav-empty-sub">
              Browse our collection and tap the heart icon on any product to
              save it here for later.
            </p>
            <Link to="/" className="fav-shop-link">
              <i className="fa-solid fa-bag-shopping" />
              Start Shopping
            </Link>
          </div>
        )}
      </main>

      {/* ── Toast notification ── */}
      <div
        className={`fav-toast${!toast.visible ? " hidden" : ""}${toast.exiting ? " toast-out" : ""}`}
      >
        <i className="fa-solid fa-circle-check" />
        <span>{toast.message}</span>
      </div>
    </>
  );
}
