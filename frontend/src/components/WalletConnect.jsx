import React from "react";
import { connectWallet, signMessage } from "../lib/ethereum";
import { createApiClient } from "../lib/api";

function WalletConnect() {
  const [account, setAccount] = React.useState(null);
  const [isLinked, setIsLinked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const token = localStorage.getItem("kadham_token");
  const api = React.useMemo(() => createApiClient(token), [token]);

  React.useEffect(() => {
    if (!token) return;

    async function checkExistingLink() {
      try {
        const res = await api.get("/wallets");
        const verified = res.data.find((w) => w.verified);
        if (verified) {
          setAccount(verified.address);
          setIsLinked(true);
        }
      } catch (err) {
        console.error("Failed to fetch wallets", err);
      }
    }
    checkExistingLink();
  }, [api, token]);

  const handleConnect = async () => {
    if (!token) {
      setError("Please login first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Connect to MetaMask
      const { account: acc } = await connectWallet();
      setAccount(acc);

      // 2. Request Linking Nonce
      const { data: linkReq } = await api.post("/wallets/request-link", { address: acc });

      // 3. Sign Message
      const signature = await signMessage(linkReq.messageToSign);

      // 4. Verify Signature
      await api.post("/wallets/verify", {
        address: acc,
        signature
      });

      setIsLinked(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="flex items-center gap-2">
      {isLinked ? (
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] font-mono text-green-700">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
        >
          {loading ? "Linking..." : "Link Wallet"}
        </button>
      )}
      {error && <span className="text-[10px] text-red-500 max-w-[100px] truncate">{error}</span>}
    </div>
  );
}

export default WalletConnect;
