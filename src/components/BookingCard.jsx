export default function BookingCard({ booking }) {
    const formatDate = (val) => val ? new Date(val).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const formatTime = (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    const statusColor = {
        confirmed: '#4caf88',
        pending: '#c9a354',
        cancelled: '#e05f5f',
    }[booking?.status?.toLowerCase()] || '#c9a354';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');
                .bc {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 10px;
                    overflow: hidden;
                    transition: border-color 0.2s, transform 0.2s;
                }
                .bc:hover { border-color: rgba(201,163,84,0.2); transform: translateY(-1px); }
                .bc-header {
                    background: rgba(201,163,84,0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding: 1rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .bc-id {
                    font-family: 'DM Mono', monospace;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.3);
                }
                .bc-status {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.65rem;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                    border: 1px solid;
                }
                .bc-body {
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .bc-route {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    flex: 1;
                }
                .bc-code {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.6rem;
                    font-weight: 600;
                    color: #fff;
                }
                .bc-city-name {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.65rem;
                    color: rgba(255,255,255,0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                }
                .bc-arrow {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }
                .bc-line { flex: 1; height: 1px; background: rgba(201,163,84,0.2); }
                .bc-plane { color: #c9a354; font-size: 0.85rem; }
                .bc-detail {
                    display: flex;
                    flex-direction: column;
                    gap: 0.1rem;
                }
                .bc-detail-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.62rem;
                    text-transform: uppercase;
                    letter-spacing: 0.07em;
                    color: rgba(255,255,255,0.2);
                }
                .bc-detail-val {
                    font-family: 'DM Mono', monospace;
                    font-size: 0.82rem;
                    color: rgba(255,255,255,0.6);
                }
                .bc-price {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.3rem;
                    color: #c9a354;
                    font-weight: 600;
                    text-align: right;
                }
            `}</style>
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
                            <span className="bc-plane">✈</span>
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
                    <div className="bc-price">${booking?.totalPrice ?? booking?.flight?.price ?? '—'}</div>
                </div>
            </div>
        </>
    );
}