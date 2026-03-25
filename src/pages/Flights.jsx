import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plane, ArrowRight, ArrowLeft, ArrowLeftRight, RotateCcw,
    X, Check, Users, Clock, Search, SlidersHorizontal,
    User, BookOpen, Globe, Phone, Utensils,
    ChevronRight, ChevronDown, AlertCircle, Loader2, ArrowUp, ArrowDown,
    MapPin
} from 'lucide-react';
import { getFlights } from '../api/flightApi';
import { createBooking } from '../api/bookingApi';
import { getNationalities, getMealPreferences } from '../api/bookingOptionsApi';
import { getCountries, getCitiesByCountryId } from '../api/LocationApi';
import { validatePassenger, getPhonePlaceholder, DEFAULT_NATIONALITIES, DEFAULT_MEAL_PREFERENCES } from './validation';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './Flights.css';

function LocationPicker({ label, countries, country, city, onCountryChange, onCityChange }) {
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);

    useEffect(() => {
        if (!country) { setCities([]); return; }
        setLoadingCities(true);
        getCitiesByCountryId(country.id)
            .then(res => setCities(res.data))
            .catch(() => setCities([]))
            .finally(() => setLoadingCities(false));
    }, [country?.id]);

    const handleCountryChange = (e) => {
        const selected = countries.find(c => c.id === Number(e.target.value)) || null;
        onCountryChange(selected);
        onCityChange(null);
    };

    const handleCityChange = (e) => {
        const selected = cities.find(c => c.id === Number(e.target.value)) || null;
        onCityChange(selected);
    };

    return (
        <div className="fl-location-picker">
            <span className="fl-label">{label}</span>
            <div className="fl-location-row">
                <div className="fl-location-country-wrap">
                    {country?.flag && <span className="fl-country-flag">{country.flag}</span>}
                    <select
                        className={`fl-select fl-country-select${country?.flag ? ' fl-select-flagged' : ''}`}
                        value={country?.id || ''}
                        onChange={handleCountryChange}
                    >
                        <option value="">Country</option>
                        {countries.map(c => (
                            <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                        ))}
                    </select>
                </div>

                <span className="fl-location-sep"><ChevronRight size={12} /></span>

                {country ? (
                    <select
                        className="fl-select fl-city-select"
                        value={city?.id || ''}
                        onChange={handleCityChange}
                        disabled={loadingCities}
                    >
                        <option value="">{loadingCities ? 'Loading…' : 'All cities'}</option>
                        {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        className="fl-input fl-city-input"
                        placeholder="Any city"
                        value={city?.name || ''}
                        onChange={e => onCityChange(e.target.value ? { name: e.target.value } : null)}
                    />
                )}
            </div>
        </div>
    );
}

const emptyPassenger = () => ({
    fullName: '', passportNumber: '', nationality: '',
    dateOfBirth: '', gender: '', phone: '', mealPreference: ''
});

function PassengerForm({ index, data, onChange, errors, nationalities, mealPreferences }) {
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
                    {opts.options.map(o => {
                        const val = typeof o === 'object' ? o.name : o;
                        const keyId = typeof o === 'object' ? (o.id ?? o.name) : o;
                        return <option key={keyId} value={val}>{val}</option>;
                    })}
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
                <span className="modal-field-err"><AlertCircle size={11} /> {errors[key]}</span>
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
            <div className="modal-passenger-section-label"><BookOpen size={10} /> Identity</div>
            <div className="modal-passenger-grid">
                {field('fullName', 'Full Name', 'text', { placeholder: 'As on passport', fullWidth: true, icon: <User size={11} /> })}
                {field('passportNumber', 'Passport No.', 'text', { placeholder: 'e.g. AA1234567', icon: <BookOpen size={11} /> })}
                {field('nationality', 'Nationality', 'select', { options: nationalities, icon: <Globe size={11} /> })}
                {field('dateOfBirth', 'Date of Birth', 'date', { icon: <Users size={11} /> })}
                {field('gender', 'Gender', 'select', { options: ['Male', 'Female', 'Other'], icon: <Users size={11} /> })}
            </div>
            <div className="modal-passenger-section-label"><Phone size={10} /> Contact</div>
            <div className="modal-passenger-grid">
                {field('phone', 'Phone Number', 'tel', { placeholder: getPhonePlaceholder(data.nationality), icon: <Phone size={11} /> })}
            </div>
            <div className="modal-passenger-section-label"><Utensils size={10} /> Preferences</div>
            <div className="modal-passenger-grid">
                {field('mealPreference', 'Meal Preference', 'select', { options: mealPreferences, fullWidth: true, icon: <Utensils size={11} /> })}
            </div>
        </div>
    );
}

// ─── Booking modal ────────────────────────────────────────────────
function BookingModal({ flight, flights, onClose, onBooked, nationalities, mealPreferences }) {
    const [step, setStep] = useState(1);
    const [tripType, setTripType] = useState('ONE_WAY');
    const [passengers, setPassengers] = useState(1);
    const [returnFlightId, setReturnFlightId] = useState('');
    const [passengerForms, setPassengerForms] = useState([emptyPassenger()]);
    const [formErrors, setFormErrors] = useState([{}]);
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
        setPassengerForms(prev => { const a = [...prev]; while (a.length < n) a.push(emptyPassenger()); return a.slice(0, n); });
        setFormErrors(prev => { const a = [...prev]; while (a.length < n) a.push({}); return a.slice(0, n); });
    };

    const handlePassengerChange = (idx, key, val) => {
        setPassengerForms(prev => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));
        setFormErrors(prev => prev.map((e, i) => i === idx ? { ...e, [key]: '' } : e));
    };

    const validateStep1 = () => {
        if (tripType === 'ROUND_TRIP' && !returnFlightId) { setError('Please select a return flight.'); return false; }
        setError(''); return true;
    };

    const validateStep2 = () => {
        const allErrors = passengerForms.map(p => validatePassenger(p).errors);
        setFormErrors(allErrors);
        return allErrors.every(e => Object.keys(e).length === 0);
    };

    const handleBook = async () => {
        if (!validateStep2()) return;
        setLoading(true); setError('');
        try {
            const body = { flightId: flight.id, tripType, passengers, passengerDetails: passengerForms };
            if (tripType === 'ROUND_TRIP') body.returnFlightId = Number(returnFlightId);
            await createBooking(body);
            setSuccess(true);
            setTimeout(() => { onBooked(); onClose(); }, 1800);
        } catch (e) {
            setError(e.response?.data || 'Booking failed. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-wide">
                <button className="modal-close" onClick={onClose}><X size={16} /></button>
                <div className="modal-steps">
                    <div className={`modal-step ${step >= 1 ? 'active' : ''}`}>
                        <div className="modal-step-dot">{step > 1 ? <Check size={12} /> : '1'}</div>
                        <span>Trip Details</span>
                    </div>
                    <div className="modal-step-line" />
                    <div className={`modal-step ${step >= 2 ? 'active' : ''}`}>
                        <div className="modal-step-dot">2</div>
                        <span>Passengers</span>
                    </div>
                </div>
                <div className="modal-title">{step === 1 ? <>Select <em>Trip</em></> : <>Passenger <em>Details</em></>}</div>
                <div className="modal-route">
                    <span>{flight.source}</span>
                    <ArrowRight size={12} style={{ display: 'inline', margin: '0 5px', verticalAlign: 'middle', opacity: 0.5 }} />
                    <span>{flight.destination}</span>
                    <span style={{ opacity: 0.4 }}> · {flight.flightNumber}</span>
                </div>

                {step === 1 && (
                    <>
                        <div className="modal-tabs">
                            <div className={`modal-tab ${tripType === 'ONE_WAY' ? 'active' : ''}`} onClick={() => setTripType('ONE_WAY')}><Plane size={13} /> One Way</div>
                            <div className={`modal-tab ${tripType === 'ROUND_TRIP' ? 'active' : ''}`} onClick={() => setTripType('ROUND_TRIP')}><ArrowLeftRight size={13} /> Round Trip</div>
                        </div>
                        <div className="modal-field">
                            <label className="modal-label"><span className="modal-label-icon"><Users size={11} /></span> Passengers</label>
                            <select className="modal-select" value={passengers} onChange={e => handlePassengerCount(Number(e.target.value))}>
                                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} disabled={n > flight.seatsAvailable}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                            </select>
                        </div>
                        {tripType === 'ROUND_TRIP' && (
                            <div className="modal-field">
                                <label className="modal-label"><span className="modal-label-icon"><RotateCcw size={11} /></span> Return Flight</label>
                                <select className="modal-select" value={returnFlightId} onChange={e => setReturnFlightId(e.target.value)}>
                                    <option value="">Select return flight…</option>
                                    {returnOptions.length === 0
                                        ? <option disabled>No return flights available</option>
                                        : returnOptions.map(f => <option key={f.id} value={f.id}>{f.source} → {f.destination} · {f.flightNumber} · PKR {f.price}</option>)
                                    }
                                </select>
                            </div>
                        )}
                        <div className="modal-summary">
                            <div>
                                <div className="modal-total-lbl">Total</div>
                                <div className="modal-total-sub">{passengers} pax · {tripType === 'ROUND_TRIP' ? 'return included' : 'one way'}</div>
                            </div>
                            <div className="modal-total">PKR {total.toLocaleString()}</div>
                        </div>
                        {error && <div className="modal-error"><AlertCircle size={14} /> {error}</div>}
                        <button className="modal-btn" onClick={() => { if (validateStep1()) setStep(2); }}>
                            Continue <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Passenger Details
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="modal-passengers-scroll">
                            {passengerForms.map((p, i) => (
                                <PassengerForm key={i} index={i} data={p}
                                    onChange={handlePassengerChange} errors={formErrors[i]}
                                    nationalities={nationalities} mealPreferences={mealPreferences}
                                />
                            ))}
                        </div>
                        <div className="modal-summary">
                            <div>
                                <div className="modal-total-lbl">Total</div>
                                <div className="modal-total-sub">{passengers} pax · {tripType === 'ROUND_TRIP' ? 'return included' : 'one way'}</div>
                            </div>
                            <div className="modal-total">PKR {total.toLocaleString()}</div>
                        </div>
                        {error && <div className="modal-error"><AlertCircle size={14} /> {error}</div>}
                        {success ? (
                            <div className="modal-success"><Check size={15} /> Booking confirmed!</div>
                        ) : (
                            <div className="modal-btn-row">
                                <button className="modal-btn-back" onClick={() => { setStep(1); setError(''); }}><ArrowLeft size={14} /> Back</button>
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

// ─── Flight card ──────────────────────────────────────────────────
function FlightCard({ flight, allFlights, onBooked, nationalities, mealPreferences }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const fmt = v => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const fmtD = v => v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '---';

    return (
        <>
            <div className="fc">
                <div className="fc-route">
                    <div className="fc-city"><div className="fc-code">{flight.source}</div><div className="fc-name">Origin</div></div>
                    <div className="fc-mid">
                        <div className="fc-line"><div className="fc-dot" /><div className="fc-dash" /><Plane size={14} className="fc-plane-icon" /><div className="fc-dash" /><div className="fc-dot" /></div>
                        <div className="fc-fn">{flight.flightNumber}</div>
                    </div>
                    <div className="fc-city"><div className="fc-code">{flight.destination}</div><div className="fc-name">Destination</div></div>
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
                    <div className="fc-price">PKR {(flight.price ?? 0).toLocaleString()}</div>
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
                <BookingModal flight={flight} flights={allFlights}
                    onClose={() => setShowModal(false)} onBooked={onBooked}
                    nationalities={nationalities} mealPreferences={mealPreferences}
                />
            )}
        </>
    );
}

// ─── Sort dropdown ────────────────────────────────────────────────
const SORT_OPTIONS = [
    { value: 'departure', label: 'Departure', Icon: Clock },
    { value: 'price', label: 'Price Low', Icon: ArrowUp },
    { value: 'price-desc', label: 'Price High', Icon: ArrowDown },
    { value: 'seats', label: 'Most Seats', Icon: Users },
];

function SortDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const current = SORT_OPTIONS.find(o => o.value === value);
    return (
        <div style={{ position: 'relative' }}>
            <button className="fl-sort-btn" onClick={() => setOpen(o => !o)}>
                <current.Icon size={12} /> {current.label}
                <ChevronDown size={12} style={{ opacity: 0.5, marginLeft: 2 }} />
            </button>
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
                    <div className="fl-sort-menu">
                        {SORT_OPTIONS.map(opt => (
                            <button key={opt.value}
                                className={`fl-sort-option ${value === opt.value ? 'active' : ''}`}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                            >
                                <opt.Icon size={12} /> {opt.label}
                                {value === opt.value && <Check size={11} style={{ marginLeft: 'auto' }} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function Flights() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('departure');
    const [nationalities, setNationalities] = useState(DEFAULT_NATIONALITIES);
    const [mealPreferences, setMealPreferences] = useState(DEFAULT_MEAL_PREFERENCES);
    const [countries, setCountries] = useState([]);

    // Uncommitted search state
    const [fromCountry, setFromCountry] = useState(null);
    const [fromCity, setFromCity] = useState(null);
    const [toCountry, setToCountry] = useState(null);
    const [toCity, setToCity] = useState(null);
    const [date, setDate] = useState('');

    // Committed (applied on Search click)
    const [applied, setApplied] = useState({ fromCity: '', toCity: '', date: '' });

    const load = () => {
        setLoading(true);
        getFlights()
            .then(res => setFlights(res.data))
            .catch(() => setError('Failed to load flights.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        getCountries().then(res => setCountries(res.data)).catch(() => { });
        getNationalities().then(res => { if (res.data?.length) setNationalities(res.data); }).catch(() => { });
        getMealPreferences().then(res => { if (res.data?.length) setMealPreferences(res.data); }).catch(() => { });
    }, []);

    const hasFilters = fromCountry || fromCity || toCountry || toCity || date;

    const handleSearch = () =>
        setApplied({ fromCity: fromCity?.name || '', toCity: toCity?.name || '', date });

    const handleClear = () => {
        setFromCountry(null); setFromCity(null);
        setToCountry(null); setToCity(null);
        setDate('');
        setApplied({ fromCity: '', toCity: '', date: '' });
    };

    const handleSwap = () => {
        const [fc, tc] = [fromCountry, toCountry];
        const [fci, tci] = [fromCity, toCity];
        setFromCountry(tc); setFromCity(tci);
        setToCountry(fc); setToCity(fci);
    };

    const filtered = flights
        .filter(f => {
            if (applied.fromCity && !f.source?.toLowerCase().includes(applied.fromCity.toLowerCase())) return false;
            if (applied.toCity && !f.destination?.toLowerCase().includes(applied.toCity.toLowerCase())) return false;
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
                    <p className="fl-sub">Select your country and city, then search available routes instantly.</p>

                    <div className="fl-search-panel">
                        <LocationPicker label="From" countries={countries}
                            country={fromCountry} city={fromCity}
                            onCountryChange={setFromCountry} onCityChange={setFromCity}
                        />

                        <button className="fl-swap-btn" title="Swap" onClick={handleSwap}>
                            <ArrowLeftRight size={14} />
                        </button>

                        <LocationPicker label="To" countries={countries}
                            country={toCountry} city={toCity}
                            onCountryChange={setToCountry} onCityChange={setToCity}
                        />

                        <div className="fl-field">
                            <span className="fl-label">Date</span>
                            <input className="fl-input fl-date-input" type="date" value={date}
                                onChange={e => setDate(e.target.value)} style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        <div className="fl-search-actions">
                            <button className="fl-search-btn" onClick={handleSearch}><Search size={14} /> Search</button>
                            {hasFilters && (
                                <button className="fl-clear-btn" onClick={handleClear}><X size={14} /> Clear</button>
                            )}
                        </div>
                    </div>

                    {(applied.fromCity || applied.toCity || applied.date) && (
                        <div className="fl-active-filters">
                            {applied.fromCity && <span className="fl-filter-chip"><MapPin size={10} /> From: {applied.fromCity}</span>}
                            {applied.toCity && <span className="fl-filter-chip"><MapPin size={10} /> To: {applied.toCity}</span>}
                            {applied.date && <span className="fl-filter-chip"><Clock size={10} /> {new Date(applied.date + 'T00:00').toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                        </div>
                    )}
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
                                    ? <div className="fl-empty">No flights match your search. Try different cities or clear filters.</div>
                                    : filtered.map(f =>
                                        <FlightCard key={f.id} flight={f} allFlights={flights}
                                            onBooked={load} nationalities={nationalities} mealPreferences={mealPreferences}
                                        />
                                    )
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