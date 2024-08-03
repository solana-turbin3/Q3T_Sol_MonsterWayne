import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"
import { createBundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));


const bundlrUploader = createBundlrUploader(umi);


umi.use(signerIdentity(signer));


(async () => {
    try {
        //
         const content = await readFile("../ts/cluster1/images/generug.png")
         const image = createGenericFile(content, "genarug.png", {contentType:"image/png"})
         const [myUri] = await bundlrUploader.upload([image])
         console.log("Your image URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();


//Your image URI:  https://arweave.net/gYYjtjVZ6jAafB4Iuwmvthw3FXrtjPA-0ZaejNaojpQ