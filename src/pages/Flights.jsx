import { useEffect, useState } from 'react';
import { Search, X, PlaneTakeoff, ArrowLeftRight } from 'lucide-react';
import { getFlights } from '../api/flightApi';
import { getAllCities } from '../api/LocationApi';
import { DEFAULT_NATIONALITIES } from './validation';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import FlightCard from '../components/FlightCard';
import CustomSelect from '../components/CustomSelect';
import { SORT_OPTIONS } from '../components/SortDropdown';
import CityAutocomplete from '../components/CityAutoComplete';
import './Flights.css';

export default function Flights() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('departure');
    const [nationalities] = useState(DEFAULT_NATIONALITIES);

    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [date, setDate] = useState('');
    const [cities, setCities] = useState([]);

    const [applied, setApplied] = useState({ fromCity: '', toCity: '', date: '' });

    const isSearchActive = applied.fromCity || applied.toCity || applied.date;

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

    const upcomingTotal = flights.filter(f => f.departureTime && new Date(f.departureTime) > now).length;

    const renderEmptyState = () => {
        if (isSearchActive) {
            const parts = [];
            if (applied.fromCity) parts.push(`from "${applied.fromCity}"`);
            if (applied.toCity) parts.push(`to "${applied.toCity}"`);
            if (applied.date) parts.push(`on ${new Date(applied.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);

            return (
                <div className="fl-empty">
                    <PlaneTakeoff size={32} className="fl-empty-icon" />
                    <p className="fl-empty-title">No flights found</p>
                    <p className="fl-empty-desc">
                        No upcoming flights {parts.join(' ')}.<br />
                        Try adjusting your search or{' '}
                        <button className="fl-empty-clear" onClick={handleClear}>clear filters</button>
                        {' '}to see all available routes.
                    </p>
                </div>
            );
        }

        return (
            <div className="fl-empty">
                <PlaneTakeoff size={32} className="fl-empty-icon" />
                <p className="fl-empty-title">No upcoming flights</p>
                <p className="fl-empty-desc">
                    There are no flights scheduled at the moment.<br />
                    Check back soon - new routes are added regularly.
                </p>
            </div>
        );
    };

    return (
        <>
            <NavBar />
            <div className="fl-root">

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

                        <button className="fl-swap-btn" onClick={handleSwap} title="Swap cities">
                            <ArrowLeftRight size={16} />
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

                    {isSearchActive && (
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

                <div className="fl-content">
                    {loading && (
                        <div className="fl-loading">Loading flights…</div>
                    )}
                    {error && (
                        <div className="fl-error">{error}</div>
                    )}

                    {!loading && !error && (
                        <>
                            {filtered.length > 0 && (
                                <div className="fl-bar">
                                    <span className="fl-count">
                                        {isSearchActive
                                            ? `${filtered.length} of ${upcomingTotal} flight${upcomingTotal !== 1 ? 's' : ''} match your search`
                                            : `${filtered.length} upcoming flight${filtered.length !== 1 ? 's' : ''}`
                                        }
                                    </span>
                                    <div className="fl-sort-wrap">
                                        <span className="fl-sort-label">Sort</span>
                                        <CustomSelect
                                            value={sortBy}
                                            onChange={setSortBy}
                                            options={SORT_OPTIONS}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="fl-list">
                                {filtered.length === 0
                                    ? renderEmptyState()
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