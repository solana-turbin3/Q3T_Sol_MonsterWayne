import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "../wba-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("8wo8wDAsbcB93RXResPpBPHwWaecfxDR43EjCuqPikyg");

(async () => {
    try {
        // Create a new ATA for the mint
        const associatedTokenAddress = await getOrCreateAssociatedTokenAccount(
            connection,// Connection to the network
            keypair,
            mint,
            keypair.publicKey,
            

        );

        console.log(`Associated token address: ${associatedTokenAddress.address.toBase58()}`);

        // Mint tokens to the associated token address
        await mintTo(
            connection,
            keypair,
            mint,
            associatedTokenAddress.address,
            keypair.publicKey,
            token_decimals
        );

        console.log(`Minted ${token_decimals} tokens to the associated token address`);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
