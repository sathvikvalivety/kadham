import React from "react";
import { createApiClient } from "../lib/api";
import { getExplorerUrl } from "../lib/ethereum";

function DepositHistoryPage() {
    const [token] = React.useState(() => {
        const t = localStorage.getItem("kadham_token");
        return t && t !== "null" ? t : null;
    });
    const api = React.useMemo(() => createApiClient(token), [token]);
    const [deposits, setDeposits] = React.useState([]);
    const [transactions, setTransactions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function load() {
            try {
                const [depRes, txRes] = await Promise.all([
                    api.get("/deposits/me"),
                    api.get("/transactions/me")
                ]);
                setDeposits(depRes.data);
                setTransactions(txRes.data);
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
                                        {dep.tx_hash && (
                                            <a href={`https://sepolia.etherscan.io/tx/${dep.tx_hash}`} target="_blank" rel="noopener noreferrer" className="block text-[10px] text-blue-500 hover:underline mt-1">
                                                View Tx
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">GBC Transactions</h2>
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden text-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 uppercase text-[10px] font-bold tracking-wider text-gray-500">
                            <tr>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Details</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No transactions found.</td></tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(tx.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${tx.direction === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {tx.type || tx.direction}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {tx.tx_hash ? (
                                                <a href={getExplorerUrl('tx', tx.tx_hash)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                                    View on Etherscan ↗
                                                </a>
                                            ) : <span className="text-gray-400">Off-chain</span>}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${tx.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {tx.direction === 'CREDIT' ? '+' : '-'}{tx.amount} GBC
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DepositHistoryPage;
