export default function SkeletonCard() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-route">
                <div className="skeleton-block skeleton-code" />
                <div className="skeleton-line-wrap">
                    <div className="skeleton-block skeleton-line" />
                </div>
                <div className="skeleton-block skeleton-code" />
            </div>
            <div className="skeleton-meta">
                <div className="skeleton-block skeleton-meta-row" />
                <div className="skeleton-block skeleton-meta-row" />
                <div className="skeleton-block skeleton-meta-row short" />
            </div>
            <div className="skeleton-footer">
                <div className="skeleton-block skeleton-price" />
                <div className="skeleton-block skeleton-btn" />
            </div>
        </div>
    );
}
