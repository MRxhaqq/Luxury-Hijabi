import { useState, useEffect } from "react";
import { Link } from "react-router";
import "./OrdersHeader.css";

export function OrdersHeader({ orderCount = 0, cartCount = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setIsOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <header className="oh-header">
        <div className="oh-inner">
          <Link to="/" className="oh-brand">
            <img
              src="/images/logo/Luxury-Hijabi_Brand-Logo-4.png"
              alt="Luxury Hijabi"
              className="oh-logo"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextElementSibling.style.display = "inline";
              }}
            />
            <span className="oh-logo-fallback">Luxury Hijabi</span>
          </Link>

          <div className="oh-title-wrap">
            <h1 className="oh-title">Your Orders</h1>
            <span className="oh-badge">
              {orderCount} {orderCount === 1 ? "order" : "orders"}
            </span>
          </div>

          <nav className="oh-nav">
            <Link to="/checkout" className="oh-nav-link">
              <i className="fa-solid fa-bag-shopping" /> Checkout
            </Link>
            <Link to="/checkout" className="oh-nav-link oh-cart-link">
              <i className="fa-solid fa-cart-shopping" /> Cart
              <span className="oh-cart-count">{cartCount}</span>
            </Link>
            <Link to="/" className="oh-nav-link">
              <i className="fa-solid fa-house" /> Shop
            </Link>
          </nav>

          <button
            className={`oh-hamburger${isOpen ? " open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((p) => !p)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {isOpen && <div className="oh-backdrop" onClick={close} />}

      <div className={`oh-drawer${isOpen ? " open" : ""}`}>
        <div className="oh-drawer-heading">
          <span className="oh-drawer-title">Your Orders</span>
          <span className="oh-badge">
            {orderCount} {orderCount === 1 ? "order" : "orders"}
          </span>
        </div>
        <nav className="oh-drawer-nav">
          <Link to="/checkout" className="oh-drawer-link" onClick={close}>
            <i className="fa-solid fa-bag-shopping" /> Checkout
          </Link>
          <Link to="/checkout" className="oh-drawer-link" onClick={close}>
            <i className="fa-solid fa-cart-shopping" /> Cart
            <span className="oh-drawer-cart-badge">{cartCount}</span>
          </Link>
          <Link to="/" className="oh-drawer-link" onClick={close}>
            <i className="fa-solid fa-house" /> Shop
          </Link>
        </nav>
      </div>
    </>
  );
}
