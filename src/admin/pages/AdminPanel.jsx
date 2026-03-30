import React, { useEffect, useState, useContext, Fragment } from 'react';
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
    ChevronDown,
    ChevronUp,
    User,
    Globe,
    Phone,
    Utensils,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { getFlights, addFlight, updateFlight, deleteFlight } from '../../api/flightApi';
import { getAllBookings, updateBookingStatus, deleteBooking } from '../../api/bookingApi';

import {
    validateFlightNumber, validateCity, validateDeparture,
    validateArrival, validateSeats, validatePrice, runValidators,
} from '../../pages/validation';
import '../../styles/palette.css';
import './AdminPanel.css';

// ─── Status helpers ───────────────────────────────────────────────
const STATUS_COLOR = {
    BOOKED: 'var(--color-booked)',
    CANCELLED: 'var(--color-cancelled)',
    COMPLETED: 'var(--color-completed)',
    RETURN: 'var(--color-return)',
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
    departureTime: '', arrivalTime: '', seatsAvailable: '', price: '', meals: '',
    airline: '', aircraft: '', wifiAvailable: '', inflightEntertainment: '',
    cabinClass: '', layover: '', stopovers: '', baggageAllowance: '',
    seatType: '', mealsIncluded: '', refundable: '', duration: '',
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
            meals: flight.meals ?? '',
            airline: flight.airline ?? '',
            aircraft: flight.aircraft ?? '',
            wifiAvailable: flight.wifiAvailable !== undefined ? String(flight.wifiAvailable) : '',
            inflightEntertainment: flight.inFlightEntertainment ?? '',
            cabinClass: flight.cabinClass ?? '',
            layover: flight.layover ?? '',
            stopovers: flight.stopovers ?? '',
            baggageAllowance: flight.baggageAllowance ?? '',
            seatType: flight.seatType ?? '',
            mealsIncluded: flight.mealsIncluded !== undefined ? String(flight.mealsIncluded) : '',
            refundable: flight.refundable !== undefined ? String(flight.refundable) : '',
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
        price: validatePrice(form.price),
        // airline: validateAirline(form.airline),
        // aircraft: validateAircraft(form.aircraft, 'Aircraft'),
        // wifiAvailable: validateWifiAvailable(form.wifiAvailable, 'Wi-Fi Availability'),
        // inflightEntertainment: validateInflightEntertainment(form.inflightEntertainment, 'In-flight Entertainment'),
        // cabinClass: validateCabinClass(form.cabinClass, 'Cabin Class'),
        // layover: validateLayover(form.layover, 'Layover'),
        // stopovers: validateStopovers(form.stopovers, 'Stopovers'),
        // baggageAllowance: validateBaggageAllowance(form.baggageAllowance, 'Baggage Allowance'),
        source: validateCity(form.source, 'Origin'),
        destination: validateCity(form.destination, 'Destination'),
        departureTime: validateDeparture(form.departureTime),
        arrivalTime: validateArrival(form.departureTime, form.arrivalTime),
        // duration: validateDuration(form.duration),
        seatsAvailable: validateSeats(form.seatsAvailable),
        // seatType: validateSeatType(form.seatType, 'Seat Type'),
        // mealsIncluded: validateBoolean(form.mealsIncluded, 'Meals Included'),
        // meals: validateMealPreference(form.meals, 'Meals'),
    });

    const handleSubmit = async () => {
        setServerError('');
        const { errors: fieldErrors, isValid } = validate();
        if (!isValid) { setErrors(fieldErrors); return; }
        setLoading(true);
        try {
            const parsedPrice = parseFloat(form.price);
            const parsedSeats = parseInt(form.seatsAvailable, 10);

            if (isNaN(parsedPrice) || isNaN(parsedSeats)) {
                setErrors(prev => ({
                    ...prev,
                    ...(isNaN(parsedPrice) ? { price: 'Price must be a valid number.' } : {}),
                    ...(isNaN(parsedSeats) ? { seatsAvailable: 'Seats must be a valid integer.' } : {}),
                }));
                setLoading(false);
                return;
            }

            const payload = {
                flightNumber: form.flightNumber.trim().toUpperCase(),
                price: parsedPrice,

                airline: form.airline?.trim() || null,
                aircraft: form.aircraft?.trim() || null,

                wifiAvailable: form.wifiAvailable === 'true',
                mealsIncluded: form.mealsIncluded === 'true',
                refundable: form.refundable === 'true',

                inFlightEntertainment: form.inflightEntertainment?.trim() || null,
                cabinClass: form.cabinClass?.trim() || null,
                layover: form.layover?.trim() || null,
                stopovers: form.stopovers?.trim() || null,
                baggageAllowance: form.baggageAllowance?.trim() || null,

                source: form.source.trim(),
                destination: form.destination.trim(),

                departureTime: form.departureTime,
                arrivalTime: form.arrivalTime,

                duration: (form.departureTime && form.arrivalTime) ? Math.round((new Date(form.arrivalTime) - new Date(form.departureTime)) / 60000) : null,
                seatsAvailable: parsedSeats,

                seatType: form.seatType?.trim() || null,
                meals: form.meals?.trim() || null,
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
                        <label className="ap-form-label">Airline</label>
                        <input className={`ap-form-input${errors.airline ? ' ap-input-err' : ''}`} name="airline" value={form.airline} onChange={handle} placeholder="e.g. PIA" />
                        {errors.airline && <span className="ap-field-err">{errors.airline}</span>}
                    </div>
                    <div className="ap-form-field">
                        <label className="ap-form-label">Aircraft</label>
                        <input className={`ap-form-input${errors.aircraft ? ' ap-input-err' : ''}`} name="aircraft" value={form.aircraft} onChange={handle} placeholder="e.g. Boeing 777" />
                        {errors.aircraft && <span className="ap-field-err">{errors.aircraft}</span>}
                    </div>
                </div>

                <div className="ap-form-row">
                    <div className="ap-form-field">
                        <label className="ap-form-label">Wi-Fi Available</label>
                        <select name="wifiAvailable" value={form.wifiAvailable} onChange={handle} className="ap-form-input">
                            <option value="">Select</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                        {errors.wifiAvailable && <span className="ap-field-err">{errors.wifiAvailable}</span>}
                    </div>
                    <div className="ap-form-field">
                        <label className="ap-form-label">In-Flight Entertainment</label>
                        <input name="inflightEntertainment" value={form.inflightEntertainment} onChange={handle} className="ap-form-input" placeholder="e.g. Movies, Music" />
                        {errors.inflightEntertainment && <span className="ap-field-err">{errors.inflightEntertainment}</span>}
                    </div>
                </div>

                <div className="ap-form-row">
                    <div className="ap-form-field">
                        <label className="ap-form-label">Origin City</label>
                        <input
                            className={`ap-form-input${errors.source ? ' ap-input-err' : ''}`}
                            name="source"
                            placeholder="e.g. Karachi"
                            value={form.source}
                            onChange={handle}
                        />
                        {errors.source && <span className="ap-field-err">{errors.source}</span>}
                    </div>
                    <div className="ap-form-field">
                        <label className="ap-form-label">Destination City</label>
                        <input
                            className={`ap-form-input${errors.destination ? ' ap-input-err' : ''}`}
                            name="destination"
                            placeholder="e.g. Lahore"
                            value={form.destination}
                            onChange={handle}
                        />
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

                <div className="ap-form-row">
                    <div className="ap-form-field">
                        <label className="ap-form-label">Seat Type</label>
                        <input name="seatType" value={form.seatType} onChange={handle} className="ap-form-input" placeholder="e.g. Window, Aisle" />
                        {errors.seatType && <span className="ap-field-err">{errors.seatType}</span>}
                    </div>
                    <div className="ap-form-field">
                        <label className="ap-form-label">Seats Available</label>
                        <input className={`ap-form-input${errors.seatsAvailable ? ' ap-input-err' : ''}`} name="seatsAvailable" type="number" min="1" max="1000" placeholder="e.g. 180" value={form.seatsAvailable} onChange={handle} />
                        {errors.seatsAvailable && <span className="ap-field-err">{errors.seatsAvailable}</span>}
                    </div>
                </div>

                <div className="ap-form-field">
                    <label className="ap-form-label">Meals Included</label>
                    <select name="mealsIncluded" value={form.mealsIncluded} onChange={handle} className="ap-form-input">
                        <option value="">Select</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div className="ap-form-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="ap-form-label">Meal Options <span style={{ fontWeight: 400, opacity: 0.5, fontSize: '0.75rem' }}>(comma-separated, e.g. Standard, Vegetarian, Halal)</span></label>
                    <input
                        className="ap-form-input"
                        name="meals"
                        placeholder="e.g. Standard, Vegetarian, Halal, Vegan"
                        value={form.meals}
                        onChange={handle}
                        disabled={form.mealsIncluded !== 'true'}
                        style={form.mealsIncluded === 'true' ? {} : { backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
                    />
                </div>
                <div className="ap-form-field">
                    <label className="ap-form-label">Refundable</label>
                    <select name="refundable" value={form.refundable} onChange={handle} className="ap-form-input">
                        <option value="">Select</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
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
                        <Plane size={18} style={{ color: 'var(--color-warning)' }} />
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
    const [expandedId, setExpandedId] = useState(null);

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
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={10} className="ap-empty">No bookings found.</td></tr>
                            ) : filtered.map(b => {
                                const isExpanded = expandedId === b.id;
                                const passengers = Array.isArray(b.passengerDetails) ? b.passengerDetails : [];
                                return (
                                    <React.Fragment key={b.id} >
                                        <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : b.id)}>
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
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={e => { e.stopPropagation(); handleStatusChange(b.id, e.target.value); }}
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
                                                <div className="ap-actions" onClick={e => e.stopPropagation()}>
                                                    <button className="ap-del-btn" onClick={() => setDeleteBk(b)}>
                                                        <Trash2 size={11} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center' }}>
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </span>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr key={`${b.id}-details`}>
                                                <td colSpan={10} style={{ padding: 0, background: 'rgba(201,163,84,0.03)', borderBottom: '1px solid rgba(201,163,84,0.12)' }}>
                                                    <div style={{ padding: '1rem 1.5rem' }}>
                                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem', fontFamily: 'DM Sans, sans-serif' }}>
                                                            Passenger Details
                                                        </div>
                                                        {passengers.length === 0 ? (
                                                            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>No passenger details recorded.</div>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                {passengers.map((p, i) => (
                                                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.6rem 1.2rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                        <div style={{ gridColumn: '1 / -1', fontSize: '0.72rem', color: '#c9a354', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                                                                                <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                                    {icon}{label}
                                                                                </div>
                                                                                <div style={{ fontSize: '0.78rem', color: val ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono, monospace' }}>
                                                                                    {val || '—'}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
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
                </main>
            </div>
        </div>
    );
}