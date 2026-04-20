import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plane, LogOut, UserCircle, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './NavBar.css';
import { register } from '../api/authApi';

export default function NavBar() {
    const { user, login, logout } = useContext(AuthContext);
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const drawerRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const profileStyle = (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '0.78rem',
        color: active ? '#c9a354' : 'rgba(255,255,255,0.45)',
        textDecoration: 'none',
        padding: '0.4rem 0.75rem',
        borderRadius: '4px',
        border: `1px solid ${active ? 'rgba(201,163,84,0.35)' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.2s',
        marginLeft: '0.25rem',
    });

    const firstName = user?.name ? user.name.split(' ')[0] : user?.email?.split('@')[0];

    return (
        <>
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
                            <button className="nav-link" onClick={login}>Login</button>
                            <button className="nav-link" onClick={register}>Register</button>
                        </>
                    ) : (
                        <>
                            <Link to="/profile" style={profileStyle(isActive('/profile'))} title={user.name || user.email}>
                                <UserCircle size={15} strokeWidth={1.8} />
                                {firstName}
                            </Link>
                            <button className="nav-btn" onClick={logout}>
                                <LogOut size={13} strokeWidth={2} /> Logout
                            </button>
                        </>
                    )}
                </div>

                <button
                    className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(v => !v)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                >
                    <span className="nav-hamburger-bar" />
                    <span className="nav-hamburger-bar" />
                    <span className="nav-hamburger-bar" />
                </button>
            </nav>

            <div ref={drawerRef} className={`nav-drawer ${menuOpen ? 'open' : ''}`} role="dialog" aria-label="Navigation menu">
                <Link to="/flights" className={`nav-drawer-link ${isActive('/flights') ? 'active' : ''}`}>
                    <Plane size={14} strokeWidth={1.8} /> Flights
                </Link>

                {user && (
                    <Link to="/bookings" className={`nav-drawer-link ${isActive('/bookings') ? 'active' : ''}`}>
                        Bookings
                    </Link>
                )}

                {user && (
                    <Link to="/profile" className={`nav-drawer-link ${isActive('/profile') ? 'active' : ''}`}>
                        <UserCircle size={14} strokeWidth={1.8} /> {firstName}
                    </Link>
                )}

                <div className="nav-drawer-divider" />

                {!user ? (
                    <>
                        <button className="nav-drawer-link" onClick={() => { login(); setMenuOpen(false); }}>
                            Login
                        </button>
                        <button className="nav-drawer-btn" onClick={() => { register(); setMenuOpen(false); }}>
                            Register
                        </button>
                    </>
                ) : (
                    <button className="nav-drawer-btn" onClick={() => { logout(); setMenuOpen(false); }}>
                        <LogOut size={13} strokeWidth={2} /> Logout
                    </button>
                )}
            </div>
        </>
    );
}