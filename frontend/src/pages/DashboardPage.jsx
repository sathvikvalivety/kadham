import React from "react";
import { Link } from "react-router-dom";
import { createApiClient } from "../lib/api";
import { connectWallet, getGbcBalance } from "../lib/ethereum";
import EcoScoreCard from "../components/EcoScoreCard";

function DashboardPage() {
  const [token, setToken] = React.useState(() => {
    const t = localStorage.getItem("kadham_token");
    return t && t !== "null" ? t : null;
  });
  const [ecoScore] = React.useState(80);
  const [gbcBalance, setGbcBalance] = React.useState(null);
  const [deposits, setDeposits] = React.useState([]);

  const api = React.useMemo(() => createApiClient(token), [token]);

  React.useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    let isMounted = true;
    async function loadData() {
      try {
        const [prodRes, depRes] = await Promise.all([
          api.get("/products"),
          api.get("/deposits/me")
        ]);
        if (isMounted) {
          setDeposits(depRes.data.slice(0, 10));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("kadham_token");
          setToken(null);
        }
      }
    }

    loadData();

    const interval = setInterval(() => {
      if (isMounted) loadData();
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [api, token]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome to Kadham</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EcoScoreCard score={ecoScore} label="Your Eco Score (mock)" />
        <div className="rounded p-4 bg-white border flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide mb-1">GBC Balance</p>
            <p className="text-3xl font-bold">{gbcBalance ?? "--"} GBC</p>
          </div>
          <p className="text-xs mt-2 text-gray-600">
            Balance is read from the GBC token contract via MetaMask.
          </p>
        </div>
        <div className="rounded p-4 bg-white border space-y-2">
          <p className="text-xs uppercase tracking-wide mb-1">Quick Actions</p>
          <Link to="/deposit" className="block text-sm text-primary">
            ➜ Make a waste deposit
          </Link>
          <Link to="/scan-product" className="block text-sm text-primary">
            ➜ Scan a product (mock)
          </Link>
          <Link to="/redeem" className="block text-sm text-primary">
            ➜ Redeem GBC for eco-products
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold">Recent Deposits</h2>
          <Link to="/history" className="text-xs text-primary hover:underline">View All</Link>
        </div>
        <div className="divide-y">
          {deposits.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No deposits found.</div>
          ) : (
            deposits.map((dep) => (
              <div key={dep.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{dep.description || dep.material_type || (dep.status === 'PENDING_VERIFICATION' ? 'AI Identification underway...' : 'Waste Deposit')}</p>
                  <p className="text-xs text-gray-500">{new Date(dep.created_at).toLocaleString()} • #{dep.id}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${dep.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    dep.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {dep.status.replace('_', ' ')}
                  </span>
                  {dep.eco_score && <p className="text-xs text-green-600 font-bold mt-1">+{dep.eco_score}pts</p>}
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
