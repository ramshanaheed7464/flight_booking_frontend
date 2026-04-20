import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, X, PlaneTakeoff, ArrowLeftRight, Loader2, AlertCircle, Globe } from 'lucide-react';
import { DEFAULT_NATIONALITIES } from './validation';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import FlightCard from '../components/FlightCard';
import DuffelFlightCard from '../components/DuffelFlightCard';
import SkeletonCard from '../components/SkeletonCard';
import AirportAutocomplete from '../components/AirportAutocomplete';
import CustomSelect from '../components/CustomSelect';
import { SORT_OPTIONS } from '../components/SortDropdown';
import CityAutocomplete from '../components/CityAutoComplete';
import useFlights from '../hooks/useFlights';
import useDuffelSearch from '../hooks/useDuffelSearch';
import './Flights.css';

// ── Tab constants ────────────────────────────────────────────────────────────
const TAB_SCHEDULED = 'scheduled';
const TAB_DUFFEL = 'duffel';

// ── Scheduled flights section ────────────────────────────────────────────────
function ScheduledFlightsSection() {
    const {
        flights, filtered, cities, loading, error,
        sortBy, setSortBy,
        fromCity, setFromCity,
        toCity, setToCity,
        date, setDate,
        applied,
        isSearchActive, hasFilters,
        upcomingTotal,
        handleSearch, handleClear, handleSwap,
        reload,
    } = useFlights();

    const renderEmptyState = () => {
        if (isSearchActive) {
            const parts = [];
            if (applied.fromCity) parts.push(`from "${applied.fromCity}"`);
            if (applied.toCity) parts.push(`to "${applied.toCity}"`);
            if (applied.date) parts.push(
                `on ${new Date(applied.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            );
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
                    There are no scheduled flights at the moment.<br />
                    Check back soon — new routes are added regularly.
                </p>
            </div>
        );
    };

    return (
        <>
            {/* Search panel */}
            <div className="fl-search-panel">
                <CityAutocomplete
                    label="From"
                    cities={cities}
                    value={fromCity}
                    onChange={setFromCity}
                    placeholder="Departure city…"
                />

                <button className="fl-swap-btn" onClick={handleSwap} title="Swap cities">
                    <ArrowLeftRight size={15} />
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

            {/* Results */}
            <div className="fl-content">
                {loading && (
                    <div className="fl-list">
                        {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                )}
                {error && <div className="fl-error">{error}</div>}

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
                                        onBooked={reload}
                                        nationalities={DEFAULT_NATIONALITIES}
                                    />
                                ))
                            }
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

// ── Duffel real-time search section ─────────────────────────────────────────
function DuffelSection() {
    const {
        originLabel, setOriginLabel, fetchOriginSuggestions, selectOrigin, clearOrigin,
        originSuggestions, originLoading,
        destLabel, setDestLabel, fetchDestSuggestions, selectDest, clearDest,
        destSuggestions, destLoading,
        departureDate, setDepartureDate,
        swapCities,
        results, loading, error, searched, canSearch,
        search, clearResults,
        origin, dest,
    } = useDuffelSearch();

    const notConfigured = !import.meta.env.VITE_DUFFEL_ACCESS_TOKEN;

    if (notConfigured) {
        return (
            <div className="fl-content">
                <div className="ama-unconfigured">
                    <Globe size={32} className="ama-unconfigured-icon" />
                    <p className="ama-unconfigured-title">Duffel not configured</p>
                    <p className="ama-unconfigured-desc">
                        Add your Duffel access token to <code>.env</code>:
                    </p>
                    <pre className="ama-unconfigured-code">{`VITE_DUFFEL_ACCESS_TOKEN=duffel_test_...`}</pre>
                    <p className="ama-unconfigured-link">
                        Get a free test token at{' '}
                        <span className="ama-link-text">app.duffel.com</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Search panel */}
            <div className="fl-search-panel">
                <AirportAutocomplete
                    label="From"
                    value={originLabel}
                    onChange={v => { setOriginLabel(v); fetchOriginSuggestions(v); }}
                    suggestions={originSuggestions}
                    loading={originLoading}
                    onSelect={selectOrigin}
                    onClear={clearOrigin}
                    placeholder="City or airport…"
                />

                <button className="fl-swap-btn" onClick={swapCities} title="Swap airports">
                    <ArrowLeftRight size={15} />
                </button>

                <AirportAutocomplete
                    label="To"
                    value={destLabel}
                    onChange={v => { setDestLabel(v); fetchDestSuggestions(v); }}
                    suggestions={destSuggestions}
                    loading={destLoading}
                    onSelect={selectDest}
                    onClear={clearDest}
                    placeholder="City or airport…"
                />

                <div className="fl-field">
                    <span className="fl-label">Date</span>
                    <input
                        className="fl-input fl-date-input"
                        type="date"
                        value={departureDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={e => setDepartureDate(e.target.value)}
                    />
                </div>

                <div className="fl-search-actions">
                    <button
                        className="fl-search-btn"
                        onClick={search}
                        disabled={!canSearch || loading}
                    >
                        {loading
                            ? <><Loader2 size={14} className="spin" /> Searching…</>
                            : <><Search size={14} /> Search</>
                        }
                    </button>
                    {searched && (
                        <button className="fl-clear-btn" onClick={clearResults}>
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Active filter chips */}
            {searched && (
                <div className="fl-active-filters">
                    {origin && <span className="fl-filter-chip">From: {origin}</span>}
                    {dest && <span className="fl-filter-chip">To: {dest}</span>}
                    {departureDate && <span className="fl-filter-chip">{new Date(departureDate).toLocaleDateString()}</span>}
                </div>
            )}

            {/* Results */}
            <div className="fl-content">
                {error && (
                    <div className="fl-error">
                        <AlertCircle size={14} style={{ marginRight: 6 }} /> {error}
                    </div>
                )}

                {loading && (
                    <div className="fl-list">
                        {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                )}

                {searched && !loading && !error && (
                    <>
                        <div className="fl-bar">
                            <span className="fl-count">
                                {results.length === 0
                                    ? 'No flights found for this route and date.'
                                    : `${results.length} live offer${results.length !== 1 ? 's' : ''}`
                                }
                            </span>
                        </div>
                        <div className="fl-list">
                            {results.length === 0 ? (
                                <div className="fl-empty">
                                    <PlaneTakeoff size={32} className="fl-empty-icon" />
                                    <p className="fl-empty-title">No flights found</p>
                                    <p className="fl-empty-desc">
                                        Try different dates or nearby airports.
                                    </p>
                                </div>
                            ) : results.map(offer => (
                                <DuffelFlightCard
                                    key={offer.id}
                                    offer={offer}
                                />
                            ))}
                        </div>
                    </>
                )}

                {!searched && !loading && !error && !results.length && (
                    <div className="fl-empty ama-prompt">
                        <Globe size={36} className="fl-empty-icon" />
                        <p className="fl-empty-title">Search global flights</p>
                        <p className="fl-empty-desc">
                            Enter an origin airport, destination, and departure date to search
                            live fares.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

// ── Main Flights page ────────────────────────────────────────────────────────
/**
 * Flights — renders two tabs: Scheduled (local backend) and Live Search (Duffel).
 * SRP: each section owns its own data via a dedicated hook.
 */
export default function Flights() {
    const { state } = useLocation();
    const [tab, setTab] = useState(state?.tab === TAB_DUFFEL ? TAB_DUFFEL : TAB_SCHEDULED);

    return (
        <>
            <NavBar />
            <div className="fl-root">

                <div className="fl-hero">
                    <h1 className="fl-title">Find your <em>Flight</em></h1>
                    <p className="fl-sub">
                        Browse scheduled routes or search live global fares.
                    </p>

                    {/* Tab switcher */}
                    <div className="fl-tabs">
                        <button
                            className={`fl-tab ${tab === TAB_SCHEDULED ? 'fl-tab--active' : ''}`}
                            onClick={() => setTab(TAB_SCHEDULED)}
                        >
                            <PlaneTakeoff size={14} />
                            Scheduled Flights
                        </button>
                        <button
                            className={`fl-tab ${tab === TAB_DUFFEL ? 'fl-tab--active' : ''}`}
                            onClick={() => setTab(TAB_DUFFEL)}
                        >
                            <Globe size={14} />
                            Live Search
                        </button>
                    </div>
                </div>

                {tab === TAB_SCHEDULED ? <ScheduledFlightsSection /> : <DuffelSection />}

                <Footer />
            </div>
        </>
    );
}
