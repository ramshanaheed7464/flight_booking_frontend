import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            await register({ name: form.name, email: form.email, password: form.password });
            navigate('/login');
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                (typeof err.response?.data === 'string' ? err.response.data : null) ||
                (err.message === 'Network Error' ? 'Cannot reach server — is your backend running?' : null) ||
                `Registration failed (${err.response?.status ?? 'no response'})`;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-root">
            <div className="auth-bg" />
            <div className="auth-grid" />
            <div className="auth-card">
                <div className="auth-logo">✦ <span>Aero</span>Link</div>
                <h1 className="auth-title">Join <em>AeroLink.</em></h1>
                <p className="auth-sub">Create your account and start booking flights today.</p>
                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label">Full Name</label>
                        <input className="auth-input" type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <input className="auth-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="auth-row">
                        <div className="auth-field">
                            <label className="auth-label">Password</label>
                            <input className="auth-input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">Confirm</label>
                            <input className="auth-input" type="password" name="confirm" placeholder="••••••••" value={form.confirm} onChange={handleChange} required />
                        </div>
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? 'Creating account…' : 'Create Account'}
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