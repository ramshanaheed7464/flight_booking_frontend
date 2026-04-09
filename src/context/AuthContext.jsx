import { createContext, useState, useEffect } from 'react';
import keycloak from '../keycloak';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        keycloak.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            checkLoginIframe: false
        })
            .then((authenticated) => {
                if (authenticated) {
                    const tokenParsed = keycloak.tokenParsed;
                    setUser({
                        name: tokenParsed?.name || tokenParsed?.preferred_username,
                        email: tokenParsed?.email,
                        role: tokenParsed?.realm_access?.roles?.includes('admin') ? 'ADMIN' : 'USER'
                    });
                }
                setInitialized(true);
            });
    }, []);

    const login = () => keycloak.login();

    const logout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
        setUser(null);
    };

    const getToken = () => keycloak.token;

    if (!initialized) return null;

    return (
        <AuthContext.Provider value={{ user, login, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
};