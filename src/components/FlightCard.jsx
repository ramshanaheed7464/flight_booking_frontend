import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createBooking } from '../api/bookingApi';

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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
                .fc {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px;
                    padding: 1.5rem 1.75rem;
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    transition: border-color 0.25s, background 0.25s, transform 0.2s;
                    cursor: default;
                    position: relative;
                    overflow: hidden;
                }
                .fc::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 3px; height: 100%;
                    background: linear-gradient(180deg, #c9a354, transparent);
                    opacity: 0;
                    transition: opacity 0.25s;
                }
                .fc:hover { border-color: rgba(201,163,84,0.25); background: rgba(255,255,255,0.05); transform: translateY(-1px); }
                .fc:hover::before { opacity: 1; }
                .fc-route {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                }
                .fc-city {
                    text-align: center;
                }
                .fc-code {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.9rem;
                    font-weight: 600;
                    color: #fff;
                    line-height: 1;
                }
                .fc-name {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.7rem;
                    font-weight: 300;
                    color: rgba(255,255,255,0.35);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-top: 0.25rem;
                }
                .fc-mid {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.3rem;
                }
                .fc-line {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }
                .fc-dot { width: 6px; height: 6px; border-radius: 50%; border: 1.5px solid #c9a354; flex-shrink: 0; }
                .fc-dash { flex: 1; height: 1px; background: rgba(201,163,84,0.25); }
                .fc-plane { color: #c9a354; font-size: 0.9rem; }
                .fc-duration {
                    font-family: 'DM Mono', monospace;
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.3);
                }
                .fc-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                    min-width: 100px;
                }
                .fc-time {
                    font-family: 'DM Mono', monospace;
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.5);
                }
                .fc-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    color: rgba(255,255,255,0.2);
                }
                .fc-price-wrap {
                    text-align: right;
                    min-width: 90px;
                }
                .fc-price {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.5rem;
                    color: #c9a354;
                    font-weight: 600;
                    line-height: 1;
                }
                .fc-price-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.65rem;
                    color: rgba(255,255,255,0.2);
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    margin-top: 0.2rem;
                }
                .fc-btn {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.75rem;
                    font-weight: 500;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    border: 1px solid #c9a354;
                    color: #c9a354;
                    background: transparent;
                    padding: 0.5rem 1.1rem;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                    white-space: nowrap;
                }
                .fc-btn:hover:not(:disabled) { background: #c9a354; color: #08080c; }
                .fc-btn:disabled { opacity: 0.4; cursor: default; }
                .fc-btn.booked { border-color: #4caf88; color: #4caf88; }
            `}</style>
            <div className="fc">
                <div className="fc-route">
                    <div className="fc-city">
                        <div className="fc-code">{flight.source || 'ORG'}</div>
                        <div className="fc-name">{flight.source || 'Origin'}</div>
                    </div>
                    <div className="fc-mid">
                        <div className="fc-line">
                            <div className="fc-dot" />
                            <div className="fc-dash" />
                            <span className="fc-plane">✈</span>
                            <div className="fc-dash" />
                            <div className="fc-dot" />
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
                    <div className="fc-price">${flight.price ?? '---'}</div>
                    <div className="fc-price-label">per seat</div>
                </div>
                <button
                    className={`fc-btn ${booked ? 'booked' : ''}`}
                    onClick={handleBook}
                    disabled={booking || booked}
                >
                    {booked ? '✓ Booked' : booking ? 'Booking…' : 'Book Now'}
                </button>
            </div>
        </>
    );
}