# AeroLink Flight Booking — Application Overview

## What It Does

AeroLink is a full-stack flight booking web application. Users can search and book flights two ways:

1. **Scheduled Flights** — flights stored in the local database (PKR pricing, admin-managed)
2. **Live Search** — real-time Duffel API results (USD pricing, live availability)

Admins manage flights, view all bookings, update statuses, and delete records via a dedicated panel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 |
| Build tool | Vite 7 |
| Routing | React Router v6 |
| Auth | Keycloak SSO (`keycloak-js ^26.2.3`) |
| HTTP client | Axios (with JWT interceptor) |
| Icons | Lucide React |
| Styling | Plain CSS with CSS variables |
| Live flight data | Duffel API (test environment) |

---

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | Deployed via Vite build (served statically) |
| Backend API | `https://flightbookingbackend-production-a1a8.up.railway.app/api` |
| Keycloak | `https://keycloak-production-70f4.up.railway.app` |
| Keycloak realm | `flight-booking` |
| Keycloak client | `aerolink-frontend` |
| Duffel API | `https://api.duffel.com` (test token, proxied via Vite in dev) |

---

## Authentication

Authentication is handled entirely by Keycloak. There is no custom login form — Keycloak's hosted login page is used.

**Flow:**
1. App loads → `keycloak.init({ onLoad: 'check-sso' })` runs once
2. If a valid Keycloak session exists, the token is refreshed
3. JWT `realm_access.roles` is checked immediately — if the user is `ADMIN`, they are redirected to `/admin` before any page renders
4. `POST /api/user/sync` is called to write the Keycloak display name into the Spring database
5. User profile is fetched from `GET /api/user/me` as fallback
6. `AuthContext` exposes: `user`, `login`, `loginWithGoogle`, `register`, `logout`, `getToken`, `initialized`

**Roles:**
- `USER` — can browse flights, make bookings, view their own bookings, manage profile
- `ADMIN` — redirected to admin panel; cannot access user-facing pages

**Guards (App.jsx):**
- `AdminRoute` — requires ADMIN role
- `UserRoute` — requires authenticated non-ADMIN user
- `PublicRoute` — allows unauthenticated access but blocks render until auth resolves; redirects admins away

---

## Project Structure

```
src/
├── api/
│   ├── axiosInstance.js       — Axios instance with base URL + Keycloak JWT interceptor
│   ├── authApi.js             — Auth-related API calls (forgot/reset password, verify email)
│   ├── bookingApi.js          — Booking CRUD + admin booking endpoints
│   ├── duffelApi.js           — Duffel search/offer calls (via Vite proxy in dev)
│   └── flightApi.js           — Scheduled flight endpoints
├── admin/
│   └── pages/
│       ├── AdminPanel.jsx     — Tab shell (Dashboard / Flights / Bookings)
│       └── tabs/
│           ├── DashboardTab.jsx   — Overview stats + recent bookings
│           ├── FlightsTab.jsx     — Add / edit / delete scheduled flights
│           ├── BookingsTab.jsx    — View all bookings, update status, delete
│           └── AdminModals.jsx    — Shared Delete confirmation modal
├── components/
│   ├── NavBar.jsx/css         — Top navigation bar
│   ├── Footer.jsx/css         — Footer
│   ├── FlightCard.jsx/css     — Card for scheduled flight listing
│   ├── DuffelFlightCard.jsx/css — Card for live Duffel flight listing
│   ├── BookingCard.css        — Booking card shared styles
│   ├── DuffelBookingCard.jsx  — Card for Duffel booking in user bookings page
│   ├── DuffelBookingModal.jsx — Multi-step booking modal for live flights
│   ├── BookingDetailModal.jsx — Read-only booking detail view
│   ├── AirportAutocomplete.jsx — Airport IATA code search input
│   ├── OneWayCard.jsx         — Scheduled one-way booking card
│   ├── RoundTripCard.jsx      — Scheduled round-trip booking card
│   ├── SkeletonCard.jsx       — Animated loading placeholder card
│   ├── StatCard.jsx           — Admin dashboard stat box
│   └── StatusBadge.jsx        — Coloured status pill (BOOKED / COMPLETED / CANCELLED)
├── constants/
│   └── statusColors.js        — Status → CSS colour variable map
├── context/
│   └── AuthContext.jsx        — Keycloak init, user state, auth actions
├── hooks/
│   └── useBookings.js         — Fetches and pairs user bookings (one-way + round-trip + Duffel)
├── pages/
│   ├── Home.jsx/css           — Landing page with hero, feature cards, how-it-works
│   ├── Flights.jsx/css        — Flight search (scheduled + Duffel live search tabs)
│   ├── Bookings.jsx/css       — User's booking history
│   ├── BookingModal.jsx/css   — Passenger form modal for scheduled flights
│   ├── FlightDetailModal.jsx/css — Flight detail view before booking
│   ├── PassengerForm.jsx/css  — Passenger detail fields (used inside booking modals)
│   ├── Profile.jsx            — User profile page
│   ├── Auth.css               — Shared auth page styles
│   ├── ForgotPassword.jsx     — Request password reset
│   ├── ResetPassword.jsx      — Set new password via token
│   └── VerifyEmail.jsx        — Email verification landing page
├── styles/
│   ├── globals.css            — CSS reset, body defaults, font imports
│   ├── components.css         — Shared component styles + skeleton animation
│   └── palette.css            — All CSS custom properties (colours, spacing, fonts)
├── utils/
│   ├── bookingUtils.js        — isDuffelBooking(), pairBookings(), parsePassengers()
│   └── dateFormat.js          — formatTime(), formatMediumDate(), formatLongDate()
├── keycloak.js                — Keycloak instance + init-guard flag
├── App.jsx                    — Route definitions + route guards
└── main.jsx                   — React root render
```

---

## Routing

| Path | Guard | Component |
|------|-------|-----------|
| `/` | None | `Home` |
| `/flights` | `PublicRoute` (admin redirected to `/admin`) | `Flights` |
| `/bookings` | `UserRoute` (auth required, non-admin) | `Bookings` |
| `/admin` | `AdminRoute` (ADMIN role required) | `AdminPanel` |
| `/profile` | None | `Profile` |
| `/forgot-password` | None | `ForgotPassword` |
| `/reset-password` | None | `ResetPassword` |
| `/verify-email` | None | `VerifyEmail` |
| `*` | — | Redirect to `/` |

---

## Booking Types

### Scheduled Flights
- Stored in Spring's `flights` table (managed by admin)
- Priced in PKR
- Booked via `POST /api/bookings`
- Supports ONE_WAY and ROUND_TRIP
- Passenger details stored as JSON in `passengerDetails` column
- Confirmation email sent by backend (currently uses account email — known issue)

### Live (Duffel) Flights
- Real-time results from Duffel API
- Priced in USD
- User searches → offer returned → user fills passenger details → `POST /api/duffel/bookings`
- Spring backend calls Duffel to create the order, saves to `duffel_bookings` table, sends confirmation email
- `bookingReference` is the Duffel order ID (e.g. `ORD-00001`)
- Supports multi-passenger, stop detection, meal preferences

---

## API Endpoints (Frontend → Backend)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/flights` | List all scheduled flights |
| POST | `/flights` | Create flight (admin) |
| PUT | `/flights/{id}` | Update flight (admin) |
| DELETE | `/flights/{id}` | Delete flight (admin) |
| POST | `/bookings` | Create scheduled booking |
| GET | `/bookings` | Get current user's bookings |
| PUT | `/bookings/{id}/cancel` | Cancel a booking |
| GET | `/bookings/all` | Get all bookings (admin) |
| PUT | `/bookings/{id}/status` | Update booking status (admin) |
| DELETE | `/bookings/{id}` | Delete booking (admin) |
| POST | `/duffel/bookings` | Create Duffel booking via backend |
| POST | `/user/sync` | Sync Keycloak name to DB |
| GET | `/user/me` | Get current user profile |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Submit new password |
| POST | `/auth/verify-email` | Verify email token |

---

## Duffel Integration

In development, Vite proxies `/duffel/*` → `https://api.duffel.com/*` with the Duffel API token injected as the `Authorization` header. This proxy is **dev-only** — in production the frontend calls Spring at `/api/duffel/bookings` which makes the Duffel API call server-side.

Duffel test token is stored in `vite.config.js` under the proxy configuration.

**Duffel search flow:**
1. `POST /duffel/offer_requests` — submit origin/destination/date/passengers
2. `GET /duffel/offers?offer_request_id=...` — retrieve available offers
3. User selects offer → `DuffelBookingModal` opens
4. User fills passenger forms → `POST /api/duffel/bookings` (Spring) with `{ offerId, currency, amount, passengers }`

---

## Design System

All design tokens live in `src/styles/palette.css` as CSS custom properties.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-gold` | `#c9a354` | Primary accent, CTAs, headings em |
| `--color-success` | `#4caf88` | Success states, Duffel badges |
| `--color-danger` | `#e05252` | Errors, cancel actions |
| `--color-bg` | `#0d0d0f` | Page background |
| `--color-surface` | `#17181c` | Card backgrounds |
| `--color-border` | `#2a2b30` | Card/input borders |
| `--font-display` | Playfair Display | Headings, hero text |
| `--font-body` | DM Sans | All body text |
| `--font-mono` | DM Mono | Flight numbers, codes, refs |

---

## Admin Panel

Three tabs managed in `AdminPanel.jsx`:

**Dashboard tab** — shows stat cards (total flights, total bookings, active bookings, estimated revenue), and a recent bookings table (last 6). Revenue is cumulative: scheduled bookings use `flight.price × passengers` (PKR), Duffel bookings use `totalAmount` (USD). Mixed currency — displayed as-is.

**Flights tab** — full CRUD for scheduled flights. Form with fields: flight number, airline, source, destination, departure/arrival time, price, seats, trip type.

**Bookings tab** — paginated table of all bookings. Supports: search by user/route/flight, filter by status, expand row to see passenger details, change status via dropdown, delete. Handles both scheduled and Duffel booking field shapes.

---

## Known Backend Gaps (as of April 2026)

| Issue | Impact |
|-------|--------|
| `GET /bookings/all` only returns scheduled bookings | Duffel bookings not visible in admin panel |
| `/user/sync` returns 500 occasionally | Username may not update on first login |
| Scheduled flight confirmation email uses account email | Passenger form email ignored for scheduled bookings |
| Booking cancellation does not restore seat count | `flight.seatsAvailable` not incremented on cancel |

---

## Environment Variables

Configured in `vite.config.js` (not `.env` files):

- Vite dev proxy `/api` → Spring backend URL
- Vite dev proxy `/duffel` → `https://api.duffel.com` with Duffel Authorization header

Keycloak configuration is hardcoded in `src/keycloak.js`:
- `url`: Keycloak server URL
- `realm`: `flight-booking`
- `clientId`: `aerolink-frontend`
