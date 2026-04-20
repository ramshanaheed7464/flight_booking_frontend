import { useState } from 'react';
import { Plane, X, Loader2, Users, Globe, ExternalLink } from 'lucide-react';
import { cancelBooking } from '../api/bookingApi';
import { STATUS_COLORS } from '../constants/statusColors';
import { formatTime, formatMediumDate } from '../utils/dateFormat';
import { parsePassengers } from '../utils/bookingUtils';

export default function DuffelBookingCard({ booking, onCancel }) {
    const [cancelling, setCancelling] = useState(false);
    const [showPassengers, setShowPassengers] = useState(false);

    const status = booking.status || 'BOOKED';
    const color = STATUS_COLORS[status] || '#c9a354';
    const canCancel = status === 'BOOKED';

    const passengers = parsePassengers(booking.passengerDetails);
    const passengerCount = passengers.length || booking.passengers || 1;

    const handleCancel = async () => {
        if (!window.confirm('Cancel this Duffel booking?')) return;
        setCancelling(true);
        try {
            await cancelBooking(booking.id);
            onCancel();
        } catch (e) {
            alert(e.response?.data || 'Failed to cancel booking.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="bc">
            <div className="bc-header">
                <div className="bc-header-left">
                    <span className="bc-id">#{booking.id}</span>
                    <span className="bc-type">
                        <Globe size={11} /> Duffel · One Way
                    </span>
                    {booking.bookingReference && (
                        <span className="bc-duffel-ref">
                            <ExternalLink size={10} /> {booking.bookingReference}
                        </span>
                    )}
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
                        <div className="bc-code">{booking.origin || '—'}</div>
                        <div className="bc-city">Origin</div>
                    </div>
                    <div className="bc-arr">
                        <div className="bc-line" />
                        <Plane size={13} className="bc-plane-icon" />
                        <div className="bc-line" />
                    </div>
                    <div>
                        <div className="bc-code">{booking.destination || '—'}</div>
                        <div className="bc-city">Destination</div>
                    </div>
                </div>

                <div className="bc-detail">
                    <span className="bc-detail-lbl">Flight</span>
                    <span className="bc-detail-val">
                        {booking.carrier ? `${booking.carrier} · ` : ''}{booking.flightNumber || '—'}
                    </span>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-lbl">Date</span>
                    <span className="bc-detail-val">{formatMediumDate(booking.departureAt)}</span>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-lbl">Time</span>
                    <span className="bc-detail-val">{formatTime(booking.departureAt)}</span>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-lbl">Passengers</span>
                    <span className="bc-detail-val">{passengerCount}</span>
                </div>
                {booking.totalAmount && (
                    <div className="bc-detail">
                        <span className="bc-detail-lbl">Total</span>
                        <span className="bc-detail-val">
                            {booking.currency} {Number(booking.totalAmount).toLocaleString()}
                        </span>
                    </div>
                )}

                <div className="bc-actions">
                    {passengers.length > 0 && (
                        <button className="bc-detail-btn" onClick={() => setShowPassengers(v => !v)}>
                            <Users size={12} /> {showPassengers ? 'Hide' : 'View'} Passengers
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

                {showPassengers && passengers.length > 0 && (
                    <div className="bc-passengers">
                        {passengers.map((p, i) => (
                            <div key={i} className="bc-passenger-row">
                                <span className="bc-passenger-name">{p.fullName}</span>
                                {p.email && <span className="bc-passenger-email">{p.email}</span>}
                                {p.nationality && <span className="bc-passenger-meta">{p.nationality}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
