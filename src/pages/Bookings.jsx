import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import OneWayCard from '../components/OneWayCard';
import RoundTripCard from '../components/RoundTripCard';
import DuffelBookingCard from '../components/DuffelBookingCard';
import CustomSelect from '../components/CustomSelect';
import useBookings from '../hooks/useBookings';
import { TAB_DOTS } from '../constants/statusColors';
import './Bookings.css';

const TABS = ['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'];

/**
 * Bookings page — SRP: owns tab state and renders the list.
 * Data fetching and pairing logic live in useBookings().
 * Card rendering lives in OneWayCard / RoundTripCard.
 */
export default function Bookings() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Redirect unauthenticated users; the hook runs after mount so guard here too.
    if (!user) { navigate('/login'); return null; }

    const { paired, loading, error, reload } = useBookings();

    const counts = TABS.reduce((acc, t) => {
        if (t === 'ALL') { acc[t] = paired.length; return acc; }
        acc[t] = paired.filter(p =>
            p.type === 'ROUND_TRIP'
                ? p.outbound.status === t || p.returnLeg.status === t
                : p.outbound.status === t
        ).length;
        return acc;
    }, {});

    const filtered = activeTab === 'ALL' ? paired : paired.filter(p =>
        p.type === 'ROUND_TRIP'
            ? p.outbound.status === activeTab || p.returnLeg.status === activeTab
            : p.outbound.status === activeTab
    );

    const searchLower = search.toLowerCase().trim();
    const searched = searchLower
        ? filtered.filter(p => {
            const b = p.outbound;
            return [
                b.flightNumber, b.origin, b.destination, b.bookingReference,
                b.carrier, b.flight?.flightNumber, b.flight?.source, b.flight?.destination,
            ].some(v => v && String(v).toLowerCase().includes(searchLower));
          })
        : filtered;

    const SORT_OPTIONS = [
        { value: 'newest', label: 'Newest first' },
        { value: 'oldest', label: 'Oldest first' },
        { value: 'status', label: 'By status' },
    ];

    const getDate = p => {
        const b = p.outbound;
        return new Date(b.departureAt || b.flight?.departureTime || 0).getTime();
    };

    const displayed = [...searched].sort((a, b) => {
        if (sortBy === 'oldest') return getDate(a) - getDate(b);
        if (sortBy === 'status') return (a.outbound.status ?? '').localeCompare(b.outbound.status ?? '');
        return getDate(b) - getDate(a);
    });

    return (
        <>
            <NavBar />
            <div className="bk-root">
                <div className="bk-hero">
                    <h1 className="bk-title">My <em>Bookings</em></h1>
                    <p className="bk-sub">Manage your upcoming, completed and cancelled trips.</p>
                    <div className="bk-tabs">
                        {TABS.map(t => (
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
                    {loading && (
                        <div className="bk-loading"><Loader2 size={16} className="spin" /> Loading bookings…</div>
                    )}
                    {error && (
                        <div className="bk-error"><AlertCircle size={14} /> {error}</div>
                    )}

                    {!loading && !error && paired.length > 0 && (
                        <div className="bk-controls">
                            <div className="bk-search-wrap">
                                <Search size={13} className="bk-search-icon" />
                                <input
                                    className="bk-search-input"
                                    type="text"
                                    placeholder="Search by route, flight, or reference…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button className="bk-search-clear" onClick={() => setSearch('')}>
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                            <CustomSelect
                                value={sortBy}
                                onChange={setSortBy}
                                options={SORT_OPTIONS}
                            />
                        </div>
                    )}

                    {!loading && !error && (
                        displayed.length === 0 ? (
                            <div className="bk-empty">
                                <div className="bk-empty-icon"><Plane size={36} strokeWidth={1} /></div>
                                <div className="bk-empty-text">
                                    {searchLower
                                        ? `No bookings matching "${search}".`
                                        : activeTab === 'ALL'
                                            ? 'No bookings yet. Explore our flights and book your next adventure.'
                                            : `No ${activeTab.toLowerCase()} bookings.`
                                    }
                                </div>
                                {!searchLower && activeTab === 'ALL' && (
                                    <a href="/flights" className="bk-empty-link">Browse Flights</a>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="bk-count">
                                    {searchLower
                                        ? `${displayed.length} of ${filtered.length} booking${filtered.length !== 1 ? 's' : ''}`
                                        : `${displayed.length} booking${displayed.length !== 1 ? 's' : ''}`
                                    }
                                </div>
                                <div className="bk-list">
                                    {displayed.map(p =>
                                        p.type === 'ROUND_TRIP' ? (
                                            <RoundTripCard
                                                key={`rt-${p.outbound.id}`}
                                                outbound={p.outbound}
                                                returnLeg={p.returnLeg}
                                                onCancel={reload}
                                            />
                                        ) : p.type === 'DUFFEL' ? (
                                            <DuffelBookingCard
                                                key={`duffel-${p.outbound.id}`}
                                                booking={p.outbound}
                                                onCancel={reload}
                                            />
                                        ) : (
                                            <OneWayCard
                                                key={p.outbound.id}
                                                booking={p.outbound}
                                                onCancel={reload}
                                            />
                                        )
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
