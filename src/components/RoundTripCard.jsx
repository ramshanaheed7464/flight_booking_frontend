import { useState } from 'react';
import { Plane, ArrowLeftRight, RotateCcw, X, Users, Loader2 } from 'lucide-react';
import { cancelBooking } from '../api/bookingApi';
import { STATUS_COLORS } from '../constants/statusColors';
import { formatTime, formatMediumDate } from '../utils/dateFormat';
import { parsePassengers } from '../utils/bookingUtils';
import BookingDetailModal from './BookingDetailModal';

/**
 * LegBody — private sub-component; renders the body of one flight leg.
 * ISP: receives only the data it needs (booking, pax, status, onViewDetail).
 */
function LegBody({ booking, pax, status, onViewDetail }) {
    return (
        <div className="bc-body bc-leg-body" style={{ opacity: status === 'CANCELLED' ? 0.45 : 1 }}>
            <div className="bc-route">
                <div>
                    <div className="bc-code">{booking.flight?.source || '—'}</div>
                    <div className="bc-city">Origin</div>
                </div>
                <div className="bc-arr">
                    <div className="bc-line" />
                    <Plane size={13} className="bc-plane-icon" />
                    <div className="bc-line" />
                </div>
                <div>
                    <div className="bc-code">{booking.flight?.destination || '—'}</div>
                    <div className="bc-city">Destination</div>
                </div>
            </div>

            <div className="bc-detail">
                <span className="bc-detail-lbl">Flight</span>
                <span className="bc-detail-val">{booking.flight?.flightNumber || '—'}</span>
            </div>
            <div className="bc-detail">
                <span className="bc-detail-lbl">Date</span>
                <span className="bc-detail-val">{formatMediumDate(booking.flight?.departureTime)}</span>
            </div>
            <div className="bc-detail">
                <span className="bc-detail-lbl">Time</span>
                <span className="bc-detail-val">{formatTime(booking.flight?.departureTime)}</span>
            </div>
            <div className="bc-detail">
                <span className="bc-detail-lbl">Passengers</span>
                <span className="bc-detail-val">{booking.passengers ?? 1}</span>
            </div>

            {pax.length > 0 && (
                <div className="bc-actions">
                    <button className="bc-detail-btn bc-detail-sm" onClick={onViewDetail}>
                        <Users size={11} /> View Details
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * RoundTripCard — SRP: renders a paired round-trip booking card.
 * Extracted from Bookings.jsx for reuse and independent testing.
 * CSS lives in src/pages/Bookings.css (bc-* classes).
 */
export default function RoundTripCard({ outbound, returnLeg, onCancel }) {
    const [cancellingOut, setCancellingOut] = useState(false);
    const [cancellingRet, setCancellingRet] = useState(false);
    const [showDetailOut, setShowDetailOut] = useState(false);
    const [showDetailRet, setShowDetailRet] = useState(false);

    const outStatus = outbound.status || 'BOOKED';
    const retStatus = returnLeg.status || 'BOOKED';
    const overallStatus = (outStatus === 'BOOKED' || retStatus === 'BOOKED') ? 'BOOKED' : outStatus;
    const color = STATUS_COLORS[overallStatus] || '#c9a354';
    const bothBooked = outStatus === 'BOOKED' && retStatus === 'BOOKED';

    const outPassengers = parsePassengers(outbound.passengerDetails);
    const retPassengers = parsePassengers(returnLeg.passengerDetails);

    const handleCancelOut = async () => {
        if (!window.confirm('Cancel outbound leg?')) return;
        setCancellingOut(true);
        try { await cancelBooking(outbound.id); onCancel(); }
        catch (e) { alert(e.response?.data || 'Failed to cancel.'); }
        finally { setCancellingOut(false); }
    };

    const handleCancelRet = async () => {
        if (!window.confirm('Cancel return leg?')) return;
        setCancellingRet(true);
        try { await cancelBooking(returnLeg.id); onCancel(); }
        catch (e) { alert(e.response?.data || 'Failed to cancel.'); }
        finally { setCancellingRet(false); }
    };

    const handleCancelBoth = async () => {
        if (!window.confirm('Cancel entire round trip?')) return;
        setCancellingOut(true);
        try {
            if (outbound.status === 'BOOKED') await cancelBooking(outbound.id);
            if (returnLeg.status === 'BOOKED') await cancelBooking(returnLeg.id);
            onCancel();
        } catch (e) {
            alert(e.response?.data || 'Failed to cancel.');
        } finally {
            setCancellingOut(false);
        }
    };

    return (
        <>
            <div className="bc bc-roundtrip">
                <div className="bc-header">
                    <div className="bc-header-left">
                        <span className="bc-id">#{outbound.id} · #{returnLeg.id}</span>
                        <span className="bc-type"><ArrowLeftRight size={11} /> Round Trip</span>
                    </div>
                    <div className="bc-header-right">
                        <span
                            className="bc-status"
                            style={{ color, borderColor: `${color}55`, background: `${color}11` }}
                        >
                            {overallStatus}
                        </span>
                    </div>
                </div>

                {/* Outbound leg */}
                <div className="bc-leg">
                    <div className="bc-leg-label">
                        <span className="bc-leg-badge bc-leg-out"><Plane size={11} /> Outbound</span>
                        {outStatus === 'CANCELLED' && (
                            <span className="bc-leg-status" style={{ color: STATUS_COLORS.CANCELLED, opacity: 0.5 }}>
                                Cancelled
                            </span>
                        )}
                    </div>
                    <LegBody
                        booking={outbound}
                        pax={outPassengers}
                        status={outStatus}
                        onViewDetail={() => setShowDetailOut(true)}
                    />
                </div>

                <div className="bc-leg-divider">
                    <div className="bc-leg-divider-line" />
                    <span className="bc-leg-divider-label"><RotateCcw size={10} /> Return</span>
                    <div className="bc-leg-divider-line" />
                </div>

                {/* Return leg */}
                <div className="bc-leg">
                    <div className="bc-leg-label">
                        <span className="bc-leg-badge bc-leg-ret"><RotateCcw size={11} /> Return</span>
                        {retStatus === 'CANCELLED' && (
                            <span className="bc-leg-status" style={{ color: STATUS_COLORS.CANCELLED, opacity: 0.5 }}>
                                Cancelled
                            </span>
                        )}
                    </div>
                    <LegBody
                        booking={returnLeg}
                        pax={retPassengers}
                        status={retStatus}
                        onViewDetail={() => setShowDetailRet(true)}
                    />
                </div>

                {/* Cancel actions */}
                {(outStatus === 'BOOKED' || retStatus === 'BOOKED') && (
                    <div className="bc-rt-actions">
                        {bothBooked ? (
                            <button className="bc-cancel-btn" onClick={handleCancelBoth} disabled={cancellingOut}>
                                {cancellingOut
                                    ? <><Loader2 size={12} className="spin" /> Cancelling…</>
                                    : <><X size={13} /> Cancel Entire Trip</>
                                }
                            </button>
                        ) : (
                            <>
                                {outStatus === 'BOOKED' && (
                                    <button className="bc-cancel-btn bc-cancel-sm" onClick={handleCancelOut} disabled={cancellingOut}>
                                        {cancellingOut ? '…' : <><X size={13} /> Cancel Outbound</>}
                                    </button>
                                )}
                                {retStatus === 'BOOKED' && (
                                    <button className="bc-cancel-btn bc-cancel-sm" onClick={handleCancelRet} disabled={cancellingRet}>
                                        {cancellingRet ? '…' : <><X size={13} /> Cancel Return</>}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {showDetailOut && <BookingDetailModal booking={outbound} onClose={() => setShowDetailOut(false)} />}
            {showDetailRet && <BookingDetailModal booking={returnLeg} onClose={() => setShowDetailRet(false)} />}
        </>
    );
}
