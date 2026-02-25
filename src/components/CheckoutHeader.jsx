/**
 * CheckoutHeader.jsx  (UPDATED)
 *
 * Changes from original:
 *  - Imports ThemeToggle (compact variant) and places it between
 *    the item count badge and the receipt icon button.
 *
 * Placement rationale:
 *  The checkout header is intentionally minimal — no full nav,
 *  just brand + heading + two utility icons. A compact toggle
 *  (icon + pill only, no text) fits the space without crowding.
 *  Users completing a purchase expect to stay focused; the toggle
 *  is available but visually quiet.
 */

import { Link } from "react-router";
import { ThemeToggle } from "./ThemeToggle";
import "./CheckoutHeader.css";

export function CheckoutHeader({ itemCount = 0, onToggleSummary }) {
  const label = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand logo */}
        <Link to="/" className="brand">
          <img
            src="../images/logo/Luxury-Hijabi_Brand-Logo-4.png"
            alt="Luxury Hijabi"
            className="brand-logo"
          />
        </Link>

        <div className="header-center">
          <h1 className="checkout-heading">Checkout</h1>
          <span className="item-count-badge" id="headerBadge">
            {label}
          </span>
        </div>

        {/* Right-side actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* ── Theme Toggle — compact variant ──
              Icon + pill only. Sits before the receipt button so the
              rightmost element is still the primary action (summary). */}
          <ThemeToggle variant="compact" />

          {/* Receipt / summary toggle button (mobile) */}
          <button
            className="icon-btn"
            id="summaryToggleBtn"
            aria-label="Toggle payment summary"
            onClick={onToggleSummary}
          >
            <i className="fa-solid fa-receipt" />
          </button>
        </div>
      </div>
    </header>
  );
}
