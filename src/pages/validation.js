
export const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
export const FLIGHT_NUM_RE = /^[A-Z0-9]{2,8}$/i;

export function validateEmail(val) {
    if (!val.trim()) return 'Email is required.';
    if (!EMAIL_RE.test(val.trim())) return 'Enter a valid email address.';
    return '';
}

export function validatePasswordPresence(val) {
    if (!val) return 'Password is required.';
    return '';
}

export const STRONG_PASSWORD_RE =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

export function validatePassword(val) {
    if (!val) return 'Password is required.';

    if (!STRONG_PASSWORD_RE.test(val)) {
        return 'Password must be 6+ chars and include uppercase, lowercase, number, and special character.';
    }

    return '';
}

export const STRENGTH_COLORS = {
    danger: 'var(--color-danger)',
    warning: 'var(--color-warning-muted)',
    gold: 'var(--color-gold)',
    success: 'var(--color-success)',
    successStrong: 'var(--color-success-strong)',
};

export function validatePasswordStrength(val) {
    if (!val) return { score: 0, label: '', color: '' };
    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    score = Math.min(score, 4);
    const map = [
        { label: 'Too weak', color: STRENGTH_COLORS.danger },
        { label: 'Weak', color: STRENGTH_COLORS.warning },
        { label: 'Fair', color: STRENGTH_COLORS.gold },
        { label: 'Good', color: STRENGTH_COLORS.success },
        { label: 'Strong', color: STRENGTH_COLORS.successStrong },
    ];
    return { score, ...map[score] };
}

export function validateName(val) {
    if (!val.trim()) return 'Name is required.';
    if (val.trim().length < 2) return 'Name must be at least 2 characters.';
    if (val.trim().length > 60) return 'Name must be 60 characters or fewer.';
    if (!/^[\p{L}\s'\-\.]+$/u.test(val.trim())) return 'Name contains invalid characters.';
    return '';
}

export function validateConfirmPassword(password, confirm) {
    if (!confirm) return 'Please confirm your password.';
    if (password !== confirm) return 'Passwords do not match.';
    return '';
}


export function validateFlightNumber(val) {
    if (!val.trim()) return 'Flight number is required.';
    if (!FLIGHT_NUM_RE.test(val.trim())) return 'Use 2–8 letters/digits (e.g. PK101).';
    return '';
}

export function validateCity(val, label = 'City') {
    if (!val.trim()) return `${label} is required.`;
    if (val.trim().length < 2) return `${label} must be at least 2 characters.`;
    return '';
}

export function validateDeparture(val) {
    if (!val) return 'Departure time is required.';
    if (new Date(val) < new Date()) return 'Departure must be in the future.';
    return '';
}

export function validateArrival(departure, arrival) {
    if (!arrival) return 'Arrival time is required.';
    if (departure && new Date(arrival) <= new Date(departure))
        return 'Arrival must be after departure.';
    return '';
}

export function validateAirline(val) {
    if (!val.trim()) return 'Airline is required.';
    if (val.trim().length < 2) return 'Airline must be at least 2 characters.';
    if (val.trim().length > 60) return 'Airline must be 60 characters or fewer.';
    return '';
}

export function validateBaggageAllowance(val) {
    if (!val.trim()) return 'Baggage allowance is required.';
    if (val.trim().length < 2) return 'Baggage allowance must be at least 2 characters.';
    if (val.trim().length > 30) return 'Baggage allowance must be 30 characters or fewer.';
    return '';
}

export function validateWifiAvailable(val) {
    if (val === '') return 'Please specify if Wi-Fi is available.';
    if (val !== 'true' && val !== 'false') return 'Please select Wifi availability from the given options.';
    return '';
}

export function validateInflightEntertainment(val) {
    if (!val.trim()) return 'In-flight entertainment info is required.';
    if (val.trim().length < 2) return 'In-flight entertainment info must be at least 2 characters.';
    if (val.trim().length > 60) return 'In-flight entertainment info must be 60 characters or fewer.';
    return '';
}

// export function validateCabinClass(val) {
//     if (!val.trim()) return 'Cabin class is required.';
//     if (val.trim().length < 2) return 'Cabin class must be at least 2 characters.';
//     if (val.trim().length > 30) return 'Cabin class must be 30 characters or fewer.';
//     return '';
// }

export function validatemealsIncluded(val) {
    if (val === '') return 'Please specify if meals are included.';
    if (val !== 'true' && val !== 'false') return 'Please select meal inclusion from the given options.';
    return '';
}

export function validateRefundable(val) {
    if (val === '') return 'Please specify if the flight is refundable.';
    if (val !== 'true' && val !== 'false') return 'Please select refundable option from the given options.';
    return '';
}

export function validateSeats(val) {
    const n = parseInt(val);
    if (!val && val !== 0) return 'Seats is required.';
    if (isNaN(n) || n < 1) return 'Seats must be at least 1.';
    if (n > 1000) return 'Seats cannot exceed 1000.';
    return '';
}

export function validateSeatType(val) {
    if (!val.trim()) return 'Seat type is required.';
    if (val.trim().length < 2) return 'Seat type must be at least 2 characters.';
    if (val.trim().length > 30) return 'Seat type must be 30 characters or fewer.';
    return '';
}

export function validatePrice(val) {
    const n = parseFloat(val);
    if (!val && val !== 0) return 'Price is required.';
    if (isNaN(n) || n <= 0) return 'Price must be greater than 0.';
    if (n > 10_000_000) return 'Price seems too high.';
    return '';
}

export const PASSPORT_RE = /^[A-Z0-9]{6,12}$/i;


export function validateFullName(val) {
    if (!val?.trim()) return 'Full name is required.';
    if (val.trim().length < 2) return 'Name must be at least 2 characters.';
    if (val.trim().length > 80) return 'Name must be 80 characters or fewer.';
    if (!/^[\p{L}\s'\-\.]+$/u.test(val.trim())) return 'Name contains invalid characters.';
    return '';
}

export function validatePassportNumber(val) {
    if (!val?.trim()) return 'Passport number is required.';
    if (!PASSPORT_RE.test(val.trim())) return 'Enter a valid passport number (6–12 letters/digits).';
    return '';
}

export function validateNationality(val) {
    if (!val) return 'Please select a nationality.';
    return '';
}

export function validateDateOfBirth(val) {
    if (!val) return 'Date of birth is required.';
    const dob = new Date(val);
    const now = new Date();
    const age = (now - dob) / (1000 * 60 * 60 * 24 * 365.25);
    if (isNaN(dob.getTime())) return 'Enter a valid date.';
    if (dob >= now) return 'Date of birth must be in the past.';
    if (age > 120) return 'Enter a valid date of birth.';
    return '';
}

export function validateGender(val) {
    if (!val) return 'Please select a gender.';
    return '';
}

export const NATIONALITY_TO_COUNTRY = {
    'Pakistani': 'PK',
    'Afghan': 'AF',
    'American': 'US',
    'Australian': 'AU',
    'British': 'GB',
    'Canadian': 'CA',
    'Chinese': 'CN',
    'Dutch': 'NL',
    'Egyptian': 'EG',
    'French': 'FR',
    'German': 'DE',
    'Indian': 'IN',
    'Iranian': 'IR',
    'Italian': 'IT',
    'Japanese': 'JP',
    'Jordanian': 'JO',
    'Korean': 'KR',
    'Malaysian': 'MY',
    'Saudi Arabian': 'SA',
    'South African': 'ZA',
    'Spanish': 'ES',
    'Turkish': 'TR',
    'Emirati': 'AE',
    'Other': null,
};

export const DEFAULT_NATIONALITIES = Object.keys(NATIONALITY_TO_COUNTRY);

export const DEFAULT_MEAL_PREFERENCES = [
    'Standard', 'Vegetarian', 'Vegan', 'Halal', 'Kosher',
    'Gluten Free', 'Diabetic', 'Low Calorie', 'Child Meal',
];

export const COUNTRY_DIAL_HINT = {
    PK: '+92 3XX XXXXXXX',
    AF: '+93 7XX XXXXXXX',
    US: '+1 (XXX) XXX-XXXX',
    AU: '+61 4XX XXX XXX',
    GB: '+44 7XXX XXXXXX',
    CA: '+1 (XXX) XXX-XXXX',
    CN: '+86 1XX XXXX XXXX',
    NL: '+31 6 XXXX XXXX',
    EG: '+20 1XX XXXX XXX',
    FR: '+33 6 XX XX XX XX',
    DE: '+49 1XX XXXXXXXX',
    IN: '+91 XXXXX XXXXX',
    IR: '+98 9XX XXX XXXX',
    IT: '+39 3XX XXX XXXX',
    JP: '+81 9X XXXX XXXX',
    JO: '+962 7X XXX XXXX',
    KR: '+82 1X XXXX XXXX',
    MY: '+60 1X XXXX XXXX',
    SA: '+966 5X XXX XXXX',
    ZA: '+27 6X XXX XXXX',
    ES: '+34 6XX XXX XXX',
    TR: '+90 5XX XXX XXXX',
    AE: '+971 5X XXX XXXX',
};

export function getPhonePlaceholder(nationality) {
    const code = NATIONALITY_TO_COUNTRY[nationality];
    return COUNTRY_DIAL_HINT[code] || '+XX XXXXXXXXXXXX';
}

export function validatePhone(val, nationality) {
    if (!val?.trim()) return 'Phone number is required.';
    const raw = val.trim();
    const digitsOnly = raw.replace(/[\s\-().]/g, '');

    if (!digitsOnly.startsWith('+')) {
        const hint = COUNTRY_DIAL_HINT[NATIONALITY_TO_COUNTRY[nationality]] ?? null;
        return hint
            ? `Phone must include country code. Expected format: ${hint}`
            : 'Phone must start with a country code (e.g. +92…).';
    }

    const digitCount = digitsOnly.slice(1).length;
    if (digitCount < 7 || digitCount > 15) {
        return 'Enter a valid phone number including country code.';
    }

    return '';
}

export async function validatePhoneAsync(val, nationality) {
    if (!val?.trim()) return 'Phone number is required.';
    const raw = val.trim();

    try {
        const { parsePhoneNumberFromString } = await import('libphonenumber-js');
        const countryCode = NATIONALITY_TO_COUNTRY[nationality] ?? undefined;
        const phone = parsePhoneNumberFromString(raw, countryCode);

        if (!phone || !phone.isValid()) {
            const hint = countryCode ? COUNTRY_DIAL_HINT[countryCode] : null;
            return hint
                ? `Invalid phone number for ${nationality}. Expected format: ${hint}`
                : 'Enter a valid international phone number.';
        }
        return '';
    } catch {
        return validatePhone(val, nationality);
    }
}

export function validateMealPreference(val) {
    if (!val) return 'Please select a meal preference.';
    return '';
}

export function validatePassenger(p) {
    return runValidators({
        fullName: validateFullName(p.fullName),
        passportNumber: validatePassportNumber(p.passportNumber),
        nationality: validateNationality(p.nationality),
        dateOfBirth: validateDateOfBirth(p.dateOfBirth),
        gender: validateGender(p.gender),
        phone: validatePhone(p.phone, p.nationality),
        mealPreference: validateMealPreference(p.mealPreference),
    });
}
export function runValidators(validators) {
    const errors = {};
    for (const [field, msg] of Object.entries(validators)) {
        if (msg) errors[field] = msg;
    }
    return { errors, isValid: Object.keys(errors).length === 0 };
}