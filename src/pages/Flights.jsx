import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFlights } from '../api/flightApi';
import { createBooking } from '../api/bookingApi';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './Flights.css';

function BookingModal({ flight, flights, onClose, onBooked }) {
    const [tripType, setTripType] = useState('ONE_WAY');
    const [passengers, setPassengers] = useState(1);
    const [returnFlightId, setReturnFlightId] = useState('');
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

    const handleBook = async () => {
        setError('');
        if (tripType === 'ROUND_TRIP' && !returnFlightId) {
            setError('Please select a return flight.');
            return;
        }
        setLoading(true);
        try {
            const body = { flightId: flight.id, tripType, passengers };
            if (tripType === 'ROUND_TRIP') body.returnFlightId = Number(returnFlightId);
            await createBooking(body);
            setSuccess(true);
            setTimeout(() => { onBooked(); onClose(); }, 1600);
        } catch (e) {
            setError(e.response?.data || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="modal-title">Confirm <em>Booking</em></div>
                <div className="modal-route">{flight.source} → {flight.destination} · {flight.flightNumber}</div>

                <div className="modal-tabs">
                    {['ONE_WAY', 'ROUND_TRIP'].map(t => (
                        <div key={t} className={`modal-tab ${tripType === t ? 'active' : ''}`} onClick={() => setTripType(t)}>
                            {t === 'ONE_WAY' ? '✈ One Way' : '⇄ Round Trip'}
                        </div>
                    ))}
                </div>

                <div className="modal-field">
                    <label className="modal-label">Passengers</label>
                    <select className="modal-select" value={passengers} onChange={e => setPassengers(Number(e.target.value))}>
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <option key={n} value={n} disabled={n > flight.seatsAvailable}>
                                {n} Passenger{n > 1 ? 's' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {tripType === 'ROUND_TRIP' && (
                    <div className="modal-field">
                        <label className="modal-label">Return Flight</label>
                        <select className="modal-select" value={returnFlightId} onChange={e => setReturnFlightId(e.target.value)}>
                            <option value="">Select return flight…</option>
                            {returnOptions.length === 0
                                ? <option disabled>No return flights available</option>
                                : returnOptions.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.source} → {f.destination} · {f.flightNumber} · ${f.price}
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
                    <div className="modal-total">${total}</div>
                </div>

                {error && <div className="modal-error">{error}</div>}
                {success
                    ? <div className="modal-success">✓ Booking confirmed!</div>
                    : <button className="modal-btn" onClick={handleBook} disabled={loading}>
                        {loading ? 'Confirming…' : 'Confirm Booking'}
                    </button>
                }
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
                            <span className="fc-plane">✈</span>
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
                    <div><div className="fc-lbl">Departure</div><div className="fc-time">{fmt(flight.departureTime)} · {fmtD(flight.departureTime)}</div></div>
                    <div><div className="fc-lbl">Arrival</div><div className="fc-time">{fmt(flight.arrivalTime)}</div></div>
                </div>
                <div className="fc-meta">
                    <div>
                        <div className="fc-lbl">Seats</div>
                        <div className={`fc-time ${flight.seatsAvailable <= 10 ? 'fc-seats-low' : ''}`}>{flight.seatsAvailable} left</div>
                    </div>
                </div>
                <div className="fc-price-wrap">
                    <div className="fc-price">${flight.price ?? '—'}</div>
                    <div className="fc-price-lbl">per seat</div>
                </div>
                {flight.seatsAvailable === 0
                    ? <div className="fc-no-seats">Sold out</div>
                    : <button className="fc-btn" onClick={() => user ? setShowModal(true) : navigate('/login')}>Book Now</button>
                }
            </div>
            {showModal && (
                <BookingModal
                    flight={flight}
                    flights={allFlights}
                    onClose={() => setShowModal(false)}
                    onBooked={onBooked}
                />
            )}
        </>
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
                        <button className="fl-search-btn" onClick={handleSearch}>Search</button>
                        {(from || to || date) && <button className="fl-clear-btn" onClick={handleClear}>Clear</button>}
                    </div>
                </div>

                <div className="fl-content">
                    {loading && <div className="fl-loading">Searching flights…</div>}
                    {error && <div className="fl-error">{error}</div>}
                    {!loading && !error && (
                        <>
                            <div className="fl-bar">
                                <div className="fl-count">{filtered.length} flight{filtered.length !== 1 ? 's' : ''} found</div>
                                <div className="fl-sort-wrap">
                                    <span className="fl-sort-label">Sort</span>
                                    <select className="fl-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                        <option value="departure">Departure</option>
                                        <option value="price">Price ↑</option>
                                        <option value="price-desc">Price ↓</option>
                                        <option value="seats">Most Seats</option>
                                    </select>
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