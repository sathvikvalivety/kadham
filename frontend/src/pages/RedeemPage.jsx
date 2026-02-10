import React from "react";
import { createApiClient } from "../lib/api";
import ProductCard from "../components/ProductCard";
import GreenAlternatives from "../components/GreenAlternatives";

// Helper to assign images based on seed data
const getProductImage = (sku) => {
  const images = {
    "BAMBOO-TB-001": "https://images.unsplash.com/photo-1607613009820-a29f7bb6dc08?auto=format&fit=crop&q=80&w=800",
    "STEEL-BOT-001": "https://images.unsplash.com/photo-1602143407151-011141920038?auto=format&fit=crop&q=80&w=800",
    "SOLAR-PB-001": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
    "MESH-BAG-001": "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800",
    "RECYC-NB-001": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
    "COMP-BIN-001": "https://images.unsplash.com/photo-1584274702511-92e1b802a11b?auto=format&fit=crop&q=80&w=800",
  };
  return images[sku] || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800";
};

function RedeemPage() {
  const [token] = React.useState(localStorage.getItem("kadham_token"));
  const api = React.useMemo(() => createApiClient(token), [token]);
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadProducts = React.useCallback(async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRedeemSuccess = (product) => {
    // Optional: Refresh balance or show visual feedback
    console.log("Redeemed:", product.name);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Eco Marketplace</h1>
          <p className="text-gray-600 mt-2">Spend your GBC tokens on sustainable products. Shipping included!</p>
        </div>
        <div className="bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-100">
          🌿 1 GBC = 1 Sustainable Action
        </div>
      </div>

      {/* Greener Alternatives Section */}
      <GreenAlternatives />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              image={getProductImage(p.sku)}
              onRedeemSuccess={handleRedeemSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RedeemPage;
