import { useState } from 'react';
import { Plane, Clock, Users, Info } from 'lucide-react';
import FlightDetailModal from '../pages/FlightDetailModal';
import { formatTime, formatShortDate, formatDuration } from '../utils/dateFormat';
import './FlightCard.css';

/**
 * FlightCard — SRP: renders a single flight summary card.
 * Date/time formatting delegated to utils/dateFormat.js.
 */
export default function FlightCard({ flight, allFlights, onBooked, nationalities }) {
    const [showDetail, setShowDetail] = useState(false);

    const duration = formatDuration(flight.duration);

    return (
        <>
            <div className="fc">
                <div className="fc-route">
                    <div className="fc-city">
                        <div className="fc-code">{flight.source}</div>
                        <div className="fc-name">Origin</div>
                    </div>
                    <div className="fc-mid">
                        <div className="fc-line">
                            <div className="fc-dot" />
                            <div className="fc-dash" />
                            <Plane size={14} className="fc-plane-icon" />
                            <div className="fc-dash" />
                            <div className="fc-dot" />
                        </div>
                        <div className="fc-fn">{flight.flightNumber}</div>
                        {duration && <div className="fc-duration">{duration}</div>}
                    </div>
                    <div className="fc-city">
                        <div className="fc-code">{flight.destination}</div>
                        <div className="fc-name">Destination</div>
                    </div>
                </div>

                <div className="fc-meta">
                    <div>
                        <div className="fc-lbl">
                            <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />Departure
                        </div>
                        <div className="fc-time">
                            {formatTime(flight.departureTime)} · {formatShortDate(flight.departureTime)}
                        </div>
                    </div>
                    <div>
                        <div className="fc-lbl">
                            <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />Arrival
                        </div>
                        <div className="fc-time">{formatTime(flight.arrivalTime)}</div>
                    </div>
                    <div>
                        <div className="fc-lbl">
                            <Users size={10} style={{ display: 'inline', marginRight: 3 }} />Seats
                        </div>
                        <div className={`fc-time ${flight.seatsAvailable <= 10 ? 'fc-seats-low' : ''}`}>
                            {flight.seatsAvailable} left
                        </div>
                    </div>
                </div>

                <div className="fc-bottom-row">
                    <div className="fc-price-wrap">
                        <div className="fc-price">PKR {(flight.price ?? 0).toLocaleString()}</div>
                        <div className="fc-price-lbl">per seat</div>
                    </div>
                    <button className="fc-view-btn" onClick={() => setShowDetail(true)}>
                        <Info size={13} /> View
                    </button>
                </div>
            </div>

            {showDetail && (
                <FlightDetailModal
                    flight={flight}
                    allFlights={allFlights}
                    onClose={() => setShowDetail(false)}
                    onBooked={onBooked}
                    nationalities={nationalities}
                />
            )}
        </>
    );
}
