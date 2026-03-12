import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './NavBar.css';

export default function NavBar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="nav-root">
            <Link to="/" className="nav-brand">✦ <span>Aero</span>Link</Link>
            <div className="nav-links">
                <Link to="/flights" className={`nav-link ${isActive('/flights') ? 'active' : ''}`}>Flights</Link>
                {user && <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>Bookings</Link>}
                {!user ? (
                    <>
                        <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Login</Link>
                        <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>Register</Link>
                    </>
                ) : (
                    <>
                        <span className="nav-user">{user.email}</span>
                        <button className="nav-btn" onClick={handleLogout}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}