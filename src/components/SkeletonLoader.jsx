/**
 * SkeletonLoader.jsx
 *
 * Animated skeleton placeholder cards shown while products "load".
 * Used in ProductDisplay.jsx — renders for a brief delay before showing real products.
 *
 * Props:
 *   count {number} – how many skeleton cards to render (default 18)
 */

import "./SkeletonLoader.css";

function SkeletonCard({ delay = 0 }) {
  return (
    <div className="sk-card" style={{ animationDelay: `${delay}s` }}>
      {/* Image placeholder */}
      <div className="sk-img sk-pulse" />

      {/* Product name — two lines */}
      <div className="sk-line w-80 sk-pulse" />
      <div className="sk-line w-60 sk-pulse" />

      {/* Star rating */}
      <div className="sk-stars">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="sk-star sk-pulse" />
        ))}
        <div className="sk-rating-count sk-pulse" />
      </div>

      {/* Price */}
      <div className="sk-line h-20 w-40 sk-pulse" />

      {/* Qty + button */}
      <div className="sk-line w-30 sk-pulse" style={{ marginTop: 8 }} />
      <div className="sk-btn sk-pulse" />
    </div>
  );
}

export function SkeletonLoader({ count = 18 }) {
  return (
    <div className="sk-grid">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} delay={i * 0.04} />
      ))}
    </div>
  );
}
