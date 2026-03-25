import { useState, useEffect } from 'react';
import { Plane, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { validatePassword, validateConfirmPassword, validatePasswordStrength, runValidators } from './validation';
import { resetPassword } from '../api/authApi';
import './Auth.css';
import './ForgotPassword.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [form, setForm] = useState({ password: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    const strength = validatePasswordStrength(form.password);

    useEffect(() => {
        if (!token) setTokenValid(false);
    }, [token]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => runValidators({
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
            await resetPassword({ token, newPassword: form.password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const msg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || 'Failed to reset password.';

            if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
                setTokenValid(false);
            } else {
                setServerError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="auth-root">
                <div className="auth-bg" />
                <div className="auth-grid" />
                <div className="auth-card">
                    <div className="auth-logo">
                        <Plane size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                        {' '}<span>Aero</span>Link
                    </div>
                    <div className="fp-invalid">
                        <div className="fp-invalid-icon"><XCircle size={36} /></div>
                        <div className="fp-invalid-title">Link expired or invalid</div>
                        <p className="fp-invalid-sub">
                            This password reset link has expired or has already been used.
                            Request a new one below.
                        </p>
                        <Link to="/forgot-password" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            Request New Link
                        </Link>
                    </div>
                    <div className="auth-divider" />
                    <div className="auth-footer">
                        Remember your password? <Link to="/login">Back to login</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-root">
                <div className="auth-bg" />
                <div className="auth-grid" />
                <div className="auth-card">
                    <div className="auth-logo">
                        <Plane size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                        {' '}<span>Aero</span>Link
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <CheckCircle size={40} style={{ color: 'var(--color-success)', marginBottom: '1rem' }} />
                        <h1 className="auth-title">Password <em>Reset!</em></h1>
                        <p className="auth-sub" style={{ marginBottom: '1.5rem' }}>
                            Your password has been changed successfully.
                            Redirecting you to login…
                        </p>
                        <Link to="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-root">
            <div className="auth-bg" />
            <div className="auth-grid" />
            <div className="auth-card">
                <div className="auth-logo">
                    <Plane size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                    {' '}<span>Aero</span>Link
                </div>

                <h1 className="auth-title">Reset <em>Password</em></h1>
                <p className="auth-sub">Enter your new password below.</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label className="auth-label">New Password</label>
                        <div className="fp-input-wrap">
                            <input
                                className={`auth-input${errors.password ? ' auth-input-err' : ''}`}
                                type={showPw ? 'text' : 'password'}
                                name="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                style={{ paddingRight: '2.75rem' }}
                                autoFocus
                            />
                            <button type="button" className="fp-eye-btn" onClick={() => setShowPw(v => !v)}>
                                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.password && <span className="auth-field-err">{errors.password}</span>}
                    </div>

                    {form.password && (
                        <div className="fp-strength">
                            <div className="fp-strength-bar">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="fp-strength-seg" style={{
                                        background: i <= strength.score ? strength.color : undefined,
                                        opacity: i <= strength.score ? 1 : 0.18,
                                    }} />
                                ))}
                            </div>
                            <span className="fp-strength-label" style={{ color: strength.color }}>
                                {strength.label}
                            </span>
                        </div>
                    )}

                    <div className="auth-field">
                        <label className="auth-label">Confirm Password</label>
                        <div className="fp-input-wrap">
                            <input
                                className={`auth-input${errors.confirm ? ' auth-input-err' : ''}`}
                                type={showConfirm ? 'text' : 'password'}
                                name="confirm"
                                placeholder="Repeat new password"
                                value={form.confirm}
                                onChange={handleChange}
                                autoComplete="new-password"
                                style={{
                                    paddingRight: '2.75rem',
                                    borderColor: form.confirm && form.password !== form.confirm
                                        ? 'var(--color-danger-input-border)' : undefined,
                                }}
                            />
                            <button type="button" className="fp-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        {errors.confirm && <span className="auth-field-err">{errors.confirm}</span>}
                    </div>

                    {serverError && <div className="auth-error">{serverError}</div>}

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? 'Resetting…' : 'Reset Password'}
                    </button>
                </form>

                <div className="auth-divider" />
                <div className="auth-footer">
                    Remember your password? <Link to="/login">Back to login</Link>
                </div>
            </div>
        </div>
    );
}