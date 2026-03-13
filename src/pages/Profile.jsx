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
import { getProfile, updateProfile } from '../api/userApi';
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

    // Name form
    const [name, setName] = useState('');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameSuccess, setNameSuccess] = useState('');
    const [nameError, setNameError] = useState('');

    // Password form
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

    // ── Update name ──────────────────────────────────────────────
    const handleNameSave = async () => {
        setNameError('');
        setNameSuccess('');
        if (!name.trim()) { setNameError('Name cannot be empty.'); return; }
        setNameLoading(true);
        try {
            const res = await updateProfile({ name: name.trim() });
            setProfile(res.data);
            // Update localStorage so NavBar reflects the change immediately
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

    // ── Update password ──────────────────────────────────────────
    const handlePasswordSave = async () => {
        setPwError('');
        setPwSuccess('');
        if (!currentPassword) { setPwError('Enter your current password.'); return; }
        if (!newPassword) { setPwError('Enter a new password.'); return; }
        if (newPassword.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
        setPwLoading(true);
        try {
            await updateProfile({ currentPassword, newPassword });
            setPwSuccess('Password changed successfully. Please log in again.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            // Force re-login after password change
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
                        <Loader2 size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Loading profile…
                    </div>
                </div>
            </>
        );
    }

    const roleColor = isAdmin ? '#c9a354' : '#4caf88';
    const roleLabel = isAdmin ? 'Administrator' : 'Passenger';

    const content = (
        <div className="pf-root">
            {/* Hero */}
            <div className="pf-hero">
                <div className="pf-avatar">
                    <span className="pf-avatar-initials">
                        {getInitials(profile?.name, profile?.email)}
                    </span>
                </div>
                <div className="pf-hero-info">
                    <div className="pf-hero-name">{profile?.name || 'No Name'}</div>
                    <div className="pf-hero-email">{profile?.email}</div>
                    <div
                        className="pf-hero-badge"
                        style={{ color: roleColor, borderColor: roleColor + '55', background: roleColor + '11' }}
                    >
                        {isAdmin
                            ? <ShieldCheck size={11} strokeWidth={2} />
                            : <User size={11} strokeWidth={2} />
                        }
                        {roleLabel}
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => navigate('/admin')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.35)', background: 'none',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px',
                            padding: '0.45rem 0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.color = '#fff'}
                        onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                    >
                        <ArrowLeft size={13} /> Back to Panel
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="pf-content">

                {/* Account info (read-only) */}
                <div className="pf-card">
                    <div className="pf-card-header">
                        <User size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
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
                            <span className="pf-info-val" style={{ color: roleColor }}>{profile?.role}</span>
                        </div>
                    </div>
                </div>

                {/* Update name */}
                <div className="pf-card">
                    <div className="pf-card-header">
                        <User size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
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
                                ? <><Loader2 size={13} style={{ marginRight: '0.35rem' }} />Saving…</>
                                : <><Check size={13} strokeWidth={2.5} />Save Name</>
                            }
                        </button>
                    </div>
                </div>

                {/* Change password */}
                <div className="pf-card">
                    <div className="pf-card-header">
                        <Lock size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
                        <span className="pf-card-title">Change Password</span>
                    </div>
                    <div className="pf-card-body">

                        {/* Current password */}
                        <div className="pf-field" style={{ marginBottom: '1.1rem' }}>
                            <label className="pf-label">Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="pf-input"
                                    type={showCurrent ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    style={{ paddingRight: '2.75rem' }}
                                />
                                <button
                                    onClick={() => setShowCurrent(v => !v)}
                                    style={{
                                        position: 'absolute', right: '0.8rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: 'rgba(255,255,255,0.25)',
                                        cursor: 'pointer', display: 'flex', padding: 0,
                                    }}
                                >
                                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <div className="pf-divider" />

                        {/* New password */}
                        <div className="pf-field" style={{ marginBottom: '1.1rem' }}>
                            <label className="pf-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="pf-input"
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    style={{ paddingRight: '2.75rem' }}
                                />
                                <button
                                    onClick={() => setShowNew(v => !v)}
                                    style={{
                                        position: 'absolute', right: '0.8rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: 'rgba(255,255,255,0.25)',
                                        cursor: 'pointer', display: 'flex', padding: 0,
                                    }}
                                >
                                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div className="pf-field" style={{ marginBottom: 0 }}>
                            <label className="pf-label">Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="pf-input"
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    style={{
                                        paddingRight: '2.75rem',
                                        borderColor: confirmPassword && newPassword !== confirmPassword
                                            ? 'rgba(224,95,95,0.5)' : undefined,
                                    }}
                                />
                                <button
                                    onClick={() => setShowConfirm(v => !v)}
                                    style={{
                                        position: 'absolute', right: '0.8rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: 'rgba(255,255,255,0.25)',
                                        cursor: 'pointer', display: 'flex', padding: 0,
                                    }}
                                >
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <div className="pf-input-hint" style={{ color: 'rgba(224,95,95,0.7)' }}>
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
                                ? <><Loader2 size={13} style={{ marginRight: '0.35rem' }} />Updating…</>
                                : <><Lock size={13} />Change Password</>
                            }
                        </button>
                    </div>
                </div>

            </div>

            {!isAdmin && <Footer />}
        </div>
    );

    // Admin gets no NavBar (they use the admin topbar via AdminPanel)
    // Regular users get NavBar
    if (isAdmin) return content;

    return (
        <>
            <NavBar />
            {content}
        </>
    );
}