import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@coral-xyz/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "../wba-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = "finalized";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

// Create our program
const program = new Program<WbaVault>(IDL, "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address, provider);

// Create a random keypair
const vaultState = new PublicKey("2fZ9BxQCgiyRKKC6xPoxfTHqeuoefc36tyPcyQQyByyd");
console.log(`VaultState public key: ${vaultState.toBase58()}`);

// Seeds are "auth", vaultState
const vaultAuthSeeds = [Buffer.from("auth"), vaultState.toBuffer()];
// Create the PDA for our enrollment account
 const [vaultAuth, _bump] = PublicKey.findProgramAddressSync(vaultAuthSeeds, program.programId);


// Seeds are "vault", vaultAuth
const vaultSeeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
// Create the vault key
 const [vault, _bump2] = PublicKey.findProgramAddressSync(vaultSeeds, program.programId);
 console.log(`Vault that will hold the funds deposited address: ${vault.toBase58()}`);

 const getVaultBalance = async () => {
  const balance = await connection.getBalance(vault);
  console.log(`Vault balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  return balance;
};

// Execute our enrollment transaction
(async () => {
  try {
    // Query initial balance
    const initialBalance = await getVaultBalance();

    const signature = await program.methods
    .deposit(new BN(LAMPORTS_PER_SOL * 1)    )
    .accounts({
       owner: keypair.publicKey,
       vaultState: vaultState,
       vaultAuth: vaultAuth,
       vault: vault,
       systemProgram: SystemProgram.programId,
      })
    .signers([
        keypair
    ]).rpc();
    console.log(`Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);

    // Query balance after deposit
    const finalBalance = await getVaultBalance();

    console.log(`Balance changed by: ${(finalBalance - initialBalance) / LAMPORTS_PER_SOL} SOL`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
