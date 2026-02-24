import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ProductDisplay } from "./components/ProductDisplay";
import { ProductDetail } from "./components/ProductDetail";
import { SearchResults } from "./components/SearchResults";
import { Checkout } from "./components/Checkout";
import { Orders } from "./components/Orders";
import { Favorites } from "./components/Favorites";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Profile } from "./components/Profile";
import { OrderConfirmation } from "./components/OrderConfirmation";
import { AuthStore } from "./utils/authStore";

/* Auth guard — redirects to /login if user is not signed in */
function PrivateRoute({ children, reason = "" }) {
  if (!AuthStore.isLoggedIn()) {
    const params = new URLSearchParams({ redirect: window.location.pathname });
    if (reason) params.set("reason", reason);
    return <Navigate to={`/login?${params.toString()}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<ProductDisplay />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />

        {/* ── Protected routes ── */}
        <Route
          path="/checkout"
          element={
            <PrivateRoute reason="cart">
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <PrivateRoute reason="favorites">
              <Favorites />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Fallback — redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
