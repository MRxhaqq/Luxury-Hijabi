import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import "./ProductDisplay.css";
import { products } from "../data/products";
import { CartStore } from "../utils/cartStore";
import { AuthStore } from "../utils/authStore";
import { FavoritesStore } from "../utils/favoritesStore";
import { RecentlyViewedStore } from "../utils/recentlyViewedStore";
import { ProductDisplayHeader } from "./ProductDisplayHeader";
import { SkeletonLoader } from "./SkeletonLoader";

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

function formatRatingCount(count) {
  return count > 1000 ? `${count / 1000}k` : count;
}

function RecentlyViewedRow({ onNavigate }) {
  const items = RecentlyViewedStore.getItems().slice(0, 6);
  if (!items.length) return null;

  return (
    <div className="rv-section">
      <h2 className="rv-title">Recently Viewed</h2>
      {/* Horizontal scroll container on small screens, grid on large */}
      <div className="rv-scroll-wrap">
        <div className="rv-grid">
          {items.map((item) => (
            <div
              key={item.id}
              className="rv-card"
              onClick={() => onNavigate(`/product/${item.id}`)}
            >
              <div className="rv-img-wrap">
                <img src={item.image} alt={item.name} className="rv-img" />
              </div>
              <div className="rv-body">
                <div className="rv-name">{item.name}</div>
                <div className="rv-price">${item.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductDisplay() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => CartStore.getTotalCount());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Read the empty-cart flag synchronously during initialisation — avoids
  // calling setState inside a useEffect body which triggers a cascade warning.
  const [showEmptyCartToast, setShowEmptyCartToast] = useState(() => {
    try {
      if (sessionStorage.getItem("lh_empty_cart_redirect")) {
        sessionStorage.removeItem("lh_empty_cart_redirect");
        return true;
      }
    } catch {}
    return false;
  });

  const [selectedQty, setSelectedQty] = useState({});
  const [addedMap, setAddedMap] = useState({});
  const [favourites, setFavourites] = useState(() => {
    const items = FavoritesStore.getItems();
    return new Set(items.map((i) => i.id));
  });
  const [beatingId, setBeatingId] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    exiting: false,
    message: "",
  });
  const toastTimerRef = useRef(null);

  // Auto-dismiss the empty-cart toast after 4 s
  useEffect(() => {
    if (!showEmptyCartToast) return;
    const t = setTimeout(() => setShowEmptyCartToast(false), 4000);
    return () => clearTimeout(t);
  }, [showEmptyCartToast]);

  // Skeleton loading delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.paddingTop = "0";
    return () => {
      document.body.style.paddingTop = "";
    };
  }, []);

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, exiting: false, message });
    toastTimerRef.current = setTimeout(() => {
      setToast((p) => ({ ...p, exiting: true }));
      setTimeout(
        () => setToast({ visible: false, exiting: false, message: "" }),
        320,
      );
    }, 2800);
  }, []);

  function handleAddToCart(product) {
    if (!AuthStore.isLoggedIn()) {
      navigate(`/login?redirect=${encodeURIComponent("/")}&reason=cart`);
      return;
    }
    const qty = selectedQty[product.id] ?? 1;
    CartStore.addItem(product, qty);
    setCartCount(CartStore.getTotalCount());
    showToast(`${qty > 1 ? qty + " × " : ""}${product.name} added to cart!`);
    setAddedMap((p) => ({ ...p, [product.id]: true }));
    setTimeout(() => setAddedMap((p) => ({ ...p, [product.id]: false })), 1400);
  }

  function handleFavourite(product) {
    if (!AuthStore.isLoggedIn()) {
      navigate(`/login?redirect=${encodeURIComponent("/")}&reason=favorites`);
      return;
    }
    const wasAdded = FavoritesStore.toggle(product);
    setFavourites((prev) => {
      const next = new Set(prev);
      wasAdded ? next.add(product.id) : next.delete(product.id);
      return next;
    });
    setBeatingId(null);
    requestAnimationFrame(() => setBeatingId(product.id));
    setTimeout(() => setBeatingId(null), 450);
    showToast(
      wasAdded
        ? `${product.name} added to favorites!`
        : `${product.name} removed from favorites.`,
    );
  }

  function handleProductClick(product) {
    RecentlyViewedStore.addItem(product);
    navigate(`/product/${product.id}`);
  }

  // Search navigates to the dedicated search results page
  function handleSearchChange(q) {
    setSearchQuery(q);
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : products;

  return (
    <>
      <title>Luxury Hijabi</title>

      <ProductDisplayHeader
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {isLoading ? (
        <SkeletonLoader count={18} />
      ) : (
        <>
          <div className="grid-container">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const isAdded = addedMap[product.id] ?? false;
                const isFav = favourites.has(product.id);
                return (
                  <div className="grid-item" key={product.id}>
                    <button
                      className={`favourite-btn${isFav ? " active" : ""}${beatingId === product.id ? " beating" : ""}`}
                      aria-label={
                        isFav ? "Remove from favourites" : "Add to favourites"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavourite(product);
                      }}
                    >
                      <i className="fa-solid fa-heart" />
                    </button>

                    <div
                      className="grid-item-image-container"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="grid-item-image"
                      />
                    </div>

                    <div
                      className="grid-item-name"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleProductClick(product)}
                    >
                      {product.name}
                    </div>

                    <div className="grid-item-rating-container">
                      <div className="rating-row">
                        <div className="rating">
                          <StarRating stars={product.rating.stars} />
                        </div>
                        <span className="rating-count">
                          ({formatRatingCount(product.rating.count)})
                        </span>
                      </div>
                    </div>

                    <div className="grid-item-price">
                      ${product.price.toFixed(2)}
                    </div>

                    <div className="grid-item-quantity">
                      <select
                        className="quantity-select"
                        value={selectedQty[product.id] ?? 1}
                        onChange={(e) =>
                          setSelectedQty((p) => ({
                            ...p,
                            [product.id]: parseInt(e.target.value, 10),
                          }))
                        }
                      >
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className={`grid-item-button${isAdded ? " btn-added" : ""}`}
                      onClick={() => handleAddToCart(product)}
                    >
                      {isAdded ? "Added ✓" : "Add to Cart"}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="search-empty-state">
                <i className="fa-solid fa-magnifying-glass" />
                <p>
                  No products found for "<strong>{searchQuery}</strong>"
                </p>
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          <RecentlyViewedRow onNavigate={navigate} />
        </>
      )}

      {/* Empty cart redirect toast */}
      {showEmptyCartToast && (
        <div className="cart-toast">
          <i className="fa-solid fa-circle-info" style={{ color: "#c4a99a" }} />
          <span>Your cart is empty. Add some items before checking out!</span>
        </div>
      )}

      {/* Cart / Favorites toast */}
      <div
        className={`cart-toast${!toast.visible ? " hidden" : ""}${toast.exiting ? " cart-toast-out" : ""}`}
      >
        <i className="fa-solid fa-circle-check" />
        <span>{toast.message}</span>
      </div>
    </>
  );
}
