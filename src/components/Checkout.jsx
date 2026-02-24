/**
 * Checkout.jsx  (UPDATED)
 *
 * Changes from original:
 *  1. Empty cart redirect — if cart is empty, redirects to / with a toast message (Feature 8).
 *  2. Stripe Test-Mode Payment — "Place Order" opens a StripePayment modal (Feature 2).
 *  3. Order Confirmation page — after Stripe success, saves order to sessionStorage
 *     and navigates to /order-confirmation instead of showing an inline popup (Feature 9).
 *  4. Promo code LUXHIJABI gives 10% discount.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { CartStore } from "../utils/cartStore";
import { CheckoutHeader } from "./CheckoutHeader";
import { StripePayment } from "./StripePayment";
import "./Checkout.css";

const VALID_PROMO = "LUXHIJABI";
const PROMO_DISCOUNT = 0.1; // 10%

function fmt(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

/* ── Order Card ── */
function OrderCard({ item, onDelete, onQtyChange, isRemoving }) {
  function handleDelete() {
    onDelete(item.id);
  }
  return (
    <div className={`order-card${isRemoving ? " card-removing" : ""}`}>
      <div className="card-header">
        <i className="fa-solid fa-box" />
        <strong>{item.name}</strong>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
          Arrives {item.deliveryDate}
        </span>
      </div>
      <div className="card-body">
        <div className="prod-img-wrap">
          <img
            src={item.image}
            alt={item.name}
            className="prod-img"
            onError={(e) => {
              e.target.src =
                "https://placehold.co/110x110/f8f3ec/5a3626?text=Item";
            }}
          />
        </div>

        <div>
          <p className="prod-name">{item.name}</p>
          <p className="prod-price">${item.price.toFixed(2)}</p>
          <div className="prod-meta">
            <span>Qty:</span>
            <select
              className="qty-select"
              value={item.qty}
              onChange={(e) => onQtyChange(item.id, e.target.value)}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <button className="txt-btn delete-btn" onClick={handleDelete}>
              Remove
            </button>
          </div>
        </div>

        <div className="delivery-opts">
          <p className="opts-label">Delivery</p>
          <label className="radio-row">
            <input type="radio" name={`del-${item.id}`} defaultChecked />
            <span className="radio-dot" />
            <span className="radio-info">
              <strong>
                {item.shippingCost === 0
                  ? "Free Standard"
                  : `Standard ($${item.shippingCost.toFixed(2)})`}
              </strong>
              <em>{item.deliveryDate}</em>
            </span>
          </label>
          <label className="radio-row">
            <input type="radio" name={`del-${item.id}`} />
            <span className="radio-dot" />
            <span className="radio-info">
              <strong>Express ($9.99)</strong>
              <em>1-2 business days</em>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

/* ── Main Checkout Component ── */
export function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => CartStore.getItems());
  const [removingIds, setRemovingIds] = useState(new Set());

  /* Promo code */
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState("idle"); // "idle" | "success" | "error"
  const [discountApplied, setDiscountApplied] = useState(false);

  /* Stripe modal */
  const [showStripe, setShowStripe] = useState(false);

  /* Mobile summary drawer */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Reset spinner */
  const [resetSpinning, setResetSpinning] = useState(false);

  /* ── Empty cart redirect (Feature 8) ── */
  useEffect(() => {
    if (items.length === 0) {
      /* Store a flag that the main page can read to show a friendly message */
      try {
        sessionStorage.setItem("lh_empty_cart_redirect", "1");
      } catch {}
      navigate("/", { replace: true });
    }
  }, [items, navigate]);

  /* Set body padding for fixed header */
  useEffect(() => {
    document.body.style.paddingTop = "114px";
    return () => {
      document.body.style.paddingTop = "";
    };
  }, []);

  /* ── Computed totals ── */
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = items.reduce((s, i) => s + i.shippingCost * i.qty, 0);
  const discount = discountApplied ? subtotal * PROMO_DISCOUNT : 0;
  const tax = (subtotal + shipping - discount) * 0.1;
  const total = subtotal + shipping - discount + tax;

  /* ── Item operations ── */
  function handleDelete(id) {
    setRemovingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      CartStore.removeItem(id);
      setItems(CartStore.getItems());
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 640);
  }

  function handleQtyChange(id, qty) {
    CartStore.updateQty(id, qty);
    setItems(CartStore.getItems());
  }

  /* ── Promo code ── */
  function handleApplyPromo() {
    if (promoCode.trim().toUpperCase() === VALID_PROMO) {
      setPromoStatus("success");
      setDiscountApplied(true);
    } else {
      setPromoStatus("error");
      setDiscountApplied(false);
    }
  }

  /* ── Stripe success handler ── */
  function handleStripeSuccess() {
    /* Build the delivery overrides from the cart */
    const overrides = {};
    items.forEach((i) => { overrides[i.id] = i.shippingCost; });

    /* Place the order (saves to localStorage + clears cart) */
    CartStore.placeOrder(overrides);

    /* Get the most recent order for the confirmation page */
    const orders = CartStore.getOrders();
    const lastOrder = orders[0];

    if (lastOrder) {
      try {
        sessionStorage.setItem("lh_last_order", JSON.stringify(lastOrder));
      } catch {}
    }

    setShowStripe(false);

    /* Navigate to the order confirmation page */
    navigate("/order-confirmation");
  }

  /* ── Reset cart ── */
  function handleReset() {
    setResetSpinning(true);
    setTimeout(() => {
      CartStore.clear();
      setItems([]);
      setResetSpinning(false);
    }, 500);
  }

  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const isEmpty = items.length === 0;

  /* Don't render while redirect is in progress */
  if (isEmpty) return null;

  return (
    <>
      <title>Checkout – Luxury Hijabi</title>

      <CheckoutHeader
        itemCount={itemCount}
        onToggleSummary={() => setDrawerOpen((p) => !p)}
      />

      {/* Progress strip */}
      <div className="progress-wrap">
        <div className="progress-track">
          <div className="progress-fill" />
        </div>
        <div className="progress-labels">
          <span className="prog-step done">Cart</span>
          <span className="prog-step active">Checkout</span>
          <span className="prog-step">Payment</span>
          <span className="prog-step">Confirmation</span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="main-layout">
        {/* Left — order cards */}
        <div>
          <h2 className="col-title">Your Cart</h2>

          {items.map((item, i) => (
            <div
              className="anim-up"
              key={item.id}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <OrderCard
                item={item}
                isRemoving={removingIds.has(item.id)}
                onDelete={handleDelete}
                onQtyChange={handleQtyChange}
              />
            </div>
          ))}
        </div>

        {/* Right — payment summary */}
        <div className="summary-col">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>

            <div className="sum-row">
              <span className="sum-label">Subtotal ({itemCount} items)</span>
              <span className="sum-val">{fmt(subtotal)}</span>
            </div>
            <div className="sum-row">
              <span className="sum-label">Shipping</span>
              <span className="sum-val">{shipping === 0 ? "Free" : fmt(shipping)}</span>
            </div>
            {discountApplied && (
              <div className="sum-row">
                <span className="sum-label" style={{ color: "#2e7d32" }}>Promo (LUXHIJABI)</span>
                <span className="sum-val" style={{ color: "#2e7d32" }}>-{fmt(discount)}</span>
              </div>
            )}
            <div className="sum-row">
              <span className="sum-label">Tax (10%)</span>
              <span className="sum-val">{fmt(tax)}</span>
            </div>
            <div className="sum-divider" />
            <div className="sum-row total-row">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>

            {/* Promo code */}
            <div className="promo-row">
              <input
                type="text"
                className={`promo-input${promoStatus === "success" ? " promo-success" : promoStatus === "error" ? " promo-error" : ""}`}
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); setPromoStatus("idle"); }}
                disabled={discountApplied}
              />
              <button
                className={`promo-btn${promoStatus === "success" ? " promo-btn-success" : ""}`}
                onClick={handleApplyPromo}
                disabled={discountApplied || !promoCode.trim()}
              >
                {promoStatus === "success" ? "Applied!" : "Apply"}
              </button>
            </div>
            {promoStatus === "error" && (
              <p style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#b94040", marginTop: 6 }}>
                Invalid promo code.
              </p>
            )}
            {promoStatus !== "success" && (
              <p style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#9a7060", marginTop: 6 }}>
                Try: <strong>LUXHIJABI</strong> for 10% off
              </p>
            )}

            {/* Place Order button — opens Stripe modal */}
            <button
              className="place-btn"
              onClick={() => setShowStripe(true)}
              disabled={isEmpty}
            >
              <span className="place-btn-text">Proceed to Payment</span>
              <i className="fa-solid fa-lock place-btn-icon" />
            </button>

            <p className="secure-note">
              <i className="fa-solid fa-shield-halved" />
              Secure checkout · SSL encrypted
            </p>
          </div>
        </div>
      </div>

      {/* ── Reset button ── */}
      <button
        className={`co-reset-btn${resetSpinning ? " spinning" : ""}`}
        onClick={handleReset}
        title="Clear cart"
      >
        <i className="fa-solid fa-rotate-left" />
        <span>Clear Cart</span>
      </button>

      {/* ── Mobile payment drawer ── */}
      {drawerOpen && (
        <div
          className="payment-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div className={`payment-drawer${drawerOpen ? " open" : ""}`}>
        <div className="payment-drawer-handle" />
        <div className="payment-drawer-inner">
          <h3 className="payment-drawer-title">Order Summary</h3>
          <div className="sum-row">
            <span className="sum-label">Subtotal</span>
            <span className="sum-val">{fmt(subtotal)}</span>
          </div>
          <div className="sum-row">
            <span className="sum-label">Shipping</span>
            <span className="sum-val">{shipping === 0 ? "Free" : fmt(shipping)}</span>
          </div>
          {discountApplied && (
            <div className="sum-row">
              <span className="sum-label" style={{ color: "#2e7d32" }}>Promo</span>
              <span className="sum-val" style={{ color: "#2e7d32" }}>-{fmt(discount)}</span>
            </div>
          )}
          <div className="sum-row">
            <span className="sum-label">Tax (10%)</span>
            <span className="sum-val">{fmt(tax)}</span>
          </div>
          <div className="sum-divider" />
          <div className="sum-row total-row">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
          <button
            className="place-btn payment-drawer-place-btn"
            onClick={() => { setDrawerOpen(false); setShowStripe(true); }}
          >
            <span className="place-btn-text">Proceed to Payment</span>
            <i className="fa-solid fa-lock place-btn-icon" />
          </button>
        </div>
      </div>

      {/* ── Stripe Payment Modal (Feature 2) ── */}
      {showStripe && (
        <StripePayment
          total={total}
          onSuccess={handleStripeSuccess}
          onClose={() => setShowStripe(false)}
        />
      )}
    </>
  );
}
