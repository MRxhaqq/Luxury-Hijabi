/**
 * SearchResults.jsx
 *
 * Dedicated search results page at /search?q=...
 * Features:
 *  - Filters: price range, rating, category
 *  - Sort: relevance, price asc/desc, rating
 *  - Active filter chips
 *  - Auth-guarded cart + favorites
 *  - Toast notifications
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { products } from "../data/products";
import { CartStore } from "../utils/cartStore";
import { AuthStore } from "../utils/authStore";
import { FavoritesStore } from "../utils/favoritesStore";
import { ProductDisplayHeader } from "./ProductDisplayHeader";
import "./SearchResults.css";

const CATEGORIES = [
  { label: "Hijabs & Scarves", keywords: ["hijab", "scarf", "chiffon"] },
  { label: "Abayas & Dresses", keywords: ["abaya", "dress"] },
  { label: "Jewellery", keywords: ["bracelet", "ring", "bangle", "brooch", "pin", "watch"] },
  { label: "Bags & Accessories", keywords: ["bag", "clutch", "purse"] },
  { label: "Perfumes & Gifts", keywords: ["perfume", "scent", "gift"] },
];

function getCategory(productName) {
  const nameLower = productName.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => nameLower.includes(kw))) return cat.label;
  }
  return "Other";
}

function Stars({ count, size = 13 }) {
  const full = Math.floor(count);
  const half = count % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span>
      {Array.from({ length: full }, (_, i) => <i key={`f${i}`} className="fa-solid fa-star" style={{ fontSize: size }} />)}
      {half && <i className="fa-solid fa-star-half-stroke" style={{ fontSize: size }} />}
      {Array.from({ length: empty }, (_, i) => <i key={`e${i}`} className="fa-regular fa-star" style={{ fontSize: size }} />)}
    </span>
  );
}

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [cartCount, setCartCount] = useState(() => CartStore.getTotalCount());
  const [searchQuery, setSearchQuery] = useState(query);

  /* Filters */
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [selectedCats, setSelectedCats] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* Per-card state */
  const [addedMap, setAddedMap] = useState({});
  const [favMap, setFavMap] = useState({});
  const [beatingId, setBeatingId] = useState(null);

  const [toast, setToast] = useState({ visible: false, exiting: false, message: "" });
  const toastTimer = useRef(null);

  /* Sync header search with URL */
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  /* Load favorites */
  useEffect(() => {
    const favItems = FavoritesStore.getItems();
    const map = {};
    favItems.forEach((i) => { map[i.id] = true; });
    setFavMap(map);
  }, []);

  const showToast = useCallback((message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, exiting: false, message });
    toastTimer.current = setTimeout(() => {
      setToast((p) => ({ ...p, exiting: true }));
      setTimeout(() => setToast({ visible: false, exiting: false, message: "" }), 320);
    }, 2800);
  }, []);

  /* Filter + sort products */
  const filtered = products
    .filter((p) => {
      // text match
      if (query.trim() && !p.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      // price
      if (minPrice !== "" && p.price < parseFloat(minPrice)) return false;
      if (maxPrice !== "" && p.price > parseFloat(maxPrice)) return false;
      // rating
      if (minRating > 0 && p.rating.stars < minRating) return false;
      // category
      if (selectedCats.length > 0) {
        const cat = getCategory(p.name);
        if (!selectedCats.includes(cat)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating.stars - a.rating.stars;
      return 0;
    });

  function handleAddToCart(e, product) {
    e.stopPropagation();
    if (!AuthStore.isLoggedIn()) {
      navigate(`/login?redirect=${encodeURIComponent(`/search?q=${query}`)}&reason=cart`);
      return;
    }
    CartStore.addItem(product, 1);
    setCartCount(CartStore.getTotalCount());
    setAddedMap((p) => ({ ...p, [product.id]: true }));
    setTimeout(() => setAddedMap((p) => ({ ...p, [product.id]: false })), 1400);
    showToast(`${product.name} added to cart!`);
  }

  function handleFav(e, product) {
    e.stopPropagation();
    if (!AuthStore.isLoggedIn()) {
      navigate(`/login?redirect=${encodeURIComponent(`/search?q=${query}`)}&reason=favorites`);
      return;
    }
    const wasAdded = FavoritesStore.toggle(product);
    setFavMap((p) => ({ ...p, [product.id]: wasAdded }));
    setBeatingId(product.id);
    setTimeout(() => setBeatingId(null), 450);
    showToast(wasAdded ? `${product.name} added to favorites!` : `${product.name} removed from favorites.`);
  }

  function toggleCat(cat) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function resetFilters() {
    setMinPrice(""); setMaxPrice(""); setMinRating(0); setSelectedCats([]);
  }

  /* Active filter chips */
  const chips = [];
  if (minPrice !== "" || maxPrice !== "") {
    chips.push({ label: `Price: $${minPrice || "0"} – $${maxPrice || "∞"}`, onRemove: () => { setMinPrice(""); setMaxPrice(""); } });
  }
  if (minRating > 0) {
    chips.push({ label: `${minRating}+ Stars`, onRemove: () => setMinRating(0) });
  }
  selectedCats.forEach((cat) => {
    chips.push({ label: cat, onRemove: () => toggleCat(cat) });
  });

  return (
    <div className="sr-page">
      <title>Search: {query} – Luxury Hijabi</title>

      <ProductDisplayHeader
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setSearchParams({ q });
        }}
      />

      <div className="sr-layout">
        {/* ── Header row ── */}
        <div className="sr-header-row">
          <div>
            <h1 className="sr-heading">
              {query ? <>Results for "<span>{query}</span>"</> : "All Products"}
            </h1>
            <p className="sr-result-count">{filtered.length} {filtered.length === 1 ? "product" : "products"} found</p>
          </div>
          <div className="sr-sort-row">
            <button className="sr-mobile-filter-btn" onClick={() => setMobileFiltersOpen((p) => !p)}>
              <i className="fa-solid fa-sliders" /> Filters
            </button>
            <span className="sr-sort-label">Sort by:</span>
            <select className="sr-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {chips.length > 0 && (
          <div className="sr-active-filters">
            {chips.map((chip, i) => (
              <div className="sr-filter-chip" key={i}>
                {chip.label}
                <button className="sr-chip-remove" onClick={chip.onRemove}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            ))}
            <button className="sr-filter-reset" onClick={resetFilters}>Clear all</button>
          </div>
        )}

        {/* ── Filters sidebar ── */}
        <aside className={`sr-filters${mobileFiltersOpen ? " mobile-open" : ""}`}>
          <div className="sr-filters-title">
            Filters
            <button className="sr-filter-reset" onClick={resetFilters}>Reset all</button>
          </div>

          {/* Price */}
          <div className="sr-filter-group">
            <div className="sr-filter-group-title">Price Range</div>
            <div className="sr-price-inputs">
              <input
                type="number" className="sr-price-input" placeholder="Min"
                value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0"
              />
              <span className="sr-price-sep">–</span>
              <input
                type="number" className="sr-price-input" placeholder="Max"
                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="sr-filter-group">
            <div className="sr-filter-group-title">Minimum Rating</div>
            <div className="sr-rating-options">
              {[4, 3, 2].map((r) => (
                <label key={r} className={`sr-rating-option${minRating === r ? " selected" : ""}`}>
                  <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} />
                  {Array.from({ length: r }, (_, i) => <i key={i} className="fa-solid fa-star" />)}
                  <span>{r}+ stars</span>
                </label>
              ))}
              {minRating > 0 && (
                <label className="sr-rating-option" onClick={() => setMinRating(0)} style={{ cursor: "pointer" }}>
                  <i className="fa-solid fa-xmark" style={{ color: "#9a7060" }} />
                  <span style={{ color: "#9a7060" }}>Any rating</span>
                </label>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="sr-filter-group">
            <div className="sr-filter-group-title">Category</div>
            <div className="sr-category-options">
              {CATEGORIES.map((cat) => {
                const count = products.filter((p) => getCategory(p.name) === cat.label).length;
                return (
                  <label key={cat.label} className="sr-category-option">
                    <input
                      type="checkbox"
                      checked={selectedCats.includes(cat.label)}
                      onChange={() => toggleCat(cat.label)}
                    />
                    <span>{cat.label}</span>
                    <span className="sr-category-count">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button className="sr-apply-btn" onClick={() => setMobileFiltersOpen(false)}>
            Apply Filters
          </button>
        </aside>

        {/* ── Results ── */}
        <div className="sr-results">
          <div className="sr-grid">
            {filtered.length > 0 ? filtered.map((product, i) => (
              <div
                key={product.id}
                className="sr-card"
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <button
                  className={`sr-fav-btn${favMap[product.id] ? " active" : ""}${beatingId === product.id ? " beating" : ""}`}
                  onClick={(e) => handleFav(e, product)}
                  aria-label="Toggle favorite"
                >
                  <i className="fa-solid fa-heart" />
                </button>

                <div className="sr-card-img-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="sr-card-img"
                    onError={(e) => { e.target.src = "https://placehold.co/300x220/f8f3ec/5a3626?text=Product"; }}
                  />
                </div>

                <div className="sr-card-body">
                  <p className="sr-card-name">{product.name}</p>
                  <div className="sr-card-rating">
                    <div className="sr-card-stars"><Stars count={product.rating.stars} /></div>
                    <span className="sr-card-rating-count">
                      ({product.rating.count > 1000 ? `${product.rating.count / 1000}k` : product.rating.count})
                    </span>
                  </div>
                  <p className="sr-card-price">${product.price.toFixed(2)}</p>
                  <button
                    className={`sr-card-add-btn${addedMap[product.id] ? " btn-added" : ""}`}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <i className={addedMap[product.id] ? "fa-solid fa-check" : "fa-solid fa-cart-plus"} />
                    {addedMap[product.id] ? "Added ✓" : "Add to Cart"}
                  </button>
                </div>
              </div>
            )) : (
              <div className="sr-empty">
                <i className="fa-solid fa-magnifying-glass" />
                <div className="sr-empty-title">No products found</div>
                <p className="sr-empty-sub">
                  Try adjusting your search or filters to find what you are looking for.
                </p>
                <button className="sr-empty-btn" onClick={resetFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`sr-toast${!toast.visible ? " hidden" : ""}${toast.exiting ? " toast-out" : ""}`}>
        <i className="fa-solid fa-circle-check" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
