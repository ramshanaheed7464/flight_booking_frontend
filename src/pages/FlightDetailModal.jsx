import { useState, useContext } from 'react';
import {
    Plane, X, Users, Wifi, WifiOff, Utensils, UtensilsCrossed,
    MonitorPlay, ShieldCheck, ShieldOff, Armchair, Luggage,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import BookingModal from './BookingModal';
import { formatTime, formatLongDate, formatDuration } from '../utils/dateFormat';
import './FlightDetailModal.css';

/**
 * FlightDetailModal — SRP: displays full flight details and gates into BookingModal.
 * OCP: amenity list is data-driven; add a new amenity by extending the amenities array.
 * Date/time formatting delegated to utils/dateFormat.js.
 */
export default function FlightDetailModal({ flight, allFlights, onClose, onBooked, nationalities }) {
    const [showBooking, setShowBooking] = useState(false);
    const { user, login } = useContext(AuthContext);

    const toBool = v => v === true || v === 1 || v === '1' || String(v).toLowerCase() === 'true';

    const wifiOn      = toBool(flight.wifiAvailable);
    const mealsOn     = toBool(flight.mealsIncluded);
    const entertainOn = toBool(flight.entertainmentAvailable);
    const refundOn    = toBool(flight.refundable);

    const flightMeals = mealsOn && flight.meals
        ? flight.meals.split(',').map(m => m.trim()).filter(Boolean)
        : [];

    // OCP: extend this array to add new amenity toggles without changing rendering logic.
    const amenities = [
        { key: 'wifi',         on: wifiOn,      onIcon: <Wifi size={14} />,         offIcon: <WifiOff size={14} />,       label: 'Wi-Fi' },
        { key: 'meals',        on: mealsOn,     onIcon: <Utensils size={14} />,     offIcon: <UtensilsCrossed size={14} />,label: 'Meals' },
        { key: 'entertain',    on: entertainOn, onIcon: <MonitorPlay size={14} />,  offIcon: <MonitorPlay size={14} />,    label: 'Entertainment' },
        { key: 'refundable',   on: refundOn,    onIcon: <ShieldCheck size={14} />,  offIcon: <ShieldOff size={14} />,      label: 'Refundable' },
    ];

    const handleBook = () => {
        if (!user) { login(); return; }
        setShowBooking(true);
    };

    if (showBooking) return (
        <BookingModal
            flight={flight}
            flights={allFlights}
            onClose={() => setShowBooking(false)}
            onBooked={() => { onBooked(); onClose(); }}
            nationalities={nationalities}
            mealPreferences={flightMeals}
        />
    );

    const duration = formatDuration(flight.duration);

    return (
        <div className="fdm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="fdm">
                <button className="fdm-close" onClick={onClose}><X size={16} /></button>

                {/* ── Header ── */}
                <div className="fdm-header">
                    <div className="fdm-header-top">
                        {flight.airline && <span className="fdm-airline">{flight.airline}</span>}
                        <span className="fdm-fn">{flight.flightNumber}</span>
                    </div>

                    <div className="fdm-route-hero">
                        <div className="fdm-city-block">
                            <div className="fdm-city-code">{flight.source}</div>
                            <div className="fdm-city-time">{formatTime(flight.departureTime)}</div>
                            <div className="fdm-city-date">{formatLongDate(flight.departureTime)}</div>
                        </div>

                        <div className="fdm-route-mid">
                            <div className="fdm-route-line">
                                <div className="fdm-route-dot" />
                                <div className="fdm-route-track">
                                    <Plane size={18} className="fdm-plane-icon" />
                                </div>
                                <div className="fdm-route-dot" />
                            </div>
                            {duration && <div className="fdm-duration-badge">{duration}</div>}
                        </div>

                        <div className="fdm-city-block fdm-city-right">
                            <div className="fdm-city-code">{flight.destination}</div>
                            <div className="fdm-city-time">{formatTime(flight.arrivalTime)}</div>
                            <div className="fdm-city-date">{formatLongDate(flight.arrivalTime)}</div>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="fdm-body">
                    <div className="fdm-amenities">
                        {amenities.map(({ key, on, onIcon, offIcon, label }) => (
                            <div key={key} className={`fdm-amenity ${on ? 'fdm-amenity-on' : 'fdm-amenity-off'}`}>
                                {on ? onIcon : offIcon}
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="fdm-grid">
                        {flight.seatType && (
                            <div className="fdm-detail-card">
                                <div className="fdm-detail-icon"><Armchair size={13} /></div>
                                <div>
                                    <div className="fdm-detail-label">Seat Type</div>
                                    <div className="fdm-detail-value">{flight.seatType}</div>
                                </div>
                            </div>
                        )}

                        {flight.baggageAllowance && (
                            <div className="fdm-detail-card">
                                <div className="fdm-detail-icon"><Luggage size={13} /></div>
                                <div>
                                    <div className="fdm-detail-label">Baggage</div>
                                    <div className="fdm-detail-value">{flight.baggageAllowance}</div>
                                </div>
                            </div>
                        )}

                        {entertainOn && flight.inFlightEntertainment && (
                            <div className="fdm-detail-card">
                                <div className="fdm-detail-icon"><MonitorPlay size={13} /></div>
                                <div>
                                    <div className="fdm-detail-label">Entertainment</div>
                                    <div className="fdm-detail-value">{flight.inFlightEntertainment}</div>
                                </div>
                            </div>
                        )}

                        {mealsOn && flightMeals.length > 0 && (
                            <div className="fdm-detail-card fdm-detail-card-wide">
                                <div className="fdm-detail-icon"><Utensils size={13} /></div>
                                <div>
                                    <div className="fdm-detail-label">Meal Options</div>
                                    <div className="fdm-meal-tags">
                                        {flightMeals.map((m, i) => (
                                            <span key={i} className="fdm-meal-tag">{m}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="fdm-footer">
                    <div className="fdm-footer-left">
                        <div className="fdm-seats-wrap">
                            <Users size={13} />
                            <span className={flight.seatsAvailable <= 10 ? 'fdm-seats-low' : ''}>
                                {flight.seatsAvailable} seats left
                            </span>
                        </div>
                    </div>
                    <div className="fdm-footer-right">
                        <div className="fdm-price-block">
                            <div className="fdm-price">PKR {(flight.price ?? 0).toLocaleString()}</div>
                            <div className="fdm-price-lbl">per seat</div>
                        </div>
                        {flight.seatsAvailable === 0
                            ? <div className="fdm-sold-out">Sold Out</div>
                            : <button className="fdm-book-btn" onClick={handleBook}>
                                <Plane size={14} /> {user ? 'Book Now' : 'Sign in to Book'}
                              </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
