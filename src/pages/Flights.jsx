import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plane, ArrowRight, ArrowLeft, ArrowLeftRight, RotateCcw,
    X, Check, Users, Calendar, Clock, Search, SlidersHorizontal,
    User, BookOpen, Globe, Phone, Mail, Utensils,
    ChevronRight, ChevronDown, AlertCircle, Loader2, ArrowUp, ArrowDown
} from 'lucide-react';
import { getFlights } from '../api/flightApi';
import { createBooking } from '../api/bookingApi';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './Flights.css';

const NATIONALITIES = [
    'Pakistani', 'Afghan', 'American', 'Australian', 'British', 'Canadian',
    'Chinese', 'Dutch', 'Egyptian', 'French', 'German', 'Indian', 'Iranian',
    'Italian', 'Japanese', 'Jordanian', 'Korean', 'Malaysian', 'Saudi Arabian',
    'South African', 'Spanish', 'Turkish', 'Emirati', 'Other'
];

const MEAL_PREFERENCES = [
    'Standard', 'Vegetarian', 'Vegan', 'Halal', 'Kosher',
    'Gluten Free', 'Diabetic', 'Low Calorie', 'Child Meal'
];

const emptyPassenger = () => ({
    fullName: '', passportNumber: '', nationality: '',
    dateOfBirth: '', gender: '', phone: '', email: '', mealPreference: ''
});

function PassengerForm({ index, data, onChange, errors }) {
    const field = (key, label, type = 'text', opts = {}) => (
        <div className={`modal-field${opts.fullWidth ? ' modal-field-full' : ''}`}>
            <label className="modal-label">
                {opts.icon && <span className="modal-label-icon">{opts.icon}</span>}
                {label}
            </label>
            {type === 'select' ? (
                <select
                    className={`modal-select${errors?.[key] ? ' modal-input-err' : ''}`}
                    value={data[key]}
                    onChange={e => onChange(index, key, e.target.value)}
                >
                    <option value="">Select…</option>
                    {opts.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input
                    className={`modal-input${errors?.[key] ? ' modal-input-err' : ''}`}
                    type={type}
                    placeholder={opts.placeholder || ''}
                    value={data[key]}
                    onChange={e => onChange(index, key, e.target.value)}
                    style={type === 'date' ? { colorScheme: 'dark' } : {}}
                />
            )}
            {errors?.[key] && (
                <span className="modal-field-err">
                    <AlertCircle size={11} /> {errors[key]}
                </span>
            )}
        </div>
    );

    return (
        <div className="modal-passenger">
            <div className="modal-passenger-title">
                <User size={13} className="modal-passenger-icon" />
                <span className="modal-passenger-num">Passenger {index + 1}</span>
                <span className="modal-passenger-sub">Travel &amp; identity information</span>
            </div>

            <div className="modal-passenger-section-label">
                <BookOpen size={10} /> Identity
            </div>
            <div className="modal-passenger-grid">
                {field('fullName', 'Full Name', 'text', { placeholder: 'As on passport', fullWidth: true, icon: <User size={11} /> })}
                {field('passportNumber', 'Passport No.', 'text', { placeholder: 'e.g. AA1234567', icon: <BookOpen size={11} /> })}
                {field('nationality', 'Nationality', 'select', { options: NATIONALITIES, icon: <Globe size={11} /> })}
                {field('dateOfBirth', 'Date of Birth', 'date', { icon: <Calendar size={11} /> })}
                {field('gender', 'Gender', 'select', { options: ['Male', 'Female', 'Other'], icon: <Users size={11} /> })}
            </div>

            <div className="modal-passenger-section-label">
                <Phone size={10} /> Contact
            </div>
            <div className="modal-passenger-grid">
                {field('phone', 'Phone Number', 'tel', { placeholder: '+92 300 0000000', icon: <Phone size={11} /> })}
                {field('email', 'Email Address', 'email', { placeholder: 'passenger@email.com', icon: <Mail size={11} /> })}
            </div>

            <div className="modal-passenger-section-label">
                <Utensils size={10} /> Preferences
            </div>
            <div className="modal-passenger-grid">
                {field('mealPreference', 'Meal Preference', 'select', { options: MEAL_PREFERENCES, fullWidth: true, icon: <Utensils size={11} /> })}
            </div>
        </div>
    );
}

function BookingModal({ flight, flights, onClose, onBooked }) {
    const [step, setStep] = useState(1);
    const [tripType, setTripType] = useState('ONE_WAY');
    const [passengers, setPassengers] = useState(1);
    const [returnFlightId, setReturnFlightId] = useState('');
    const [passengerForms, setPassengerForms] = useState([emptyPassenger()]);
    const [formErrors, setFormErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const price = flight.price ?? 0;
    const returnFlight = flights.find(f => f.id === Number(returnFlightId));
    const total = tripType === 'ROUND_TRIP' && returnFlight
        ? (price + (returnFlight.price ?? 0)) * passengers
        : price * passengers;

    const returnOptions = flights.filter(f =>
        f.id !== flight.id &&
        f.source === flight.destination &&
        f.destination === flight.source
    );

    const handlePassengerCount = (n) => {
        setPassengers(n);
        setPassengerForms(prev => {
            const next = [...prev];
            while (next.length < n) next.push(emptyPassenger());
            return next.slice(0, n);
        });
    };

    const handlePassengerChange = (idx, key, val) => {
        setPassengerForms(prev => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));
        setFormErrors(prev => prev.map((e, i) => i === idx ? { ...e, [key]: '' } : e));
    };

    const validateStep1 = () => {
        if (tripType === 'ROUND_TRIP' && !returnFlightId) {
            setError('Please select a return flight.');
            return false;
        }
        setError('');
        return true;
    };

    const validateStep2 = () => {
        const errors = passengerForms.map(p => {
            const e = {};
            if (!p.fullName.trim()) e.fullName = 'Required';
            if (!p.passportNumber.trim()) e.passportNumber = 'Required';
            if (!p.nationality) e.nationality = 'Required';
            if (!p.dateOfBirth) e.dateOfBirth = 'Required';
            if (!p.gender) e.gender = 'Required';
            if (!p.phone.trim()) e.phone = 'Required';
            if (!p.email.trim()) e.email = 'Required';
            if (!p.mealPreference) e.mealPreference = 'Required';
            return e;
        });
        setFormErrors(errors);
        return errors.every(e => Object.keys(e).length === 0);
    };

    const handleNext = () => { if (validateStep1()) setStep(2); };

    const handleBook = async () => {
        if (!validateStep2()) return;
        setLoading(true);
        setError('');
        try {
            const body = { flightId: flight.id, tripType, passengers, passengerDetails: passengerForms };
            if (tripType === 'ROUND_TRIP') body.returnFlightId = Number(returnFlightId);
            await createBooking(body);
            setSuccess(true);
            setTimeout(() => { onBooked(); onClose(); }, 1800);
        } catch (e) {
            setError(e.response?.data || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-wide">
                <button className="modal-close" onClick={onClose}>
                    <X size={16} />
                </button>

                <div className="modal-steps">
                    <div className={`modal-step ${step >= 1 ? 'active' : ''}`}>
                        <div className="modal-step-dot">
                            {step > 1 ? <Check size={12} /> : '1'}
                        </div>
                        <span>Trip Details</span>
                    </div>
                    <div className="modal-step-line" />
                    <div className={`modal-step ${step >= 2 ? 'active' : ''}`}>
                        <div className="modal-step-dot">2</div>
                        <span>Passengers</span>
                    </div>
                </div>

                <div className="modal-title">
                    {step === 1 ? <>Select <em>Trip</em></> : <>Passenger <em>Details</em></>}
                </div>
                <div className="modal-route">
                    <span>{flight.source}</span>
                    <ArrowRight size={12} style={{ display: 'inline', margin: '0 5px', verticalAlign: 'middle', opacity: 0.5 }} />
                    <span>{flight.destination}</span>
                    <span style={{ opacity: 0.4 }}> · {flight.flightNumber}</span>
                </div>

                {step === 1 && (
                    <>
                        <div className="modal-tabs">
                            <div className={`modal-tab ${tripType === 'ONE_WAY' ? 'active' : ''}`} onClick={() => setTripType('ONE_WAY')}>
                                <Plane size={13} /> One Way
                            </div>
                            <div className={`modal-tab ${tripType === 'ROUND_TRIP' ? 'active' : ''}`} onClick={() => setTripType('ROUND_TRIP')}>
                                <ArrowLeftRight size={13} /> Round Trip
                            </div>
                        </div>

                        <div className="modal-field">
                            <label className="modal-label">
                                <span className="modal-label-icon"><Users size={11} /></span> Passengers
                            </label>
                            <select className="modal-select" value={passengers} onChange={e => handlePassengerCount(Number(e.target.value))}>
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <option key={n} value={n} disabled={n > flight.seatsAvailable}>
                                        {n} Passenger{n > 1 ? 's' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {tripType === 'ROUND_TRIP' && (
                            <div className="modal-field">
                                <label className="modal-label">
                                    <span className="modal-label-icon"><RotateCcw size={11} /></span> Return Flight
                                </label>
                                <select className="modal-select" value={returnFlightId} onChange={e => setReturnFlightId(e.target.value)}>
                                    <option value="">Select return flight…</option>
                                    {returnOptions.length === 0
                                        ? <option disabled>No return flights available</option>
                                        : returnOptions.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.source} → {f.destination} · {f.flightNumber} · PKR {f.price}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        )}

                        <div className="modal-summary">
                            <div>
                                <div className="modal-total-lbl">Total</div>
                                <div className="modal-total-sub">{passengers} pax · {tripType === 'ROUND_TRIP' ? 'return included' : 'one way'}</div>
                            </div>
                            <div className="modal-total">PKR {total}</div>
                        </div>

                        {error && <div className="modal-error"><AlertCircle size={14} /> {error}</div>}
                        <button className="modal-btn" onClick={handleNext}>
                            Continue <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Passenger Details
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="modal-passengers-scroll">
                            {passengerForms.map((p, i) => (
                                <PassengerForm key={i} index={i} data={p} onChange={handlePassengerChange} errors={formErrors[i]} />
                            ))}
                        </div>

                        <div className="modal-summary">
                            <div>
                                <div className="modal-total-lbl">Total</div>
                                <div className="modal-total-sub">{passengers} pax · {tripType === 'ROUND_TRIP' ? 'return included' : 'one way'}</div>
                            </div>
                            <div className="modal-total">PKR {total}</div>
                        </div>

                        {error && <div className="modal-error"><AlertCircle size={14} /> {error}</div>}
                        {success ? (
                            <div className="modal-success"><Check size={15} /> Booking confirmed!</div>
                        ) : (
                            <div className="modal-btn-row">
                                <button className="modal-btn-back" onClick={() => { setStep(1); setError(''); }}>
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <button className="modal-btn modal-btn-flex" onClick={handleBook} disabled={loading}>
                                    {loading ? <><Loader2 size={14} className="spin" /> Confirming…</> : 'Confirm Booking'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function FlightCard({ flight, allFlights, onBooked }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const fmt = v => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const fmtD = v => v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '---';

    return (
        <>
            <div className="fc">
                <div className="fc-route">
                    <div className="fc-city">
                        <div className="fc-code">{flight.source}</div>
                        <div className="fc-name">Origin</div>
                    </div>
                    <div className="fc-mid">
                        <div className="fc-line">
                            <div className="fc-dot" /><div className="fc-dash" />
                            <Plane size={14} className="fc-plane-icon" />
                            <div className="fc-dash" /><div className="fc-dot" />
                        </div>
                        <div className="fc-fn">{flight.flightNumber}</div>
                    </div>
                    <div className="fc-city">
                        <div className="fc-code">{flight.destination}</div>
                        <div className="fc-name">Destination</div>
                    </div>
                </div>
                <div className="fc-meta">
                    <div>
                        <div className="fc-lbl"><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />Departure</div>
                        <div className="fc-time">{fmt(flight.departureTime)} · {fmtD(flight.departureTime)}</div>
                    </div>
                    <div>
                        <div className="fc-lbl"><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />Arrival</div>
                        <div className="fc-time">{fmt(flight.arrivalTime)}</div>
                    </div>
                </div>
                <div className="fc-meta">
                    <div>
                        <div className="fc-lbl"><Users size={10} style={{ display: 'inline', marginRight: 3 }} />Seats</div>
                        <div className={`fc-time ${flight.seatsAvailable <= 10 ? 'fc-seats-low' : ''}`}>{flight.seatsAvailable} left</div>
                    </div>
                </div>
                <div className="fc-price-wrap">
                    <div className="fc-price">PKR {flight.price ?? '—'}</div>
                    <div className="fc-price-lbl">per seat</div>
                </div>
                {flight.seatsAvailable === 0
                    ? <div className="fc-no-seats">Sold out</div>
                    : <button className="fc-btn" onClick={() => user ? setShowModal(true) : navigate('/login')}>
                        <Plane size={13} /> Book Now
                    </button>
                }
            </div>
            {showModal && (
                <BookingModal flight={flight} flights={allFlights} onClose={() => setShowModal(false)} onBooked={onBooked} />
            )}
        </>
    );
}

const SORT_OPTIONS = [
    { value: 'departure', label: 'Departure', icon: 'Calendar' },
    { value: 'price', label: 'Price Low', icon: 'ArrowUp' },
    { value: 'price-desc', label: 'Price High', icon: 'ArrowDown' },
    { value: 'seats', label: 'Most Seats', icon: 'Users' },
];

function SortDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const current = SORT_OPTIONS.find(o => o.value === value);
    const icons = { Calendar, ArrowUp, ArrowDown, Users };
    const IconEl = icons[current.icon];
    return (
        <div style={{ position: 'relative' }}>
            <button
                className="fl-sort-btn"
                onClick={() => setOpen(o => !o)}
            >
                <IconEl size={12} />
                {current.label}
                <ChevronDown size={12} style={{ opacity: 0.5, marginLeft: 2 }} />
            </button>
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
                    <div className="fl-sort-menu">
                        {SORT_OPTIONS.map(opt => {
                            const Icon = icons[opt.icon];
                            return (
                                <button
                                    key={opt.value}
                                    className={`fl-sort-option ${value === opt.value ? 'active' : ''}`}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                >
                                    <Icon size={12} />
                                    {opt.label}
                                    {value === opt.value && <Check size={11} style={{ marginLeft: 'auto' }} />}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default function Flights() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [sortBy, setSortBy] = useState('departure');
    const [applied, setApplied] = useState({ from: '', to: '', date: '' });

    const load = () => {
        setLoading(true);
        getFlights()
            .then(res => setFlights(res.data))
            .catch(() => setError('Failed to load flights.'))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleSearch = () => setApplied({ from, to, date });
    const handleClear = () => { setFrom(''); setTo(''); setDate(''); setApplied({ from: '', to: '', date: '' }); };

    const filtered = flights
        .filter(f => {
            if (applied.from && !f.source?.toLowerCase().includes(applied.from.toLowerCase())) return false;
            if (applied.to && !f.destination?.toLowerCase().includes(applied.to.toLowerCase())) return false;
            if (applied.date) {
                const dep = f.departureTime ? new Date(f.departureTime).toISOString().slice(0, 10) : '';
                if (dep !== applied.date) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'price') return (a.price ?? 0) - (b.price ?? 0);
            if (sortBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
            if (sortBy === 'seats') return b.seatsAvailable - a.seatsAvailable;
            return new Date(a.departureTime) - new Date(b.departureTime);
        });

    return (
        <>
            <NavBar />
            <div className="fl-root">
                <div className="fl-hero">
                    <h1 className="fl-title">Find your <em>Flight</em></h1>
                    <p className="fl-sub">Search, filter and book available routes instantly.</p>
                    <div className="fl-search-panel">
                        <div className="fl-field">
                            <span className="fl-label">From</span>
                            <input className="fl-input" placeholder="e.g. Karachi" value={from} onChange={e => setFrom(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </div>
                        <div className="fl-field">
                            <span className="fl-label">To</span>
                            <input className="fl-input" placeholder="e.g. Lahore" value={to} onChange={e => setTo(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                        </div>
                        <div className="fl-field">
                            <span className="fl-label">Date</span>
                            <input className="fl-input" type="date" value={date} onChange={e => setDate(e.target.value)} style={{ colorScheme: 'dark' }} />
                        </div>
                        <button className="fl-search-btn" onClick={handleSearch}>
                            <Search size={14} /> Search
                        </button>
                        {(from || to || date) && (
                            <button className="fl-clear-btn" onClick={handleClear}>
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="fl-content">
                    {loading && <div className="fl-loading"><Loader2 size={18} className="spin" /> Searching flights…</div>}
                    {error && <div className="fl-error"><AlertCircle size={15} /> {error}</div>}
                    {!loading && !error && (
                        <>
                            <div className="fl-bar">
                                <div className="fl-count">{filtered.length} flight{filtered.length !== 1 ? 's' : ''} found</div>
                                <div className="fl-sort-wrap">
                                    <SlidersHorizontal size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                    <span className="fl-sort-label">Sort</span>
                                    <SortDropdown value={sortBy} onChange={setSortBy} />
                                </div>
                            </div>
                            <div className="fl-list">
                                {filtered.length === 0
                                    ? <div className="fl-empty">No flights found. Try different cities or clear filters.</div>
                                    : filtered.map(f => <FlightCard key={f.id} flight={f} allFlights={flights} onBooked={load} />)
                                }
                            </div>
                        </>
                    )}
                </div>
                <Footer />
            </div>
        </>
    );
}