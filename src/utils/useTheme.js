/**
 * useTheme.js
 *
 * Global theme hook — single source of truth for dark/light mode
 * across the entire Luxury Hijabi application.
 *
 * Why a module-level singleton instead of React Context?
 *  • No Provider wrapper needed — any component can call useTheme()
 *  • State lives in the module; listeners are notified on every change
 *  • Zero prop-drilling, zero Context boilerplate
 *  • Works identically in every header, page, and component
 *
 * Priority: stored preference > OS preference > light
 */

"use strict";

import { useState, useEffect } from "react";

const THEME_KEY = "lh_theme_v1";

/* ── Module-level state (shared across all hook instances) ── */
let _isDark = resolveInitialTheme();
const _listeners = new Set();

function resolveInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function applyTheme(isDark) {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  try {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  } catch {}
  _isDark = isDark;
  _listeners.forEach((fn) => fn(isDark));
}

/* Apply theme immediately on module load (before React renders) */
applyTheme(_isDark);

/* Listen for OS preference changes — only auto-switch if user hasn't made a manual choice */
try {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const hasManualChoice = !!localStorage.getItem(THEME_KEY);
      if (!hasManualChoice) applyTheme(e.matches);
    });
} catch {}

/**
 * useTheme()
 *
 * Returns [isDark, toggleTheme]
 *   isDark      — boolean, true when dark mode is active
 *   toggleTheme — function, call to flip the theme
 *
 * Every component using this hook re-renders whenever the theme changes,
 * regardless of which component triggered the change.
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(_isDark);

  useEffect(() => {
    function listener(val) {
      setIsDark(val);
    }
    _listeners.add(listener);
    /* Sync in case theme changed between render and effect */
    setIsDark(_isDark);
    return () => _listeners.delete(listener);
  }, []);

  function toggleTheme() {
    applyTheme(!_isDark);
  }

  return [isDark, toggleTheme];
}
