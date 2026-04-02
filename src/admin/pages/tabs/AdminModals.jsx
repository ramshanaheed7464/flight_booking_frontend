import { useState } from 'react';
import { X, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { addFlight, updateFlight } from '../../../api/flightApi';
import {
    validateFlightNumber, validateCity, validateDeparture,
    validateArrival, validateSeats, validatePrice, runValidators,
    validateBaggageAllowance, validateWifiAvailable,
    validateInflightEntertainment,
    validatemealsIncluded, validateRefundable, validateSeatType,
    validateAirline
} from '../../../pages/validation';

const EMPTY_FLIGHT = {
    flightNumber: '', source: '', destination: '',
    departureTime: '', arrivalTime: '', seatsAvailable: '', price: '',
    meals: '', airline: '', wifiAvailable: '', inflightEntertainment: '',
    // layover: '', stopovers: '', cabinClass: '',
    baggageAllowance: '',
    isEntertainmentAvailable: '', seatType: '', mealsIncluded: '', refundable: '',
};

export function FlightModal({ flight, onClose, onSaved }) {
    const isEdit = !!flight?.id;

    const [form, setForm] = useState(isEdit ? {
        flightNumber: flight.flightNumber || '',
        source: flight.source || '',
        destination: flight.destination || '',
        departureTime: flight.departureTime ? flight.departureTime.slice(0, 16) : '',
        arrivalTime: flight.arrivalTime ? flight.arrivalTime.slice(0, 16) : '',
        seatsAvailable: flight.seatsAvailable ?? '',
        price: flight.price ?? '',
        meals: flight.meals ?? '',
        airline: flight.airline ?? '',
        wifiAvailable: flight.wifiAvailable !== undefined ? String(flight.wifiAvailable) : '',
        inflightEntertainment: flight.inFlightEntertainment ?? '',
        // cabinClass: flight.cabinClass ?? '',
        // layover: flight.layover ?? '',
        // stopovers: flight.stopovers ?? '',
        baggageAllowance: flight.baggageAllowance ?? '',
        seatType: flight.seatType ?? '',
        mealsIncluded: flight.mealsIncluded !== undefined ? String(flight.mealsIncluded) : '',
        refundable: flight.refundable !== undefined ? String(flight.refundable) : '',
        isEntertainmentAvailable: flight.isEntertainmentAvailable !== undefined ? String(flight.isEntertainmentAvailable) : '',
    } : { ...EMPTY_FLIGHT });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const handle = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => runValidators({
        flightNumber: validateFlightNumber(form.flightNumber),
        airline: validateAirline(form.airline),
        price: validatePrice(form.price),
        source: validateCity(form.source, 'Origin'),
        destination: validateCity(form.destination, 'Destination'),
        departureTime: validateDeparture(form.departureTime),
        arrivalTime: validateArrival(form.departureTime, form.arrivalTime),
        baggageAllowance: validateBaggageAllowance(form.baggageAllowance),
        wifiAvailable: validateWifiAvailable(form.wifiAvailable),
        inflightEntertainment: validateInflightEntertainment(form.inflightEntertainment),
        // cabinClass: validateCabinClass(form.cabinClass),
        mealsIncluded: validatemealsIncluded(form.mealsIncluded),
        refundable: validateRefundable(form.refundable),
        seatsAvailable: validateSeats(form.seatsAvailable),
        seatType: validateSeatType(form.seatType),
    });

    const handleSubmit = async () => {
        setServerError('');
        const { errors: fieldErrors, isValid } = validate();
        if (!isValid) { setErrors(fieldErrors); return; }

        const parsedPrice = parseFloat(form.price);
        const parsedSeats = parseInt(form.seatsAvailable, 10);

        if (isNaN(parsedPrice) || isNaN(parsedSeats)) {
            setErrors(prev => ({
                ...prev,
                ...(isNaN(parsedPrice) ? { price: 'Price must be a valid number.' } : {}),
                ...(isNaN(parsedSeats) ? { seatsAvailable: 'Seats must be a valid integer.' } : {}),
            }));
            return;
        }

        setLoading(true);
        try {
            const payload = {
                flightNumber: form.flightNumber.trim().toUpperCase(),
                price: parsedPrice,
                airline: form.airline?.trim() || null,
                wifiAvailable: form.wifiAvailable === 'true',
                mealsIncluded: form.mealsIncluded === 'true',
                refundable: form.refundable === 'true',
                entertainmentAvailable: form.isEntertainmentAvailable === 'true',
                inFlightEntertainment: form.inflightEntertainment?.trim() || null,
                baggageAllowance: form.baggageAllowance?.trim() || null,
                source: form.source.trim(),
                destination: form.destination.trim(),
                departureTime: form.departureTime,
                arrivalTime: form.arrivalTime,
                duration: (form.departureTime && form.arrivalTime)
                    ? Math.round((new Date(form.arrivalTime) - new Date(form.departureTime)) / 60000)
                    : null,
                seatsAvailable: parsedSeats,
                seatType: form.seatType?.trim() || null,
                meals: form.meals?.trim() || null,
            };

            if (isEdit) {
                await updateFlight(flight.id, payload);
            } else {
                await addFlight(payload);
            }

            onSaved();
            onClose();
        } catch (e) {
            setServerError(e.response?.data || 'Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="ap-modal">
                <button className="ap-modal-close" onClick={onClose}><X size={16} /></button>
                <div className="ap-modal-title">{isEdit ? 'Edit' : 'Add'} <em>Flight</em></div>
                <div className="ap-modal-sub">
                    {isEdit ? `Editing flight #${flight.id}` : 'Add a new flight to the system'}
                </div>

                <div className="ap-form-row">
                    <Field label="Flight Number" error={errors.flightNumber}>
                        <input className={`ap-form-input${errors.flightNumber ? ' ap-input-err' : ''}`} name="flightNumber" placeholder="e.g. PK101" value={form.flightNumber} onChange={handle} />
                    </Field>
                    <Field label="Airline" error={errors.airline}>
                        <input className={`ap-form-input${errors.airline ? ' ap-input-err' : ''}`} name="airline" value={form.airline} onChange={handle} placeholder="e.g. PIA" />
                    </Field>

                </div>

                <div className="ap-form-row">
                    {/* <Field label="Cabin Class" error={errors.seatType}>
                        <select name="seatType" value={form.seatType} onChange={handle} className={`ap-form-input${errors.seatType ? ' ap-input-err' : ''}`}>
                            <option value="">Select</option>
                            <option value="economy">Economy</option>
                            <option value="business">Business</option>
                            <option value="first">First</option>
                        </select>
                    </Field> */}

                    <Field label="Wi-Fi Available" error={errors.wifiAvailable}>
                        <select name="wifiAvailable" value={form.wifiAvailable} onChange={handle} className={`ap-form-input${errors.wifiAvailable ? ' ap-input-err' : ''}`}>
                            <option value="">Select</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </Field>
                    <Field label="Baggage Allowance" error={errors.baggageAllowance}>
                        <input className={`ap-form-input${errors.baggageAllowance ? ' ap-input-err' : ''}`} name="baggageAllowance" value={form.baggageAllowance} onChange={handle} placeholder="e.g. 20 kg" />
                    </Field>
                </div>

                <div className="ap-form-row">
                    <Field label="Entertainment Available" error={errors.isEntertainmentAvailable}>
                        <select name="isEntertainmentAvailable" value={form.isEntertainmentAvailable} onChange={handle} className={`ap-form-input${errors.isEntertainmentAvailable ? ' ap-input-err' : ''}`}>
                            <option value="">Select</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </Field>
                    <Field label="In-Flight Entertainment" error={errors.inflightEntertainment}>
                        <input className="ap-form-input"
                            name="inflightEntertainment"
                            placeholder="e.g. Movies, TV Shows, Music"
                            value={form.inflightEntertainment}
                            onChange={handle}
                            disabled={form.isEntertainmentAvailable !== 'true'}
                            style={form.isEntertainmentAvailable === 'true' ? {} : { backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }} />
                    </Field>
                </div>

                <div className="ap-form-row">
                    <Field label="Origin City" error={errors.source}>
                        <input className={`ap-form-input${errors.source ? ' ap-input-err' : ''}`} name="source" placeholder="e.g. Karachi" value={form.source} onChange={handle} />
                    </Field>
                    <Field label="Destination City" error={errors.destination}>
                        <input className={`ap-form-input${errors.destination ? ' ap-input-err' : ''}`} name="destination" placeholder="e.g. Lahore" value={form.destination} onChange={handle} />
                    </Field>
                </div>

                <div className="ap-form-row">
                    <Field label="Departure" error={errors.departureTime}>
                        <input className={`ap-form-input${errors.departureTime ? ' ap-input-err' : ''}`} name="departureTime" type="datetime-local" value={form.departureTime} onChange={handle} style={{ colorScheme: 'dark' }} />
                    </Field>
                    <Field label="Arrival" error={errors.arrivalTime}>
                        <input className={`ap-form-input${errors.arrivalTime ? ' ap-input-err' : ''}`} name="arrivalTime" type="datetime-local" value={form.arrivalTime} onChange={handle} style={{ colorScheme: 'dark' }} />
                    </Field>
                </div>

                <div className="ap-form-row">
                    <Field label="Seat Type" error={errors.seatType}>
                        <input name="seatType" value={form.seatType} onChange={handle} className={`ap-form-input${errors.seatType ? ' ap-input-err' : ''}`} placeholder="e.g. Window, Aisle" />
                    </Field>
                    <Field label="Seats Available" error={errors.seatsAvailable}>
                        <input className={`ap-form-input${errors.seatsAvailable ? ' ap-input-err' : ''}`} name="seatsAvailable" type="number" min="1" max="1000" placeholder="e.g. 180" value={form.seatsAvailable} onChange={handle} />
                    </Field>
                </div>

                <Field label="Meals Included" error={errors.mealsIncluded}>
                    <select name="mealsIncluded" value={form.mealsIncluded} onChange={handle} className={`ap-form-input${errors.mealsIncluded ? ' ap-input-err' : ''}`}>
                        <option value="">Select</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </Field>

                <div className="ap-form-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="ap-form-label">
                        Meal Options{' '}
                        <span style={{ fontWeight: 400, opacity: 0.5, fontSize: '0.75rem' }}>
                            (comma-separated, e.g. Standard, Vegetarian, Halal)
                        </span>
                    </label>
                    <input
                        className="ap-form-input"
                        name="meals"
                        placeholder="e.g. Standard, Vegetarian, Halal, Vegan"
                        value={form.meals}
                        onChange={handle}
                        disabled={form.mealsIncluded !== 'true'}
                        style={form.mealsIncluded === 'true' ? {} : { backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
                    />
                </div>

                <div className="ap-form-row">
                    <Field label="Refundable" error={errors.refundable}>
                        <select name="refundable" value={form.refundable} onChange={handle} className={`ap-form-input${errors.refundable ? ' ap-input-err' : ''}`}>
                            <option value="">Select</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </Field>
                    <Field label="Price (PKR)" error={errors.price}>
                        <input className={`ap-form-input${errors.price ? ' ap-input-err' : ''}`} name="price" type="number" min="1" placeholder="e.g. 15000" value={form.price} onChange={handle} />
                    </Field>
                </div>

                {serverError && (
                    <div className="ap-modal-error"><AlertCircle size={13} />{serverError}</div>
                )}

                <div className="ap-modal-actions">
                    <button className="ap-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="ap-modal-submit" onClick={handleSubmit} disabled={loading}>
                        {loading
                            ? <><Loader2 size={13} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Saving…</>
                            : isEdit ? 'Update Flight' : 'Add Flight'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

export function DeleteModal({ label, onClose, onConfirm }) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm();
        setLoading(false);
    };

    return (
        <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="ap-modal" style={{ maxWidth: 380 }}>
                <button className="ap-modal-close" onClick={onClose}><X size={16} /></button>
                <div className="ap-modal-title">Confirm <em>Delete</em></div>
                <div className="ap-modal-sub">This action cannot be undone.</div>
                <p className="ap-confirm-text">
                    Are you sure you want to delete <strong>{label}</strong>?
                    {label?.includes('booking') && ' Seats will be restored if it was active.'}
                </p>
                <div className="ap-modal-actions">
                    <button className="ap-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="ap-del-confirm-btn" onClick={handleConfirm} disabled={loading}>
                        {loading
                            ? <><Loader2 size={13} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Deleting…</>
                            : <><Trash2 size={13} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Delete</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="ap-form-field">
            <label className="ap-form-label">{label}</label>
            {children}
            {error && <span className="ap-field-err">{error}</span>}
        </div>
    );
}