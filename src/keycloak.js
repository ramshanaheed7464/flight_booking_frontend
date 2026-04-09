import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'flight-booking',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'aerolink-frontend'
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;