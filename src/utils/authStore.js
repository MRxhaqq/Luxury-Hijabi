/**
 * authStore.js
 *
 * A simple authentication manager using localStorage for persistence.
 * Users are stored as an array of objects with username, email, and password.
 * This simulates a real auth system without a backend.
 *
 * NOTE: In a real app, passwords would NEVER be stored in plain text.
 * This is a demonstration-only implementation.
 */

"use strict";

const USERS_KEY = "lh_users_v1";       // stores registered users array
const SESSION_KEY = "lh_session_v1";   // stores currently logged-in user

// --- Internal helpers ---

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  try {
    // Store only safe fields — never expose sensitive data in session
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
    }));
  } catch {}
}

// --- Public API ---

export const AuthStore = {

  /**
   * Returns the currently logged-in user object, or null if not logged in.
   * Shape: { id, username, email }
   */
  getCurrentUser: () => loadSession(),

  /** Returns true if a user is currently logged in. */
  isLoggedIn: () => loadSession() !== null,

  /**
   * Register a new user.
   * Returns { success: true, user } on success.
   * Returns { success: false, error: string } on failure.
   */
  register({ username, email, password }) {
    if (!username || !email || !password) {
      return { success: false, error: "All fields are required." };
    }

    const users = loadUsers();

    // Check if username or email already exists
    const emailTaken = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (emailTaken) {
      return { success: false, error: "An account with this email already exists." };
    }

    const usernameTaken = users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (usernameTaken) {
      return { success: false, error: "This username is already taken." };
    }

    // Create new user object and add to users array
    const newUser = {
      id: `user-${Date.now()}`,   // simple unique id based on timestamp
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,                    // NOTE: plain text only for demo purposes
    };

    users.push(newUser);
    saveUsers(users);

    // Automatically log in after registration
    saveSession(newUser);

    return { success: true, user: newUser };
  },

  /**
   * Log in an existing user.
   * Accepts either email or username as the identifier.
   * Returns { success: true, user } on success.
   * Returns { success: false, error: string } on failure.
   */
  login({ identifier, password }) {
    if (!identifier || !password) {
      return { success: false, error: "Please fill in all fields." };
    }

    const users = loadUsers();

    // Look up the user by email OR username (case-insensitive)
    const user = users.find(
      (u) =>
        u.email === identifier.toLowerCase() ||
        u.username.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      return { success: false, error: "No account found with that email or username." };
    }

    if (user.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    // Save session
    saveSession(user);

    return { success: true, user };
  },

  /** Log out the current user by clearing the session. */
  logout() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  },
};
