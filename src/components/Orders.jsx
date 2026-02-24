/**
 * Orders.jsx  (UPDATED)
 *
 * Changes from original:
 *  - Reset button now CLEARS ALL ORDER HISTORY instead of reloading the page.
 *    Research: on e-commerce order history pages, a "Reset" or "Clear" action
 *    should clear the displayed data (order history). Reloading the page would
 *    just show the same orders again, which is not useful. Clearing order history
 *    lets users clean up their account, which is the expected behavior.
 *  - A confirmation dialog is shown before clearing (prevents accidental data loss).
 *  - The ORDERS_KEY is cleared from localStorage when confirmed.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import { CartStore } from "../utils/cartStore";
import { OrdersHeader } from "./OrdersHeader";
import "./Orders.css";

const ORDERS_KEY = "lh_orders_v1"; // must match the key used in cartStore.js

function fmt(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Single Order Item Row ────────────────────────────────────────────────────
function OrderItem({ item, onAddToCart, onTrack }) {
  const [clicked, setClicked] = useState(false);

  function handleAddToCart() {
    onAddToCart(item);
    setClicked(true);
    setTimeout(() => setClicked(false), 180);
  }

  return (
    <div className="order-item">
      <div className="item-img-wrap">
        <img
          src={item.image}
          alt={item.name}
          className="item-img"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/110x110/f8f3ec/5a3626?text=Item";
          }}
        />
      </div>

      <div className="item-info">
        <p className="item-name">{item.name}</p>
        <p className="item-arriving">
          <i className="fa-solid fa-truck-fast" />
          Arriving on: <strong>{item.deliveryDate || "Monday, March 2"}</strong>
        </p>
        <p className="item-qty">
          Quantity: <strong>{item.qty}</strong>
        </p>
        <button
          className={`btn-add-cart${clicked ? " btn-clicked" : ""}`}
          onClick={handleAddToCart}
        >
          <i className="fa-solid fa-cart-plus" />
          <span>Add to Cart</span>
        </button>
      </div>

      <div className="item-actions">
        <button className="btn-track" onClick={onTrack}>
          <i className="fa-solid fa-location-dot" /> Track package
        </button>
      </div>
    </div>
  );
}

// ─── Order Group ──────────────────────────────────────────────────────────────
function OrderGroup({ order, animClass, onAddToCart, onTrack }) {
  return (
    <div className={`order-group ${animClass}`}>
      <div className="order-meta">
        <div className="order-meta-item">
          <span className="meta-label">Order Placed:</span>
          <span className="meta-value">{order.datePlaced}</span>
        </div>
        <div className="order-meta-item">
          <span className="meta-label">Total:</span>
          <span className="meta-value meta-total">{fmt(order.total)}</span>
        </div>
        <div className="order-meta-item order-meta-id">
          <span className="meta-label">Order ID:</span>
          <span className="meta-value meta-id">{order.id}</span>
        </div>
      </div>

      {order.items.map((item) => (
        <OrderItem
          key={item.id + order.id}
          item={item}
          onAddToCart={onAddToCart}
          onTrack={onTrack}
        />
      ))}
    </div>
  );
}

const DELAY_CLASSES = ["anim-up delay-2", "anim-up delay-3", "anim-up delay-4"];

// ─── Confirm Clear Dialog ─────────────────────────────────────────────────────
function ConfirmClearOrdersDialog({ onConfirm, onCancel }) {
  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="track-box" style={{ textAlign: "center" }}>
        <button className="track-close" aria-label="Close" onClick={onCancel}>
          <i className="fa-solid fa-xmark" />
        </button>
        <div
          className="track-icon-wrap"
          style={{ background: "linear-gradient(135deg, #b94040, #7a2020)" }}
        >
          <i className="fa-solid fa-trash" />
        </div>
        <h2 className="track-title">Clear Order History?</h2>
        <p className="track-sub">
          This will permanently remove all your order records. This cannot be
          undone.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            className="track-dismiss"
            style={{ background: "#b94040" }}
            onClick={onConfirm}
          >
            <span>Yes, Clear All</span>
          </button>
          <button className="track-dismiss" onClick={onCancel}>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Orders Component ────────────────────────────────────────────────────
export function Orders() {
  const [orders, setOrders] = useState(() => CartStore.getOrders());
  const [cartCount, setCartCount] = useState(() => CartStore.getTotalCount());
  const [showTrack, setShowTrack] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    exiting: false,
    message: "",
  });
  const [resetSpinning, setResetSpinning] = useState(false);

  // ── Set body padding ────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.paddingTop = "64px";
    document.body.style.paddingBottom = "0px";
    return () => {
      document.body.style.paddingTop = "";
      document.body.style.paddingBottom = "";
    };
  }, []);

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2800);
  }, []);

  // ── Keyboard: Escape closes overlays ───────────────────────────────────────
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        setShowTrack(false);
        setShowClearConfirm(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // ── Lock body scroll while overlays are open ────────────────────────────────
  useEffect(() => {
    document.body.style.overflow =
      showTrack || showClearConfirm ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showTrack, showClearConfirm]);

  // ── Add to Cart from order history ─────────────────────────────────────────
  function handleAddToCart(item) {
    CartStore.addItem(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        deliveryDate: item.deliveryDate,
        shippingCost: item.shippingCost ?? 0,
      },
      1,
    );
    setCartCount(CartStore.getTotalCount());
    showToast(`${item.name} added to cart!`);
  }

  // ── Reset / Clear Order History ─────────────────────────────────────────────
  /*
   * E-commerce best practice: "Reset" on an orders page clears the order history.
   * This gives users control over their account data. Reloading the page would
   * just show the same orders again — not useful. Clearing the history is the
   * expected behavior when a user explicitly requests a reset of the order list.
   */
  function handleResetClick() {
    if (orders.length === 0) return; // nothing to clear
    setShowClearConfirm(true);
  }

  function handleConfirmClear() {
    setResetSpinning(true);
    setShowClearConfirm(false);

    setTimeout(() => {
      try {
        localStorage.removeItem(ORDERS_KEY); // clear from localStorage
      } catch {}
      setOrders([]);
      setResetSpinning(false);
    }, 480);
  }

  const isEmpty = orders.length === 0;

  return (
    <>
      <title>Orders - Page</title>

      <OrdersHeader orderCount={orders.length} cartCount={cartCount} />

      <main className="main-wrap">
        <div className="orders-container">
          <h2 className="section-title anim-up delay-1">Your Orders</h2>

          {orders.map((order, i) => (
            <OrderGroup
              key={order.id}
              order={order}
              animClass={DELAY_CLASSES[Math.min(i, DELAY_CLASSES.length - 1)]}
              onAddToCart={handleAddToCart}
              onTrack={() => setShowTrack(true)}
            />
          ))}

          <div
            className={`empty-state${isEmpty ? "" : " hidden"}`}
            id="emptyState"
          >
            <i className="fa-regular fa-bag-shopping" />
            <p>You have no orders yet.</p>
            <Link to="/" className="continue-link">
              Start Shopping
            </Link>
          </div>
        </div>
      </main>

      {/* ── Reset Button — only visible when there are orders to clear ── */}
      {!isEmpty && (
        <button
          className={`reset-btn${resetSpinning ? " spinning" : ""}`}
          title="Clear all order history"
          onClick={handleResetClick}
        >
          <i className="fa-solid fa-rotate-left" />
          <span>Clear History</span>
        </button>
      )}

      {/* ── Confirm Clear Dialog ── */}
      {showClearConfirm && (
        <ConfirmClearOrdersDialog
          onConfirm={handleConfirmClear}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {/* ── Track Package Overlay ── */}
      <div
        className={`overlay${showTrack ? "" : " hidden"}`}
        id="trackOverlay"
        onClick={(e) => e.target === e.currentTarget && setShowTrack(false)}
      >
        <div className="track-box">
          <button
            className="track-close"
            aria-label="Close"
            onClick={() => setShowTrack(false)}
          >
            <i className="fa-solid fa-xmark" />
          </button>
          <div className="track-icon-wrap">
            <i className="fa-solid fa-truck-fast" />
          </div>
          <h2 className="track-title">Tracking Your Package</h2>
          <p className="track-sub">Your order is on its way!</p>

          <div className="track-steps">
            <div className="track-step done">
              <div className="track-dot">
                <i className="fa-solid fa-check" />
              </div>
              <div className="track-step-info">
                <strong>Order Confirmed</strong>
                <span>February 19, 2026</span>
              </div>
            </div>
            <div className="track-step done">
              <div className="track-dot">
                <i className="fa-solid fa-check" />
              </div>
              <div className="track-step-info">
                <strong>Shipped</strong>
                <span>February 20, 2026</span>
              </div>
            </div>
            <div className="track-step active">
              <div className="track-dot">
                <i className="fa-solid fa-truck" />
              </div>
              <div className="track-step-info">
                <strong>Out for Delivery</strong>
                <span>Estimated: February 24, 2026</span>
              </div>
            </div>
            <div className="track-step">
              <div className="track-dot">
                <i className="fa-solid fa-house" />
              </div>
              <div className="track-step-info">
                <strong>Delivered</strong>
                <span>Pending</span>
              </div>
            </div>
          </div>

          <button className="track-dismiss" onClick={() => setShowTrack(false)}>
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* ── Cart Toast Notification ── */}
      <div
        className={`cart-toast${!toast.visible ? " hidden" : ""}${toast.exiting ? " toast-out" : ""}`}
        id="cartToast"
      >
        <i className="fa-solid fa-circle-check" />
        <span id="cartToastMsg">{toast.message}</span>
      </div>
    </>
  );
}
