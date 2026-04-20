import { useState } from 'react';
import {
    X, Check, ChevronRight, ArrowLeft, Loader2, AlertCircle,
    Plane, Users,
} from 'lucide-react';
import { firstSegment, lastSegment, stopCount, parseDuration } from '../api/duffelApi';
import { createDuffelBooking } from '../api/bookingApi';
import { NATIONALITY_TO_COUNTRY, DEFAULT_NATIONALITIES, DEFAULT_MEAL_PREFERENCES } from '../pages/validation';
import {
    validateFullName, validatePassportNumber, validatePassportExpiry,
    validateAdultDateOfBirth, validateNationality, validateGender,
    validatePhone, validateEmail, runValidators,
} from '../pages/validation';
import { formatTime, formatShortDate, formatLongDate } from '../utils/dateFormat';
import PassengerForm from '../pages/PassengerForm';
import CustomSelect from './CustomSelect';
import '../styles/components.css';
import '../pages/BookingModal.css';
import '../pages/FlightDetailModal.css';

const adultOptions = (offer) => {
    const max = offer?.passengers?.length ?? 1;
    return Array.from({ length: max }, (_, i) => i + 1).map(n => ({
        value: n,
        label: `${n} Traveler${n > 1 ? 's' : ''}`,
    }));
};

const emptyPassenger = () => ({
    fullName: '', email: '', passportNumber: '', passportExpiry: '',
    nationality: '', dateOfBirth: '', gender: '', phone: '', mealPreference: '',
});

function validateDuffelPassenger(p, departureDate) {
    return runValidators({
        fullName: validateFullName(p.fullName),
        email: validateEmail(p.email),
        passportNumber: validatePassportNumber(p.passportNumber, p.nationality),
        passportExpiry: validatePassportExpiry(p.passportExpiry, departureDate),
        nationality: validateNationality(p.nationality),
        dateOfBirth: validateAdultDateOfBirth(p.dateOfBirth),
        gender: validateGender(p.gender),
        phone: validatePhone(p.phone, p.nationality),
    });
}

function toE164(phone) {
    return phone.trim().replace(/[\s\-().]/g, '');
}

function buildOrderPayload(offer, passengerForms) {
    const passengers = passengerForms.map((p, i) => {
        const parts = p.fullName.trim().split(/\s+/);
        const given_name = parts.slice(0, -1).join(' ') || parts[0];
        const family_name = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        const countryCode = NATIONALITY_TO_COUNTRY[p.nationality] ?? null;

        const passenger = {
            id: offer.passengers?.[i]?.id,
            title: p.gender === 'Female' ? 'ms' : 'mr',
            given_name,
            family_name,
            gender: p.gender === 'Female' ? 'f' : 'm',
            born_on: p.dateOfBirth,
            email: p.email,
            phone_number: toE164(p.phone),
        };

        if (countryCode) {
            passenger.identity_documents = [{
                unique_identifier: p.passportNumber.toUpperCase(),
                expires_on: p.passportExpiry,
                issuing_country_code: countryCode,
                nationality: countryCode,
                type: 'passport',
            }];
        }

        return passenger;
    });

    return {
        offerId: offer.id,
        currency: offer.total_currency,
        amount: offer.total_amount,
        passengers,
    };
}

function parseDuffelError(msg) {
    if (!msg) return 'Booking failed. Please try again.';
    if (/phone_number/i.test(msg))
        return 'Phone number is invalid. Make sure it includes the country code (e.g. +923001234567) with no spaces.';
    if (/passport|identity_document|unique_identifier/i.test(msg))
        return 'Passport details are invalid. Please check the passport number and expiry date.';
    if (/expires_on|expiry/i.test(msg))
        return 'Passport expiry date is invalid or too soon for this route.';
    if (/born_on|date_of_birth/i.test(msg))
        return 'Date of birth is invalid.';
    if (/offer.*expired|no longer available/i.test(msg))
        return 'This offer has expired. Please go back and search again for fresh results.';
    if (/balance|payment/i.test(msg))
        return 'Payment could not be processed. Please check your Duffel account balance.';
    if (/passenger.*id/i.test(msg))
        return 'Passenger count mismatch. Please close and reopen the booking form.';
    return msg;
}

export default function DuffelBookingModal({ offer, onClose, onBooked }) {
    const dep = firstSegment(offer);
    const arr = lastSegment(offer);
    const stops = stopCount(offer);
    const duration = parseDuration(offer?.slices?.[0]?.duration);
    const carrier = dep?.marketing_carrier ?? {};
    const flightNum = dep ? `${carrier.iata_code ?? ''}${dep.marketing_carrier_flight_number ?? ''}` : '—';
    const stopLabel = stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`;
    const departureDate = dep?.departing_at ?? null;

    const [step, setStep] = useState(1);
    const [adults, setAdults] = useState(1);
    const [passengerForms, setPassengerForms] = useState([emptyPassenger()]);
    const [formErrors, setFormErrors] = useState([{}]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [bookingRef, setBookingRef] = useState(null);

    const pricePerTraveler = Number(offer.total_amount ?? 0);
    const total = pricePerTraveler * adults;
    const currency = offer.total_currency ?? 'USD';

    const handleAdultChange = (n) => {
        setAdults(n);
        setPassengerForms(prev => {
            const a = [...prev];
            while (a.length < n) a.push(emptyPassenger());
            return a.slice(0, n);
        });
        setFormErrors(prev => {
            const a = [...prev];
            while (a.length < n) a.push({});
            return a.slice(0, n);
        });
    };

    const handleChange = (idx, key, val) => {
        setPassengerForms(prev => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));
        setFormErrors(prev => prev.map((e, i) => i === idx ? { ...e, [key]: '' } : e));
    };

    const handleBook = async () => {
        const allErrors = passengerForms.map(p => validateDuffelPassenger(p, departureDate).errors);
        setFormErrors(allErrors);
        if (allErrors.some(e => Object.keys(e).length > 0)) return;

        const offerSlots = offer?.passengers?.length ?? 0;
        if (passengerForms.length > offerSlots) {
            setError(
                `This offer only has ${offerSlots} passenger slot${offerSlots !== 1 ? 's' : ''}. ` +
                `Please go back to the flight search, reduce travelers to ${offerSlots}, and search again.`
            );
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Spring backend calls Duffel, saves to DB, and sends confirmation email
            const payload = buildOrderPayload(offer, passengerForms);
            const res = await createDuffelBooking(payload);
            const booking = res.data;
            const reference = booking?.bookingReference ?? booking?.duffelOrderId ?? 'CONFIRMED';

            setBookingRef(reference);
            setTimeout(() => { onBooked?.(); onClose(); }, 4000);
        } catch (e) {
            const msg = e.response?.data?.message ?? e.response?.data ?? e.message;
            setError(parseDuffelError(String(msg)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-wide">
                <button className="modal-close" onClick={onClose}><X size={16} /></button>

                <div className="modal-steps">
                    <div className={`modal-step ${step >= 1 ? 'active' : ''}`}>
                        <div className="modal-step-dot">{step > 1 ? <Check size={12} /> : '1'}</div>
                        <span>Flight Details</span>
                    </div>
                    <div className="modal-step-line" />
                    <div className={`modal-step ${step >= 2 ? 'active' : ''}`}>
                        <div className="modal-step-dot">2</div>
                        <span>Passengers</span>
                    </div>
                </div>

                <div className="modal-title">
                    {step === 1 ? <>Flight <em>Summary</em></> : <>Passenger <em>Details</em></>}
                </div>

                {step === 1 && (
                    <>
                        <div className="fdm-header" style={{ borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }}>
                            <div className="fdm-header-top">
                                <span className="fdm-airline">{carrier.name ?? carrier.iata_code}</span>
                                <span className="fdm-fn">{flightNum}</span>
                            </div>
                            <div className="fdm-route-hero">
                                <div className="fdm-city-block">
                                    <div className="fdm-city-code">{dep?.origin?.iata_code}</div>
                                    <div className="fdm-city-time">{formatTime(dep?.departing_at)}</div>
                                    <div className="fdm-city-date">{formatLongDate(dep?.departing_at)}</div>
                                </div>
                                <div className="fdm-route-mid">
                                    <div className="fdm-route-line">
                                        <div className="fdm-route-dot" />
                                        <div className="fdm-route-track">
                                            <Plane size={18} className="fdm-plane-icon" />
                                        </div>
                                        <div className="fdm-route-dot" />
                                    </div>
                                    {duration && <div className="fdm-duration-badge">{duration} · {stopLabel}</div>}
                                </div>
                                <div className="fdm-city-block fdm-city-right">
                                    <div className="fdm-city-code">{arr?.destination?.iata_code}</div>
                                    <div className="fdm-city-time">{formatTime(arr?.arriving_at)}</div>
                                    <div className="fdm-city-date">{formatLongDate(arr?.arriving_at)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-field">
                            <label className="modal-label">
                                <span className="modal-label-icon"><Users size={11} /></span> Travelers
                            </label>
                            <CustomSelect
                                value={adults}
                                onChange={val => handleAdultChange(Number(val))}
                                options={adultOptions(offer)}
                                fullWidth
                            />
                        </div>

                        <div className="modal-summary">
                            <div>
                                <div className="modal-total-lbl">Total</div>
                                <div className="modal-total-sub">{adults} traveler{adults > 1 ? 's' : ''} · one way</div>
                            </div>
                            <div className="modal-total">
                                {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                        </div>

                        <button className="modal-btn" onClick={() => setStep(2)}>
                            Continue <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Passenger Details
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="modal-scroll">
                            {passengerForms.map((p, i) => (
                                <PassengerForm
                                    key={i}
                                    index={i}
                                    data={p}
                                    onChange={handleChange}
                                    errors={formErrors[i]}
                                    nationalities={DEFAULT_NATIONALITIES}
                                    mealPreferences={DEFAULT_MEAL_PREFERENCES}
                                    showPassportExpiry
                                    showEmail
                                    departureDate={departureDate}
                                />
                            ))}
                        </div>

                        <div className="modal-summary">
                            <div>
                                <div className="modal-total-lbl">Total</div>
                                <div className="modal-total-sub">{adults} traveler{adults > 1 ? 's' : ''} · one way</div>
                            </div>
                            <div className="modal-total">
                                {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </div>
                        </div>

                        {error && (
                            <div className="modal-error">
                                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>{error}</span>
                            </div>
                        )}

                        {bookingRef ? (
                            <div className="modal-success">
                                <Check size={15} /> Booking confirmed!
                                <span className="dbm-ref"> Ref: {bookingRef}</span>
                                <p className="dbm-email-note">
                                    A confirmation email has been sent to each passenger's email address.
                                </p>
                            </div>
                        ) : (
                            <div className="modal-btn-row">
                                <button className="modal-btn-back" onClick={() => { setStep(1); setError(''); }}>
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <button className="modal-btn modal-btn-flex" onClick={handleBook} disabled={loading}>
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
