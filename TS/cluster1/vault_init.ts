import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
} from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, Address } from "@coral-xyz/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";
/// J8qKEmQpadFeBuXAVseH8GNrvsyBhMT8MHSVD3enRgJz

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = "confirmed";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider,
);

// Create a random keypair
const vaultState = Keypair.generate();
console.log(`Vault public key: ${vaultState.publicKey.toBase58()}`);
//2fZ9BxQCgiyRKKC6xPoxfTHqeuoefc36tyPcyQQyByyd
//The vaultState account holds the state information of the vault. This account is where you store the configuration and status of the vault.
// This account could contain various data such as:
// Total amount of funds deposited.
// Configuration settings (e.g., access controls, rules for the vault).
// Metadata related to the vault's operation.

// Seeds are "auth", vaultState
const vaultAuthSeeds = [Buffer.from("auth"), vaultState.publicKey.toBuffer()]; 

// create the PDA  for our enrollment account
const [vaultAuth, _bump] = PublicKey.findProgramAddressSync(vaultAuthSeeds, program.programId);
//The vaultAuth account holds the authority of the vault. This account is used to sign transactions that modify the vault state.


const vaultSeeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
const [vault, _bump2] = PublicKey.findProgramAddressSync(vaultSeeds, program.programId);
// The vault account holds the funds deposited into the vault. This account is where you store the funds that users deposit into the vault.


// Execute our enrollment transaction
(async () => {
  try {
    const signature = await program.methods.initialize()
    .accounts({
     owner: keypair.publicKey,
     vaultState: vaultState.publicKey,
     vaultAuth: vaultAuth,
     vault: vault,
    systemProgram: SystemProgram.programId,
      //Note 2
    }).signers([keypair, vaultState]).rpc();
    console.log(`Init success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();


// Vault public key: 2fZ9BxQCgiyRKKC6xPoxfTHqeuoefc36tyPcyQQyByyd
// Init success! Check out your TX here:

// https://explorer.solana.com/tx/3fBxp16SJwGzeURxzFGoHHUe6z6ojK5D6uJkpQJ3YAuaWAJsswBfEwWF1HF4Tm3S1XNFbGzbubR8fDviKphgcUer?cluster=devnet
