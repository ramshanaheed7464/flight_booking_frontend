import { useState, useEffect, useRef } from 'react';
import { MapPin, X } from 'lucide-react';

function normalise(c) {
    const name =
        c.name ??
        c.cityName ??
        c.city ??
        c.label ??
        c.title ??
        '';

    const country =
        c.country ??
        c.countryName ??
        c.nation ??
        '';

    return { ...c, name: String(name).trim(), country: String(country).trim() };
}

export default function CityAutocomplete({ label, cities, value, onChange, placeholder }) {
    const [query, setQuery] = useState(value || '');
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const wrapRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    const normalisedCities = cities.map(normalise);

    const suggestions = normalisedCities
        .filter(c => {
            if (!query.trim()) return true;
            const q = query.toLowerCase();
            return (
                c.name.toLowerCase().includes(q) ||
                c.country.toLowerCase().includes(q)
            );
        })
        .slice(0, 10);

    const select = (city) => {
        // Show "Karachi, Pakistan" in the input for UX
        const display = city.country ? `${city.name}, ${city.country}` : city.name;
        setQuery(display);
        // But pass ONLY the city name to the filter so it matches f.source / f.destination
        onChange(city.name);
        setOpen(false);
        inputRef.current?.blur();
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        onChange(val); // free text — pass as-is
        setHighlighted(0);
        setOpen(true);
    };

    const handleKeyDown = (e) => {
        if (!open || suggestions.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
        if (e.key === 'Enter') { e.preventDefault(); select(suggestions[highlighted]); }
        if (e.key === 'Escape') { setOpen(false); }
    };

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="fl-field fl-field-auto" ref={wrapRef}>
            <span className="fl-label">{label}</span>
            <div className={`autocomplete-wrap${open && suggestions.length > 0 ? ' is-open' : ''}`}>
                <MapPin size={13} className="autocomplete-icon" />
                <input
                    ref={inputRef}
                    className="autocomplete-input"
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || 'Type a city…'}
                    autoComplete="off"
                />
                {query && (
                    <button
                        className="autocomplete-clear"
                        onClick={() => { setQuery(''); onChange(''); setOpen(true); inputRef.current?.focus(); }}
                    >
                        <X size={11} />
                    </button>
                )}
            </div>

            {open && suggestions.length > 0 && (
                <div className="autocomplete-list">
                    {suggestions.map((city, i) => (
                        <button
                            key={city.id ?? `${city.name}-${i}`}
                            className={`autocomplete-item${i === highlighted ? ' is-highlighted' : ''}`}
                            onMouseDown={(e) => { e.preventDefault(); select(city); }}
                            onMouseEnter={() => setHighlighted(i)}
                        >
                            <MapPin size={11} className="autocomplete-item-icon" />
                            <span className="autocomplete-item-label">{city.name}</span>
                            {city.country && (
                                <span className="autocomplete-item-sub">{city.country}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {open && query.trim().length > 0 && suggestions.length === 0 && (
                <div className="autocomplete-list">
                    <div className="autocomplete-empty">No cities found for "{query}"</div>
                </div>
            )}
        </div>
    );
}