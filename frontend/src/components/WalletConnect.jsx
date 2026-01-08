import React from "react";
import { connectWallet } from "../lib/ethereum";

function WalletConnect() {
  const [account, setAccount] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleConnect = async () => {
    try {
      setError(null);
      const { account: acc } = await connectWallet();
      setAccount(acc);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {account ? (
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      ) : (
        <button
          onClick={handleConnect}
          className="text-xs px-2 py-1 rounded bg-primary text-white hover:bg-teal-700"
        >
          Connect Wallet
        </button>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default WalletConnect;
