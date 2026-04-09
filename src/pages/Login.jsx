import { useContext } from 'react';
import { Plane } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
    const { login } = useContext(AuthContext);

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
                <button className="auth-btn" onClick={login}>
                    Sign In with Keycloak
                </button>
            </div>
        </div>
    );
}