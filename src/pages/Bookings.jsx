import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookings, cancelBooking } from '../api/bookingApi';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './Bookings.css';

const STATUS_COLORS = {
    BOOKED: '#4caf88',
    CANCELLED: '#e05f5f',
    COMPLETED: '#c9a354',
    RETURN: '#7b8cde',
};

const TAB_DOTS = {
    ALL: 'rgba(255,255,255,0.3)',
    BOOKED: '#4caf88',
    COMPLETED: '#c9a354',
    CANCELLED: '#e05f5f',
};

function BookingCard({ booking, onCancel }) {
    const [cancelling, setCancelling] = useState(false);

    const fmt = v => v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtT = v => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

    const status = booking.status || 'BOOKED';
    const color = STATUS_COLORS[status] || '#c9a354';
    const canCancel = status === 'BOOKED';

    const tripLabel = booking.tripType === 'ROUND_TRIP' ? '⇄ Round Trip'
        : booking.tripType === 'RETURN' ? '↩ Return'
            : '✈ One Way';

    const handleCancel = async () => {
        if (!window.confirm('Cancel this booking?')) return;
        setCancelling(true);
        try {
            await cancelBooking(booking.id);
            onCancel();
        } catch (e) {
            alert(e.response?.data || 'Failed to cancel.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="bc">
            <div className="bc-header">
                <div className="bc-header-left">
                    <span className="bc-id">#{booking.id}</span>
                    <span className="bc-type">{tripLabel}</span>
                </div>
                <span
                    className="bc-status"
                    style={{ color, borderColor: color + '55', background: color + '11' }}
                >
                    {status}
                </span>
            </div>
            <div className="bc-body">
                <div className="bc-route">
                    <div>
                        <div className="bc-code">{booking.flight?.source || '—'}</div>
                        <div className="bc-city">Origin</div>
                    </div>
                    <div className="bc-arr">
                        <div className="bc-line" /><span className="bc-plane">✈</span><div className="bc-line" />
                    </div>
                    <div>
                        <div className="bc-code">{booking.flight?.destination || '—'}</div>
                        <div className="bc-city">Destination</div>
                    </div>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-lbl">Flight</span>
                    <span className="bc-detail-val">{booking.flight?.flightNumber || '—'}</span>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-lbl">Date</span>
                    <span className="bc-detail-val">{fmt(booking.flight?.departureTime)}</span>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-lbl">Time</span>
                    <span className="bc-detail-val">{fmtT(booking.flight?.departureTime)}</span>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-lbl">Passengers</span>
                    <span className="bc-detail-val">{booking.passengers ?? 1}</span>
                </div>
                <div className="bc-actions">
                    {canCancel && (
                        <button className="bc-cancel-btn" onClick={handleCancel} disabled={cancelling}>
                            {cancelling ? 'Cancelling…' : 'Cancel'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Bookings() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');

    const load = () => {
        setLoading(true);
        getBookings()
            .then(res => setBookings(res.data))
            .catch(() => setError('Failed to load bookings.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        load();
    }, [user]);

    const tabs = ['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'];
    const counts = tabs.reduce((acc, t) => {
        acc[t] = t === 'ALL' ? bookings.length : bookings.filter(b => b.status === t).length;
        return acc;
    }, {});

    const filtered = activeTab === 'ALL' ? bookings : bookings.filter(b => b.status === activeTab);

    return (
        <>
            <NavBar />
            <div className="bk-root">
                <div className="bk-hero">
                    <h1 className="bk-title">My <em>Bookings</em></h1>
                    <p className="bk-sub">Manage your upcoming, completed and cancelled trips.</p>
                    <div className="bk-tabs">
                        {tabs.map(t => (
                            <div
                                key={t}
                                className={`bk-tab ${activeTab === t ? 'active' : ''}`}
                                onClick={() => setActiveTab(t)}
                            >
                                <span className="bk-tab-dot" style={{ background: TAB_DOTS[t] }} />
                                {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()} ({counts[t]})
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bk-content">
                    {loading && <div className="bk-loading">Loading bookings…</div>}
                    {error && <div className="bk-error">{error}</div>}
                    {!loading && !error && (
                        filtered.length === 0 ? (
                            <div className="bk-empty">
                                <div className="bk-empty-icon">✈</div>
                                <div className="bk-empty-text">
                                    {activeTab === 'ALL'
                                        ? 'No bookings yet. Explore our flights and book your next adventure.'
                                        : `No ${activeTab.toLowerCase()} bookings.`
                                    }
                                </div>
                                {activeTab === 'ALL' && <a href="/flights" className="bk-empty-link">Browse Flights</a>}
                            </div>
                        ) : (
                            <>
                                <div className="bk-count">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</div>
                                <div className="bk-list">
                                    {filtered.map(b => <BookingCard key={b.id} booking={b} onCancel={load} />)}
                                </div>
                            </>
                        )
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}