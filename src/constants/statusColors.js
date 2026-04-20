/**
 * statusColors.js — OCP: add a new booking status here only.
 * All components that render status colors import from this single source.
 */

export const STATUS_COLORS = {
    BOOKED:    '#4caf88',
    CANCELLED: '#e05f5f',
    COMPLETED: '#c9a354',
    RETURN:    'var(--color-return)',
};

/** Dot colors used in the Bookings tab bar */
export const TAB_DOTS = {
    ALL:       'rgba(255,255,255,0.3)',
    BOOKED:    '#4caf88',
    COMPLETED: '#c9a354',
    CANCELLED: '#e05f5f',
};
