import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Flights from "./pages/Flights";
import Bookings from "./pages/Bookings";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";

// Guard: only ADMIN can access /admin
function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "ADMIN") return <Navigate to="/flights" />;
  return children;
}

// Guard: redirect logged-in admins away from public pages
function UserRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (user?.role === "ADMIN") return <Navigate to="/admin" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/flights" element={<UserRoute><Flights /></UserRoute>} />
          <Route path="/bookings" element={<UserRoute><Bookings /></UserRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;