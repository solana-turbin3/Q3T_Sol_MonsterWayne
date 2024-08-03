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
const commitment: Commitment = "confirmed";

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment,
});

// Create our program
const program = new Program<WbaVault>(IDL, "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address, provider);

// Vault state public key
const vaultState = new PublicKey("2fZ9BxQCgiyRKKC6xPoxfTHqeuoefc36tyPcyQQyByyd");

// Create the PDA for our vaultAuth account
const vaultAuthSeeds = [Buffer.from("auth"), vaultState.toBuffer()];
const [vaultAuth, _bump] = PublicKey.findProgramAddressSync(vaultAuthSeeds, program.programId);

// Create the PDA for our vault account
const vaultSeeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
const [vault, _bump2] = PublicKey.findProgramAddressSync(vaultSeeds, program.programId);

// Function to get the balance of a given account
const getBalance = async (publicKey: PublicKey) => {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
};

// Execute our withdraw transaction
(async () => {
  try {
    // Get initial balance
    const initialBalance = await getBalance(vault);
    console.log(`Initial vault balance: ${initialBalance} SOL`);

    const signature = await program.methods
      .withdraw(new BN(LAMPORTS_PER_SOL * 1))
      .accounts({
        vault,
        vaultAuth,
        vaultState,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();

    console.log(`Withdraw success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);

    // Get final balance
    const finalBalance = await getBalance(vault);
    console.log(`Final vault balance: ${finalBalance} SOL`);
    console.log(`Balance changed by: ${initialBalance - finalBalance} SOL`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
