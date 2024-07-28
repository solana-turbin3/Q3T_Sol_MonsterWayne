import { Keypair } from "@solana/web3.js";

//Generate a new keypair
let keypair = Keypair.generate();

console.log(`You've generated a new Solana wallet: ${keypair.publicKey.toBase58()}


To save your wallet, copy and paste the following into a JSON file:

[${keypair.secretKey}]`)

// Pubkey is FvFBd2pXo3L4akhaRuNJqg8F3K6dfcvHCXWzjZ3guFFb