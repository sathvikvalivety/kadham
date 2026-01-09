import React from "react";
import { createApiClient } from "../lib/api";

function DepositHistoryPage() {
    const [token] = React.useState(() => {
        const t = localStorage.getItem("kadham_token");
        return t && t !== "null" ? t : null;
    });
    const api = React.useMemo(() => createApiClient(token), [token]);
    const [deposits, setDeposits] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function load() {
            try {
                const res = await api.get("/deposits/me");
                setDeposits(res.data);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        }
        load();

        // Auto refresh every 30 seconds
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, [api]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Waste Deposit History</h1>
                <button
                    onClick={() => window.location.reload()}
                    className="text-primary text-sm font-semibold hover:underline"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden text-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 uppercase text-[10px] font-bold tracking-wider text-gray-500">
                        <tr>
                            <th className="px-6 py-4 text-left">Date & ID</th>
                            <th className="px-6 py-4 text-left">Snapshot</th>
                            <th className="px-6 py-4 text-left">Classification</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-right">Reward</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading history...</td>
                            </tr>
                        ) : deposits.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">No deposits found. Start recycling!</td>
                            </tr>
                        ) : (
                            deposits.map((dep) => (
                                <tr key={dep.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">#{dep.id}</div>
                                        <div className="text-gray-400 text-[11px]">{new Date(dep.created_at).toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {dep.image_data ? (
                                            <img src={dep.image_data} alt="Waste" className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-800">{dep.material_type || (dep.status === 'PENDING_VERIFICATION' ? 'Analyzing...' : 'Unknown')}</div>
                                        <div className="text-[11px] text-gray-500 italic max-w-xs truncate">{dep.description || dep.remarks || 'No details'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${dep.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                dep.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {dep.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600">
                                        {dep.eco_score ? `+${dep.eco_score}pts` : "--"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DepositHistoryPage;
