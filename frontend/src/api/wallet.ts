const API_URL = "http://localhost:8081/api";

export async function generateMnemonic() {
  const res = await fetch(`${API_URL}/mnemonic`);
  return res.json();
}

export async function deriveSolanaAddress(mnemonic: string, index = 0) {
  const res = await fetch(`${API_URL}/solana/address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mnemonic, index }),
  });
  return res.json();
}

export async function deriveEthereumAddress(mnemonic: string, index = 0) {
  const res = await fetch(`${API_URL}/ethereum/address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mnemonic, index }),
  });
  return res.json();
}

export async function encryptWallet(mnemonic: string, password: string) {
  const res = await fetch(`${API_URL}/encrypt-wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mnemonic, password }),
  });
  return res.json();
}

export async function decryptWallet(encrypted: string, password: string) {
  const res = await fetch(`${API_URL}/decrypt-wallet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ encrypted, password }),
  });
  return res.json();
}

export async function signSolanaMessage(mnemonic: string, index: number, message: string) {
  const res = await fetch(`${API_URL}/solana/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mnemonic, index, message }),
  });
  return res.json();
}

export async function signEthereumMessage(mnemonic: string, index: number, message: string) {
  const res = await fetch(`${API_URL}/ethereum/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mnemonic, index, message }),
  });
  return res.json();
} 