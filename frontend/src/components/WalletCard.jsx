import React, { useEffect, useState, useCallback } from "react";
import { getGbcBalance } from "../lib/ethereum";

function WalletCard({ walletAddress, refreshTrigger }) {
    const [balance, setBalance] = useState("0.0000");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBalance = useCallback(async () => {
        if (!walletAddress) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        try {
            console.log("ClickRefresh: fetching balance for", walletAddress);
            const bal = await getGbcBalance(walletAddress);

            if (!isMounted) return;

            if (bal !== null) {
                console.log("ClickRefresh: Balance updated to", bal);
                setBalance(bal);
            } else {
                console.warn("ClickRefresh: Balance fetch returned null, keeping old value");
            }
        } catch (err) {
            if (isMounted) {
                console.error("WalletCard error:", err);
                setError("Failed to load");
            }
        } finally {
            if (isMounted) setLoading(false);
        }

        return () => { isMounted = false; };
    }, [walletAddress]);

    // Fetch when address changes or trigger fires
    useEffect(() => {
        fetchBalance();
    }, [fetchBalance, refreshTrigger]);

    return (
        <div className="rounded-xl p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden group border border-slate-700">
            {/* Background Decoration */}
            <div className="absolute -top-4 -right-4 bg-emerald-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">GBC Balance</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                            {loading && balance === "0.0000" ? (
                                <div className="h-8 w-24 bg-slate-700 animate-pulse rounded"></div>
                            ) : (
                                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                                    {balance}
                                </span>
                            )}
                            <span className="text-sm font-medium text-slate-500">GBC</span>
                        </div>
                    </div>

                    <button
                        onClick={fetchBalance}
                        disabled={loading}
                        className={`p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 transition-all text-slate-400 hover:text-white ${loading ? 'animate-spin' : ''}`}
                        title="Refresh Balance"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                        <span className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></span>
                        {walletAddress ? (
                            <a
                                href={`https://sepolia.etherscan.io/address/${walletAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors hover:underline"
                            >
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </a>
                        ) : (
                            <span>No Wallet Linked</span>
                        )}
                    </div>
                    {error && <span className="text-red-400">{error}</span>}
                </div>
            </div>
        </div>
    );
}

export default WalletCard;
