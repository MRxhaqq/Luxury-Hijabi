/**
 * ThemeToggle.jsx
 *
 * Reusable dark/light mode toggle pill used across all headers
 * in the Luxury Hijabi application.
 *
 * Props:
 *   variant  — "default" | "compact" | "drawer" | "sidebar"
 *              default  → label + pill (ProductDisplayHeader desktop nav)
 *              compact  → icon + pill only, no text (Checkout / Orders headers)
 *              drawer   → full-width drawer-style row (mobile drawers)
 *              sidebar  → Profile page sidebar style
 *
 * All variants share the same toggle logic via useTheme().
 * Changing theme in any one instance updates every other instance instantly.
 */

import { useTheme } from "../utils/useTheme";
import "./ThemeToggle.css";

export function ThemeToggle({ variant = "default" }) {
  const [isDark, toggleTheme] = useTheme();

  const icon = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  const label = isDark ? "Light Mode" : "Dark Mode";
  const ariaLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  /* Drawer and sidebar variants render a slightly different internal layout
     (label on left side, pill on right side) */
  const isRowLayout = variant === "drawer" || variant === "sidebar";

  return (
    <button
      className={`theme-toggle${variant !== "default" ? ` ${variant}` : ""}`}
      onClick={toggleTheme}
      data-on={isDark ? "true" : "false"}
      aria-pressed={isDark}
      aria-label={ariaLabel}
      type="button"
    >
      {isRowLayout ? (
        <>
          <span className="theme-toggle-left">
            <i className={`${icon} theme-toggle-icon`} aria-hidden="true" />
            <span className="theme-toggle-label">{label}</span>
          </span>
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb" />
          </span>
        </>
      ) : (
        <>
          <i className={`${icon} theme-toggle-icon`} aria-hidden="true" />
          {variant !== "compact" && (
            <span className="theme-toggle-label">{label}</span>
          )}
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-thumb" />
          </span>
        </>
      )}
    </button>
  );
}
