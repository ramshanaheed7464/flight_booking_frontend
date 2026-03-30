import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Circle, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { createBooking } from '../api/bookingApi';
import './FlightCard.css';

export default function FlightCard({ flight }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [booking, setBooking] = useState(false);
    const [booked, setBooked] = useState(false);

    const handleBook = async () => {
        if (!user) { navigate('/login'); return; }
        setBooking(true);
        try {
            await createBooking({ flightId: flight.id });
            setBooked(true);
        } catch (e) {
            alert('Booking failed. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    const formatTime = (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const formatDate = (val) => val ? new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '---';

    return (
        <div className="fc">
            <div className="fc-route">
                <div className="fc-city">
                    <div className="fc-code">{flight.source || 'ORG'}</div>
                    <div className="fc-name">{flight.source || 'Origin'}</div>
                </div>
                <div className="fc-mid">
                    <div className="fc-line">
                        <Circle size={6} className="fc-dot-icon" />
                        <div className="fc-dash" />
                        <Plane size={14} className="fc-plane-icon" />
                        <div className="fc-dash" />
                        <Circle size={6} className="fc-dot-icon" />
                    </div>
                    <div className="fc-duration">{flight.flightNumber || 'Non-stop'}</div>
                </div>
                <div className="fc-city">
                    <div className="fc-code">{flight.destination || 'DST'}</div>
                    <div className="fc-name">{flight.destination || 'Destination'}</div>
                </div>
            </div>
            <div className="fc-meta">
                <div>
                    <div className="fc-label">Departure</div>
                    <div className="fc-time">{formatTime(flight.departureTime)} · {formatDate(flight.departureTime)}</div>
                </div>
                <div>
                    <div className="fc-label">Seats</div>
                    <div className="fc-time">{flight.seatsAvailable ?? '—'} left</div>
                </div>
            </div>
            <div className="fc-price-wrap">
                <div className="fc-price">PKR {flight.price ?? '---'}</div>
                <div className="fc-price-label">per seat</div>
            </div>
            <button
                className={`fc-btn ${booked ? 'booked' : ''}`}
                onClick={handleBook}
                disabled={booking || booked}
            >
                {booked
                    ? <><Check size={13} strokeWidth={2.5} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Booked</>
                    : booking ? 'Booking…' : 'Book Now'
                }
            </button>
        </div>
    );
}