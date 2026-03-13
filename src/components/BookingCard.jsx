import { Plane, ArrowRight } from 'lucide-react';
import './BookingCard.css';

export default function BookingCard({ booking }) {
    const formatDate = (val) => val ? new Date(val).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const formatTime = (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const statusColor = {
        confirmed: '#4caf88',
        pending: '#c9a354',
        cancelled: '#e05f5f',
    }[booking?.status?.toLowerCase()] || '#c9a354';

    return (
        <div className="bc">
            <div className="bc-header">
                <span className="bc-id">#{booking?.id || 'BKXXXXXX'}</span>
                <span className="bc-status" style={{ color: statusColor, borderColor: statusColor + '55', background: statusColor + '11' }}>
                    {booking?.status || 'Pending'}
                </span>
            </div>
            <div className="bc-body">
                <div className="bc-route">
                    <div>
                        <div className="bc-code">{booking?.flight?.source || 'ORG'}</div>
                        <div className="bc-city-name">{booking?.flight?.source || 'Origin'}</div>
                    </div>
                    <div className="bc-arrow">
                        <div className="bc-line" />
                        <Plane size={14} style={{ color: '#c9a354', flexShrink: 0 }} />
                        <div className="bc-line" />
                    </div>
                    <div>
                        <div className="bc-code">{booking?.flight?.destination || 'DST'}</div>
                        <div className="bc-city-name">{booking?.flight?.destination || 'Destination'}</div>
                    </div>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-label">Date</span>
                    <span className="bc-detail-val">{formatDate(booking?.flight?.departureTime)}</span>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-label">Time</span>
                    <span className="bc-detail-val">{formatTime(booking?.flight?.departureTime)}</span>
                </div>
                <div className="bc-detail">
                    <span className="bc-detail-label">Seats</span>
                    <span className="bc-detail-val">{booking?.seats ?? 1}</span>
                </div>
                <div className="bc-price">PKR {booking?.totalPrice ?? booking?.flight?.price ?? '—'}</div>
            </div>
        </div>
    );
}