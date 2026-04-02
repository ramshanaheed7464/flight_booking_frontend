import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect — a reusable styled dropdown.
 *
 * Props:
 *   value       – currently selected value (string | number)
 *   onChange    – (value) => void
 *   options     – Array<{ value, label, Icon?, disabled? }>
 *   placeholder – string shown when no value is selected (optional)
 *   className   – extra class on the trigger button (optional)
 *   menuClass   – extra class on the dropdown menu (optional)
 *   disabled    – boolean (optional)
 *   fullWidth   – boolean — stretches trigger + menu to 100% of parent (optional)
 *   maxItems    – number — how many items show before scrolling (default 6)
 */
export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = 'Select…',
    className = '',
    menuClass = '',
    disabled = false,
    fullWidth = false,
    maxItems = 6,
}) {
    const [open, setOpen] = useState(false);
    const [alignRight, setAlignRight] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const wrapRef = useRef(null);

    const current = options.find(o => String(o.value) === String(value));

    const handleOpen = () => {
        if (disabled) return;
        if (!open && wrapRef.current) {
            const rect = wrapRef.current.getBoundingClientRect();

            // horizontal: flip right if menu would overflow viewport
            setAlignRight(!fullWidth && rect.left + 180 > window.innerWidth - 16);

            // vertical: flip up if not enough space below
            setOpenUpward(window.innerHeight - rect.bottom < maxItems * 34 + 12);
        }
        setOpen(o => !o);
    };

    // Close on outside click — no backdrop needed, so scroll is never blocked
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const menuModifiers = [
        fullWidth ? 'fl-sort-menu--full' : '',
        alignRight ? 'fl-sort-menu--right' : '',
        openUpward ? 'fl-sort-menu--up' : '',
        menuClass,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={`fl-select-wrap${fullWidth ? ' fl-select-wrap--full' : ''}`}
            ref={wrapRef}
        >
            <button
                className={`fl-sort-btn${fullWidth ? ' fl-sort-btn--full' : ''}${className ? ' ' + className : ''}`}
                onClick={handleOpen}
                disabled={disabled}
                type="button"
            >
                {current?.Icon && <current.Icon size={12} />}
                <span>{current ? current.label : placeholder}</span>
                <ChevronDown size={12} className="fl-sort-btn-chevron" />
            </button>

            {open && (
                <div
                    className={`fl-sort-menu ${menuModifiers}`}
                    style={{ maxHeight: `${maxItems * 34}px` }}
                >
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`fl-sort-option${String(value) === String(opt.value) ? ' active' : ''}${opt.disabled ? ' disabled' : ''}`}
                            disabled={opt.disabled}
                            onMouseDown={e => {
                                // prevent the outer mousedown handler from firing first
                                e.stopPropagation();
                            }}
                            onClick={() => {
                                if (!opt.disabled) {
                                    onChange(opt.value);
                                    setOpen(false);
                                }
                            }}
                        >
                            {opt.Icon && <opt.Icon size={12} />}
                            {opt.label}
                            {String(value) === String(opt.value) && (
                                <Check size={11} className="fl-sort-option-check" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}