import React from "react";
import { transferGbc } from "../lib/ethereum";

// Placeholder Treasury Address
const TREASURY_ADDRESS = "0x9ed497386210CD393FBd62661bfB25220D9e5687";

function ProductCard({ product, image, onRedeemSuccess }) {
    const [loading, setLoading] = React.useState(false);

    const handleRedeem = async () => {
        if (!window.confirm(`Redeem ${product.name} for ${product.price_gbc} GBC?`)) return;

        setLoading(true);
        try {
            console.log(`Transferring ${product.price_gbc} GBC to ${TREASURY_ADDRESS}...`);
            await transferGbc(TREASURY_ADDRESS, product.price_gbc);

            onRedeemSuccess(product);
            alert("Redemption Successful! Your GBC has been transferred.");
        } catch (err) {
            console.error(err);
            alert("Transaction failed: " + (err.reason || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col">
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                <img
                    src={image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-full text-green-700 shadow-sm">
                    {product.eco_score} Eco-Pts
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="font-bold text-primary text-xl">{product.price_gbc} GBC</span>
                    <button
                        onClick={handleRedeem}
                        disabled={loading}
                        className="bg-primary hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? "Processing..." : "Redeem"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
