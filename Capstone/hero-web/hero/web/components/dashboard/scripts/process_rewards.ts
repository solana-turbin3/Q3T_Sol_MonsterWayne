import { Connection, PublicKey, StakeProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import { hero } from '../../solana/idl/hero_anchor_program';

// Initialize connection, wallet, and program
const connection = new Connection('https://api.devnet.solana.com');
const wallet = new Wallet(/* your wallet keypair */);
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(hero, new PublicKey(hero.metadata.address), provider);

async function processRewards() {
  try {
    // Fetch all UserVault accounts
    const userVaults = await program.account.userVault.all();

    for (const userVault of userVaults) {
      const { publicKey, account } = userVault;
      
      // Skip if no stake account
      if (account.stakeAccount.equals(PublicKey.default)) continue;

      // Fetch the current stake account balance
      const stakeAccountInfo = await connection.getAccountInfo(account.stakeAccount);
      if (!stakeAccountInfo) continue;

      const currentStakeBalance = stakeAccountInfo.lamports;
      const initialStakeAmount = account.stakedAmount;
      const rewards = currentStakeBalance - initialStakeAmount;

      if (rewards > 0) {
        // Split the stake account to separate rewards
        await splitStakeAccount(account.stakeAccount, rewards, publicKey, account.user);

        // Update the UserVault with accumulated rewards
        await program.methods.updateAccumulatedRewards(rewards)
          .accounts({
            userVault: publicKey,
            user: account.user,
          })
          .rpc();

        console.log(`Processed rewards for user ${account.user.toBase58()}: ${rewards / LAMPORTS_PER_SOL} SOL`);
      }
    }
  } catch (error) {
    console.error('Error processing rewards:', error);
  }
}

async function splitStakeAccount(stakeAccountPubkey: PublicKey, rewardsLamports: number, userVaultPubkey: PublicKey, userPubkey: PublicKey) {
  const newStakeAccount = Wallet.generate().publicKey;

  const splitIx = StakeProgram.split({
    stakePubkey: stakeAccountPubkey,
    authorizedPubkey: userVaultPubkey,
    splitStakePubkey: newStakeAccount,
    lamports: rewardsLamports,
  });

  const tx = await program.methods.splitStakeAccount()
    .accounts({
      user: userPubkey,
      userVault: userVaultPubkey,
      stakeAccount: stakeAccountPubkey,
      newStakeAccount: newStakeAccount,
      stakeProgram: StakeProgram.programId,
    })
    .preInstructions([splitIx])
    .rpc();

  console.log(`Split stake account: ${tx}`);
}

// Run the script
processRewards().then(() => {
  console.log('Rewards processing completed');
}).catch((error) => {
  console.error('Error running rewards processing:', error);
});
