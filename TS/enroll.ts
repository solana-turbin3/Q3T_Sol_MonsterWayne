import { Connection, Keypair, PublicKey, SystemProgram  } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Idl,  } from "@coral-xyz/anchor"
import { IDL, WbaPrereq } from "./programs/wba_prereq";
import idl from "./programs/wba_prereq.json"
import wallet from "./wba-wallet.json"
import { idlAddress } from "@coral-xyz/anchor/dist/cjs/idl";

// Define the accounts context for the complete method
// type CompleteAccounts = {
//     signer: PublicKey;
//     prereq: PublicKey;
//     systemProgram: PublicKey;
//   };


// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");


// Github account
const github = Buffer.from("monsterwayne", "utf8");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
    commitment: "confirmed"});

    // Create our program
//const program : Program<WbaPrereq> = new Program(IDL, provider);
//const program = new Program<WbaPrereq>(IDL as Idl, new PublicKey(IDL.address), provider);
//const program = new Program(idl as Idl, new PublicKey(idlAddress), provider);
const program = new Program(idl as Idl, provider);

// Create the PDA for our enrollment account
const enrollment_seeds = [Buffer.from("prereq"), keypair.publicKey.toBuffer()];
const [enrollment_key, _bump] = PublicKey.findProgramAddressSync(enrollment_seeds, program.programId);

// Execute our enrollment transaction
(async () => {

  
     console.log("Enrollment key", enrollment_key);

    try {
          const txhash = await program.methods
          .complete(github) // Call the complete method with the github account
          .accounts({ // Pass in the accounts required by the program
              signer: keypair.publicKey, // The signer is the keypair's public key
              prereq: enrollment_key, // The enrollment account
              system_program: SystemProgram.programId // The system program ID
          })
          .signers([
              keypair
          ]).rpc();
          console.log(`Success! Check out your TX here:
          https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
      } catch(e) {
          console.error(`Oops, something went wrong: ${e}`)
    } 

})();


    