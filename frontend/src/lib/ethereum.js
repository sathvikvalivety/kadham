import { BrowserProvider, Contract } from "ethers";

const GBC_TOKEN_ADDRESS = import.meta.env.VITE_GBC_TOKEN_ADDRESS || "";

const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is required");
  }
  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer, account: accounts[0] };
}

export async function getGbcBalance(address) {
  if (!window.ethereum || !GBC_TOKEN_ADDRESS) {
    return null;
  }
  const provider = new BrowserProvider(window.ethereum);
  const contract = new Contract(GBC_TOKEN_ADDRESS, erc20Abi, provider);
  const [rawBalance, decimals] = await Promise.all([
    contract.balanceOf(address),
    contract.decimals()
  ]);
  const divisor = 10n ** BigInt(decimals);
  const integerPart = rawBalance / divisor;
  const fractionalPart = rawBalance % divisor;
  return `${integerPart}.${fractionalPart.toString().padStart(decimals, "0").slice(0, 4)}`;
}
