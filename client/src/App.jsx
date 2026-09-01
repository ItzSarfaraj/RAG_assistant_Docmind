import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./pages/NotesPage";

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [authMode, setAuthMode] = useState("login");

  const handleLogin = (userData) => setUser(userData);
  const handleSignup = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setAuthMode("login");
  };

  if (!user) {
    return authMode === "signup" ? (
      <Signup onSignup={handleSignup} onSwitchToLogin={() => setAuthMode("login")} />
    ) : (
      <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthMode("signup")} />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
      <Route path="/notes/:noteId" element={<NotesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;