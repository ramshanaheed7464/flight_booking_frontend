export function parsePassengers(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p : [];
    } catch {
        return [];
    }
}

export function isDuffelBooking(b) {
    return !!(b.duffelOrderId || b.bookingReference || b.origin);
}

export function pairBookings(bookings) {
    const paired = [];
    const used = new Set();

    bookings.forEach(b => {
        const isDuffel = isDuffelBooking(b);
        const key = isDuffel ? `duffel-${b.id}` : `regular-${b.id}`;
        if (used.has(key)) return;

        if (isDuffel) {
            used.add(key);
            paired.push({ type: 'DUFFEL', outbound: b, status: b.status });
            return;
        }

        if (b.tripType === 'ROUND_TRIP') {
            const returnLeg = bookings.find(r =>
                !used.has(`regular-${r.id}`) &&
                r.tripType === 'RETURN' &&
                r.passengers === b.passengers &&
                r.flight?.source === b.flight?.destination &&
                r.flight?.destination === b.flight?.source
            );
            if (returnLeg) {
                used.add(key);
                used.add(`regular-${returnLeg.id}`);
                paired.push({ type: 'ROUND_TRIP', outbound: b, returnLeg, status: b.status });
                return;
            }
        }

        used.add(key);
        paired.push({
            type: b.tripType === 'RETURN' ? 'ONE_WAY' : (b.tripType || 'ONE_WAY'),
            outbound: b,
            status: b.status,
        });
    });

    return paired;
}
