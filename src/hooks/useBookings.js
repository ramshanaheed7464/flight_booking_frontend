import { useEffect, useState } from 'react';
import { getBookings } from '../api/bookingApi';
import { pairBookings } from '../utils/bookingUtils';

export default function useBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = () => {
        setLoading(true);
        getBookings()
            .then(res => setBookings(res.data ?? []))
            .catch(() => setError('Failed to load bookings.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const paired = pairBookings(bookings);

    return { paired, loading, error, reload: load };
}
