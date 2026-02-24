/**
 * recentlyViewedStore.js
 *
 * Tracks recently viewed products per-user (or anonymously).
 * Stores up to MAX_ITEMS in localStorage, most-recent first.
 */

"use strict";

import { AuthStore } from "./authStore";

const MAX_ITEMS = 8;

function getKey() {
  const user = AuthStore.getCurrentUser();
  return user ? `lh_recently_viewed_v1_${user.id}` : "lh_recently_viewed_v1_guest";
}

function load() {
  try {
    const raw = localStorage.getItem(getKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items) {
  try {
    localStorage.setItem(getKey(), JSON.stringify(items));
  } catch {}
}

export const RecentlyViewedStore = {
  getItems: () => load(),

  /**
   * Record a product view. Moves it to the front if already present.
   * product = { id, name, price, image, rating }
   */
  addItem(product) {
    const items = load().filter((i) => i.id !== product.id);
    items.unshift({ ...product, viewedAt: Date.now() });
    save(items.slice(0, MAX_ITEMS));
  },

  clear: () => save([]),
};
