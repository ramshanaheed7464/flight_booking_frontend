/**
 * StatCard — SRP: renders a single labelled statistic tile in admin dashboards.
 * Used by DashboardTab, FlightsTab, and BookingsTab.
 */
export default function StatCard({ iconClass, icon, num, label }) {
    return (
        <div className="ap-stat-card">
            <div className={`ap-stat-icon ${iconClass}`}>{icon}</div>
            <div>
                <div className="ap-stat-num">{num}</div>
                <div className="ap-stat-lbl">{label}</div>
            </div>
        </div>
    );
}
