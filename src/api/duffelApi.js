const BASE = '/duffel';

async function duffelFetch(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.errors?.[0]?.message ?? body?.error ?? `HTTP ${res.status}`;
        throw new Error(msg);
    }

    return res.json();
}

export async function searchFlightOffers({
    origin,
    destination,
    departureDate,
    adults = 1,
    cabinClass = 'economy',
}) {
    const passengers = Array.from({ length: adults }, () => ({ type: 'adult' }));

    const body = {
        data: {
            slices: [{ origin, destination, departure_date: departureDate }],
            passengers,
            cabin_class: cabinClass,
        },
    };

    const json = await duffelFetch('/air/offer_requests?return_offers=true', {
        method: 'POST',
        body: JSON.stringify(body),
    });

    return { offers: json?.data?.offers ?? [] };
}

export async function searchLocations(query) {
    if (!query || query.length < 2) return [];
    const json = await duffelFetch(`/places/suggestions?query=${encodeURIComponent(query)}`);
    return json?.data ?? [];
}

export async function createDuffelOrder(payload) {
    return duffelFetch('/air/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export function firstSegment(offer) {
    return offer?.slices?.[0]?.segments?.[0] ?? null;
}

export function lastSegment(offer) {
    const segs = offer?.slices?.[0]?.segments ?? [];
    return segs[segs.length - 1] ?? null;
}

export function stopCount(offer) {
    const segs = offer?.slices?.[0]?.segments ?? [];
    return Math.max(0, segs.length - 1);
}

export function parseDuration(iso) {
    if (!iso) return null;
    const h = iso.match(/(\d+)H/);
    const m = iso.match(/(\d+)M/);
    const hours = h ? parseInt(h[1], 10) : 0;
    const mins  = m ? parseInt(m[1], 10) : 0;
    if (!hours && !mins) return null;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
