import { useEffect, useState } from 'react';
import { getFlights } from '../api/flightApi';
import { getAllCities } from '../api/LocationApi';

/**
 * useFlights — DIP + SRP.
 * Flights page depends on this abstraction instead of calling the API directly.
 * Owns: data fetching, filter state, sort state, derived filtered list.
 */
export default function useFlights() {
    const [flights, setFlights] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('departure');

    const [fromCity, setFromCity] = useState('');
    const [toCity, setToCity] = useState('');
    const [date, setDate] = useState('');
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
            .catch(() => {});
    }, []);

    const isSearchActive = applied.fromCity || applied.toCity || applied.date;
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
                const dep = new Date(f.departureTime).toISOString().slice(0, 10);
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

    const upcomingTotal = flights.filter(
        f => f.departureTime && new Date(f.departureTime) > now
    ).length;

    return {
        flights,
        filtered,
        cities,
        loading,
        error,
        sortBy,
        setSortBy,
        fromCity, setFromCity,
        toCity, setToCity,
        date, setDate,
        applied,
        isSearchActive,
        hasFilters,
        upcomingTotal,
        handleSearch,
        handleClear,
        handleSwap,
        reload: load,
    };
}
