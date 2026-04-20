import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { Plane, PlaneTakeoff, Globe, Search, Calendar, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

export default function Home() {
    const { user, login } = useContext(AuthContext);

    return (
        <div className="home-root">
            <div className="home-bg" />
            <div className="home-grid" />

            <div className="home-content">
                <div className="home-eyebrow">
                    <Plane size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                    Premium Air Travel
                </div>
                <h1 className="home-title">Fly with <em>refined</em><br />elegance.</h1>
                <p className="home-subtitle">
                    Curated scheduled routes and live global fares — book with confidence, travel in style.
                </p>
                <div className="home-actions">
                    <Link to="/flights" className="home-cta primary">Explore Flights</Link>
                    {!user && (
                        <button className="home-cta secondary" onClick={login}>
                            Sign In
                        </button>
                    )}
                    {user && <Link to="/bookings" className="home-cta secondary">My Bookings</Link>}
                </div>

                <div className="home-route-pill">
                    <span className="home-route-code">KHI</span>
                    <span className="home-route-track">
                        <span className="home-route-line" />
                        <PlaneTakeoff size={13} className="home-route-plane" />
                        <span className="home-route-line" />
                    </span>
                    <span className="home-route-code">LHR</span>
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

            <div className="home-ways">
                <div className="home-ways-label">Two ways to fly</div>
                <div className="home-features">
                    <div className="home-feature-card">
                        <div className="home-feature-icon"><PlaneTakeoff size={20} /></div>
                        <div className="home-feature-title">Scheduled Flights</div>
                        <p className="home-feature-desc">
                            Browse curated routes managed by our team. Fixed schedules, trusted carriers, and seamless booking in seconds.
                        </p>
                        <Link to="/flights" className="home-feature-link">Browse routes →</Link>
                    </div>

                    <div className="home-divider-or">
                        <span>or</span>
                    </div>

                    <div className="home-feature-card">
                        <div className="home-feature-icon"><Globe size={20} /></div>
                        <div className="home-feature-title">Live Global Search</div>
                        <p className="home-feature-desc">
                            Search real-time fares across hundreds of airlines worldwide. Any route, any date — live pricing.
                        </p>
                        <Link to="/flights" state={{ tab: 'duffel' }} className="home-feature-link">Search live fares →</Link>
                    </div>
                </div>
            </div>

            <div className="home-how">
                <div className="home-how-label">How it works</div>
                <div className="home-steps">
                    <div className="home-step">
                        <div className="home-step-num">1</div>
                        <div className="home-step-icon"><Search size={18} /></div>
                        <div className="home-step-title">Search</div>
                        <p className="home-step-desc">Enter your origin, destination, and travel date to find available flights.</p>
                    </div>
                    <div className="home-step-connector" />
                    <div className="home-step">
                        <div className="home-step-num">2</div>
                        <div className="home-step-icon"><Calendar size={18} /></div>
                        <div className="home-step-title">Book</div>
                        <p className="home-step-desc">Select your flight, fill in passenger details, and confirm your booking instantly.</p>
                    </div>
                    <div className="home-step-connector" />
                    <div className="home-step">
                        <div className="home-step-num">3</div>
                        <div className="home-step-icon"><CheckCircle size={18} /></div>
                        <div className="home-step-title">Fly</div>
                        <p className="home-step-desc">Receive your confirmation, manage your trip in My Bookings, and enjoy the journey.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
