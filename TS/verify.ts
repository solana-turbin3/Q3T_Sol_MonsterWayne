import { Connection } from "@solana/web3.js"
import { BorshInstructionCoder, Idl } from "@coral-xyz/anchor";
import { IDL } from "./programs/wba_prereq";
import idl from "./programs/wba_prereq.json"

const verifyTx = async() => {
  const connection = new Connection("https://api.devnet.solana.com");
  const tx = await connection.getTransaction("2v2Y3mn7z1Q4WJ5cApV6wNP36zsY8wyPdA4EwmAze64jjMc4jNFGG2FSY1G7ygZzQ9K1f7mSwd65GiE9LSM1NGG2");
  //console.log("Transaction:", tx);                                                                        
  if (tx) {
    // Verify the program ID called is the WBA program id
    // WBA program ID: WBAQSygkwMox2VuWKU133NxFrpDZUBdvSBeaBEue2Jq
    console.log("Program IDs:");
    tx.transaction.message.programIds().forEach(id => console.log(id.toString()));

    const ixs = tx.transaction.message.instructions;
    // Decodes the program instructions (in our case, the `complete` instruction)
    // https://coral-xyz.github.io/anchor/ts/classes/BorshInstructionCoder.html#format
    const coder = new BorshInstructionCoder(idl as Idl);

    ixs.forEach(ix => {
      const msg = coder.decode(ix.data, "base58");
      console.log("instruction name: ", msg?.name);

      const ixData = msg?.data;
      // @ts-ignore
      // Typescript hack since it doesn't know that the `github` args exists in the
      // params to the `complete` instruction
      const githubBuffer = ixData?.github as Buffer;
      console.log("github username: ", githubBuffer.toString("utf8"));
    });
  }
};

verifyTx();