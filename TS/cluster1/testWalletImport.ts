import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';
import wallet from "../wba-wallet.json"; // Ensure the correct path to your wallet file

// Log the wallet content to verify the import
console.log("Wallet content:", wallet);

let keypair;
try {
    keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
    console.log("Keypair loaded successfully. Public Key:", keypair.publicKey.toBase58());
} catch (error) {
    console.error("Failed to create Keypair. Invalid keypair:", error);
    process.exit(1);
}