import { useState, useRef } from 'react';
import { searchFlightOffers, searchLocations } from '../api/duffelApi';

const DEBOUNCE_MS = 300;

/**
 * useDuffelSearch — DIP: encapsulates all Duffel search state and side-effects.
 * Flights.jsx depends on this interface, not on duffelApi directly.
 */
export default function useDuffelSearch() {
    // ── Origin ────────────────────────────────────────────────────────────────
    const [origin, setOrigin]               = useState('');       // IATA code
    const [originLabel, setOriginLabel]     = useState('');       // display string
    const [originSuggestions, setOriginSuggestions] = useState([]);
    const [originLoading, setOriginLoading] = useState(false);

    // ── Destination ───────────────────────────────────────────────────────────
    const [dest, setDest]                   = useState('');
    const [destLabel, setDestLabel]         = useState('');
    const [destSuggestions, setDestSuggestions] = useState([]);
    const [destLoading, setDestLoading]     = useState(false);

    // ── Search params ─────────────────────────────────────────────────────────
    const [departureDate, setDepartureDate] = useState('');
    const [adults, setAdults]               = useState(1);

    // ── Results ───────────────────────────────────────────────────────────────
    const [results, setResults]             = useState([]);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState(null);
    const [searched, setSearched]           = useState(false);

    // ── Debounce timers ───────────────────────────────────────────────────────
    const originTimer = useRef(null);
    const destTimer   = useRef(null);

    // ── Suggestion fetchers ───────────────────────────────────────────────────
    const fetchOriginSuggestions = (text) => {
        clearTimeout(originTimer.current);
        if (!text || text.length < 2) { setOriginSuggestions([]); return; }
        originTimer.current = setTimeout(async () => {
            setOriginLoading(true);
            try {
                const data = await searchLocations(text);
                setOriginSuggestions(data);
            } catch {
                setOriginSuggestions([]);
            } finally {
                setOriginLoading(false);
            }
        }, DEBOUNCE_MS);
    };

    const fetchDestSuggestions = (text) => {
        clearTimeout(destTimer.current);
        if (!text || text.length < 2) { setDestSuggestions([]); return; }
        destTimer.current = setTimeout(async () => {
            setDestLoading(true);
            try {
                const data = await searchLocations(text);
                setDestSuggestions(data);
            } catch {
                setDestSuggestions([]);
            } finally {
                setDestLoading(false);
            }
        }, DEBOUNCE_MS);
    };

    // ── Selection / clear ─────────────────────────────────────────────────────
    const selectOrigin = (loc) => {
        setOrigin(loc.iata_code);
        setOriginLabel(`${loc.iata_code} – ${loc.name}`);
        setOriginSuggestions([]);
    };

    const clearOrigin = () => {
        setOrigin('');
        setOriginLabel('');
        setOriginSuggestions([]);
    };

    const selectDest = (loc) => {
        setDest(loc.iata_code);
        setDestLabel(`${loc.iata_code} – ${loc.name}`);
        setDestSuggestions([]);
    };

    const clearDest = () => {
        setDest('');
        setDestLabel('');
        setDestSuggestions([]);
    };

    const swapCities = () => {
        setOrigin(dest);
        setOriginLabel(destLabel);
        setDest(origin);
        setDestLabel(originLabel);
        setOriginSuggestions([]);
        setDestSuggestions([]);
    };

    // ── Search ────────────────────────────────────────────────────────────────
    const canSearch = origin && dest && departureDate;

    const search = async () => {
        if (!canSearch) return;
        setLoading(true);
        setError(null);
        setSearched(true);
        try {
            const { offers } = await searchFlightOffers({
                origin,
                destination: dest,
                departureDate,
                adults,
            });
            setResults(offers);
        } catch (err) {
            setError(err.message ?? 'Search failed. Please try again.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setResults([]);
        setError(null);
        setSearched(false);
    };

    return {
        origin, dest,
        originLabel, setOriginLabel, fetchOriginSuggestions, selectOrigin, clearOrigin,
        originSuggestions, originLoading,
        destLabel, setDestLabel, fetchDestSuggestions, selectDest, clearDest,
        destSuggestions, destLoading,
        departureDate, setDepartureDate,
        adults, setAdults,
        swapCities,
        results, loading, error, searched, canSearch,
        search, clearResults,
    };
}
