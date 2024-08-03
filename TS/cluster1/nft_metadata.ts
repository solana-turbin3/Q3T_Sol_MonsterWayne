import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { bundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";


// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

//const uploader = bundlrUploader(umi);


(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

         const image = "https://arweave.net/gYYjtjVZ6jAafB4Iuwmvthw3FXrtjPA-0ZaejNaojpQ"
         const metadata = {
             name: "Monster Rug",
             symbol: "MRUG",
             description: "THE BIG RUG",
             image,
             attributes: [
                 {
                trait_type: "Background",
                value: 'pink'
                },
                {
                trait_type: "Rarity",
                value: 'GOAT'
                    },
                {
                trait_type: "Color",
                value: 'Supa Pink'
                            }
             ],
             properties: {
                 files: [
                     {
                         type: "image/png",
                         uri: image
                     },
                 ]
             },
             creators: []
         };
         const myUri = await umi.uploader.uploadJson(metadata)
         console.log("Your image URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();

//https://arweave.net/X0O-ASB4RmwIZ9PnOaPCRsvKFfr0e9NTaPCrhiL2bLo