import { useRef, useState, useEffect } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

export default function AirportAutocomplete({
    label,
    value,
    onChange,
    suggestions = [],
    loading = false,
    onSelect,
    onClear,
    placeholder = 'City or airport…',
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        const handler = e => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleInput = (e) => {
        onChange(e.target.value);
        setOpen(true);
    };

    const handleSelect = (loc) => {
        onSelect(loc);
        setOpen(false);
    };

    const handleClear = () => {
        onClear();
        setOpen(false);
    };

    const showDropdown = open && (loading || suggestions.length > 0);

    return (
        <div className="fl-field fl-field-auto" ref={rootRef}>
            {label && <span className="fl-label">{label}</span>}
            <div className={`autocomplete-wrap${showDropdown ? ' is-open' : ''}`}>
                <MapPin size={13} className="autocomplete-icon" />
                <input
                    className="autocomplete-input"
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInput}
                    onFocus={() => { if (suggestions.length || loading) setOpen(true); }}
                    autoComplete="off"
                    spellCheck={false}
                />
                {value && (
                    <button className="autocomplete-clear" onClick={handleClear} tabIndex={-1} type="button">
                        <X size={11} />
                    </button>
                )}
            </div>

            {showDropdown && (
                <div className="autocomplete-list">
                    {loading && (
                        <div className="autocomplete-empty">
                            <Loader2 size={13} className="spin" style={{ marginRight: 6 }} /> Searching…
                        </div>
                    )}
                    {!loading && suggestions.map(loc => (
                        <button
                            key={`${loc.iata_code}-${loc.type}`}
                            className="autocomplete-item"
                            onMouseDown={e => { e.preventDefault(); handleSelect(loc); }}
                            type="button"
                        >
                            <MapPin size={11} className="autocomplete-item-icon" />
                            <span className="autocomplete-item-label">
                                {loc.iata_code} — {loc.name}
                            </span>
                            <span className="autocomplete-item-sub">
                                {loc.city_name ? `${loc.city_name}, ` : ''}{loc.iata_country_code}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
