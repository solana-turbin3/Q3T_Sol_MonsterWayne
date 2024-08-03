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

// Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
    try {
        // Create a new SPL token mint
        const mint = await createMint(
            connection,
            keypair,
            keypair.publicKey,
            null,
            6, // decimals
        );

        console.log(`Mint address: ${mint.toBase58()}`);
    } catch (error) {
        console.error(`Oops, something went wrong: ${error}`);
    }
})();


//  Mint address: 8wo8wDAsbcB93RXResPpBPHwWaecfxDR43EjCuqPikyg