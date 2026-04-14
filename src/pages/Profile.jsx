import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Lock,
    Check,
    AlertCircle,
    Loader2,
    ShieldCheck,
    Eye,
    EyeOff,
    ArrowLeft,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../api/userApi';
import { validateName, validatePassword, validatePasswordStrength, validateConfirmPassword } from './validation';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './Profile.css';

function getInitials(name, email) {
    if (name) {
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    }
    return email?.[0]?.toUpperCase() || '?';
}

export default function Profile() {
    const { user, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameSuccess, setNameSuccess] = useState('');
    const [nameError, setNameError] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwError, setPwError] = useState('');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        getProfile()
            .then(res => {
                setProfile(res.data);
                setName(res.data.name || '');
            })
            .catch(() => navigate('/login'))
            .finally(() => setLoading(false));
    }, [user]);

    const isAdmin = user?.role === 'ADMIN';
    const newPwStrength = validatePasswordStrength(newPassword);

    const handleNameSave = async () => {
        setNameError('');
        setNameSuccess('');
        const nameErr = validateName(name);
        if (nameErr) { setNameError(nameErr); return; }
        setNameLoading(true);
        try {
            const res = await updateProfile({ name: name.trim() });
            setProfile(res.data);
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, name: res.data.name }));
            setNameSuccess('Name updated successfully.');
            setTimeout(() => setNameSuccess(''), 3500);
        } catch (e) {
            setNameError(e.response?.data || 'Failed to update name.');
        } finally {
            setNameLoading(false);
        }
    };

    const handlePasswordSave = async () => {
        setPwError('');
        setPwSuccess('');
        if (!currentPassword) { setPwError('Enter your current password.'); return; }
        const pwErr = validatePassword(newPassword);
        if (pwErr) { setPwError(pwErr); return; }
        if (newPassword === currentPassword) { setPwError('New password must differ from the current one.'); return; }
        const confirmErr = validateConfirmPassword(newPassword, confirmPassword);
        if (confirmErr) { setPwError(confirmErr); return; }
        setPwLoading(true);
        try {
            await changePassword({ currentPassword, newPassword });
            setPwSuccess('Password changed successfully. Please log in again.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => { logout(); navigate('/login'); }, 2200);
        } catch (e) {
            setPwError(e.response?.data || 'Failed to update password.');
        } finally {
            setPwLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                {!isAdmin && <NavBar />}
                <div className="pf-root">
                    <div className="pf-loading">
                        <Loader2 size={18} className="pf-loading-icon" />
                        Loading profile…
                    </div>
                </div>
            </>
        );
    }

    const roleClass = isAdmin ? 'pf-info-val--admin' : 'pf-info-val--passenger';

    const content = (
        <div className="pf-root">
            <div className="pf-hero">
                <div className="pf-avatar">
                    <span className="pf-avatar-initials">
                        {getInitials(profile?.name, profile?.email)}
                    </span>
                </div>
                <div className="pf-hero-info">
                    <div className="pf-hero-name">{profile?.name || 'No Name'}</div>
                    <div className="pf-hero-email">{profile?.email}</div>
                    <div className={`pf-hero-badge ${isAdmin ? 'pf-hero-badge--admin' : 'pf-hero-badge--passenger'}`}>
                        {isAdmin
                            ? <ShieldCheck size={11} strokeWidth={2} />
                            : <User size={11} strokeWidth={2} />
                        }
                        {isAdmin ? 'Administrator' : 'Passenger'}
                    </div>
                </div>
                {isAdmin && (
                    <button
                        className="pf-back-btn"
                        onClick={() => navigate('/admin')}
                    >
                        <ArrowLeft size={13} /> Back to Panel
                    </button>
                )}
            </div>

            <div className="pf-content">

                <div className="pf-card">
                    <div className="pf-card-header">
                        <User size={13} className="pf-card-icon" />
                        <span className="pf-card-title">Account Information</span>
                    </div>
                    <div className="pf-card-body">
                        <div className="pf-info-row">
                            <span className="pf-info-key">User ID</span>
                            <span className="pf-info-val">#{profile?.id}</span>
                        </div>
                        <div className="pf-info-row">
                            <span className="pf-info-key">Email</span>
                            <span className="pf-info-val">{profile?.email}</span>
                        </div>
                        <div className="pf-info-row">
                            <span className="pf-info-key">Role</span>
                            <span className={`pf-info-val ${roleClass}`}>{profile?.role}</span>
                        </div>
                    </div>
                </div>

                <div className="pf-card">
                    <div className="pf-card-header">
                        <User size={13} className="pf-card-icon" />
                        <span className="pf-card-title">Update Name</span>
                    </div>
                    <div className="pf-card-body">
                        <div className="pf-field">
                            <label className="pf-label">Full Name</label>
                            <input
                                className="pf-input"
                                type="text"
                                placeholder="Your full name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                            />
                            <div className="pf-input-hint">This name is shown across the platform.</div>
                        </div>

                        {nameError && (
                            <div className="pf-error">
                                <AlertCircle size={13} strokeWidth={2} />{nameError}
                            </div>
                        )}
                        {nameSuccess && (
                            <div className="pf-success">
                                <Check size={13} strokeWidth={2.5} />{nameSuccess}
                            </div>
                        )}

                        <button className="pf-save-btn" onClick={handleNameSave} disabled={nameLoading}>
                            {nameLoading
                                ? <><Loader2 size={13} className="pf-btn-spinner" />Saving…</>
                                : <><Check size={13} strokeWidth={2.5} />Save Name</>
                            }
                        </button>
                    </div>
                </div>

                <div className="pf-card">
                    <div className="pf-card-header">
                        <Lock size={13} className="pf-card-icon" />
                        <span className="pf-card-title">Change Password</span>
                    </div>
                    <div className="pf-card-body">

                        <div className="pf-field pf-field--spaced">
                            <label className="pf-label">Current Password</label>
                            <div className="pf-input-wrap">
                                <input
                                    className="pf-input pf-input--padded"
                                    type={showCurrent ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                />
                                <button className="pf-eye-btn" onClick={() => setShowCurrent(v => !v)}>
                                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <div className="pf-divider" />

                        <div className="pf-field pf-field--spaced">
                            <label className="pf-label">New Password</label>
                            <div className="pf-input-wrap">
                                <input
                                    className="pf-input pf-input--padded"
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                                <button className="pf-eye-btn" onClick={() => setShowNew(v => !v)}>
                                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {newPassword && (
                                <div className="pf-strength">
                                    <div className="pf-strength-bars">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className="pf-strength-bar"
                                                style={{
                                                    background: i <= newPwStrength.score
                                                        ? newPwStrength.color
                                                        : 'rgba(255,255,255,0.1)',
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span className="pf-strength-label" style={{ color: newPwStrength.color }}>
                                        {newPwStrength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="pf-field pf-field--last">
                            <label className="pf-label">Confirm New Password</label>
                            <div className="pf-input-wrap">
                                <input
                                    className={`pf-input pf-input--padded${confirmPassword && newPassword !== confirmPassword ? ' pf-input--mismatch' : ''}`}
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                                <button className="pf-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <div className="pf-input-hint pf-input-hint--error">
                                    Passwords do not match.
                                </div>
                            )}
                        </div>

                        {pwError && (
                            <div className="pf-error">
                                <AlertCircle size={13} strokeWidth={2} />{pwError}
                            </div>
                        )}
                        {pwSuccess && (
                            <div className="pf-success">
                                <Check size={13} strokeWidth={2.5} />{pwSuccess}
                            </div>
                        )}

                        <button className="pf-save-btn" onClick={handlePasswordSave} disabled={pwLoading}>
                            {pwLoading
                                ? <><Loader2 size={13} className="pf-btn-spinner" />Updating…</>
                                : <><Lock size={13} />Change Password</>
                            }
                        </button>
                    </div>
                </div>

            </div>

            {!isAdmin && <Footer />}
        </div>
    );

    if (isAdmin) return content;

    return (
        <>
            <NavBar />
            {content}
        </>
    );
}