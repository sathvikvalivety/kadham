import React from "react";
import { createApiClient } from "../lib/api";

function RedeemPage() {
  const [token] = React.useState(localStorage.getItem("kadham_token"));
  const api = React.useMemo(() => createApiClient(token), [token]);
  const [products, setProducts] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [message, setMessage] = React.useState(null);

  React.useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
      } catch {
        setProducts([]);
      }
    }
    loadProducts();
  }, [api]);

  const handleRedeem = (e) => {
    e.preventDefault();
    const product = products.find((p) => String(p.id) === selectedId);
    if (!product) {
      return;
    }
    setMessage(
      `Redeem request created for ${product.name} at price ${product.price_gbc} GBC (mock). Confirm redemption off-chain or via a separate flow.`
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Redeem GBC</h1>
      <form onSubmit={handleRedeem} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block text-sm mb-1">Choose eco-product</label>
          <select
            className="w-full border rounded px-2 py-1 text-sm"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} – {p.price_gbc} GBC
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded text-sm font-medium"
          disabled={!selectedId}
        >
          Redeem
        </button>
      </form>
      {message && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">{message}</div>
      )}
    </div>
  );
}

export default RedeemPage;
