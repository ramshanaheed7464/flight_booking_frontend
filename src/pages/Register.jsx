import { useState, useContext } from 'react';
import { Plane } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    validateName, validateEmail, validatePassword,
    validateConfirmPassword, validatePasswordStrength, runValidators,
} from './validation';
import './Auth.css';

export default function Register() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const strength = validatePasswordStrength(form.password);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => runValidators({
        name: validateName(form.name),
        email: validateEmail(form.email),
        password: validatePassword(form.password),
        confirm: validateConfirmPassword(form.password, form.confirm),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        const { errors: fieldErrors, isValid } = validate();
        if (!isValid) { setErrors(fieldErrors); return; }
        setLoading(true);
        try {
            await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
            navigate('/verify-email', { state: { email: form.email.trim() } });
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                (typeof err.response?.data === 'string' ? err.response.data : null) ||
                (err.message === 'Network Error' ? 'Cannot reach server — is your backend running?' : null) ||
                `Registration failed (${err.response?.status ?? 'no response'})`;
            setServerError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="auth-bg" />
            <div className="auth-grid" />
            <div className="auth-card">
                <div className="auth-logo">
                    <Plane size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                    {' '}<span>Aero</span>Link
                </div>
                <h1 className="auth-title">Join <em>AeroLink.</em></h1>
                <p className="auth-sub">Create your account and start booking flights today.</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label className="auth-label">Full Name</label>
                        <input
                            className={`auth-input${errors.name ? ' auth-input-err' : ''}`}
                            type="text" name="name" placeholder="John Doe"
                            value={form.name} onChange={handleChange} autoComplete="name"
                        />
                        {errors.name && <span className="auth-field-err">{errors.name}</span>}
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <input
                            className={`auth-input${errors.email ? ' auth-input-err' : ''}`}
                            type="email" name="email" placeholder="you@example.com"
                            value={form.email} onChange={handleChange} autoComplete="email"
                        />
                        {errors.email && <span className="auth-field-err">{errors.email}</span>}
                    </div>

                    <div className="auth-row">
                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <input
                                className={`auth-input${errors.password ? ' auth-input-err' : ''}`}
                                type="password" name="password" placeholder="Min. 6 characters"
                                value={form.password} onChange={handleChange} autoComplete="new-password"
                            />
                            {errors.password && <span className="auth-field-err">{errors.password}</span>}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Confirm</label>
                            <input
                                className={`auth-input${errors.confirm ? ' auth-input-err' : ''}`}
                                type="password" name="confirm" placeholder="Repeat password"
                                value={form.confirm} onChange={handleChange} autoComplete="new-password"
                            />
                            {errors.confirm && <span className="auth-field-err">{errors.confirm}</span>}
                        </div>
                    </div>

                    {form.password && (
                        <div className="auth-strength">
                            <div className="auth-strength-bar">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="auth-strength-seg" style={{
                                        background: i <= strength.score ? strength.color : undefined,
                                        opacity: i <= strength.score ? 1 : 0.18,
                                    }} />
                                ))}
                            </div>
                            <span className="auth-strength-label" style={{ color: strength.color }}>
                                {strength.label}
                            </span>
                        </div>
                    )}

                    {serverError && <div className="auth-error">{serverError}</div>}

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? 'Sending code…' : 'Continue'}
                    </button>
                </form>

                <div className="auth-divider" />
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}