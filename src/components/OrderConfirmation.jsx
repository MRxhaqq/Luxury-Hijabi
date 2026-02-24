/**
 * OrderConfirmation.jsx
 *
 * Printable / shareable order summary page at /order-confirmation
 * Shows after an order is placed from the Checkout page.
 *
 * Data is read from sessionStorage key "lh_last_order" which is
 * written by Checkout.jsx before navigating here.
 * Falls back gracefully if no order is found.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import "./OrderConfirmation.css";

function fmt(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function OrderConfirmation() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lh_last_order");
      if (raw) {
        setOrder(JSON.parse(raw));
        /* Keep it available for the session but don't remove it
           so refreshing still works */
      }
    } catch { /* ignore */ }
  }, []);

  if (!order) {
    return (
      <div className="oc-page">
        <div className="oc-topbar">
          <Link to="/" className="oc-topbar-brand">Luxury Hijabi</Link>
        </div>
        <div className="oc-wrap" style={{ textAlign: "center", paddingTop: 80 }}>
          <i className="fa-solid fa-bag-shopping" style={{ fontSize: 52, color: "#c4a99a", marginBottom: 20, display: "block" }} />
          <p style={{ fontFamily: "Cinzel, serif", fontSize: 20, color: "#9a7060", marginBottom: 16 }}>
            No order found.
          </p>
          <Link to="/" className="oc-cta-primary" style={{ display: "inline-flex", maxWidth: 220, margin: "0 auto" }}>
            <i className="fa-solid fa-bag-shopping" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = order.items.reduce((s, i) => s + (i.shippingCost ?? 0), 0);
  const tax = (subtotal + shipping) * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="oc-page">
      <title>Order Confirmed – Luxury Hijabi</title>

      {/* ── Top bar ── */}
      <div className="oc-topbar">
        <Link to="/" className="oc-topbar-brand">Luxury Hijabi</Link>
        <div className="oc-topbar-actions">
          <button className="oc-topbar-btn print-btn" onClick={() => window.print()}>
            <i className="fa-solid fa-print" /> Print
          </button>
          <Link to="/orders" className="oc-topbar-btn">
            <i className="fa-solid fa-bag-shopping" /> My Orders
          </Link>
        </div>
      </div>

      <div className="oc-wrap">
        {/* ── Hero ── */}
        <div className="oc-hero">
          <div className="oc-success-ring">
            <i className="fa-solid fa-check" />
          </div>
          <h1 className="oc-hero-title">Order Confirmed!</h1>
          <p className="oc-hero-sub">
            Thank you for your purchase. We have received your order and will
            begin processing it right away. A summary is shown below.
          </p>
          <div className="oc-order-id-chip">
            <i className="fa-solid fa-hashtag" />
            Order #{order.id}
          </div>
        </div>

        {/* ── Order details ── */}
        <div className="oc-card" style={{ animationDelay: "0.1s" }}>
          <div className="oc-card-header">
            <i className="fa-solid fa-circle-info" />
            <h2 className="oc-card-title">Order Details</h2>
          </div>
          <div className="oc-card-body">
            <div className="oc-meta-grid">
              <div className="oc-meta-item">
                <div className="oc-meta-label">Order Date</div>
                <div className="oc-meta-value">{order.datePlaced}</div>
              </div>
              <div className="oc-meta-item">
                <div className="oc-meta-label">Order ID</div>
                <div className="oc-meta-value" style={{ fontFamily: "monospace", fontSize: 13 }}>
                  #{order.id}
                </div>
              </div>
              <div className="oc-meta-item">
                <div className="oc-meta-label">Payment</div>
                <div className="oc-meta-value">•••• •••• •••• 4242</div>
              </div>
              <div className="oc-meta-item">
                <div className="oc-meta-label">Status</div>
                <div className="oc-meta-value" style={{ color: "#2e7d32" }}>
                  <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} />
                  Confirmed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Items ── */}
        <div className="oc-card" style={{ animationDelay: "0.16s" }}>
          <div className="oc-card-header">
            <i className="fa-solid fa-box" />
            <h2 className="oc-card-title">Items Ordered ({order.items.length})</h2>
          </div>
          <div className="oc-card-body">
            {order.items.map((item) => (
              <div className="oc-item" key={item.id}>
                <div className="oc-item-img-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="oc-item-img"
                    onError={(e) => { e.target.src = "https://placehold.co/70x70/f8f3ec/5a3626?text=·"; }}
                  />
                </div>
                <div className="oc-item-info">
                  <div className="oc-item-name">{item.name}</div>
                  <div className="oc-item-qty">Qty: {item.qty} · Arrives {item.deliveryDate || "Monday, March 2"}</div>
                </div>
                <div className="oc-item-price">{fmt(item.price * item.qty)}</div>
              </div>
            ))}

            {/* Totals */}
            <div className="oc-totals" style={{ marginTop: 16 }}>
              <div className="oc-total-row">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="oc-total-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : fmt(shipping)}</span>
              </div>
              <div className="oc-total-row">
                <span>Tax (10%)</span>
                <span>{fmt(tax)}</span>
              </div>
              <div className="oc-total-row grand">
                <span>Total Charged</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tracking ── */}
        <div className="oc-card" style={{ animationDelay: "0.22s" }}>
          <div className="oc-card-header">
            <i className="fa-solid fa-truck-fast" />
            <h2 className="oc-card-title">Estimated Delivery</h2>
          </div>
          <div className="oc-card-body">
            <div className="oc-steps">
              <div className="oc-step done">
                <div className="oc-step-dot"><i className="fa-solid fa-check" /></div>
                <div className="oc-step-info">
                  <div className="oc-step-label">Order Confirmed</div>
                  <div className="oc-step-date">{order.datePlaced}, 2026</div>
                </div>
              </div>
              <div className="oc-step active">
                <div className="oc-step-dot"><i className="fa-solid fa-gear" /></div>
                <div className="oc-step-info">
                  <div className="oc-step-label">Processing</div>
                  <div className="oc-step-date">Expected within 24 hours</div>
                </div>
              </div>
              <div className="oc-step">
                <div className="oc-step-dot"><i className="fa-solid fa-truck" /></div>
                <div className="oc-step-info">
                  <div className="oc-step-label">Shipped</div>
                  <div className="oc-step-date">Pending</div>
                </div>
              </div>
              <div className="oc-step">
                <div className="oc-step-dot"><i className="fa-solid fa-house" /></div>
                <div className="oc-step-info">
                  <div className="oc-step-label">Delivered</div>
                  <div className="oc-step-date">
                    {order.items[0]?.deliveryDate || "Monday, March 2"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA row ── */}
        <div className="oc-cta-row">
          <Link to="/" className="oc-cta-primary">
            <i className="fa-solid fa-bag-shopping" /> Continue Shopping
          </Link>
          <Link to="/orders" className="oc-cta-secondary">
            <i className="fa-solid fa-list" /> View All Orders
          </Link>
          <button className="oc-cta-secondary" onClick={() => window.print()}>
            <i className="fa-solid fa-print" /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
