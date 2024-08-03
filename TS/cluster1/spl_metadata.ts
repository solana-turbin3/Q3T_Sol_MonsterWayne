import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey, Keypair} from "@solana/web3.js"

// Define our Mint address
const mint = new PublicKey("8wo8wDAsbcB93RXResPpBPHwWaecfxDR43EjCuqPikyg")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet)); 
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

// Add the Token Metadata Program
const token_metadata_program_id = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

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
        //Start here
        // Define the accounts needed for the instruction
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            metadata: publicKey(metadata_pda.toString()),
            mint: publicKey(mint.toString()),
            payer: signer,
            mintAuthority: signer,
            updateAuthority: signer.publicKey,
        }
        

        let data: DataV2Args = {
            name: "My NFT KWA",
            symbol: "NFT KWA",
            uri: "https://arweave.net/1234",
            //creators:[]
            creators: null,
            sellerFeeBasisPoints: 0,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data: data,
            isMutable: true,
            collectionDetails: null
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        console.log(bs58.encode(result.signature));
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
