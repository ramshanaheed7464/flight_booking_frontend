import { useState } from 'react';
import { Plane, X, Users, Loader2 } from 'lucide-react';
import { cancelBooking } from '../api/bookingApi';
import { STATUS_COLORS } from '../constants/statusColors';
import { formatTime, formatMediumDate } from '../utils/dateFormat';
import { parsePassengers } from '../utils/bookingUtils';
import BookingDetailModal from './BookingDetailModal';

/**
 * OneWayCard — SRP: renders a single one-way booking card.
 * Extracted from Bookings.jsx for reuse and independent testing.
 * CSS lives in src/pages/Bookings.css (bc-* classes).
 */
export default function OneWayCard({ booking, onCancel }) {
    const [cancelling, setCancelling] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    const status = booking.status || 'BOOKED';
    const color = STATUS_COLORS[status] || '#c9a354';
    const canCancel = status === 'BOOKED';
    const passengers = parsePassengers(booking.passengerDetails);

    const handleCancel = async () => {
        if (!window.confirm('Cancel this booking?')) return;
        setCancelling(true);
        try {
            await cancelBooking(booking.id);
            onCancel();
        } catch (e) {
            alert(e.response?.data || 'Failed to cancel.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <>
            <div className="bc">
                <div className="bc-header">
                    <div className="bc-header-left">
                        <span className="bc-id">#{booking.id}</span>
                        <span className="bc-type"><Plane size={11} /> One Way</span>
                    </div>
                    <span
                        className="bc-status"
                        style={{ color, borderColor: `${color}55`, background: `${color}11` }}
                    >
                        {status}
                    </span>
                </div>

                <div className="bc-body">
                    <div className="bc-route">
                        <div>
                            <div className="bc-code">{booking.flight?.source || '—'}</div>
                            <div className="bc-city">Origin</div>
                        </div>
                        <div className="bc-arr">
                            <div className="bc-line" />
                            <Plane size={13} className="bc-plane-icon" />
                            <div className="bc-line" />
                        </div>
                        <div>
                            <div className="bc-code">{booking.flight?.destination || '—'}</div>
                            <div className="bc-city">Destination</div>
                        </div>
                    </div>

                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Flight</span>
                        <span className="bc-detail-val">{booking.flight?.flightNumber || '—'}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Date</span>
                        <span className="bc-detail-val">{formatMediumDate(booking.flight?.departureTime)}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Time</span>
                        <span className="bc-detail-val">{formatTime(booking.flight?.departureTime)}</span>
                    </div>
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Passengers</span>
                        <span className="bc-detail-val">{booking.passengers ?? 1}</span>
                    </div>

                    <div className="bc-actions">
                        {passengers.length > 0 && (
                            <button className="bc-detail-btn" onClick={() => setShowDetail(true)}>
                                <Users size={12} /> View Details
                            </button>
                        )}
                        {canCancel && (
                            <button className="bc-cancel-btn" onClick={handleCancel} disabled={cancelling}>
                                {cancelling
                                    ? <><Loader2 size={12} className="spin" /> Cancelling…</>
                                    : <><X size={13} /> Cancel</>
                                }
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showDetail && (
                <BookingDetailModal booking={booking} onClose={() => setShowDetail(false)} />
            )}
        </>
    );
}
