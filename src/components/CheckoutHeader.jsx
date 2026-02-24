/**
 * CheckoutHeader.jsx
 *
 * Checkout page header.
 * Converted from static HTML + checkout.js DOM manipulation to React props:
 *   - itemCount  {number}  – total cart item count shown in the badge
 *   - onToggleSummary {fn} – called when the receipt icon button is clicked
 *                            (opens the mobile payment summary drawer)
 */

import { Link } from "react-router";
import "./CheckoutHeader.css";

export function CheckoutHeader({ itemCount = 0, onToggleSummary }) {
  const label = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand logo — navigates back to the product listing page */}
        <Link to="/" className="brand">
          <img
            src="../images/logo/Luxury-Hijabi_Brand-Logo-4.png"
            alt="Luxury Hijabi"
            className="brand-logo"
          />
        </Link>

        <div className="header-center">
          <h1 className="checkout-heading">Checkout</h1>
          {/* Live item count badge — updated via props from Checkout.jsx */}
          <span className="item-count-badge" id="headerBadge">
            {label}
          </span>
        </div>

        {/* Receipt icon — opens the mobile payment summary drawer */}
        <button
          className="icon-btn"
          id="summaryToggleBtn"
          aria-label="Toggle payment summary"
          onClick={onToggleSummary}
        >
          <i className="fa-solid fa-receipt" />
        </button>
      </div>
    </header>
  );
}
