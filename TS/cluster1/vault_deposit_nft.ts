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
  Account,
  TOKEN_PROGRAM_ID,
  getAccount,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
//import { Account } from "@metaplex-foundation/umi";

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

// Mint address
const mint = new PublicKey("8DYrqxp91Bc8CbP25afb8a6wpUtvMxWUXjRqQtC5HABU");

const getVaultTokenBalance = async (vaultAta: Account) => {
  const vaultAccount = await getAccount(connection, vaultAta.address);
  console.log(`Vault token balance: ${vaultAccount.amount} tokens`);
  return vaultAccount.amount;
};

// Execute our deposit transaction
(async () => {
  try {
    const metadataProgram = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
    );
    const metadataAccount = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), metadataProgram.toBuffer(), mint.toBuffer()],
      metadataProgram,
    )[0];
    const masterEdition = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        metadataProgram.toBuffer(),
        mint.toBuffer(),
        Buffer.from("edition"),
      ],
      metadataProgram,
    )[0];

    // Get the token account of the owner's wallet address, and if it does not exist, create it
    const ownerAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey,
    );
    console.log(`Owner ATA: ${ownerAta.address.toBase58()}`);

    // Get the token account of the vault address, and if it does not exist, create it
    const vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth,
      true,
    );
    console.log(`Vault ATA: ${vaultAta.address.toBase58()}`);
    console.log(`Vault Auth: ${vaultAuth.toBase58()}`);
    console.log(`Vault: ${vault.toBase58()}`);

    // Query initial balance
    const initialBalance = await getVaultTokenBalance(vaultAta);

    const signature = await program.methods
      .depositNft()
      .accounts({
        owner: keypair.publicKey,
        ownerAta: ownerAta.address,
        vaultState: vaultState,
        vaultAuth: vaultAuth,
        vaultAta: vaultAta.address,
        nftMetadata: metadataAccount,
        nftMasterEdition: masterEdition,
        tokenMint: mint,
        metadataProgram: metadataProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();
    
    console.log(`Deposit success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);

    // Query balance after deposit
    const finalBalance = await getVaultTokenBalance(vaultAta);

    console.log(`Balance changed by: ${finalBalance - initialBalance} tokens`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
