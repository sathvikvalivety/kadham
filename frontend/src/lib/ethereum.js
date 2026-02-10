import { BrowserProvider, Contract, parseUnits } from "ethers";

const GBC_TOKEN_ADDRESS = import.meta.env.VITE_GBC_TOKEN_ADDRESS || "";

const erc20Abi = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)"
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
  console.log("🔍 Checking Balance on Contract:", GBC_TOKEN_ADDRESS); // Verify this matches MetaMask
  const contract = new Contract(GBC_TOKEN_ADDRESS, erc20Abi, provider);
  const [rawBalance, decimals] = await Promise.all([
    contract.balanceOf(address),
    contract.decimals()
  ]);

  const divisor = 10n ** BigInt(decimals);
  const integerPart = rawBalance / divisor;
  const fractionalPart = rawBalance % divisor;
  return `${integerPart}.${fractionalPart.toString().padStart(Number(decimals), "0").slice(0, 4)}`;
}

export async function signMessage(message) {
  if (!window.ethereum) {
    throw new Error("MetaMask is required");
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return await signer.signMessage(message);
}

export async function transferGbc(toAddress, amount) {
  if (!window.ethereum || !GBC_TOKEN_ADDRESS) {
    throw new Error("Blockchain not connected");
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(GBC_TOKEN_ADDRESS, erc20Abi, signer);

  const decimals = await contract.decimals();
  // Safe parsing of token amounts
  const amountWei = parseUnits(amount.toString(), decimals);

  const tx = await contract.transfer(toAddress, amountWei);
  return await tx.wait();
}

export function getExplorerUrl(type, value) {
  // Default to Sepolia (could use env var VITE_CHAIN_ID or similar in future)
  const baseUrl = "https://sepolia.etherscan.io";
  if (type === "tx") return `${baseUrl}/tx/${value}`;
  if (type === "address") return `${baseUrl}/address/${value}`;
  return baseUrl;
}
