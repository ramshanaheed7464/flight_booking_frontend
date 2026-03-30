import { useState } from 'react';
import { Clock, ArrowUp, ArrowDown, Users, ChevronDown, Check } from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'departure', label: 'Departure', Icon: Clock },
    { value: 'price', label: 'Price Low', Icon: ArrowUp },
    { value: 'price-desc', label: 'Price High', Icon: ArrowDown },
    { value: 'seats', label: 'Most Seats', Icon: Users },
];

export { SORT_OPTIONS };

export default function SortDropdown({ value, onChange }) {
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
                            <button
                                key={opt.value}
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