import React from "react";
import { Link } from "react-router-dom";
import { createApiClient } from "../lib/api";
import { connectWallet, getGbcBalance } from "../lib/ethereum";
import EcoScoreCard from "../components/EcoScoreCard";

function DashboardPage() {
  const [token] = React.useState(localStorage.getItem("kadham_token"));
  const [ecoScore] = React.useState(80);
  const [gbcBalance, setGbcBalance] = React.useState(null);

  React.useEffect(() => {
    async function loadBalance() {
      try {
        const { account } = await connectWallet();
        const balance = await getGbcBalance(account);
        setGbcBalance(balance);
      } catch {
        setGbcBalance(null);
      }
    }
    loadBalance();
  }, []);

  const api = React.useMemo(() => createApiClient(token), [token]);

  React.useEffect(() => {
    void api.get("/products").catch(() => {});
  }, [api]);

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
    </div>
  );
}

export default DashboardPage;
