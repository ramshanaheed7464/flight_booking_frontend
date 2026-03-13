import { useState, useContext } from 'react';
import { Plane } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form);
            navigate('/flights');
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                (typeof err.response?.data === 'string' ? err.response.data : null) ||
                (err.message === 'Network Error' ? 'Cannot reach server — is your backend running?' : null) ||
                `Login failed (${err.response?.status ?? 'no response'})`;
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
                <div className="auth-logo"><Plane size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> <span>Aero</span>Link</div>
                <h1 className="auth-title">Welcome <em>back.</em></h1>
                <p className="auth-sub">Sign in to access your bookings and flights.</p>
                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label">Email Address</label>
                        <input className="auth-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="auth-field">
                        <label className="auth-label">Password</label>
                        <input className="auth-input" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
                <div className="auth-divider" />
                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}