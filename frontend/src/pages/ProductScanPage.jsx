import React from "react";
import { createApiClient } from "../lib/api";
import QRScanMock from "../components/QRScanMock";
import EcoScoreCard from "../components/EcoScoreCard";

function ProductScanPage() {
  const [token] = React.useState(localStorage.getItem("kadham_token"));
  const api = React.useMemo(() => createApiClient(token), [token]);
  const [product, setProduct] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleScan = async (sku) => {
    setError(null);
    setProduct(null);
    try {
      const res = await api.get(`/products`);
      const found = res.data.find((p) => p.sku === sku) || res.data[0] || null;
      setProduct(found);
    } catch (_err) {
      setError("Failed to load product info");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Scan Product (mock)</h1>
      <QRScanMock label="Scan product QR / barcode (mock)" onScan={handleScan} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {product && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div className="bg-white rounded p-4 shadow">
            <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
            <p className="text-sm text-gray-700 mb-2">{product.description}</p>
            <p className="text-xs text-gray-600">SKU: {product.sku}</p>
          </div>
          <EcoScoreCard score={product.eco_score} label="Product Eco Score" />
        </div>
      )}
      {!product && !error && (
        <p className="text-xs text-gray-600">
          Scan a product to see its eco-score. Scores are stored in the Kadham backend, not
          calculated on this client.
        </p>
      )}
    </div>
  );
}

export default ProductScanPage;
