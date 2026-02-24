import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { products } from "../data/products";
import { CartStore } from "../utils/cartStore";
import { AuthStore } from "../utils/authStore";
import { FavoritesStore } from "../utils/favoritesStore";
import { RecentlyViewedStore } from "../utils/recentlyViewedStore";
import { ProductDisplayHeader } from "./ProductDisplayHeader";
import "./ProductDetail.css";

const COLOR_OPTIONS = [
  { name: "Taupe", hex: "#b8a090" },
  { name: "Black", hex: "#2c1a10" },
  { name: "Cream", hex: "#f0e6d6" },
  { name: "Rose", hex: "#c48080" },
  { name: "Navy", hex: "#2a3a5c" },
];
const SIZE_OPTIONS = [
  { label: "XS", available: true },
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: true },
  { label: "XXL", available: false },
];
const REVIEWS = [
  {
    id: 1,
    name: "Fatima A.",
    date: "January 12, 2026",
    stars: 5,
    title: "Absolutely stunning quality!",
    body: "I was blown away by the quality. The fabric feels premium and the craftsmanship is exceptional. Will definitely be ordering again.",
    verified: true,
  },
  {
    id: 2,
    name: "Mariam K.",
    date: "December 28, 2025",
    stars: 4,
    title: "Beautiful — minor sizing note",
    body: "The product is gorgeous, exactly as shown in the photos. I would recommend sizing up if you are between sizes. Overall very happy!",
    verified: true,
  },
  {
    id: 3,
    name: "Zaynab O.",
    date: "February 3, 2026",
    stars: 5,
    title: "Perfect gift",
    body: "Bought this as a gift and the recipient was absolutely delighted. Arrived quickly and packaged beautifully.",
    verified: false,
  },
];

function Stars({ count, size = 16 }) {
  const full = Math.floor(count);
  const half = count % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  const s = { fontSize: size };
  return (
    <span>
      {Array.from({ length: full }, (_, i) => (
        <i key={`f${i}`} className="fa-solid fa-star" style={s} />
      ))}
      {half && <i className="fa-solid fa-star-half-stroke" style={s} />}
      {Array.from({ length: empty }, (_, i) => (
        <i key={`e${i}`} className="fa-regular fa-star" style={s} />
      ))}
    </span>
  );
}

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pd-accordion-item">
      <button
        className={`pd-accordion-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        {title} <i className="fa-solid fa-chevron-down" />
      </button>
      <div className={`pd-accordion-body${open ? " open" : ""}`}>
        {children}
      </div>
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id);

  const [cartCount, setCartCount] = useState(() => CartStore.getTotalCount());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].name);
  const [selectedSize, setSelectedSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [beatingFav, setBeatingFav] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [toast, setToast] = useState({
    visible: false,
    exiting: false,
    message: "",
    icon: "green",
  });
  const toastTimer = useRef(null);

  useEffect(() => {
    if (!product) return;
    RecentlyViewedStore.addItem(product);
    setIsFav(FavoritesStore.isFavorited(product.id));
    setRecentlyViewed(
      RecentlyViewedStore.getItems()
        .filter((i) => i.id !== product.id)
        .slice(0, 4),
    );
  }, [product]);

  const showToast = useCallback((message, icon = "green") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, exiting: false, message, icon });
    toastTimer.current = setTimeout(() => {
      setToast((p) => ({ ...p, exiting: true }));
      setTimeout(
        () =>
          setToast({
            visible: false,
            exiting: false,
            message: "",
            icon: "green",
          }),
        320,
      );
    }, 2800);
  }, []);

  if (!product) {
    return (
      <div className="pd-page">
        <ProductDisplayHeader
          cartCount={cartCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="pd-not-found">
          <i className="fa-solid fa-box-open" />
          <p>Product not found.</p>
          <button className="pd-back-btn" onClick={() => navigate("/")}>
            <i className="fa-solid fa-arrow-left" /> Back to Shop
          </button>
        </div>
      </div>
    );
  }

  function handleAddToCart() {
    if (!AuthStore.isLoggedIn()) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/product/${product.id}`)}&reason=cart`,
      );
      return;
    }
    CartStore.addItem(product, qty);
    setCartCount(CartStore.getTotalCount());
    setIsAdded(true);
    showToast(`${product.name} added to cart!`, "green");
    setTimeout(() => setIsAdded(false), 1400);
  }

  function handleFav() {
    if (!AuthStore.isLoggedIn()) {
      navigate(
        `/login?redirect=${encodeURIComponent(`/product/${product.id}`)}&reason=favorites`,
      );
      return;
    }
    const wasAdded = FavoritesStore.toggle(product);
    setIsFav(wasAdded);
    setBeatingFav(true);
    setTimeout(() => setBeatingFav(false), 450);
    showToast(
      wasAdded ? `Added to favorites!` : `Removed from favorites.`,
      wasAdded ? "red" : "green",
    );
  }

  const avgRating = (
    REVIEWS.reduce((s, r) => s + r.stars, 0) / REVIEWS.length
  ).toFixed(1);

  return (
    <div className="pd-page">
      <title>{product.name} – Luxury Hijabi</title>

      <ProductDisplayHeader
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) navigate(`/search?q=${encodeURIComponent(q)}`);
        }}
      />

      <div className="pd-back-bar">
        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left" /> Back
        </button>
      </div>

      <div className="pd-main">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-main-img-wrap">
            {/* Fix issue 2: use the product's actual image path directly, no URL rewriting */}
            <img
              src={product.image}
              alt={product.name}
              className="pd-main-img"
            />
            {product.shippingCost === 0 && (
              <span className="pd-badge">Free Shipping</span>
            )}
          </div>
          <div className="pd-thumbnails">
            {[product.image, product.image, product.image].map((src, i) => (
              <div key={i} className={`pd-thumb${i === 0 ? " active" : ""}`}>
                <img src={src} alt={`View ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="pd-info">
          <p className="pd-category">Luxury Hijabi Collection</p>
          <h1 className="pd-name">{product.name}</h1>

          <div className="pd-rating-row">
            <div className="pd-stars">
              <Stars count={product.rating.stars} />
            </div>
            <span className="pd-rating-count">
              {product.rating.count > 1000
                ? `${product.rating.count / 1000}k`
                : product.rating.count}{" "}
              reviews
            </span>
            <button
              className="pd-rating-link"
              onClick={() =>
                document
                  .querySelector(".pd-reviews-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See all reviews
            </button>
          </div>

          <div className="pd-price-row">
            <span className="pd-price">${product.price.toFixed(2)}</span>
            <span className="pd-shipping-info">
              {product.shippingCost === 0 ? (
                <span className="pd-free-shipping">Free shipping</span>
              ) : (
                `+$${product.shippingCost.toFixed(2)} shipping`
              )}
            </span>
          </div>

          <div className="pd-divider" />

          <div className="pd-selector-label">
            Colour: <span>{selectedColor}</span>
          </div>
          <div className="pd-color-swatches">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.name}
                className={`pd-swatch${selectedColor === c.name ? " selected" : ""}`}
                style={{ background: c.hex }}
                title={c.name}
                onClick={() => setSelectedColor(c.name)}
              />
            ))}
          </div>

          <div className="pd-selector-label">
            Size: <span>{selectedSize}</span>
          </div>
          <div className="pd-size-pills">
            {SIZE_OPTIONS.map((s) => (
              <button
                key={s.label}
                className={`pd-size-pill${selectedSize === s.label ? " selected" : ""}${!s.available ? " unavailable" : ""}`}
                onClick={() => s.available && setSelectedSize(s.label)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="pd-qty-row">
            <div className="pd-selector-label" style={{ marginBottom: 0 }}>
              Qty:
            </div>
            <select
              className="pd-qty-select"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="pd-delivery-badge">
              <i className="fa-solid fa-truck-fast" /> Arrives{" "}
              {product.deliveryDate}
            </span>
          </div>

          <div className="pd-cta-row">
            <button
              className={`pd-add-btn${isAdded ? " btn-added" : ""}`}
              onClick={handleAddToCart}
            >
              <i
                className={
                  isAdded ? "fa-solid fa-check" : "fa-solid fa-cart-plus"
                }
              />
              {isAdded ? "Added to Cart ✓" : "Add to Cart"}
            </button>
            <button
              className={`pd-fav-btn${isFav ? " active" : ""}${beatingFav ? " beating" : ""}`}
              onClick={handleFav}
              aria-label={
                isFav ? "Remove from favourites" : "Add to favourites"
              }
            >
              <i className="fa-solid fa-heart" />
            </button>
          </div>

          <div className="pd-features">
            <div className="pd-feature-item">
              <i className="fa-solid fa-shield-halved" /> Authentic luxury
              quality guaranteed
            </div>
            <div className="pd-feature-item">
              <i className="fa-solid fa-rotate-left" /> 30-day free returns
            </div>
            <div className="pd-feature-item">
              <i className="fa-solid fa-lock" /> Secure checkout
            </div>
            <div className="pd-feature-item">
              <i className="fa-solid fa-award" /> Handpicked by our stylists
            </div>
          </div>

          <div className="pd-accordion">
            <AccordionItem title="Product Description">
              <p>
                Elevate your wardrobe with this exquisite piece from our curated
                luxury collection. Crafted from premium materials with
                meticulous attention to detail, this item embodies elegance and
                sophistication. Perfect for both everyday wear and special
                occasions.
              </p>
            </AccordionItem>
            <AccordionItem title="Shipping & Delivery">
              <p>
                Standard delivery: {product.deliveryDate}. Express options
                available at checkout. Free returns within 30 days. We ship
                worldwide.{" "}
                {product.shippingCost === 0
                  ? "Free standard shipping on this item."
                  : `Standard shipping: $${product.shippingCost.toFixed(2)}.`}
              </p>
            </AccordionItem>
            <AccordionItem title="Care Instructions">
              <p>
                Hand wash or gentle machine wash in cold water. Do not bleach.
                Lay flat to dry. Iron on low heat if needed. Store in a cool,
                dry place away from direct sunlight.
              </p>
            </AccordionItem>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="pd-reviews-section">
        <h2 className="pd-reviews-title">Customer Reviews</h2>
        <div className="pd-reviews-summary">
          <div>
            <div className="pd-reviews-avg">{avgRating}</div>
            <div className="pd-reviews-avg-label">out of 5</div>
          </div>
          <div>
            <div className="pd-reviews-stars">
              <Stars count={parseFloat(avgRating)} size={22} />
            </div>
            <div className="pd-reviews-count">
              Based on{" "}
              {product.rating.count > 1000
                ? `${product.rating.count / 1000}k`
                : product.rating.count}{" "}
              reviews
            </div>
          </div>
        </div>
        <div className="pd-review-grid">
          {REVIEWS.map((r, i) => (
            <div
              className="pd-review-card"
              key={r.id}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="pd-review-header">
                <div className="pd-reviewer-avatar">{r.name[0]}</div>
                <div>
                  <div className="pd-reviewer-name">{r.name}</div>
                  <div className="pd-reviewer-date">{r.date}</div>
                </div>
              </div>
              <div className="pd-review-stars">
                <Stars count={r.stars} size={13} />
              </div>
              <div className="pd-review-title">{r.title}</div>
              <div className="pd-review-body">{r.body}</div>
              {r.verified && (
                <div className="pd-verified">
                  <i className="fa-solid fa-circle-check" /> Verified Purchase
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recently Viewed — fix issue 1: horizontal scroll on mobile, proper image sizing */}
      {recentlyViewed.length > 0 && (
        <div className="pd-recently-viewed">
          <h2 className="pd-recently-title">Recently Viewed</h2>
          <div className="pd-rv-grid">
            {recentlyViewed.map((item, i) => (
              <div
                key={item.id}
                className="pd-rv-card"
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <div className="pd-rv-img-wrap">
                  <img src={item.image} alt={item.name} className="pd-rv-img" />
                </div>
                <div className="pd-rv-body">
                  <div className="pd-rv-name">{item.name}</div>
                  <div className="pd-rv-price">${item.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={`pd-toast${!toast.visible ? " hidden" : ""}${toast.exiting ? " toast-out" : ""}`}
      >
        <i className={`fa-solid fa-circle-check ${toast.icon}`} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
