import React from "react";
import { Link } from "react-router-dom";
import { createApiClient } from "../lib/api";
import EcoScoreCard from "../components/EcoScoreCard";
import WalletCard from "../components/WalletCard";

function DashboardPage() {
  const [token, setToken] = React.useState(() => {
    const t = localStorage.getItem("kadham_token");
    return t && t !== "null" ? t : null;
  });
  const [ecoScore, setEcoScore] = React.useState(0);
  const [deposits, setDeposits] = React.useState([]);
  const [wallets, setWallets] = React.useState([]);
  const [claimingId, setClaimingId] = React.useState(null);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0); // Forces wallet refresh

  const api = React.useMemo(() => createApiClient(token), [token]);

  const loadData = React.useCallback(async () => {
    try {
      const [depRes, walletRes] = await Promise.all([
        api.get("/deposits/me"),
        api.get("/wallets")
      ]);

      setDeposits(depRes.data.slice(0, 10));
      setWallets(walletRes.data);

      // Calculate Eco Score from approved deposits
      const score = depRes.data.reduce((acc, dep) => {
        if (dep.status === "APPROVED") return acc + (dep.eco_score || 0);
        return acc;
      }, 0);
      setEcoScore(score);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("kadham_token");
        setToken(null);
      }
    }
  }, [api]);

  React.useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadData();

    const interval = setInterval(() => {
      loadData();
      setRefreshTrigger(p => p + 1); // Auto-refresh wallet too
    }, 15000);

    return () => clearInterval(interval);
  }, [token, loadData]);

  const handleClaim = async (deposit) => {
    try {
      setClaimingId(deposit.id);
      await api.post("/rewards/deposit", {
        depositId: deposit.id,
        amountGbc: deposit.eco_score // 1:1 conversion
      });
      await loadData();

      // blockchain propagation can take a moment
      // Refresh immediately, then multiple times to ensure node sync catches up
      setRefreshTrigger(prev => prev + 1);

      const pollIntervals = [2000, 5000, 10000];
      pollIntervals.forEach(delay => {
        setTimeout(() => setRefreshTrigger(prev => prev + 1), delay);
      });

    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Claim failed: ${msg}`);
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  const primaryWallet = wallets.find(w => w.verified);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome to Kadham</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EcoScoreCard score={ecoScore} label="Total Points Earned" />

        <WalletCard
          walletAddress={primaryWallet?.address}
          refreshTrigger={refreshTrigger}
        />

        <div className="rounded-xl p-4 bg-white border border-gray-100 shadow-sm space-y-3">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Quick Actions</p>
          <div className="space-y-2">
            <Link to="/deposit" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium transition-colors">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">♻️</span>
              Make a waste deposit
            </Link>
            <Link to="/redeem" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium transition-colors">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">🛒</span>
              Redeem GBC for eco-products
            </Link>
            <Link to="/history" className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium transition-colors">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">📜</span>
              View detailed history
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-semibold text-gray-800">Recent Rewards</h2>
          <Link to="/history" className="text-xs text-primary font-medium hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {deposits.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No deposits found.</div>
          ) : (
            deposits.map((dep) => (
              <div key={dep.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {dep.description || dep.material_type || (dep.status === 'PENDING_VERIFICATION' ? 'Processing...' : 'Waste Deposit')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(dep.created_at).toLocaleDateString()} • #{dep.id}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${dep.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      dep.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                      {dep.status.replace('_', ' ')}
                    </span>
                    {dep.eco_score > 0 && (
                      <p className="text-xs text-green-600 font-bold mt-1">+{dep.eco_score} pts</p>
                    )}
                  </div>

                  {dep.status === "APPROVED" && !dep.tx_hash && (
                    <button
                      onClick={() => handleClaim(dep)}
                      disabled={claimingId === dep.id}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-md hover:bg-teal-700 transition-all font-medium disabled:opacity-50 shadow-sm"
                    >
                      {claimingId === dep.id ? (
                        <span className="flex items-center gap-1">
                          <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Claiming...
                        </span>
                      ) : "Claim GBC"}
                    </button>
                  )}

                  {dep.tx_hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${dep.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-1"
                    >
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {dep.tx_hash.slice(0, 8)}...
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
