import { useState } from 'react';
import { Plane, Mail, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateEmail, runValidators } from './validation';
import { forgotPassword } from '../api/authApi';
import './Auth.css';
import './ForgotPassword.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => runValidators({ email: validateEmail(email) });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setMessage('');

        const { errors: fieldErrors, isValid } = validate();
        if (!isValid) { setErrors(fieldErrors); return; }

        setLoading(true);
        try {
            await forgotPassword({ email: email.trim() });
            setMessage('If an account with that email exists, a reset link has been sent. Check your inbox.');
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                (typeof err.response?.data === 'string' ? err.response.data : null) ||
                'Failed to send reset email. Please try again.';
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

                <h1 className="auth-title">Forgot <em>Password?</em></h1>
                <p className="auth-sub">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                {message ? (
                    <div>
                        <div className="auth-success">
                            <CheckCircle size={15} />
                            {message}
                        </div>
                        <p className="fp-note">
                            Didn't receive it? Check your spam folder or{' '}
                            <button
                                onClick={() => { setMessage(''); setEmail(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}
                            >
                                try again
                            </button>.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="auth-field">
                            <label className="auth-label">Email Address</label>
                            <input
                                className={`auth-input${errors.email ? ' auth-input-err' : ''}`}
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({});
                                }}
                                autoComplete="email"
                                autoFocus
                            />
                            {errors.email && <span className="auth-field-err">{errors.email}</span>}
                        </div>

                        {serverError && <div className="auth-error">{serverError}</div>}

                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading ? 'Sending…' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <div className="auth-divider" />
                <div className="auth-footer">
                    Remember your password? <Link to="/login">Back to login</Link>
                </div>
            </div>
        </div>
    );
}