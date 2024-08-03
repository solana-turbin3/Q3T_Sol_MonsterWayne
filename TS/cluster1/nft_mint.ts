import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    let tx = createNft(umi,
       {
           mint,
           uri: "https://arweave.net/UmWK15zw-xNYaA_vOm_xeCcBvgHLFt8AZcDTW3r5SQw",
    
           name : "MONSTER RUG",
           symbol: "MRUG",
           sellerFeeBasisPoints: percentAmount(1)

       }
       )
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
   
   console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

   console.log("Mint Address: ", mint.publicKey);
})();

// Succesfully Minted! Check out your TX here:
// https://explorer.solana.com/tx/3Y6eHenUmPDon1HrciVBLaXR3wvHfTmwcTV8AFjpGkVfMcWs3ecAGMp2e6Fh5pQaDJ8Gi7qMSayTHoJWpgVXBg77?cluster=devnet
// Mint Address:  8DYrqxp91Bc8CbP25afb8a6wpUtvMxWUXjRqQtC5HABU