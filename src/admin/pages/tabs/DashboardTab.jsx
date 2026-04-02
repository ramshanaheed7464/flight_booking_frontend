import { useEffect, useState } from 'react';
import { Plane, BookOpen, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { getFlights } from '../../../api/flightApi';
import { getAllBookings } from '../../../api/bookingApi';
import './AdminTabs.css';

function StatusBadge({ status }) {
    const colors = {
        BOOKED: 'var(--color-booked)',
        CANCELLED: 'var(--color-cancelled)',
        COMPLETED: 'var(--color-completed)',
        RETURN: 'var(--color-return)',
    };
    const color = colors[status] || 'var(--color-gold)';
    return (
        <span className="ap-status" style={{ color, borderColor: color + '55', background: color + '11' }}>
            {status}
        </span>
    );
}

export default function DashboardTab({ onNav }) {
    const [flights, setFlights] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getFlights(), getAllBookings()])
            .then(([fr, br]) => { setFlights(fr.data); setBookings(br.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const revenue = bookings
        .filter(b => b.status === 'BOOKED' || b.status === 'COMPLETED')
        .reduce((s, b) => s + ((b.flight?.price ?? 0) * (b.passengers ?? 1)), 0);

    return (
        <>
            <div className="ap-page-header">
                <div>
                    <div className="ap-page-title">Admin <em>Dashboard</em></div>
                    <div className="ap-page-sub">System overview — flights, bookings and revenue at a glance.</div>
                </div>
            </div>

            {loading ? (
                <div className="ap-loading"><Loader2 size={16} />Loading overview…</div>
            ) : (
                <>
                    <div className="ap-stats">
                        <StatCard iconClass="ap-stat-icon--gold" icon={<Plane size={20} />} num={flights.length} label="Flights" />
                        <StatCard iconClass="ap-stat-icon--green" icon={<BookOpen size={20} />} num={bookings.length} label="Bookings" />
                        <StatCard iconClass="ap-stat-icon--blue" icon={<CheckCircle size={20} />} num={bookings.filter(b => b.status === 'BOOKED').length} label="Active Bookings" />
                        <StatCard
                            iconClass="ap-stat-icon--revenue"
                            icon={<span className="ap-stat-icon-pkr">PKR</span>}
                            num={<span className="ap-stat-num--lg">PKR {revenue.toLocaleString()}</span>}
                            label="Est. Revenue"
                        />
                    </div>

                    <div className="ap-section-header">
                        <span className="ap-section-label">Recent Bookings</span>
                        <button className="ap-section-link" onClick={() => onNav('bookings')}>
                            View all <ArrowRight size={12} />
                        </button>
                    </div>

                    <div className="ap-table-wrap">
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>User</th><th>Route</th><th>Status</th><th>Pax</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.slice(0, 6).map(b => (
                                    <tr key={b.id}>
                                        <td><span className="ap-table-mono">#{b.id}</span></td>
                                        <td className="ap-table-user-email">{b.user?.email || '—'}</td>
                                        <td>
                                            <div className="ap-table-route">
                                                {b.flight?.source || '—'}
                                                <ArrowRight size={11} className="ap-table-route-arrow" />
                                                {b.flight?.destination || '—'}
                                            </div>
                                        </td>
                                        <td><StatusBadge status={b.status} /></td>
                                        <td className="ap-table-pax-sm">{b.passengers ?? 1}</td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr><td colSpan={5} className="ap-empty">No bookings yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </>
    );
}

function StatCard({ iconClass, icon, num, label }) {
    return (
        <div className="ap-stat-card">
            <div className={`ap-stat-icon ${iconClass}`}>{icon}</div>
            <div>
                <div className="ap-stat-num">{num}</div>
                <div className="ap-stat-lbl">{label}</div>
            </div>
        </div>
    );
}