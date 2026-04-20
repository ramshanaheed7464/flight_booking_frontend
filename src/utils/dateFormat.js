export const formatTime = v =>
    v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

export const formatShortDate = v =>
    v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '---';

export const formatMediumDate = v =>
    v ? new Date(v).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const formatLongDate = v =>
    v ? new Date(v).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const formatDateTimeShort = v =>
    v ? new Date(v).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const formatDuration = mins => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
