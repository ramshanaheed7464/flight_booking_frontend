import { useState, useContext } from 'react';
import { Plane, Clock, AlertCircle, Info } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { firstSegment, lastSegment, stopCount, parseDuration } from '../api/duffelApi';
import { formatTime, formatShortDate } from '../utils/dateFormat';
import DuffelBookingModal from './DuffelBookingModal';
import './FlightCard.css';

export default function DuffelFlightCard({ offer }) {
    const { user, login } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);

    const dep      = firstSegment(offer);
    const arr      = lastSegment(offer);
    const stops    = stopCount(offer);
    const dur      = parseDuration(offer?.slices?.[0]?.duration);
    const price    = offer?.total_amount;
    const currency = offer?.total_currency ?? 'USD';
    const carrier  = dep?.marketing_carrier ?? {};
    const carrierName = carrier.name ?? carrier.iata_code ?? '—';
    const flightNum = dep
        ? `${carrier.iata_code ?? ''}${dep.marketing_carrier_flight_number ?? ''}`
        : '—';

    if (!dep || !arr) {
        return (
            <div className="fc fc--live" style={{ color: 'var(--color-danger)', fontSize: '0.8rem', gap: '0.5rem' }}>
                <AlertCircle size={14} /> Unable to parse flight data.
            </div>
        );
    }

    const handleView = () => {
        if (!user) { login(); return; }
        setShowModal(true);
    };

    const stopLabel = stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`;

    return (
        <>
            <div className="fc fc--live">
                <div className="fc-route">
                    <div className="fc-city">
                        <div className="fc-code">{dep.origin.iata_code}</div>
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
                        <div className="fc-fn">{flightNum}</div>
                        {dur && <div className="fc-duration">{dur} · {stopLabel}</div>}
                    </div>

                    <div className="fc-city">
                        <div className="fc-code">{arr.destination.iata_code}</div>
                        <div className="fc-name">Destination</div>
                    </div>
                </div>

                <div className="fc-meta">
                    <div>
                        <div className="fc-lbl">
                            <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />Departure
                        </div>
                        <div className="fc-time">
                            {formatTime(dep.departing_at)} · {formatShortDate(dep.departing_at)}
                        </div>
                    </div>
                    <div>
                        <div className="fc-lbl">
                            <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />Arrival
                        </div>
                        <div className="fc-time">{formatTime(arr.arriving_at)}</div>
                    </div>
                    <div>
                        <div className="fc-lbl">Carrier</div>
                        <div className="fc-time">{carrierName}</div>
                    </div>
                </div>

                <div className="fc-bottom-row">
                    <div className="fc-price-wrap">
                        <div className="fc-price">{currency} {Number(price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <div className="fc-price-lbl">per traveler</div>
                    </div>
                    <button className="fc-view-btn" onClick={handleView}>
                        <Info size={13} /> {user ? 'View' : 'Sign in to Book'}
                    </button>
                </div>
            </div>

            {showModal && (
                <DuffelBookingModal
                    offer={offer}
                    onClose={() => setShowModal(false)}
                    onBooked={() => setShowModal(false)}
                />
            )}
        </>
    );
}
