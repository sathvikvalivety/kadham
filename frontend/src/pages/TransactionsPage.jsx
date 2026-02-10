import React from "react";
import { createApiClient } from "../lib/api";

function TransactionsPage() {
  const [token] = React.useState(localStorage.getItem("kadham_token"));
  const api = React.useMemo(() => createApiClient(token), [token]);
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/transactions/me");
        setItems(res.data);
      } catch {
        setItems([]);
      }
    }
    load();
  }, [api]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transaction History</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Direction</th>
              <th className="px-3 py-2 text-left">Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {items.map((tx) => (
              <tr key={tx.id} className="border-t">
                <td className="px-3 py-2">{new Date(tx.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{tx.type}</td>
                <td className="px-3 py-2">
                  {tx.amount} {tx.token_symbol}
                </td>
                <td className="px-3 py-2">{tx.direction}</td>
                <td className="px-3 py-2 break-all text-xs">
                  {tx.tx_hash ? (
                    <a href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {tx.tx_hash.slice(0, 10)}...
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-gray-500" colSpan={5}>
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionsPage;
