import { User, BookOpen, Globe, Phone, Utensils, Users, AlertCircle } from 'lucide-react';
import { getPhonePlaceholder } from './validation';
import CustomSelect from '../components/CustomSelect';

export default function PassengerForm({ index, data, onChange, errors, nationalities, mealPreferences }) {

    const toOptions = (list) =>
        list.map(o => {
            const val = typeof o === 'object' ? o.name : o;
            const id = typeof o === 'object' ? (o.id ?? o.name) : o;
            return { value: val, label: val, id };
        });

    const field = (key, label, type = 'text', opts = {}) => (
        <div className={`modal-field${opts.fullWidth ? ' modal-field-full' : ''}`}>
            <label className="modal-label">
                {opts.icon && <span className="modal-label-icon">{opts.icon}</span>}
                {label}
            </label>

            {type === 'select' ? (
                <>
                    <CustomSelect
                        value={data[key]}
                        onChange={val => onChange(index, key, val)}
                        options={toOptions(opts.options)}
                        placeholder="Select…"
                        fullWidth
                        maxItems={opts.maxItems ?? 6}
                        className={errors?.[key] ? 'is-error' : ''}
                    />
                    {errors?.[key] && (
                        <span className="modal-field-err">
                            <AlertCircle size={11} /> {errors[key]}
                        </span>
                    )}
                </>
            ) : (
                <>
                    <input
                        className={`modal-input${errors?.[key] ? ' is-error' : ''}`}
                        type={type}
                        placeholder={opts.placeholder || ''}
                        value={data[key]}
                        onChange={e => onChange(index, key, e.target.value)}
                        style={type === 'date' ? { colorScheme: 'dark' } : {}}
                    />
                    {errors?.[key] && (
                        <span className="modal-field-err">
                            <AlertCircle size={11} /> {errors[key]}
                        </span>
                    )}
                </>
            )}
        </div>
    );

    return (
        <div className="modal-passenger">
            <div className="modal-passenger-title">
                <User size={13} className="modal-passenger-icon" />
                <span className="modal-passenger-num">Passenger {index + 1}</span>
                <span className="modal-passenger-sub">Travel &amp; identity information</span>
            </div>

            <div className="modal-passenger-section-label"><BookOpen size={10} /> Identity</div>
            <div className="modal-passenger-grid">
                {field('fullName', 'Full Name', 'text', { placeholder: 'As on passport', fullWidth: true, icon: <User size={11} /> })}
                {field('passportNumber', 'Passport No.', 'text', { placeholder: 'e.g. AA1234567', icon: <BookOpen size={11} /> })}
                {field('nationality', 'Nationality', 'select', { options: nationalities, icon: <Globe size={11} />, maxItems: 6 })}
                {field('dateOfBirth', 'Date of Birth', 'date', { icon: <Users size={11} /> })}
                {field('gender', 'Gender', 'select', { options: ['Male', 'Female', 'Other'], icon: <Users size={11} />, maxItems: 3 })}
            </div>

            <div className="modal-passenger-section-label"><Phone size={10} /> Contact</div>
            <div className="modal-passenger-grid">
                {field('phone', 'Phone Number', 'tel', { placeholder: getPhonePlaceholder(data.nationality), icon: <Phone size={11} /> })}
            </div>

            <div className="modal-passenger-section-label"><Utensils size={10} /> Preferences</div>
            <div className="modal-passenger-grid">
                {field('mealPreference', 'Meal Preference', 'select', { options: mealPreferences, fullWidth: true, icon: <Utensils size={11} />, maxItems: 5 })}
            </div>
        </div>
    );
}