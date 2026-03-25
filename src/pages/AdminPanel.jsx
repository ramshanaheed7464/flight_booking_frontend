import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plane,
    BookOpen,
    LayoutDashboard,
    LogOut,
    Plus,
    Pencil,
    Trash2,
    X,
    Check,
    AlertCircle,
    ArrowRight,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Search,
    UserCircle,
    Globe,
    Utensils,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getFlights, addFlight, updateFlight, deleteFlight } from '../api/flightApi';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../api/bookingApi';
import {
    getNationalities, addNationality, updateNationality, deleteNationality,
    getMealPreferences, addMealPreference, updateMealPreference, deleteMealPreference,
} from '../api/bookingOptionsApi';
import {
    validateFlightNumber, validateCity, validateDeparture,
    validateArrival, validateSeats, validatePrice, runValidators,
    DEFAULT_NATIONALITIES, DEFAULT_MEAL_PREFERENCES,
} from './validation';
import './AdminPanel.css';

// ─── Status helpers ───────────────────────────────────────────────
const STATUS_COLOR = {
    BOOKED: '#4caf88',
    CANCELLED: '#e05f5f',
    COMPLETED: '#c9a354',
    RETURN: '#7b8cde',
};

function StatusBadge({ status }) {
    const color = STATUS_COLOR[status] || '#c9a354';
    return (
        <span className="ap-status" style={{ color, borderColor: color + '55', background: color + '11' }}>
            {status}
        </span>
    );
}

// ─── Flight Form Modal ────────────────────────────────────────────
const EMPTY_FLIGHT = {
    flightNumber: '', source: '', destination: '',
    departureTime: '', arrivalTime: '', seatsAvailable: '', price: '',
};

function FlightModal({ flight, onClose, onSaved }) {
    const isEdit = !!flight?.id;
    const [form, setForm] = useState(
        isEdit ? {
            flightNumber: flight.flightNumber || '',
            source: flight.source || '',
            destination: flight.destination || '',
            departureTime: flight.departureTime ? flight.departureTime.slice(0, 16) : '',
            arrivalTime: flight.arrivalTime ? flight.arrivalTime.slice(0, 16) : '',
            seatsAvailable: flight.seatsAvailable ?? '',
            price: flight.price ?? '',
        } : { ...EMPTY_FLIGHT }
    );
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const handle = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => runValidators({
        flightNumber: validateFlightNumber(form.flightNumber),
        source: validateCity(form.source, 'Origin'),
        destination: validateCity(form.destination, 'Destination'),
        departureTime: validateDeparture(form.departureTime),
        arrivalTime: validateArrival(form.departureTime, form.arrivalTime),
        seatsAvailable: validateSeats(form.seatsAvailable),
        price: validatePrice(form.price),
    });

    const handleSubmit = async () => {
        setServerError('');
        const { errors: fieldErrors, isValid } = validate();
        if (!isValid) { setErrors(fieldErrors); return; }
        setLoading(true);
        try {
            const payload = {
                flightNumber: form.flightNumber.trim().toUpperCase(),
                source: form.source.trim(),
                destination: form.destination.trim(),
                departureTime: form.departureTime,
                arrivalTime: form.arrivalTime,
                seatsAvailable: parseInt(form.seatsAvailable),
                price: parseFloat(form.price),
            };
            if (isEdit) {
                await updateFlight(flight.id, payload);
            } else {
                await addFlight(payload);
            }
            onSaved();
            onClose();
        } catch (e) {
            setServerError(e.response?.data || 'Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="ap-modal">
                <button className="ap-modal-close" onClick={onClose}><X size={16} /></button>
                <div className="ap-modal-title">{isEdit ? 'Edit' : 'Add'} <em>Flight</em></div>
                <div className="ap-modal-sub">{isEdit ? `Editing flight #${flight.id}` : 'Add a new flight to the system'}</div>

                <div className="ap-form-row">
                    <div className="ap-form-field">
                        <label className="ap-form-label">Flight Number</label>
                        <input className={`ap-form-input${errors.flightNumber ? ' ap-input-err' : ''}`} name="flightNumber" placeholder="e.g. PK101" value={form.flightNumber} onChange={handle} />
                        {errors.flightNumber && <span className="ap-field-err">{errors.flightNumber}</span>}
                    </div>
                    <div className="ap-form-field">
                        <label className="ap-form-label">Price (PKR)</label>
                        <input className={`ap-form-input${errors.price ? ' ap-input-err' : ''}`} name="price" type="number" min="1" placeholder="e.g. 15000" value={form.price} onChange={handle} />
                        {errors.price && <span className="ap-field-err">{errors.price}</span>}
                    </div>
                </div>

                <div className="ap-form-row">
                    <div className="ap-form-field">
                        <label className="ap-form-label">Origin</label>
                        <input className={`ap-form-input${errors.source ? ' ap-input-err' : ''}`} name="source" placeholder="e.g. Karachi" value={form.source} onChange={handle} />
                        {errors.source && <span className="ap-field-err">{errors.source}</span>}
                    </div>
                    <div className="ap-form-field">
                        <label className="ap-form-label">Destination</label>
                        <input className={`ap-form-input${errors.destination ? ' ap-input-err' : ''}`} name="destination" placeholder="e.g. Lahore" value={form.destination} onChange={handle} />
                        {errors.destination && <span className="ap-field-err">{errors.destination}</span>}
                    </div>
                </div>

                <div className="ap-form-row">
                    <div className="ap-form-field">
                        <label className="ap-form-label">Departure</label>
                        <input className={`ap-form-input${errors.departureTime ? ' ap-input-err' : ''}`} name="departureTime" type="datetime-local" value={form.departureTime} onChange={handle} style={{ colorScheme: 'dark' }} />
                        {errors.departureTime && <span className="ap-field-err">{errors.departureTime}</span>}
                    </div>
                    <div className="ap-form-field">
                        <label className="ap-form-label">Arrival</label>
                        <input className={`ap-form-input${errors.arrivalTime ? ' ap-input-err' : ''}`} name="arrivalTime" type="datetime-local" value={form.arrivalTime} onChange={handle} style={{ colorScheme: 'dark' }} />
                        {errors.arrivalTime && <span className="ap-field-err">{errors.arrivalTime}</span>}
                    </div>
                </div>

                <div className="ap-form-field">
                    <label className="ap-form-label">Seats Available</label>
                    <input className={`ap-form-input${errors.seatsAvailable ? ' ap-input-err' : ''}`} name="seatsAvailable" type="number" min="1" max="1000" placeholder="e.g. 180" value={form.seatsAvailable} onChange={handle} />
                    {errors.seatsAvailable && <span className="ap-field-err">{errors.seatsAvailable}</span>}
                </div>

                {serverError && (
                    <div className="ap-modal-error">
                        <AlertCircle size={13} />{serverError}
                    </div>
                )}

                <div className="ap-modal-actions">
                    <button className="ap-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="ap-modal-submit" onClick={handleSubmit} disabled={loading}>
                        {loading
                            ? <><Loader2 size={13} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Saving…</>
                            : isEdit ? 'Update Flight' : 'Add Flight'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────
function DeleteModal({ label, onClose, onConfirm }) {
    const [loading, setLoading] = useState(false);
    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    };
    return (
        <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="ap-modal" style={{ maxWidth: 380 }}>
                <button className="ap-modal-close" onClick={onClose}><X size={16} /></button>
                <div className="ap-modal-title">Confirm <em>Delete</em></div>
                <div className="ap-modal-sub">This action cannot be undone.</div>
                <p className="ap-confirm-text">
                    Are you sure you want to delete <strong>{label}</strong>?
                    {label?.includes('booking') && ' Seats will be restored if it was active.'}
                </p>
                <div className="ap-modal-actions">
                    <button className="ap-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="ap-del-confirm-btn" onClick={handleConfirm} disabled={loading}>
                        {loading
                            ? <><Loader2 size={13} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Deleting…</>
                            : <><Trash2 size={13} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Delete</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Flights Tab ──────────────────────────────────────────────────
function FlightsTab() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editFlight, setEditFlight] = useState(null);
    const [deleteFlt, setDeleteFlt] = useState(null);

    const fmt = v => v ? new Date(v).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    const load = () => {
        setLoading(true);
        getFlights()
            .then(r => setFlights(r.data))
            .catch(() => setError('Failed to load flights.'))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleDelete = async () => {
        try {
            await deleteFlight(deleteFlt.id);
            setDeleteFlt(null);
            load();
        } catch (e) {
            alert(e.response?.data || 'Delete failed.');
            setDeleteFlt(null);
        }
    };

    const filtered = flights.filter(f =>
        [f.flightNumber, f.source, f.destination].some(v =>
            v?.toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <>
            <div className="ap-page-header">
                <div>
                    <div className="ap-page-title">Manage <em>Flights</em></div>
                    <div className="ap-page-sub">Add, edit or remove flights from the system.</div>
                </div>
            </div>

            {/* Stats */}
            <div className="ap-stats">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: 'rgba(201,163,84,0.1)' }}>
                        <Plane size={18} style={{ color: '#c9a354' }} />
                    </div>
                    <div>
                        <div className="ap-stat-num">{flights.length}</div>
                        <div className="ap-stat-lbl">Total Flights</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: 'rgba(76,175,136,0.1)' }}>
                        <CheckCircle size={18} style={{ color: '#4caf88' }} />
                    </div>
                    <div>
                        <div className="ap-stat-num">{flights.filter(f => f.seatsAvailable > 0).length}</div>
                        <div className="ap-stat-lbl">Available</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: 'rgba(224,95,95,0.1)' }}>
                        <XCircle size={18} style={{ color: '#e05f5f' }} />
                    </div>
                    <div>
                        <div className="ap-stat-num">{flights.filter(f => f.seatsAvailable === 0).length}</div>
                        <div className="ap-stat-lbl">Sold Out</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: 'rgba(123,140,222,0.1)' }}>
                        <Users size={18} style={{ color: '#7b8cde' }} />
                    </div>
                    <div>
                        <div className="ap-stat-num">{flights.reduce((s, f) => s + (f.seatsAvailable || 0), 0)}</div>
                        <div className="ap-stat-lbl">Total Seats</div>
                    </div>
                </div>
            </div>

            {/* Action bar */}
            <div className="ap-action-bar">
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.7rem', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                    <input
                        className="ap-search-input"
                        style={{ paddingLeft: '2.1rem' }}
                        placeholder="Search by route, flight number…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="ap-add-btn" onClick={() => setShowAdd(true)}>
                    <Plus size={14} /> Add Flight
                </button>
            </div>

            <div className="ap-count">{filtered.length} flight{filtered.length !== 1 ? 's' : ''}</div>

            {loading && <div className="ap-loading"><Loader2 size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Loading…</div>}
            {error && <div className="ap-error"><AlertCircle size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />{error}</div>}
            {!loading && !error && (
                <div className="ap-table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Flight</th>
                                <th>Route</th>
                                <th>Departure</th>
                                <th>Arrival</th>
                                <th>Seats</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="ap-empty">No flights found.</td></tr>
                            ) : filtered.map(f => (
                                <tr key={f.id}>
                                    <td><span className="ap-table-mono">#{f.id}</span></td>
                                    <td><span className="ap-table-bold">{f.flightNumber}</span></td>
                                    <td>
                                        <div className="ap-table-route">
                                            {f.source}
                                            <ArrowRight size={12} className="ap-table-route-arrow" />
                                            {f.destination}
                                        </div>
                                    </td>
                                    <td><span className="ap-table-mono">{fmt(f.departureTime)}</span></td>
                                    <td><span className="ap-table-mono">{fmt(f.arrivalTime)}</span></td>
                                    <td>
                                        <span style={{ color: f.seatsAvailable === 0 ? '#e05f5f' : f.seatsAvailable <= 10 ? '#e8a838' : 'rgba(255,255,255,0.65)' }}>
                                            {f.seatsAvailable}
                                        </span>
                                    </td>
                                    <td><span style={{ color: '#c9a354', fontFamily: 'DM Mono, monospace', fontSize: '0.8rem' }}>PKR {f.price}</span></td>
                                    <td>
                                        <div className="ap-actions">
                                            <button className="ap-edit-btn" onClick={() => setEditFlight(f)}>
                                                <Pencil size={11} /> Edit
                                            </button>
                                            <button className="ap-del-btn" onClick={() => setDeleteFlt(f)}>
                                                <Trash2 size={11} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdd && <FlightModal onClose={() => setShowAdd(false)} onSaved={load} />}
            {editFlight && <FlightModal flight={editFlight} onClose={() => setEditFlight(null)} onSaved={load} />}
            {deleteFlt && (
                <DeleteModal
                    label={`flight ${deleteFlt.flightNumber} (${deleteFlt.source} → ${deleteFlt.destination})`}
                    onClose={() => setDeleteFlt(null)}
                    onConfirm={handleDelete}
                />
            )}
        </>
    );
}

// ─── Bookings Tab ─────────────────────────────────────────────────
function BookingsTab() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [deleteBk, setDeleteBk] = useState(null);

    const fmt = v => v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtT = v => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

    const load = () => {
        setLoading(true);
        getAllBookings()
            .then(r => setBookings(r.data))
            .catch(e => {
                const status = e.response?.status;
                const msg = e.response?.data?.message || e.response?.data || e.message || 'Unknown error';
                if (status === 401 || status === 403) {
                    setError(`Access denied (${status}) — make sure your account has ADMIN role.`);
                } else if (status === 404) {
                    setError('Endpoint not found (404) — check that GET /api/bookings/all exists on your backend.');
                } else if (!e.response) {
                    setError('Cannot reach server — is your backend running?');
                } else {
                    setError(`Failed to load bookings (${status ?? 'no response'}): ${msg}`);
                }
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

    const counts = ['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'].reduce((acc, s) => {
        acc[s] = s === 'ALL' ? bookings.length : bookings.filter(b => b.status === s).length;
        return acc;
    }, {});

    return (
        <>
            <div className="ap-page-header">
                <div>
                    <div className="ap-page-title">Manage <em>Bookings</em></div>
                    <div className="ap-page-sub">View, update status or delete any booking.</div>
                </div>
            </div>

            {/* Stats */}
            <div className="ap-stats">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: 'rgba(201,163,84,0.1)' }}>
                        <BookOpen size={18} style={{ color: '#c9a354' }} />
                    </div>
                    <div>
                        <div className="ap-stat-num">{counts.ALL}</div>
                        <div className="ap-stat-lbl">Total Bookings</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: 'rgba(76,175,136,0.1)' }}>
                        <CheckCircle size={18} style={{ color: '#4caf88' }} />
                    </div>
                    <div>
                        <div className="ap-stat-num">{counts.BOOKED}</div>
                        <div className="ap-stat-lbl">Active</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: 'rgba(201,163,84,0.1)' }}>
                        <Clock size={18} style={{ color: '#c9a354' }} />
                    </div>
                    <div>
                        <div className="ap-stat-num">{counts.COMPLETED}</div>
                        <div className="ap-stat-lbl">Completed</div>
                    </div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon" style={{ background: 'rgba(224,95,95,0.1)' }}>
                        <XCircle size={18} style={{ color: '#e05f5f' }} />
                    </div>
                    <div>
                        <div className="ap-stat-num">{counts.CANCELLED}</div>
                        <div className="ap-stat-lbl">Cancelled</div>
                    </div>
                </div>
            </div>

            {/* Action bar */}
            <div className="ap-action-bar">
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={14} style={{ position: 'absolute', left: '0.7rem', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                        <input
                            className="ap-search-input"
                            style={{ paddingLeft: '2.1rem' }}
                            placeholder="Search by user, flight, route…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="ap-status-select"
                        style={{ padding: '0.55rem 0.9rem', minWidth: 130 }}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        {['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'].map(s => (
                            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="ap-count">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</div>

            {loading && <div className="ap-loading"><Loader2 size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Loading…</div>}
            {error && <div className="ap-error"><AlertCircle size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />{error}</div>}
            {!loading && !error && (
                <div className="ap-table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Route</th>
                                <th>Flight</th>
                                <th>Date</th>
                                <th>Pax</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={9} className="ap-empty">No bookings found.</td></tr>
                            ) : filtered.map(b => (
                                <tr key={b.id}>
                                    <td><span className="ap-table-mono">#{b.id}</span></td>
                                    <td>
                                        <div style={{ lineHeight: 1.3 }}>
                                            <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500 }}>{b.user?.name || '—'}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontFamily: 'DM Mono, monospace' }}>{b.user?.email || '—'}</div>
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
                                        <div style={{ lineHeight: 1.3 }}>
                                            <div className="ap-table-mono" style={{ fontSize: '0.74rem' }}>{fmt(b.flight?.departureTime)}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', fontFamily: 'DM Mono, monospace' }}>{fmtT(b.flight?.departureTime)}</div>
                                        </div>
                                    </td>
                                    <td><span style={{ color: 'rgba(255,255,255,0.55)' }}>{b.passengers ?? 1}</span></td>
                                    <td>
                                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>
                                            {(b.tripType || 'ONE_WAY').replace('_', ' ').toLowerCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="ap-status-select"
                                            value={b.status}
                                            onChange={e => handleStatusChange(b.id, e.target.value)}
                                            style={{
                                                color: STATUS_COLOR[b.status] || '#c9a354',
                                                borderColor: (STATUS_COLOR[b.status] || '#c9a354') + '55',
                                            }}
                                        >
                                            <option value="BOOKED">BOOKED</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="ap-actions">
                                            <button className="ap-del-btn" onClick={() => setDeleteBk(b)}>
                                                <Trash2 size={11} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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

// ─── Dashboard Overview Tab ───────────────────────────────────────
function DashboardTab({ onNav }) {
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
                <div className="ap-loading"><Loader2 size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Loading overview…</div>
            ) : (
                <>
                    <div className="ap-stats">
                        <div className="ap-stat-card">
                            <div className="ap-stat-icon" style={{ background: 'rgba(201,163,84,0.1)' }}>
                                <Plane size={20} style={{ color: '#c9a354' }} />
                            </div>
                            <div>
                                <div className="ap-stat-num">{flights.length}</div>
                                <div className="ap-stat-lbl">Flights</div>
                            </div>
                        </div>
                        <div className="ap-stat-card">
                            <div className="ap-stat-icon" style={{ background: 'rgba(76,175,136,0.1)' }}>
                                <BookOpen size={20} style={{ color: '#4caf88' }} />
                            </div>
                            <div>
                                <div className="ap-stat-num">{bookings.length}</div>
                                <div className="ap-stat-lbl">Bookings</div>
                            </div>
                        </div>
                        <div className="ap-stat-card">
                            <div className="ap-stat-icon" style={{ background: 'rgba(123,140,222,0.1)' }}>
                                <CheckCircle size={20} style={{ color: '#7b8cde' }} />
                            </div>
                            <div>
                                <div className="ap-stat-num">{bookings.filter(b => b.status === 'BOOKED').length}</div>
                                <div className="ap-stat-lbl">Active Bookings</div>
                            </div>
                        </div>
                        <div className="ap-stat-card">
                            <div className="ap-stat-icon" style={{ background: 'rgba(201,163,84,0.08)' }}>
                                <span style={{ color: '#c9a354', fontFamily: 'Playfair Display, serif', fontSize: '1rem', fontWeight: 600 }}>PKR</span>
                            </div>
                            <div>
                                <div className="ap-stat-num" style={{ fontSize: '1.3rem' }}>PKR {revenue.toLocaleString()}</div>
                                <div className="ap-stat-lbl">Est. Revenue</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent bookings preview */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
                                Recent Bookings
                            </div>
                            <button
                                onClick={() => onNav('bookings')}
                                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem', color: '#c9a354', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                                View all <ArrowRight size={12} />
                            </button>
                        </div>
                        <div className="ap-table-wrap">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Route</th>
                                        <th>Status</th>
                                        <th>Pax</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.slice(0, 6).map(b => (
                                        <tr key={b.id}>
                                            <td><span className="ap-table-mono">#{b.id}</span></td>
                                            <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{b.user?.email || '—'}</td>
                                            <td>
                                                <div className="ap-table-route">
                                                    {b.flight?.source || '—'}
                                                    <ArrowRight size={11} className="ap-table-route-arrow" />
                                                    {b.flight?.destination || '—'}
                                                </div>
                                            </td>
                                            <td><StatusBadge status={b.status} /></td>
                                            <td style={{ color: 'rgba(255,255,255,0.5)' }}>{b.passengers ?? 1}</td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && (
                                        <tr><td colSpan={5} className="ap-empty">No bookings yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

// ─── Booking Options Tab ──────────────────────────────────────────
function OptionList({ title, icon: Icon, items, onAdd, onUpdate, onDelete, placeholder }) {
    const [newVal, setNewVal] = useState('');
    const [editId, setEditId] = useState(null);
    const [editVal, setEditVal] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async () => {
        if (!newVal.trim()) { setError('Value cannot be empty.'); return; }
        setSaving(true); setError('');
        try { await onAdd(newVal.trim()); setNewVal(''); }
        catch (e) { setError(e.response?.data || 'Failed to add.'); }
        finally { setSaving(false); }
    };

    const handleUpdate = async (id) => {
        if (!editVal.trim()) { setError('Value cannot be empty.'); return; }
        setSaving(true); setError('');
        try { await onUpdate(id, editVal.trim()); setEditId(null); setEditVal(''); }
        catch (e) { setError(e.response?.data || 'Failed to update.'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try { await onDelete(id); }
        catch (e) { setError(e.response?.data || 'Failed to delete.'); }
    };

    return (
        <div className="ap-options-card">
            <div className="ap-options-header">
                <Icon size={14} style={{ color: 'var(--color-gold)' }} />
                <span className="ap-options-title">{title}</span>
                <span className="ap-options-count">{items.length}</span>
            </div>

            {/* Add new */}
            <div className="ap-options-add-row">
                <input
                    className="ap-form-input ap-options-input"
                    placeholder={placeholder}
                    value={newVal}
                    onChange={e => { setNewVal(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button className="ap-add-btn" onClick={handleAdd} disabled={saving}>
                    <Plus size={13} /> Add
                </button>
            </div>
            {error && <div className="ap-field-err" style={{ marginBottom: '0.5rem' }}>{error}</div>}

            {/* List */}
            <div className="ap-options-list">
                {items.length === 0 && (
                    <div className="ap-options-empty">No items yet — add one above.</div>
                )}
                {items.map(item => {
                    const id = item.id ?? item;
                    const name = item.name ?? item;
                    const isEditing = editId === id;
                    return (
                        <div key={id} className="ap-options-row">
                            {isEditing ? (
                                <>
                                    <input
                                        className="ap-form-input ap-options-inline-input"
                                        value={editVal}
                                        onChange={e => setEditVal(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleUpdate(id);
                                            if (e.key === 'Escape') { setEditId(null); setEditVal(''); }
                                        }}
                                        autoFocus
                                    />
                                    <button className="ap-edit-btn" onClick={() => handleUpdate(id)} disabled={saving}>
                                        <Check size={11} /> Save
                                    </button>
                                    <button className="ap-modal-cancel ap-options-cancel-btn" onClick={() => { setEditId(null); setEditVal(''); }}>
                                        <X size={11} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="ap-options-name">{name}</span>
                                    <div className="ap-actions">
                                        <button className="ap-edit-btn" onClick={() => { setEditId(id); setEditVal(name); }}>
                                            <Pencil size={11} /> Edit
                                        </button>
                                        <button className="ap-del-btn" onClick={() => handleDelete(id)}>
                                            <Trash2 size={11} /> Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}



function BookingOptionsTab() {
    const [nationalities, setNationalities] = useState([]);
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [usingDefaults, setUsingDefaults] = useState(false);

    const load = () => {
        setLoading(true);
        setError('');
        Promise.all([getNationalities(), getMealPreferences()])
            .then(([nr, mr]) => {
                // If backend returns empty arrays, seed from defaults as display-only
                const nats = nr.data?.length ? nr.data : DEFAULT_NATIONALITIES.map((n, i) => ({ id: i, name: n }));
                const mealsD = mr.data?.length ? mr.data : DEFAULT_MEAL_PREFERENCES.map((m, i) => ({ id: i, name: m }));
                setNationalities(nats);
                setMeals(mealsD);
                setUsingDefaults(!nr.data?.length || !mr.data?.length);
            })
            .catch(e => {
                const status = e.response?.status;
                if (status === 404 || !e.response) {
                    // Backend endpoint not implemented yet — show defaults as read-only
                    setNationalities(DEFAULT_NATIONALITIES.map((n, i) => ({ id: i, name: n })));
                    setMeals(DEFAULT_MEAL_PREFERENCES.map((m, i) => ({ id: i, name: m })));
                    setUsingDefaults(true);
                } else if (status === 403) {
                    setError('Access denied (403) — the /api/booking-options/* endpoints require ADMIN role. Check your Spring Security config (hasAuthority vs hasRole) and JWT claims. See the browser console for details.');
                } else {
                    setError(`Failed to load booking options (${status ?? 'no response'}).`);
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    // Wrap API calls so the list re-fetches after each mutation
    const wrap = fn => async (...args) => { await fn(...args); load(); };

    return (
        <>
            <div className="ap-page-header">
                <div>
                    <div className="ap-page-title">Booking <em>Options</em></div>
                    <div className="ap-page-sub">Manage nationalities and meal preferences shown during booking.</div>
                </div>
            </div>

            {loading && <div className="ap-loading"><Loader2 size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Loading…</div>}
            {error && <div className="ap-error">{error}</div>}

            {!loading && usingDefaults && (
                <div className="ap-options-notice">
                    <AlertCircle size={13} />
                    Backend endpoints for booking options are not set up yet. Showing built-in defaults — add the
                    {' '}<code>GET/POST /api/booking-options/nationalities</code> and <code>/meals</code> endpoints
                    to enable live editing.
                </div>
            )}

            {!loading && !error && (
                <div className="ap-options-grid">
                    <OptionList
                        title="Nationalities"
                        icon={Globe}
                        items={nationalities}
                        placeholder="e.g. Brazilian"
                        onAdd={wrap(name => addNationality(name))}
                        onUpdate={wrap((id, name) => updateNationality(id, name))}
                        onDelete={wrap(id => deleteNationality(id))}
                    />
                    <OptionList
                        title="Meal Preferences"
                        icon={Utensils}
                        items={meals}
                        placeholder="e.g. Nut Free"
                        onAdd={wrap(name => addMealPreference(name))}
                        onUpdate={wrap((id, name) => updateMealPreference(id, name))}
                        onDelete={wrap(id => deleteMealPreference(id))}
                    />
                </div>
            )}
        </>
    );
}

// ─── Main AdminPanel ──────────────────────────────────────────────
export default function AdminPanel() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [tab, setTab] = useState('dashboard');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/login');
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NAV = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'flights', label: 'Flights', icon: Plane },
        { id: 'bookings', label: 'Bookings', icon: BookOpen },
        { id: 'options', label: 'Booking Options', icon: Globe },
    ];

    return (
        <div className="ap-root">
            {/* Top bar */}
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
                {/* Sidebar */}
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
                    <button
                        className="ap-nav-btn"
                        onClick={() => navigate('/profile')}
                    >
                        <UserCircle size={15} className="ap-nav-icon" />
                        Profile
                    </button>
                </aside>

                {/* Main */}
                <main className="ap-main">
                    {tab === 'dashboard' && <DashboardTab onNav={setTab} />}
                    {tab === 'flights' && <FlightsTab />}
                    {tab === 'bookings' && <BookingsTab />}
                    {tab === 'options' && <BookingOptionsTab />}
                </main>
            </div>
        </div>
    );
}