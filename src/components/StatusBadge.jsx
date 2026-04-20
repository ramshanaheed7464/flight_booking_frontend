import { STATUS_COLORS } from '../constants/statusColors';

/**
 * StatusBadge — SRP: renders a single booking-status pill.
 * OCP: extend STATUS_COLORS in constants/statusColors.js to support new statuses
 *      without touching this component.
 */
export default function StatusBadge({ status }) {
    const color = STATUS_COLORS[status] || 'var(--color-gold)';
    return (
        <span
            className="ap-status"
            style={{ color, borderColor: `${color}55`, background: `${color}11` }}
        >
            {status}
        </span>
    );
}
