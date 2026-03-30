import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { getFlights } from '../api/flightApi';
import { getNationalities } from '../api/bookingOptionsApi';
import { getAllCities } from '../api/LocationApi';
import { DEFAULT_NATIONALITIES } from './validation';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import FlightCard from './FlightCard';
import SortDropdown from '../components/SortDropdown';
import CityAutocomplete from '../components/CityAutoComplete';
import './Flights.css';
export default function Flights() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('departure');
    const [nationalities, setNationalities] = useState(DEFAULT_NATIONALITIES);

    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [date, setDate] = useState('');
    const [cities, setCities] = useState([]);

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

        getAllCities()
            .then(res => setCities(Array.isArray(res.data) ? res.data : []))
            .catch(() => { });

        getNationalities()
            .then(res => { if (res.data?.length) setNationalities(res.data); })
            .catch(() => { });
    }, []);

    const hasFilters = fromCity || toCity || date;

    const handleSearch = () => setApplied({ fromCity, toCity, date });

    const handleClear = () => {
        setFromCity('');
        setToCity('');
        setDate('');
        setApplied({ fromCity: '', toCity: '', date: '' });
    };

    const handleSwap = () => {
        setFromCity(toCity);
        setToCity(fromCity);
    };

    const now = new Date();
    const filtered = flights
        .filter(f => {
            if (!f.departureTime || new Date(f.departureTime) <= now) return false;

            if (applied.fromCity && !f.source?.toLowerCase().includes(applied.fromCity.toLowerCase()))
                return false;

            if (applied.toCity && !f.destination?.toLowerCase().includes(applied.toCity.toLowerCase()))
                return false;

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

                {/* ── Hero / search panel ── */}
                <div className="fl-hero">
                    <h1 className="fl-title">Find your <em>Flight</em></h1>
                    <p className="fl-sub">
                        Select your country and city, then search available routes instantly.
                    </p>

                    <div className="fl-search-panel">
                        <CityAutocomplete
                            label="From"
                            cities={cities}
                            value={fromCity}
                            onChange={setFromCity}
                            placeholder="Departure city…"
                        />

                        <button className="fl-swap-btn" onClick={handleSwap}>
                            ⇄
                        </button>

                        <CityAutocomplete
                            label="To"
                            cities={cities}
                            value={toCity}
                            onChange={setToCity}
                            placeholder="Destination city…"
                        />

                        <div className="fl-field">
                            <span className="fl-label">Date</span>
                            <input
                                className="fl-input fl-date-input"
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>

                        <div className="fl-search-actions">
                            <button className="fl-search-btn" onClick={handleSearch}>
                                <Search size={14} /> Search
                            </button>
                            {hasFilters && (
                                <button className="fl-clear-btn" onClick={handleClear}>
                                    <X size={14} /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {(applied.fromCity || applied.toCity || applied.date) && (
                        <div className="fl-active-filters">
                            {applied.fromCity && <span className="fl-filter-chip">From: {applied.fromCity}</span>}
                            {applied.toCity && <span className="fl-filter-chip">To: {applied.toCity}</span>}
                            {applied.date && (
                                <span className="fl-filter-chip">
                                    {new Date(applied.date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Results ── */}
                <div className="fl-content">
                    {loading && (
                        <div className="fl-loading">Loading flights…</div>
                    )}
                    {error && (
                        <div className="fl-error">{error}</div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="fl-bar">
                                <span className="fl-count">
                                    {filtered.length} flight{filtered.length !== 1 ? 's' : ''} found
                                </span>
                                <div className="fl-sort-wrap">
                                    <span className="fl-sort-label">Sort</span>
                                    <SortDropdown value={sortBy} onChange={setSortBy} />
                                </div>
                            </div>

                            <div className="fl-list">
                                {filtered.length === 0
                                    ? <div className="fl-empty">No flights match your search.</div>
                                    : filtered.map(f => (
                                        <FlightCard
                                            key={f.id}
                                            flight={f}
                                            allFlights={flights}
                                            onBooked={load}
                                            nationalities={nationalities}
                                        />
                                    ))
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