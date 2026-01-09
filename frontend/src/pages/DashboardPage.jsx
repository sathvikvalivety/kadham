import React from "react";
import { Link } from "react-router-dom";
import { createApiClient } from "../lib/api";
import { getGbcBalance } from "../lib/ethereum";
import EcoScoreCard from "../components/EcoScoreCard";

function DashboardPage() {
  const [token, setToken] = React.useState(() => {
    const t = localStorage.getItem("kadham_token");
    return t && t !== "null" ? t : null;
  });
  const [ecoScore, setEcoScore] = React.useState(0);
  const [gbcBalance, setGbcBalance] = React.useState(null);
  const [deposits, setDeposits] = React.useState([]);
  const [wallets, setWallets] = React.useState([]);
  const [claimingId, setClaimingId] = React.useState(null);

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

      const primary = walletRes.data.find(w => w.verified);
      if (primary) {
        const balance = await getGbcBalance(primary.address);
        setGbcBalance(balance);
      }
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
        <div className="rounded p-4 bg-white border flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide mb-1">GBC Balance</p>
            <p className="text-3xl font-bold">{gbcBalance ?? "0.0000"} GBC</p>
          </div>
          <p className="text-xs mt-2 text-gray-600">
            {primaryWallet ? `Linked: ${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}` : "No wallet linked"}
          </p>
        </div>
        <div className="rounded p-4 bg-white border space-y-2">
          <p className="text-xs uppercase tracking-wide mb-1">Quick Actions</p>
          <Link to="/deposit" className="block text-sm text-primary">
            ➜ Make a waste deposit
          </Link>
          <Link to="/redeem" className="block text-sm text-primary">
            ➜ Redeem GBC for eco-products
          </Link>
          <Link to="/history" className="block text-sm text-primary">
            ➜ View detailed history
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-800">Recent Rewards</h2>
          <Link to="/history" className="text-xs text-primary font-medium hover:underline">View All</Link>
        </div>
        <div className="divide-y">
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
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-md hover:bg-teal-700 transition-all font-medium disabled:opacity-50"
                    >
                      {claimingId === dep.id ? "Claiming..." : "Claim GBC"}
                    </button>
                  )}

                  {dep.tx_hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${dep.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded border hover:bg-gray-200 transition-all flex items-center gap-1"
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
