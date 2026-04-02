import { useEffect, useState } from 'react';
import {
    Plane, Plus, Pencil, Trash2,
    CheckCircle, XCircle, Users,
    AlertCircle, Loader2, Search, ArrowRight,
} from 'lucide-react';
import { getFlights, deleteFlight } from '../../../api/flightApi';
import { FlightModal, DeleteModal } from './AdminModals';

const fmt = v => v
    ? new Date(v).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

function seatsClass(n) {
    if (n === 0) return 'ap-seats--soldout';
    if (n <= 10) return 'ap-seats--low';
    return 'ap-seats--ok';
}

export default function FlightsTab() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editFlight, setEditFlight] = useState(null);
    const [deleteFlt, setDeleteFlt] = useState(null);

    const load = () => {
        setLoading(true);
        getFlights()
            .then(r => setFlights(r.data))
            .catch(() => setError('Failed to load flights.'))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleDelete = async () => {
        try {
            await deleteFlight(deleteFlt.id);
            setDeleteFlt(null);
            load();
        } catch (e) {
            alert(e.response?.data || 'Delete failed.');
            setDeleteFlt(null);
        }
    };

    const filtered = flights.filter(f =>
        [f.flightNumber, f.source, f.destination].some(v =>
            v?.toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <>
            <div className="ap-page-header">
                <div>
                    <div className="ap-page-title">Manage <em>Flights</em></div>
                    <div className="ap-page-sub">Add, edit or remove flights from the system.</div>
                </div>
            </div>

            <div className="ap-stats">
                <StatCard iconClass="ap-stat-icon--gold" icon={<Plane size={18} />} num={flights.length} label="Total Flights" />
                <StatCard iconClass="ap-stat-icon--green" icon={<CheckCircle size={18} />} num={flights.filter(f => f.seatsAvailable > 0).length} label="Available" />
                <StatCard iconClass="ap-stat-icon--danger" icon={<XCircle size={18} />} num={flights.filter(f => f.seatsAvailable === 0).length} label="Sold Out" />
                <StatCard iconClass="ap-stat-icon--blue" icon={<Users size={18} />} num={flights.reduce((s, f) => s + (f.seatsAvailable || 0), 0)} label="Total Seats" />
            </div>

            <div className="ap-action-bar">
                <div className="ap-search-wrap">
                    <Search size={14} />
                    <input
                        className="ap-search-input"
                        placeholder="Search by route, flight number…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="ap-add-btn" onClick={() => setShowAdd(true)}>
                    <Plus size={14} /> Add Flight
                </button>
            </div>

            <div className="ap-count">{filtered.length} flight{filtered.length !== 1 ? 's' : ''}</div>

            {loading && <div className="ap-loading"><Loader2 size={16} />Loading…</div>}
            {error && <div className="ap-error"><AlertCircle size={14} />{error}</div>}

            {!loading && !error && (
                <div className="ap-table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>ID</th><th>Flight</th><th>Route</th>
                                <th>Departure</th><th>Arrival</th>
                                <th>Seats</th><th>Price</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="ap-empty">No flights found.</td></tr>
                            ) : filtered.map(f => (
                                <tr key={f.id}>
                                    <td><span className="ap-table-mono">#{f.id}</span></td>
                                    <td><span className="ap-table-bold">{f.flightNumber}</span></td>
                                    <td>
                                        <div className="ap-table-route">
                                            {f.source}
                                            <ArrowRight size={12} className="ap-table-route-arrow" />
                                            {f.destination}
                                        </div>
                                    </td>
                                    <td><span className="ap-table-mono">{fmt(f.departureTime)}</span></td>
                                    <td><span className="ap-table-mono">{fmt(f.arrivalTime)}</span></td>
                                    <td><span className={seatsClass(f.seatsAvailable)}>{f.seatsAvailable}</span></td>
                                    <td><span className="ap-table-price">PKR {f.price}</span></td>
                                    <td>
                                        <div className="ap-actions">
                                            <button className="ap-edit-btn" onClick={() => setEditFlight(f)}>
                                                <Pencil size={11} /> Edit
                                            </button>
                                            <button className="ap-del-btn" onClick={() => setDeleteFlt(f)}>
                                                <Trash2 size={11} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdd && <FlightModal onClose={() => setShowAdd(false)} onSaved={load} />}
            {editFlight && <FlightModal flight={editFlight} onClose={() => setEditFlight(null)} onSaved={load} />}
            {deleteFlt && (
                <DeleteModal
                    label={`flight ${deleteFlt.flightNumber} (${deleteFlt.source} → ${deleteFlt.destination})`}
                    onClose={() => setDeleteFlt(null)}
                    onConfirm={handleDelete}
                />
            )}
        </>
    );
}

function StatCard({ iconClass, icon, num, label }) {
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