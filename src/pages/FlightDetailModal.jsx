import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plane, X, Users, Wifi, WifiOff, Utensils, UtensilsCrossed,
    MonitorPlay, ShieldCheck, ShieldOff, Armchair, Luggage,
    Clock, Layers
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import BookingModal from './BookingModal';

export default function FlightDetailModal({ flight, allFlights, onClose, onBooked, nationalities }) {
    const [showBooking, setShowBooking] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const flightMeals = flight.meals
        ? flight.meals.split(',').map(m => m.trim()).filter(Boolean)
        : [];

    const fmt = v => v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const fmtFull = v => v ? new Date(v).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '---';
    const fmtDuration = mins => {
        if (!mins) return null;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const handleBook = () => {
        if (!user) { onClose(); navigate('/login'); return; }
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

    return (
        <div className="fdm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="fdm">
                <button className="fdm-close" onClick={onClose}><X size={16} /></button>

                {/* ── Header ── */}
                <div className="fdm-header">
                    <div className="fdm-header-top">
                        {flight.airline && <span className="fdm-airline">{flight.airline}</span>}
                        <span className="fdm-fn">{flight.flightNumber}</span>
                        {flight.cabinClass && <span className="fdm-class">{flight.cabinClass}</span>}
                    </div>

                    <div className="fdm-route-hero">
                        <div className="fdm-city-block">
                            <div className="fdm-city-code">{flight.source}</div>
                            <div className="fdm-city-time">{fmt(flight.departureTime)}</div>
                            <div className="fdm-city-date">{fmtFull(flight.departureTime)}</div>
                        </div>

                        <div className="fdm-route-mid">
                            <div className="fdm-route-line">
                                <div className="fdm-route-dot" />
                                <div className="fdm-route-track">
                                    <Plane size={18} className="fdm-plane-icon" />
                                </div>
                                <div className="fdm-route-dot" />
                            </div>
                            {fmtDuration(flight.duration) && (
                                <div className="fdm-duration-badge">{fmtDuration(flight.duration)}</div>
                            )}
                            {(flight.stopovers || flight.layover) && (
                                <div className="fdm-via-badge">
                                    {flight.stopovers ? `via ${flight.stopovers}` : `layover: ${flight.layover}`}
                                </div>
                            )}
                        </div>

                        <div className="fdm-city-block fdm-city-right">
                            <div className="fdm-city-code">{flight.destination}</div>
                            <div className="fdm-city-time">{fmt(flight.arrivalTime)}</div>
                            <div className="fdm-city-date">{fmtFull(flight.arrivalTime)}</div>
                        </div>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="fdm-body">
                    {/* Amenities */}
                    <div className="fdm-amenities">
                        <div className={`fdm-amenity ${flight.wifiAvailable ? 'fdm-amenity-on' : 'fdm-amenity-off'}`}>
                            {flight.wifiAvailable ? <Wifi size={14} /> : <WifiOff size={14} />}
                            <span>Wi-Fi</span>
                        </div>
                        <div className={`fdm-amenity ${flight.mealsIncluded ? 'fdm-amenity-on' : 'fdm-amenity-off'}`}>
                            {flight.mealsIncluded ? <Utensils size={14} /> : <UtensilsCrossed size={14} />}
                            <span>Meals</span>
                        </div>
                        <div className={`fdm-amenity ${flight.inFlightEntertainment ? 'fdm-amenity-on' : 'fdm-amenity-off'}`}>
                            <MonitorPlay size={14} /><span>Entertainment</span>
                        </div>
                        <div className={`fdm-amenity ${flight.refundable ? 'fdm-amenity-on' : 'fdm-amenity-off'}`}>
                            {flight.refundable ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                            <span>Refundable</span>
                        </div>
                    </div>

                    {/* Detail cards */}
                    <div className="fdm-grid">
                        {flight.aircraft && (
                            <div className="fdm-detail-card">
                                <div className="fdm-detail-icon"><Plane size={13} /></div>
                                <div>
                                    <div className="fdm-detail-label">Aircraft</div>
                                    <div className="fdm-detail-value">{flight.aircraft}</div>
                                </div>
                            </div>
                        )}
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
                        {flight.inFlightEntertainment && (
                            <div className="fdm-detail-card">
                                <div className="fdm-detail-icon"><MonitorPlay size={13} /></div>
                                <div>
                                    <div className="fdm-detail-label">Entertainment</div>
                                    <div className="fdm-detail-value">{flight.inFlightEntertainment}</div>
                                </div>
                            </div>
                        )}
                        {flight.layover && (
                            <div className="fdm-detail-card">
                                <div className="fdm-detail-icon"><Clock size={13} /></div>
                                <div>
                                    <div className="fdm-detail-label">Layover</div>
                                    <div className="fdm-detail-value">{flight.layover}</div>
                                </div>
                            </div>
                        )}
                        {flight.stopovers && (
                            <div className="fdm-detail-card">
                                <div className="fdm-detail-icon"><Layers size={13} /></div>
                                <div>
                                    <div className="fdm-detail-label">Stopovers</div>
                                    <div className="fdm-detail-value">{flight.stopovers}</div>
                                </div>
                            </div>
                        )}
                        {flightMeals.length > 0 && (
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
                                <Plane size={14} /> Book Now
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}