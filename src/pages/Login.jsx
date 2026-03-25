import { useState, useContext } from 'react';
import { Plane } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { validateEmail, validatePasswordPresence, runValidators } from './validation';
import './Auth.css';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => runValidators({
        email: validateEmail(form.email),
        password: validatePasswordPresence(form.password),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        const { errors: fieldErrors, isValid } = validate();
        if (!isValid) { setErrors(fieldErrors); return; }
        setLoading(true);
        try {
            await login({ email: form.email.trim(), password: form.password });
            navigate('/flights');
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data === 'EMAIL_NOT_VERIFIED') {
                navigate('/verify-email', { state: { email: form.email.trim() } });
                return;
            }
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                (typeof err.response?.data === 'string' ? err.response.data : null) ||
                (err.message === 'Network Error' ? 'Cannot reach server — is your backend running?' : null) ||
                `Login failed (${err.response?.status ?? 'no response'})`;
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
                <h1 className="auth-title">Welcome <em>back.</em></h1>
                <p className="auth-sub">Sign in to access your bookings and flights.</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <input
                            className={`auth-input${errors.email ? ' auth-input-err' : ''}`}
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                        {errors.email && <span className="auth-field-err">{errors.email}</span>}
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input
                            className={`auth-input${errors.password ? ' auth-input-err' : ''}`}
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        {errors.password && <span className="auth-field-err">{errors.password}</span>}
                    </div>

                    {serverError && <div className="auth-error">{serverError}</div>}

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider" />
                <div className="auth-footer">
                    <Link to="/forgot-password" style={{ color: 'var(--color-text-dim)' }}>Forgot password?</Link>
                    {' · '}
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}