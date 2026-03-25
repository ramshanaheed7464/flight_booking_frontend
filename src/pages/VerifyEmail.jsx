import { useState, useContext, useRef, useEffect } from 'react';
import { Plane, Mail, RotateCcw, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { verifyEmail, resendCode } from '../api/authApi';
import './Auth.css';

export default function VerifyEmail() {
    const { login: setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) navigate('/register');
    }, [email]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const code = digits.join('');

    const handleDigit = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...digits];
        next[i] = val.slice(-1);
        setDigits(next);
        setError('');
        if (val && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        if (code.length < 6) { setError('Enter the full 6-digit code.'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await verifyEmail({ email, code });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            await login({ skipApi: true, user: res.data.user, token: res.data.token });
            navigate('/flights');
        } catch (err) {
            const msg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || 'Invalid or expired code.';
            setError(msg);
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || resending) return;
        setResending(true);
        setResent(false);
        setError('');
        try {
            await resendCode({ email });
            setResent(true);
            setCooldown(60);
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const login = ({ user, token }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/flights';
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <Mail size={18} style={{ color: 'var(--color-gold)' }} />
                    <h1 className="auth-title" style={{ marginBottom: 0 }}>Verify <em>Email</em></h1>
                </div>
                <p className="auth-sub">
                    We sent a 6-digit code to <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</strong>.
                    Enter it below to complete your registration.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1.5rem 0' }}>
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={el => inputRefs.current[i] = el}
                            className="auth-input"
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={d}
                            onChange={e => handleDigit(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            style={{
                                width: '48px',
                                textAlign: 'center',
                                fontSize: '1.4rem',
                                fontFamily: 'var(--font-mono)',
                                padding: '0.65rem 0',
                                caretColor: 'var(--color-gold)',
                                borderColor: d ? 'rgba(201,163,84,0.5)' : undefined,
                            }}
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                {error && <div className="auth-error">{error}</div>}

                {resent && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        fontSize: '0.78rem', color: 'var(--color-success)',
                        marginBottom: '0.75rem',
                    }}>
                        <CheckCircle size={13} /> New code sent to {email}
                    </div>
                )}

                <button
                    className="auth-btn"
                    onClick={handleVerify}
                    disabled={loading || code.length < 6}
                >
                    {loading ? 'Verifying…' : 'Verify Email'}
                </button>

                <div className="auth-divider" />

                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>
                        Didn't receive it?{' '}
                    </span>
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || resending}
                        style={{
                            background: 'none', border: 'none', cursor: cooldown > 0 ? 'default' : 'pointer',
                            fontSize: '0.78rem', padding: 0,
                            color: cooldown > 0 ? 'rgba(255,255,255,0.2)' : 'var(--color-gold)',
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        }}
                    >
                        <RotateCcw size={11} />
                        {resending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                    </button>
                </div>
            </div>
        </div>
    );
}