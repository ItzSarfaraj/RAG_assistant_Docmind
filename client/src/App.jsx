import { useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function App() {
  // Check if user is already logged in
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  });

  // login / signup page
  const [authMode, setAuthMode] = useState("login");

  // Called after successful login
  const handleLogin = (userData) => {
    setUser(userData);
  };

  // Called after successful signup
  const handleSignup = (userData) => {
    setUser(userData);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

    setAuthMode("login");
  };

  // =========================
  // AUTHENTICATION
  // =========================

  if (!user) {
    // Signup page
    if (authMode === "signup") {
      return (
        <Signup
          onSignup={handleSignup}
          onSwitchToLogin={() => setAuthMode("login")}
        />
      );
    }

    // Login page
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToSignup={() => setAuthMode("signup")}
      />
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
