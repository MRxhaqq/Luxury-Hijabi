/**
 * favoritesStore.js
 *
 * A simple favorites manager using localStorage for persistence.
 * Favorites are stored per-user using the logged-in user's id as part of the key.
 * If no user is logged in, operations are no-ops.
 */

"use strict";

import { AuthStore } from "./authStore";

// Build a per-user storage key so different users have separate favorites
function getFavKey() {
  const user = AuthStore.getCurrentUser();
  return user ? `lh_favorites_v1_${user.id}` : null;
}

function loadFavorites() {
  const key = getFavKey();
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(items) {
  const key = getFavKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

export const FavoritesStore = {
  /** Returns the full list of favorited product objects for the current user. */
  getItems: () => loadFavorites(),

  /** Returns the number of favorited products for the current user. */
  getCount: () => loadFavorites().length,

  /**
   * Check if a product (by id) is already in favorites.
   * Returns boolean.
   */
  isFavorited(productId) {
    return loadFavorites().some((item) => item.id === productId);
  },

  /**
   * Add a product to favorites.
   * Does nothing if already present.
   * product = { id, name, price, image, rating, ... }
   */
  addItem(product) {
    const items = loadFavorites();
    if (items.some((i) => i.id === product.id)) return; // already favorited
    items.push({ ...product, favoritedAt: Date.now() });
    saveFavorites(items);
  },

  /**
   * Remove a product from favorites by id.
   */
  removeItem(id) {
    saveFavorites(loadFavorites().filter((item) => item.id !== id));
  },

  /**
   * Toggle favorite status for a product.
   * Returns true if the item was ADDED, false if REMOVED.
   */
  toggle(product) {
    const items = loadFavorites();
    const exists = items.some((i) => i.id === product.id);
    if (exists) {
      saveFavorites(items.filter((i) => i.id !== product.id));
      return false;
    } else {
      items.push({ ...product, favoritedAt: Date.now() });
      saveFavorites(items);
      return true;
    }
  },

  /** Clear all favorites for the current user. */
  clear: () => saveFavorites([]),
};
