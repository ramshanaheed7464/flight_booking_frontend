import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plane, ArrowLeftRight, RotateCcw, X, Check,
    Calendar, Clock, Users, Hash, AlertCircle, Loader2
} from 'lucide-react';
import { getBookings, cancelBooking } from '../api/bookingApi';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './Bookings.css';

const STATUS_COLORS = {
    BOOKED: '#4caf88',
    CANCELLED: '#e05f5f',
    COMPLETED: '#c9a354',
};

const TAB_DOTS = {
    ALL: 'rgba(255,255,255,0.3)',
    BOOKED: '#4caf88',
    COMPLETED: '#c9a354',
    CANCELLED: '#e05f5f',
};

// Pair ROUND_TRIP bookings with their RETURN leg
function pairBookings(bookings) {
    const paired = [];
    const used = new Set();

    bookings.forEach(b => {
        if (used.has(b.id)) return;

        if (b.tripType === 'ROUND_TRIP') {
            // Find matching RETURN leg: same passengers, booked close in time, reverse route
            const returnLeg = bookings.find(r =>
                !used.has(r.id) &&
                r.tripType === 'RETURN' &&
                r.passengers === b.passengers &&
                r.flight?.source === b.flight?.destination &&
                r.flight?.destination === b.flight?.source
            );
            if (returnLeg) {
                used.add(b.id);
                used.add(returnLeg.id);
                paired.push({ type: 'ROUND_TRIP', outbound: b, returnLeg, status: b.status });
                return;
            }
        }

        if (b.tripType === 'RETURN' && !used.has(b.id)) {
            // orphan RETURN — show as standalone
        }

        used.add(b.id);
        paired.push({ type: b.tripType === 'RETURN' ? 'ONE_WAY' : (b.tripType || 'ONE_WAY'), outbound: b, status: b.status });
    });

    return paired;
}

function OneWayCard({ booking, onCancel }) {
    const [cancelling, setCancelling] = useState(false);
    const fmt = v => v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtT = v => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

    const status = booking.status || 'BOOKED';
    const color = STATUS_COLORS[status] || '#c9a354';
    const canCancel = status === 'BOOKED';

    const handleCancel = async () => {
        if (!window.confirm('Cancel this booking?')) return;
        setCancelling(true);
        try { await cancelBooking(booking.id); onCancel(); }
        catch (e) { alert(e.response?.data || 'Failed to cancel.'); }
        finally { setCancelling(false); }
    };

    return (
        <div className="bc">
            <div className="bc-header">
                <div className="bc-header-left">
                    <span className="bc-id">#{booking.id}</span>
                    <span className="bc-type"><Plane size={11} /> One Way</span>
                </div>
                <span className="bc-status" style={{ color, borderColor: color + '55', background: color + '11' }}>
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
                        <div className="bc-line" /><Plane size={13} className="bc-plane-icon" /><div className="bc-line" />
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
                            {cancelling ? 'Cancelling…' : <><X size={13} /> Cancel</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function RoundTripCard({ outbound, returnLeg, onCancel }) {
    const [cancellingOut, setCancellingOut] = useState(false);
    const [cancellingRet, setCancellingRet] = useState(false);

    const fmt = v => v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtT = v => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

    const outStatus = outbound.status || 'BOOKED';
    const retStatus = returnLeg.status || 'BOOKED';
    // Overall status: if either is BOOKED show BOOKED, else show outbound status
    const overallStatus = (outStatus === 'BOOKED' || retStatus === 'BOOKED') ? 'BOOKED' : outStatus;
    const color = STATUS_COLORS[overallStatus] || '#c9a354';

    const handleCancelOut = async () => {
        if (!window.confirm('Cancel outbound leg?')) return;
        setCancellingOut(true);
        try { await cancelBooking(outbound.id); onCancel(); }
        catch (e) { alert(e.response?.data || 'Failed to cancel.'); }
        finally { setCancellingOut(false); }
    };

    const handleCancelRet = async () => {
        if (!window.confirm('Cancel return leg?')) return;
        setCancellingRet(true);
        try { await cancelBooking(returnLeg.id); onCancel(); }
        catch (e) { alert(e.response?.data || 'Failed to cancel.'); }
        finally { setCancellingRet(false); }
    };

    const handleCancelBoth = async () => {
        if (!window.confirm('Cancel entire round trip?')) return;
        setCancellingOut(true);
        try {
            if (outbound.status === 'BOOKED') await cancelBooking(outbound.id);
            if (returnLeg.status === 'BOOKED') await cancelBooking(returnLeg.id);
            onCancel();
        } catch (e) { alert(e.response?.data || 'Failed to cancel.'); }
        finally { setCancellingOut(false); }
    };

    const bothBooked = outStatus === 'BOOKED' && retStatus === 'BOOKED';

    return (
        <div className="bc bc-roundtrip">
            {/* Header */}
            <div className="bc-header">
                <div className="bc-header-left">
                    <span className="bc-id">#{outbound.id} · #{returnLeg.id}</span>
                    <span className="bc-type"><ArrowLeftRight size={11} /> Round Trip</span>
                </div>
                <div className="bc-header-right">
                    <span className="bc-status" style={{ color, borderColor: color + '55', background: color + '11' }}>
                        {overallStatus}
                    </span>
                </div>
            </div>

            {/* Outbound leg */}
            <div className="bc-leg">
                <div className="bc-leg-label">
                    <span className="bc-leg-badge bc-leg-out"><Plane size={11} /> Outbound</span>
                    <span className="bc-leg-status" style={{
                        color: STATUS_COLORS[outStatus] || '#c9a354',
                        opacity: outStatus === 'CANCELLED' ? 0.5 : 1
                    }}>
                        {outStatus === 'CANCELLED' ? 'Cancelled' : ''}
                    </span>
                </div>
                <div className="bc-body bc-leg-body" style={{ opacity: outStatus === 'CANCELLED' ? 0.45 : 1 }}>
                    <div className="bc-route">
                        <div>
                            <div className="bc-code">{outbound.flight?.source || '—'}</div>
                            <div className="bc-city">Origin</div>
                        </div>
                        <div className="bc-arr">
                            <div className="bc-line" /><Plane size={13} className="bc-plane-icon" /><div className="bc-line" />
                        </div>
                        <div>
                            <div className="bc-code">{outbound.flight?.destination || '—'}</div>
                            <div className="bc-city">Destination</div>
                        </div>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Flight</span>
                        <span className="bc-detail-val">{outbound.flight?.flightNumber || '—'}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Date</span>
                        <span className="bc-detail-val">{fmt(outbound.flight?.departureTime)}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Time</span>
                        <span className="bc-detail-val">{fmtT(outbound.flight?.departureTime)}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Passengers</span>
                        <span className="bc-detail-val">{outbound.passengers ?? 1}</span>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="bc-leg-divider">
                <div className="bc-leg-divider-line" />
                <span className="bc-leg-divider-label"><RotateCcw size={10} /> Return</span>
                <div className="bc-leg-divider-line" />
            </div>

            {/* Return leg */}
            <div className="bc-leg">
                <div className="bc-leg-label">
                    <span className="bc-leg-badge bc-leg-ret"><RotateCcw size={11} /> Return</span>
                    <span className="bc-leg-status" style={{
                        color: STATUS_COLORS[retStatus] || '#c9a354',
                        opacity: retStatus === 'CANCELLED' ? 0.5 : 1
                    }}>
                        {retStatus === 'CANCELLED' ? 'Cancelled' : ''}
                    </span>
                </div>
                <div className="bc-body bc-leg-body" style={{ opacity: retStatus === 'CANCELLED' ? 0.45 : 1 }}>
                    <div className="bc-route">
                        <div>
                            <div className="bc-code">{returnLeg.flight?.source || '—'}</div>
                            <div className="bc-city">Origin</div>
                        </div>
                        <div className="bc-arr">
                            <div className="bc-line" /><Plane size={13} className="bc-plane-icon" /><div className="bc-line" />
                        </div>
                        <div>
                            <div className="bc-code">{returnLeg.flight?.destination || '—'}</div>
                            <div className="bc-city">Destination</div>
                        </div>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Flight</span>
                        <span className="bc-detail-val">{returnLeg.flight?.flightNumber || '—'}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Date</span>
                        <span className="bc-detail-val">{fmt(returnLeg.flight?.departureTime)}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Time</span>
                        <span className="bc-detail-val">{fmtT(returnLeg.flight?.departureTime)}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Passengers</span>
                        <span className="bc-detail-val">{returnLeg.passengers ?? 1}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {(outStatus === 'BOOKED' || retStatus === 'BOOKED') && (
                <div className="bc-rt-actions">
                    {bothBooked ? (
                        <button className="bc-cancel-btn" onClick={handleCancelBoth} disabled={cancellingOut}>
                            {cancellingOut ? 'Cancelling…' : <><X size={13} /> Cancel Entire Trip</>}
                        </button>
                    ) : (
                        <>
                            {outStatus === 'BOOKED' && (
                                <button className="bc-cancel-btn bc-cancel-sm" onClick={handleCancelOut} disabled={cancellingOut}>
                                    {cancellingOut ? '…' : <><X size={13} /> Cancel Outbound</>}
                                </button>
                            )}
                            {retStatus === 'BOOKED' && (
                                <button className="bc-cancel-btn bc-cancel-sm" onClick={handleCancelRet} disabled={cancellingRet}>
                                    {cancellingRet ? '…' : <><X size={13} /> Cancel Return</>}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
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

    // Pair bookings before filtering
    const paired = pairBookings(bookings);

    // For tab counts, use paired items
    const counts = tabs.reduce((acc, t) => {
        if (t === 'ALL') { acc[t] = paired.length; return acc; }
        acc[t] = paired.filter(p => {
            if (p.type === 'ROUND_TRIP') {
                return p.outbound.status === t || p.returnLeg.status === t;
            }
            return p.outbound.status === t;
        }).length;
        return acc;
    }, {});

    const filtered = activeTab === 'ALL' ? paired : paired.filter(p => {
        if (p.type === 'ROUND_TRIP') {
            return p.outbound.status === activeTab || p.returnLeg.status === activeTab;
        }
        return p.outbound.status === activeTab;
    });

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
                                <div className="bk-empty-icon"><Plane size={36} strokeWidth={1} /></div>
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
                                    {filtered.map((p, i) =>
                                        p.type === 'ROUND_TRIP'
                                            ? <RoundTripCard key={`rt-${p.outbound.id}`} outbound={p.outbound} returnLeg={p.returnLeg} onCancel={load} />
                                            : <OneWayCard key={p.outbound.id} booking={p.outbound} onCancel={load} />
                                    )}
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