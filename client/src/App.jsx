import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Documents from "./pages/Documents";
import Notes from "./pages/Notes";
import NotesPage from "./pages/NotesPage";
import Search from "./pages/Search";
import StudyCards from "./pages/StudyCards";
import Settings from "./pages/Settings";
import CreateFlashcards from "./pages/CreateFlashcards";
import FlashcardSet from "./pages/FlashcardSet";

import DashboardLayout from "./components/layout/DashboardLayout";

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  // Login
  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/dashboard", { replace: true });
  };

  // Signup
  const handleSignup = (userData) => {
    setUser(userData);
    navigate("/dashboard", { replace: true });
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/login", { replace: true });
  };

  // Protected route
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  // Shared application layout
  const LayoutRoute = ({ children }) => (
    <ProtectedRoute>
      <DashboardLayout user={user} onLogout={handleLogout}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLogin={handleLogin}
              onSwitchToSignup={() => navigate("/signup")}
            />
          )
        }
      />

      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Signup
              onSignup={handleSignup}
              onSwitchToLogin={() => navigate("/login")}
            />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          <LayoutRoute>
            <Dashboard user={user} />
          </LayoutRoute>
        }
      />

      <Route
        path="/workspace"
        element={
          <LayoutRoute>
            <Workspace />
          </LayoutRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <LayoutRoute>
            <Documents />
          </LayoutRoute>
        }
      />

      <Route
        path="/notes"
        element={
          <LayoutRoute>
            <Notes />
          </LayoutRoute>
        }
      />

      <Route
        path="/notes/:noteId"
        element={
          <LayoutRoute>
            <NotesPage />
          </LayoutRoute>
        }
      />

      <Route
        path="/search"
        element={
          <LayoutRoute>
            <Search />
          </LayoutRoute>
        }
      />

      <Route
        path="/study-cards"
        element={
          <LayoutRoute>
            <StudyCards />
          </LayoutRoute>
        }
      />

      <Route
        path="/flashcards"
        element={
          <LayoutRoute>
            <CreateFlashcards />
          </LayoutRoute>
        }
      />

      <Route
        path="/flashcards/:setId"
        element={
          <LayoutRoute>
            <FlashcardSet />
          </LayoutRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <LayoutRoute>
            <Settings />
          </LayoutRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
