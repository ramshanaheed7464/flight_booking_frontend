import React, { useEffect, useState } from 'react';
import {
    BookOpen, CheckCircle, XCircle, Clock,
    AlertCircle, Loader2, Search, ArrowRight,
    Trash2, ChevronDown, ChevronUp,
    User, Globe, Phone, Utensils,
} from 'lucide-react';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../../api/bookingApi';
import { DeleteModal } from './AdminModals';

const STATUS_COLOR = {
    BOOKED: 'var(--color-booked)',
    CANCELLED: 'var(--color-cancelled)',
    COMPLETED: 'var(--color-completed)',
    RETURN: 'var(--color-return)',
};

const STATUSES = ['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'];

const fmt = v => v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtT = v => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

function parsePassengers(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
}

function PassengerExpansion({ passengers }) {
    if (!passengers?.length) {
        return <div className="ap-pax-empty">No passenger details recorded.</div>;
    }
    return (
        <div className="ap-pax-list">
            {passengers.map((p, i) => (
                <div key={i} className="ap-pax-card">
                    <div className="ap-pax-heading">
                        <User size={11} /> Passenger {i + 1}
                    </div>
                    {[
                        { icon: <User size={10} />, label: 'Full Name', val: p.fullName },
                        { icon: null, label: 'Passport No.', val: p.passportNumber },
                        { icon: <Globe size={10} />, label: 'Nationality', val: p.nationality },
                        { icon: null, label: 'Date of Birth', val: p.dateOfBirth },
                        { icon: null, label: 'Gender', val: p.gender },
                        { icon: <Phone size={10} />, label: 'Phone', val: p.phone },
                        { icon: <Utensils size={10} />, label: 'Meal', val: p.mealPreference },
                    ].map(({ icon, label, val }) => (
                        <div key={label}>
                            <div className="ap-pax-field-label">{icon}{label}</div>
                            <div className={`ap-pax-field-val${val ? '' : ' ap-pax-field-val--empty'}`}>
                                {val || '—'}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default function BookingsTab() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [deleteBk, setDeleteBk] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const load = () => {
        setLoading(true);
        getAllBookings()
            .then(r => setBookings(r.data))
            .catch(e => {
                const status = e.response?.status;
                const msg = e.response?.data?.message || e.response?.data || e.message || 'Unknown error';
                if (status === 401 || status === 403) setError(`Access denied (${status}) — make sure your account has ADMIN role.`);
                else if (status === 404) setError('Endpoint not found (404) — check that GET /api/bookings/all exists on your backend.');
                else if (!e.response) setError('Cannot reach server — is your backend running?');
                else setError(`Failed to load bookings (${status ?? 'no response'}): ${msg}`);
            })
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await updateBookingStatus(id, status);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        } catch (e) {
            alert(e.response?.data || 'Status update failed.');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteBooking(deleteBk.id);
            setDeleteBk(null);
            load();
        } catch (e) {
            alert(e.response?.data || 'Delete failed.');
            setDeleteBk(null);
        }
    };

    const counts = STATUSES.reduce((acc, s) => {
        acc[s] = s === 'ALL' ? bookings.length : bookings.filter(b => b.status === s).length;
        return acc;
    }, {});

    const filtered = bookings.filter(b => {
        const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
        const matchSearch = search === '' || [
            b.id?.toString(),
            b.flight?.flightNumber,
            b.flight?.source,
            b.flight?.destination,
            b.user?.email,
            b.user?.name,
        ].some(v => v?.toLowerCase().includes(search.toLowerCase()));
        return matchStatus && matchSearch;
    });

    return (
        <>
            <div className="ap-page-header">
                <div>
                    <div className="ap-page-title">Manage <em>Bookings</em></div>
                    <div className="ap-page-sub">View, update status or delete any booking.</div>
                </div>
            </div>

            <div className="ap-stats">
                <StatCard icon={<BookOpen size={18} />} iconClass="ap-stat-icon--gold" num={counts.ALL} label="Total Bookings" />
                <StatCard icon={<CheckCircle size={18} />} iconClass="ap-stat-icon--green" num={counts.BOOKED} label="Active" />
                <StatCard icon={<XCircle size={18} />} iconClass="ap-stat-icon--danger" num={counts.CANCELLED} label="Cancelled" />
                <StatCard icon={<Clock size={18} />} iconClass="ap-stat-icon--blue" num={counts.COMPLETED} label="Completed" />
            </div>

            <div className="ap-action-bar">
                <div className="ap-search-wrap">
                    <Search size={14} />
                    <input
                        className="ap-search-input ap-search-input--padded"
                        placeholder="Search by user, flight, route…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="ap-status-select ap-status-filter"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    {STATUSES.map(s => (
                        <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                    ))}
                </select>
            </div>

            <div className="ap-count">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</div>

            {loading && <div className="ap-loading"><Loader2 size={16} />Loading…</div>}
            {error && <div className="ap-error"><AlertCircle size={14} />{error}</div>}

            {!loading && !error && (
                <div className="ap-table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>User</th><th>Route</th><th>Flight</th>
                                <th>Date</th><th>Pax</th><th>Type</th>
                                <th>Status</th><th>Actions</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={10} className="ap-empty">No bookings found.</td></tr>
                            ) : filtered.map(b => {
                                const isExpanded = expandedId === b.id;
                                const passengers = parsePassengers(b.passengerDetails);
                                return (
                                    <React.Fragment key={b.id}>
                                        <tr className="ap-table-row--clickable" onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                                            <td><span className="ap-table-mono">#{b.id}</span></td>
                                            <td>
                                                <div className="ap-user-cell">
                                                    <div className="ap-user-name">{b.user?.name || '—'}</div>
                                                    <div className="ap-user-email">{b.user?.email || '—'}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ap-table-route">
                                                    {b.flight?.source || '—'}
                                                    <ArrowRight size={11} className="ap-table-route-arrow" />
                                                    {b.flight?.destination || '—'}
                                                </div>
                                            </td>
                                            <td><span className="ap-table-mono">{b.flight?.flightNumber || '—'}</span></td>
                                            <td>
                                                <div className="ap-date-cell">
                                                    <div className="ap-table-mono ap-date-main">{fmt(b.flight?.departureTime)}</div>
                                                    <div className="ap-date-time">{fmtT(b.flight?.departureTime)}</div>
                                                </div>
                                            </td>
                                            <td><span className="ap-table-pax">{b.passengers ?? 1}</span></td>
                                            <td><span className="ap-trip-type">{(b.tripType || 'ONE_WAY').replace('_', ' ').toLowerCase()}</span></td>
                                            <td>
                                                <select
                                                    className="ap-status-select"
                                                    value={b.status}
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={e => { e.stopPropagation(); handleStatusChange(b.id, e.target.value); }}
                                                    style={{
                                                        color: STATUS_COLOR[b.status] || 'var(--color-gold)',
                                                        borderColor: (STATUS_COLOR[b.status] || 'var(--color-gold)') + '55',
                                                    }}
                                                >
                                                    <option value="BOOKED">BOOKED</option>
                                                    <option value="COMPLETED">COMPLETED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="ap-actions" onClick={e => e.stopPropagation()}>
                                                    <button className="ap-del-btn" onClick={() => setDeleteBk(b)}>
                                                        <Trash2 size={11} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="ap-expand-chevron">
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </span>
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr key={`${b.id}-details`}>
                                                <td colSpan={10} className="ap-pax-expansion-cell">
                                                    <div className="ap-pax-expansion-inner">
                                                        <div className="ap-pax-expansion-label">Passenger Details</div>
                                                        <PassengerExpansion passengers={passengers} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {deleteBk && (
                <DeleteModal
                    label={`booking #${deleteBk.id}`}
                    onClose={() => setDeleteBk(null)}
                    onConfirm={handleDelete}
                />
            )}
        </>
    );
}

function StatCard({ icon, iconClass, num, label }) {
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