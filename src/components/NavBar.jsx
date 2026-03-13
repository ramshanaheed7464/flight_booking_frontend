import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, LogOut, UserCircle } from 'lucide-react';
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
            <Link to="/" className="nav-brand">
                <Plane size={16} strokeWidth={1.8} /> <span>Aero</span>Link
            </Link>
            <div className="nav-links">
                <Link to="/flights" className={`nav-link ${isActive('/flights') ? 'active' : ''}`}>Flights</Link>
                {user && (
                    <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>Bookings</Link>
                )}
                {!user ? (
                    <>
                        <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>Login</Link>
                        <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>Register</Link>
                    </>
                ) : (
                    <>
                        {/* Profile button */}
                        <Link
                            to="/profile"
                            className="nav-profile-btn"
                            title={user.name || user.email}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: '0.78rem',
                                color: isActive('/profile') ? '#c9a354' : 'rgba(255,255,255,0.45)',
                                textDecoration: 'none',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '4px',
                                border: `1px solid ${isActive('/profile') ? 'rgba(201,163,84,0.35)' : 'rgba(255,255,255,0.1)'}`,
                                transition: 'all 0.2s',
                                marginLeft: '0.25rem',
                            }}
                        >
                            <UserCircle size={15} strokeWidth={1.8} />
                            {user.name ? user.name.split(' ')[0] : user.email.split('@')[0]}
                        </Link>

                        <button className="nav-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <LogOut size={13} strokeWidth={2} />
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}