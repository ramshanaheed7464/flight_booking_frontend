import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Flights from "./pages/Flights";
import Bookings from "./pages/Bookings";
import AdminPanel from "./admin/pages/AdminPanel";
import Profile from "./pages/Profile";

function AdminRoute({ children }) {
  const { user, initialized } = useContext(AuthContext);
  if (!initialized) return null;
  if (!user) return <Navigate to="/" />;
  if (user.role !== "ADMIN") return <Navigate to="/flights" />;
  return children;
}

function UserRoute({ children }) {
  const { user, initialized } = useContext(AuthContext);
  if (!initialized) return null;
  if (!user) return <Navigate to="/" />;
  if (user.role === "ADMIN") return <Navigate to="/admin" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/flights" element={<Flights />} />
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