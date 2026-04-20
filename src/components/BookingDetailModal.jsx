import {
    Plane, X, Users, User, Globe, Phone, Utensils,
    Hash, Calendar, Clock, Ticket,
} from 'lucide-react';
import { STATUS_COLORS } from '../constants/statusColors';
import { formatTime, formatLongDate } from '../utils/dateFormat';
import { parsePassengers } from '../utils/bookingUtils';

/**
 * BookingDetailModal — SRP: displays full details for a single booking.
 * Extracted from Bookings.jsx so it can be reused independently.
 * CSS lives in src/pages/Bookings.css (bd-* classes).
 */
export default function BookingDetailModal({ booking, onClose }) {
    const passengers = parsePassengers(booking.passengerDetails);
    const status = booking.status || 'BOOKED';
    const color = STATUS_COLORS[status] || '#c9a354';

    return (
        <div className="bd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bd-modal">
                <button className="bd-close" onClick={onClose}><X size={16} /></button>

                {/* ── Header ── */}
                <div className="bd-header">
                    <div className="bd-header-top">
                        <div className="bd-booking-id">
                            <Ticket size={13} />
                            Booking #{booking.id}
                        </div>
                        <span
                            className="bd-status"
                            style={{ color, borderColor: `${color}55`, background: `${color}11` }}
                        >
                            {status}
                        </span>
                    </div>

                    <div className="bd-route-hero">
                        <div className="bd-city-block">
                            <div className="bd-city-code">{booking.flight?.source || '—'}</div>
                            <div className="bd-city-label">Origin</div>
                            <div className="bd-city-time">{formatTime(booking.flight?.departureTime)}</div>
                            <div className="bd-city-date">{formatLongDate(booking.flight?.departureTime)}</div>
                        </div>
                        <div className="bd-route-mid">
                            <div className="bd-route-line">
                                <div className="bd-route-dot" />
                                <div className="bd-route-track">
                                    <Plane size={16} className="bd-plane-icon" />
                                </div>
                                <div className="bd-route-dot" />
                            </div>
                            <div className="bd-flight-num">{booking.flight?.flightNumber || '—'}</div>
                        </div>
                        <div className="bd-city-block bd-city-right">
                            <div className="bd-city-code">{booking.flight?.destination || '—'}</div>
                            <div className="bd-city-label">Destination</div>
                            <div className="bd-city-time">{formatTime(booking.flight?.arrivalTime)}</div>
                            <div className="bd-city-date">{formatLongDate(booking.flight?.arrivalTime)}</div>
                        </div>
                    </div>
                </div>

                {/* ── Flight info row ── */}
                <div className="bd-info-row">
                    <div className="bd-info-item">
                        <span className="bd-info-lbl"><Calendar size={11} /> Date</span>
                        <span className="bd-info-val">{formatLongDate(booking.flight?.departureTime)}</span>
                    </div>
                    <div className="bd-info-item">
                        <span className="bd-info-lbl"><Clock size={11} /> Departure</span>
                        <span className="bd-info-val">{formatTime(booking.flight?.departureTime)}</span>
                    </div>
                    <div className="bd-info-item">
                        <span className="bd-info-lbl"><Clock size={11} /> Arrival</span>
                        <span className="bd-info-val">{formatTime(booking.flight?.arrivalTime)}</span>
                    </div>
                    <div className="bd-info-item">
                        <span className="bd-info-lbl"><Users size={11} /> Passengers</span>
                        <span className="bd-info-val">{booking.passengers ?? 1}</span>
                    </div>
                </div>

                {/* ── Passenger list ── */}
                {passengers.length > 0 && (
                    <div className="bd-pax-section">
                        <div className="bd-section-title">
                            <Users size={13} /> Passenger Details
                        </div>
                        <div className="bd-pax-list">
                            {passengers.map((p, i) => (
                                <div key={i} className="bd-pax-card">
                                    <div className="bd-pax-heading">
                                        <User size={11} />
                                        Passenger {i + 1}
                                        {p.fullName && <span className="bd-pax-name">— {p.fullName}</span>}
                                    </div>
                                    <div className="bd-pax-grid">
                                        {[
                                            { icon: <Hash size={10} />,    label: 'Passport No.',  val: p.passportNumber },
                                            { icon: <Globe size={10} />,   label: 'Nationality',   val: p.nationality },
                                            { icon: <Calendar size={10} />,label: 'Date of Birth', val: p.dateOfBirth },
                                            { icon: <User size={10} />,    label: 'Gender',        val: p.gender },
                                            { icon: <Phone size={10} />,   label: 'Phone',         val: p.phone },
                                            { icon: <Utensils size={10} />,label: 'Meal',          val: p.mealPreference },
                                        ].map(({ icon, label, val }) => val ? (
                                            <div key={label} className="bd-pax-field">
                                                <span className="bd-pax-lbl">{icon}{label}</span>
                                                <span className="bd-pax-val">{val}</span>
                                            </div>
                                        ) : null)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bd-footer">
                    <button className="bd-close-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
