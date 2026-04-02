import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, BookOpen, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import DashboardTab from './tabs/DashboardTab';
import FlightsTab from './tabs/FlightsTab';
import BookingsTab from './tabs/BookingsTab';
import '../../styles/palette.css';
import './AdminPanel.css';

const NAV = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
];

export default function AdminPanel() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') navigate('/login');
    }, [user]);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="ap-root">
            {/* ── Top bar ── */}
            <div className="ap-topbar">
                <div className="ap-brand">
                    <Plane size={15} strokeWidth={1.8} />
                    <span>Aero</span>Link
                    <span className="ap-brand-badge">Admin</span>
                </div>
                <div className="ap-topbar-right">
                    <span className="ap-topbar-user">{user?.email}</span>
                    <button
                        className="ap-logout-btn"
                        onClick={() => navigate('/profile')}
                        style={{ borderColor: 'rgba(201,163,84,0.3)', color: 'rgba(201,163,84,0.8)' }}
                    >
                        <UserCircle size={13} /> Profile
                    </button>
                    <button className="ap-logout-btn" onClick={handleLogout}>
                        <LogOut size={13} /> Logout
                    </button>
                </div>
            </div>

            <div className="ap-body">
                {/* ── Sidebar ── */}
                <aside className="ap-sidebar">
                    <div className="ap-nav-label">Navigation</div>
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`ap-nav-btn ${tab === id ? 'active' : ''}`}
                            onClick={() => setTab(id)}
                        >
                            <Icon size={15} className="ap-nav-icon" />
                            {label}
                        </button>
                    ))}
                    <div className="ap-nav-label" style={{ marginTop: '1.5rem' }}>Account</div>
                    <button className="ap-nav-btn" onClick={() => navigate('/profile')}>
                        <UserCircle size={15} className="ap-nav-icon" />
                        Profile
                    </button>
                </aside>

                {/* ── Main content ── */}
                <main className="ap-main">
                    {tab === 'dashboard' && <DashboardTab onNav={setTab} />}
                    {tab === 'flights' && <FlightsTab />}
                    {tab === 'bookings' && <BookingsTab />}
                </main>
            </div>
        </div>
    );
}