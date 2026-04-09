import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'flight-booking',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'flight-frontend'
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;