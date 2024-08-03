import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
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
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  Account,
} from "@solana/spl-token";

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

// Vault state public key
const vaultState = new PublicKey("2fZ9BxQCgiyRKKC6xPoxfTHqeuoefc36tyPcyQQyByyd");

// Create the PDA for our vaultAuth account
const vaultAuthSeeds = [Buffer.from("auth"), vaultState.toBuffer()];
const [vaultAuth, _bump] = PublicKey.findProgramAddressSync(vaultAuthSeeds, program.programId);

// Create the PDA for our vault account
const vaultSeeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
const [vault, _bump2] = PublicKey.findProgramAddressSync(vaultSeeds, program.programId);

// Token decimals
const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("8wo8wDAsbcB93RXResPpBPHwWaecfxDR43EjCuqPikyg");

const getVaultTokenBalance = async (vaultAta: Account) => {
  const vaultAccount = await getAccount(connection, vaultAta.address);
  console.log(`Vault token balance: ${vaultAccount.amount / token_decimals} tokens`);
  return vaultAccount.amount;
};

// Execute our enrollment transaction
(async () => {
  try {
    // Get the token account of the owner address, and if it does not exist, create it
    const ownerAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey,
    );

    // Get the token account of the vault address, and if it does not exist, create it
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth,
      true  // Ensure this is a valid associated token account
    );

    // Query initial balance
    const initialBalance = await getVaultTokenBalance(vaultAta);

    const signature = await program.methods
      .depositSpl(new BN(1000000))
      .accounts({
        owner: keypair.publicKey,
        ownerAta: ownerAta.address,
        vaultState: vaultState,
        vaultAuth: vaultAuth,
        vaultAta: vaultAta.address,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();
    
    console.log(`Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);

    // Query balance after deposit
    const finalBalance = await getVaultTokenBalance(vaultAta);

    console.log(`Balance changed by: ${(finalBalance - initialBalance) / token_decimals} tokens`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();


// Vault token balance: 0 tokens
// Deposit success! Check out your TX here:

// https://explorer.solana.com/tx/2KQkKTv2V9Niq3N1puyXSzGwUsqgidsnsiGBHwbYLxghfKu47ziXGXfANDUzJGzkDmviNCzE6QFZaUgtDA2M87c9?cluster=devnet
// Vault token balance: 1 tokens
// Balance changed by: 1 tokens