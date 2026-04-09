import { createContext, useState, useEffect } from 'react';
import keycloak from '../keycloak';

export const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function syncUserWithBackend(token, tokenParsed) {
    try {
        await fetch(`${API_BASE}/api/user/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    } catch (err) {
        console.error('User sync failed:', err);
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        keycloak
            .init({
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                checkLoginIframe: false,
            })
            .then(async (authenticated) => {
                if (authenticated) {
                    const tokenParsed = keycloak.tokenParsed;
                    const resolvedUser = {
                        name: tokenParsed?.name || tokenParsed?.preferred_username,
                        email: tokenParsed?.email,
                        role: tokenParsed?.realm_access?.roles?.includes('admin') ? 'ADMIN' : 'USER',
                    };
                    setUser(resolvedUser);

                    await syncUserWithBackend(keycloak.token, tokenParsed);
                }
                setInitialized(true);
            });
    }, []);

    const login = () => keycloak.login({ redirectUri: window.location.origin + '/flights' });
    const register = () => keycloak.login({ redirectUri: window.location.origin + '/flights' });

    const logout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
        setUser(null);
    };

    const getToken = () => keycloak.token;

    if (!initialized) return null;

    return (
        <AuthContext.Provider value={{ user, login, register, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
};