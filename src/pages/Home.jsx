import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

export default function Home() {
    const { user } = useContext(AuthContext);

    return (
        <div className="home-root">
            <div className="home-bg" />
            <div className="home-grid" />
            <div className="home-eyebrow">✦ Premium Air Travel</div>
            <h1 className="home-title">Fly with <em>refined</em><br />elegance.</h1>
            <p className="home-subtitle">
                Browse curated flights, book with confidence, and experience travel redefined.
            </p>
            <div className="home-actions">
                <Link to="/flights" className="home-cta primary">Explore Flights</Link>
                {!user && <Link to="/register" className="home-cta secondary">Create Account</Link>}
                {user && <Link to="/bookings" className="home-cta secondary">My Bookings</Link>}
            </div>
            <div className="home-stats">
                <div className="home-stat">
                    <div className="home-stat-num">240+</div>
                    <div className="home-stat-label">Destinations</div>
                </div>
                <div className="home-stat">
                    <div className="home-stat-num">50k</div>
                    <div className="home-stat-label">Happy Travelers</div>
                </div>
                <div className="home-stat">
                    <div className="home-stat-num">99%</div>
                    <div className="home-stat-label">On-time Rate</div>
                </div>
            </div>
        </div>
    );
}