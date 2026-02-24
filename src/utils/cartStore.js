/**
 * CartStore.js
 * 
 * A simple cart state manager using localStorage for persistence.
 * Converted from the vanilla JS IIFE pattern to ES module exports
 * so React components can import and use it directly.
 */

"use strict";

const STORAGE_KEY = "lh_cart_v1";
const ORDERS_KEY = "lh_orders_v1";

// --- Internal helpers ---

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silently fail if storage is unavailable
  }
}

// --- Public API ---

export const CartStore = {
  getItems: () => load(),

  getTotalCount: () =>
    load().reduce((sum, item) => sum + item.qty, 0),

  /**
   * Add a product to the cart or increment its quantity if already present.
   * product = { id, name, price, image, deliveryDate?, shippingCost? }
   */
  addItem(product, qty = 1) {
    qty = parseInt(qty, 10) || 1;
    const items = load();
    const existing = items.find((i) => i.id === product.id);

    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        deliveryDate: product.deliveryDate || "Monday, March 2",
        shippingCost: product.shippingCost ?? 0,
        qty,
      });
    }
    save(items);
  },

  updateQty(id, qty) {
    qty = parseInt(qty, 10) || 1;
    const items = load().map((item) =>
      item.id === id ? { ...item, qty } : item
    );
    save(items);
  },

  removeItem(id) {
    save(load().filter((item) => item.id !== id));
  },

  /**
   * Snapshot the current cart into order history (with optional delivery
   * cost overrides per item id), then clear the cart.
   */
  placeOrder(deliveryOverrides = {}) {
    const items = load();
    if (!items.length) return;

    const subtotal = items.reduce((sum, item) => {
      const shipping =
        deliveryOverrides[item.id] !== undefined
          ? deliveryOverrides[item.id]
          : item.shippingCost;
      return sum + item.price * item.qty + shipping;
    }, 0);

    // Generate a simple random order id
    const orderId = "xxxx-xxxx-xxxx-xxxx".replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );

    const today = new Date();
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];
    const dateLabel = `${months[today.getMonth()]} ${today.getDate()}`;

    const order = {
      id: orderId,
      datePlaced: dateLabel,
      total: subtotal * 1.1, // includes 10% tax
      items: items.map((item) => ({
        ...item,
        shippingCost:
          deliveryOverrides[item.id] !== undefined
            ? deliveryOverrides[item.id]
            : item.shippingCost,
      })),
    };

    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      const orders = raw ? JSON.parse(raw) : [];
      orders.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Silently fail
    }

    save([]);
  },

  clear: () => save([]),

  getOrders() {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};
