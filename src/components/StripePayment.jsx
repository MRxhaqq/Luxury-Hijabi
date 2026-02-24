import { useState } from "react";
import "./Stripe.css";

const TEST_CARDS = [
  { number: "4242 4242 4242 4242", result: "success", label: "Succeeds" },
  { number: "4000 0000 0000 0002", result: "decline", label: "Declined" },
  { number: "4000 0025 0000 3155", result: "auth", label: "Requires 3DS auth" },
];

function formatCardNumber(raw) {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
function formatExpiry(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
function formatCvc(raw) {
  return raw.replace(/\D/g, "").slice(0, 4);
}

export function StripePayment({ total = 0, onSuccess, onClose }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  // 3DS auth flow state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const fmt = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  function validate() {
    const digits = cardNumber.replace(/\s/g, "");
    if (!name.trim()) return "Please enter the cardholder name.";
    if (digits.length < 16) return "Please enter a valid 16-digit card number.";
    if (expiry.length < 5) return "Please enter a valid expiry date (MM/YY).";
    if (cvc.length < 3) return "Please enter a valid CVC.";
    return null;
  }

  async function handlePay(e) {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    // Simulate network round-trip
    await new Promise((res) => setTimeout(res, 1500));

    const digits = cardNumber.replace(/\s/g, "");
    const match = TEST_CARDS.find(
      (c) => c.number.replace(/\s/g, "") === digits,
    );

    // Declined card — show error, do NOT proceed
    if (match?.result === "decline") {
      setLoading(false);
      setError(
        "Your card was declined. Please try a different card or contact your bank.",
      );
      return;
    }

    // Requires 3DS authentication — show auth challenge modal
    if (match?.result === "auth") {
      setLoading(false);
      setShowAuthModal(true);
      return;
    }

    // Success (4242 or any unrecognised test number)
    setLoading(false);
    setSucceeded(true);
    setTimeout(() => onSuccess?.(), 1800);
  }

  // User clicks "Authenticate" in the 3DS modal
  async function handleAuth3DS() {
    setAuthLoading(true);
    await new Promise((res) => setTimeout(res, 1200));
    setAuthLoading(false);
    setShowAuthModal(false);
    setSucceeded(true);
    setTimeout(() => onSuccess?.(), 1800);
  }

  // User cancels the 3DS challenge
  function handleAuthCancel() {
    setShowAuthModal(false);
    setError("Authentication was cancelled. Your payment was not processed.");
  }

  function fillTestCard(card) {
    setCardNumber(card.number);
    setExpiry("12/28");
    setCvc("123");
    setName("Test User");
    setError("");
  }

  return (
    <div
      className="stripe-overlay"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose?.()}
    >
      <div className="stripe-modal">
        {/* Header */}
        <div className="stripe-modal-header">
          <div>
            <div className="stripe-modal-brand">Luxury Hijabi</div>
            <div className="stripe-modal-amount">{fmt(total)}</div>
          </div>
          {!loading && !showAuthModal && (
            <button
              className="stripe-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>

        {/* Test mode badge */}
        <div className="stripe-test-badge">
          <i className="fa-solid fa-flask" />
          Test Mode — No real charges will be made
        </div>

        {/* ── 3DS auth challenge overlay ── */}
        {showAuthModal && (
          <div className="stripe-auth-challenge">
            <div className="stripe-auth-icon">
              <i className="fa-solid fa-mobile-screen-button" />
            </div>
            <div className="stripe-auth-title">Authentication Required</div>
            <p className="stripe-auth-body">
              Your bank requires additional verification for this transaction.
              Press "Authenticate" to simulate completing the 3DS challenge.
            </p>
            <div className="stripe-auth-actions">
              <button
                className="stripe-auth-confirm"
                onClick={handleAuth3DS}
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <div className="spinner" /> Verifying…
                  </>
                ) : (
                  "Authenticate"
                )}
              </button>
              <button className="stripe-auth-cancel" onClick={handleAuthCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Success state ── */}
        {succeeded && !showAuthModal && (
          <div className="stripe-success">
            <div className="stripe-success-icon">
              <i className="fa-solid fa-check" />
            </div>
            <div className="stripe-success-title">Payment Successful!</div>
            <p className="stripe-success-sub">
              Your payment of {fmt(total)} was processed. Redirecting to your
              order confirmation…
            </p>
          </div>
        )}

        {/* ── Payment form ── */}
        {!succeeded && !showAuthModal && (
          <form className="stripe-modal-body" onSubmit={handlePay}>
            {/* Test card hints */}
            <div className="stripe-hint">
              <div className="stripe-hint-title">
                <i
                  className="fa-solid fa-lightbulb"
                  style={{ marginRight: 5 }}
                />
                Test Cards — click to fill
              </div>
              {TEST_CARDS.map((c) => (
                <div
                  key={c.number}
                  className="stripe-hint-row"
                  onClick={() => fillTestCard(c)}
                >
                  <span>{c.number}</span>
                  <span
                    style={{
                      color:
                        c.result === "decline"
                          ? "#b94040"
                          : c.result === "auth"
                            ? "#c4820a"
                            : "#2e7d32",
                    }}
                  >
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Error banner */}
            <div className={`stripe-error${error ? "" : " hidden"}`}>
              <i className="fa-solid fa-triangle-exclamation" />
              {error}
            </div>

            {/* Cardholder name */}
            <div className="stripe-field">
              <label className="stripe-label">Cardholder Name</label>
              <div className="stripe-input-wrap">
                <i className="fa-solid fa-user stripe-input-icon" />
                <input
                  type="text"
                  className="stripe-input"
                  placeholder="Name on card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="cc-name"
                />
              </div>
            </div>

            {/* Card number */}
            <div className="stripe-field">
              <label className="stripe-label">Card Number</label>
              <div className="stripe-input-wrap">
                <i className="fa-regular fa-credit-card stripe-input-icon" />
                <input
                  type="text"
                  className="stripe-input"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                />
                <i className="fa-brands fa-cc-visa stripe-card-icon" />
              </div>
            </div>

            {/* Expiry + CVC */}
            <div className="stripe-row">
              <div className="stripe-field" style={{ marginBottom: 0 }}>
                <label className="stripe-label">Expiry</label>
                <div className="stripe-input-wrap">
                  <i className="fa-solid fa-calendar stripe-input-icon" />
                  <input
                    type="text"
                    className="stripe-input"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    maxLength={5}
                  />
                </div>
              </div>
              <div className="stripe-field" style={{ marginBottom: 0 }}>
                <label className="stripe-label">CVC</label>
                <div className="stripe-input-wrap">
                  <i className="fa-solid fa-lock stripe-input-icon" />
                  <input
                    type="text"
                    className="stripe-input"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(formatCvc(e.target.value))}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="stripe-pay-btn"
              disabled={loading}
              style={{ marginTop: 20 }}
            >
              {loading ? (
                <>
                  <div className="spinner" /> Processing…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock" /> Pay {fmt(total)}
                </>
              )}
            </button>
          </form>
        )}

        <div className="stripe-footer">
          <i className="fa-solid fa-shield-halved" />
          Secured by Stripe · Your data is encrypted
        </div>
      </div>
    </div>
  );
}
