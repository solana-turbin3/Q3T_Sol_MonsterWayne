import wallet from "../wba-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { 
    Metadata,
    PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { PublicKey, Keypair } from "@solana/web3.js";

// Define our Mint address
const mint = new PublicKey("8wo8wDAsbcB93RXResPpBPHwWaecfxDR43EjCuqPikyg");

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet)); 
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

// Add the Token Metadata Program
const token_metadata_program_id = TOKEN_METADATA_PROGRAM_ID;

// Create PDA for token metadata
const metadata_seeds = [
    Buffer.from('metadata'),
    token_metadata_program_id.toBuffer(),
    mint.toBuffer(),
];

// Find program address
const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(
    metadata_seeds,
    token_metadata_program_id,
);

console.log(`Metadata PDA: ${metadata_pda.toBase58()}`);

(async () => {
    try {
        // Fetch the metadata account info
        const accountInfo = await umi.connection.getAccountInfo(metadata_pda);
        if (accountInfo === null) {
            console.log("Metadata account does not exist.");
            return;
        }

        // Decode the metadata account
        const metadata = Metadata.deserialize(accountInfo.data);
        const metadataData = metadata[0].data;

        // Print the metadata information
        console.log(`Name: ${metadataData.name}`);
        console.log(`Symbol: ${metadataData.symbol}`);
        console.log(`URI: ${metadataData.uri}`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`);
    }
})();
