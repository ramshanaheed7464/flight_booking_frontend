import { useState } from 'react';
import {
    Plane, ArrowRight, ArrowLeft, ArrowLeftRight, RotateCcw,
    X, Check, Users, ChevronRight, AlertCircle, Loader2
} from 'lucide-react';
import { createBooking } from '../api/bookingApi';
import { validatePassenger } from './validation';
import PassengerForm from './PassengerForm';
import CustomSelect from '../components/CustomSelect';

const emptyPassenger = () => ({
    fullName: '', passportNumber: '', nationality: '',
    dateOfBirth: '', gender: '', phone: '', mealPreference: ''
});

export default function BookingModal({ flight, flights, onClose, onBooked, nationalities, mealPreferences }) {
    const [step, setStep] = useState(1);
    const [tripType, setTripType] = useState('ONE_WAY');
    const [passengers, setPassengers] = useState(1);
    const [returnFlightId, setReturnFlightId] = useState('');
    const [passengerForms, setPassengerForms] = useState([emptyPassenger()]);
    const [formErrors, setFormErrors] = useState([{}]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const price = flight.price ?? 0;
    const returnFlight = flights.find(f => f.id === Number(returnFlightId));
    const total = tripType === 'ROUND_TRIP' && returnFlight
        ? (price + (returnFlight.price ?? 0)) * passengers
        : price * passengers;

    const returnOptions = flights.filter(f =>
        f.id !== flight.id &&
        f.source === flight.destination &&
        f.destination === flight.source
    );

    const passengerOptions = [1, 2, 3, 4, 5, 6].map(n => ({
        value: n,
        label: `${n} Passenger${n > 1 ? 's' : ''}`,
        disabled: n > flight.seatsAvailable,
    }));

    const returnFlightOptions = [
        { value: '', label: 'Select return flight…', disabled: true },
        ...(returnOptions.length === 0
            ? [{ value: '__none__', label: 'No return flights available', disabled: true }]
            : returnOptions.map(f => ({
                value: String(f.id),
                label: `${f.source} → ${f.destination} · ${f.flightNumber} · PKR ${f.price}`,
            }))
        ),
    ];

    const handlePassengerCount = (n) => {
        setPassengers(n);
        setPassengerForms(prev => { const a = [...prev]; while (a.length < n) a.push(emptyPassenger()); return a.slice(0, n); });
        setFormErrors(prev => { const a = [...prev]; while (a.length < n) a.push({}); return a.slice(0, n); });
    };

    const handlePassengerChange = (idx, key, val) => {
        setPassengerForms(prev => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));
        setFormErrors(prev => prev.map((e, i) => i === idx ? { ...e, [key]: '' } : e));
    };

    const validateStep1 = () => {
        if (tripType === 'ROUND_TRIP' && !returnFlightId) {
            setError('Please select a return flight.');
            return false;
        }
        setError('');
        return true;
    };

    const validateStep2 = () => {
        const allErrors = passengerForms.map(p => validatePassenger(p).errors);
        setFormErrors(allErrors);
        return allErrors.every(e => Object.keys(e).length === 0);
    };

    const handleBook = async () => {
        if (!validateStep2()) {
            console.log('passengerForms:', passengerForms);
            console.log('Validation failed:', formErrors);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const body = { flightId: flight.id, tripType, passengers, passengerDetails: passengerForms };
            if (tripType === 'ROUND_TRIP') body.returnFlightId = Number(returnFlightId);
            console.log('Sending booking:', body);
            const res = await createBooking(body);
            console.log('Booking response:', res);
            setSuccess(true);
            setTimeout(() => { onBooked(); onClose(); }, 1800);
        } catch (e) {
            console.log('Booking error:', e);
            console.log('Booking error response:', e.response);
            setError(e.response?.data || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-wide">
                <button className="modal-close" onClick={onClose}><X size={16} /></button>

                {/* Step indicator */}
                <div className="modal-steps">
                    <div className={`modal-step ${step >= 1 ? 'active' : ''}`}>
                        <div className="modal-step-dot">{step > 1 ? <Check size={12} /> : '1'}</div>
                        <span>Trip Details</span>
                    </div>
                    <div className="modal-step-line" />
                    <div className={`modal-step ${step >= 2 ? 'active' : ''}`}>
                        <div className="modal-step-dot">2</div>
                        <span>Passengers</span>
                    </div>
                </div>

                <div className="modal-title">
                    {step === 1 ? <>Select <em>Trip</em></> : <>Passenger <em>Details</em></>}
                </div>
                <div className="modal-route">
                    <span>{flight.source}</span>
                    <ArrowRight size={12} style={{ display: 'inline', margin: '0 5px', verticalAlign: 'middle', opacity: 0.5 }} />
                    <span>{flight.destination}</span>
                    <span style={{ opacity: 0.4 }}> · {flight.flightNumber}</span>
                </div>

                {/* ── Step 1: Trip details ── */}
                {step === 1 && (
                    <>
                        <div className="modal-tabs">
                            <div
                                className={`modal-tab ${tripType === 'ONE_WAY' ? 'active' : ''}`}
                                onClick={() => setTripType('ONE_WAY')}
                            >
                                <Plane size={13} /> One Way
                            </div>
                            <div
                                className={`modal-tab ${tripType === 'ROUND_TRIP' ? 'active' : ''}`}
                                onClick={() => setTripType('ROUND_TRIP')}
                            >
                                <ArrowLeftRight size={13} /> Round Trip
                            </div>
                        </div>

                        <div className="modal-field">
                            <label className="modal-label">
                                <span className="modal-label-icon"><Users size={11} /></span> Passengers
                            </label>
                            <CustomSelect
                                value={passengers}
                                onChange={val => handlePassengerCount(Number(val))}
                                options={passengerOptions}
                                fullWidth
                            />
                        </div>

                        {tripType === 'ROUND_TRIP' && (
                            <div className="modal-field">
                                <label className="modal-label">
                                    <span className="modal-label-icon"><RotateCcw size={11} /></span> Return Flight
                                </label>
                                <CustomSelect
                                    value={returnFlightId}
                                    onChange={val => setReturnFlightId(val)}
                                    options={returnFlightOptions}
                                    placeholder="Select return flight…"
                                    fullWidth
                                />
                            </div>
                        )}

                        <div className="modal-summary">
                            <div>
                                <div className="modal-total-lbl">Total</div>
                                <div className="modal-total-sub">
                                    {passengers} pax · {tripType === 'ROUND_TRIP' ? 'return included' : 'one way'}
                                </div>
                            </div>
                            <div className="modal-total">PKR {total.toLocaleString()}</div>
                        </div>

                        {error && (
                            <div className="modal-error"><AlertCircle size={14} /> {error}</div>
                        )}

                        <button className="modal-btn" onClick={() => { if (validateStep1()) setStep(2); }}>
                            Continue <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Passenger Details
                        </button>
                    </>
                )}

                {/* ── Step 2: Passenger details ── */}
                {step === 2 && (
                    <>
                        <div className="modal-scroll">
                            {passengerForms.map((p, i) => (
                                <PassengerForm
                                    key={i}
                                    index={i}
                                    data={p}
                                    onChange={handlePassengerChange}
                                    errors={formErrors[i]}
                                    nationalities={nationalities}
                                    mealPreferences={mealPreferences}
                                />
                            ))}
                        </div>

                        <div className="modal-summary">
                            <div>
                                <div className="modal-total-lbl">Total</div>
                                <div className="modal-total-sub">
                                    {passengers} pax · {tripType === 'ROUND_TRIP' ? 'return included' : 'one way'}
                                </div>
                            </div>
                            <div className="modal-total">PKR {total.toLocaleString()}</div>
                        </div>

                        {error && (
                            <div className="modal-error"><AlertCircle size={14} /> {error}</div>
                        )}

                        {success ? (
                            <div className="modal-success"><Check size={15} /> Booking confirmed!</div>
                        ) : (
                            <div className="modal-btn-row">
                                <button
                                    className="modal-btn-back"
                                    onClick={() => { setStep(1); setError(''); }}
                                >
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <button
                                    className="modal-btn modal-btn-flex"
                                    onClick={handleBook}
                                    disabled={loading}
                                >
                                    {loading
                                        ? <><Loader2 size={14} className="spin" /> Confirming…</>
                                        : 'Confirm Booking'
                                    }
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}