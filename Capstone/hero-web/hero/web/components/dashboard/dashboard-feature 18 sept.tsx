'use client';

import { useState, useEffect } from 'react';
import { AppHero } from '../ui/ui-layout';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, StakeProgram, LAMPORTS_PER_SOL, Authorized, Transaction, sendAndConfirmTransaction, Lockup, Connection, clusterApiUrl } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { idl } from '../solana/idl/hero_anchor_program';
import { Idl } from '@project-serum/anchor';
import { Address, AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
//import cron from 'node-cron';

const PROGRAM_ID = new PublicKey('3V5Powcaj74ieaZPnTg1wE1mPY5C9ZQJcFyUAKkWrU4U');

export default function DashboardFeature() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [creatorPDA, setCreatorPDA] = useState<string | null>(null);
  const [creatorData, setCreatorData] = useState<any>(null);
  const [userPDA, setUserPDA] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [stakeAccountPubkey, setStakeAccountPubkey] = useState<string | null>(null);
  const [validatorPubkey, setValidatorPubkey] = useState<string | null>(null);
  const [creatorPubkey, setCreatorPubkey] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [updatedUserVaultData, setUpdatedUserVaultData] = useState<any>(null);
  const [stakeAccountData, setStakeAccountData] = useState<any>(null);
  const [rewardsStakeAccountPubkey, setRewardsStakeAccountPubkey] = useState<string | null>(null);

  const getProgram = () => {
    console.log('Getting program');
    const provider = new anchor.AnchorProvider(
      connection,
      window.solana,
      { preflightCommitment: 'processed' }
    );
    console.log('Provider created:', provider);
    
    console.log('Creating program with IDL:', idl);
    console.log('Program ID:', PROGRAM_ID.toBase58());
    
    try {
      console.log('IDL:', idl);
      console.log('PROGRAM_ID:', PROGRAM_ID.toBase58());
      console.log('Provider:', provider);
      
      const program = new anchor.Program(idl as Idl, PROGRAM_ID as Address, provider);
      console.log('Program methods:', Object.keys(program.methods));
      return program;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  };

  const initializeCreator = async () => {
    console.log('Initializing creator');
    if (!publicKey) {
      console.log('No public key available');
      return;
    }
    try {
      const program = getProgram();
      console.log('Program obtained:', program);
      console.log('Finding program address');
      const [creatorPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), publicKey.toBuffer()],
        program.programId
      );
      console.log('Creator PDA found:', creatorPDA.toBase58());

      const creatorName = "monster";

      console.log('Calling initcreator method');
      const tx = await program.methods
        .initcreator(creatorName)
        .accounts({
          creator: publicKey,
          creatorVault: creatorPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log('initcreator method called successfully');
      console.log('Transaction signature:', tx);
      console.log('Creator PDA public key:', creatorPDA.toBase58());

      setCreatorPDA(creatorPDA.toBase58());
      console.log('Creator PDA set in state');
      alert(`Creator initialized successfully!\nTransaction signature: ${tx}\nCreator PDA: ${creatorPDA.toBase58()}`);
    } catch (error) {
      console.error('Error initializing creator:', error);
      if (error instanceof Error) {
        alert(`Failed to initialize creator: ${error.message}`);
      } else {
        alert('Failed to initialize creator: Unknown error');
      }
    }
  };

  const initUserAndStakeSOL = async () => {
    if (!publicKey || !stakeAmount) {
      console.log('Missing required information for user initialization and staking');
      return;
    }
    try {
      const program = getProgram();
      console.log('Program obtained:', program);
      
      // Fetch the latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      
      // Predefined creator public key (ensure this is correct)
      const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");

      // Convert the stake amount to lamports
      const totalLamports = parseFloat(stakeAmount) * LAMPORTS_PER_SOL;
      
      // Fetch the creator vault to get the name
      const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );
      
      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;
      
      // Derive the user vault PDA
      const [userPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user_vault'),
          publicKey.toBuffer(),
          Buffer.from(creatorName)
        ],
        program.programId
      );

      // Create the stake account keypair
      const stakeAccount = Keypair.generate();

      // Calculate the rent-exempt amount for the stake account
      const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);

      // Ensure the total lamports cover both rent-exempt amount and staked amount
      if (totalLamports <= rentExemptAmount) {
        alert('The amount must be greater than the rent-exempt amount required for the stake account.');
        return;
      }

      // Amount to stake after covering rent-exempt
      const stakeLamports = totalLamports - rentExemptAmount;

      // **Instruction: initialize user**
      const initUserIx = await program.methods.inituser(creatorPublicKey)
        .accounts({
          user: publicKey,
          creator: creatorPublicKey,
          creatorVault: creatorVaultPDA,
          userVault: userPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .instruction();

      // **Instruction: create stake account**
      const createStakeAccountIx = StakeProgram.createAccount({
        fromPubkey: publicKey,
        stakePubkey: stakeAccount.publicKey,
        authorized: new Authorized(userPDA, userPDA),
        lockup: new Lockup(0, 0, userPDA),
        lamports: totalLamports,
      });

      // **Instruction: stake SOL**
      const stakeSolIx = await program.methods
        .stakesol(new BN(stakeLamports))
        .accounts({
          user: publicKey,
          creator: creatorPublicKey,
          userVault: userPDA,
          creatorVault: creatorVaultPDA,
          validatorVote: new PublicKey('5MrQ888HbPthezJu4kWg9bFfZg2FMLtQWzixQgNNX48B'), // Replace with actual validator public key
          stakeAccount: stakeAccount.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          stakeProgram: StakeProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
          stakeConfig: new PublicKey('StakeConfig11111111111111111111111111111111'),
        })
        .instruction();

      // Create the transaction and add all instructions
      const transaction = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: publicKey,
      }).add(
        initUserIx,
        createStakeAccountIx,
        stakeSolIx
      );

      // Sign the transaction with the stake account's keypair
      transaction.partialSign(stakeAccount);

      // Let the wallet (e.g., Phantom) sign the transaction
      const signedTransaction = await window.solana.signTransaction(transaction);

      // Send and confirm the transaction
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(txid, 'confirmed');

      alert(`User initialized and ${stakeAmount} SOL staked successfully!\nTransaction signature: ${txid}`);
    } catch (error) {
      console.error('Error initializing user and staking SOL:', error);
      if (error instanceof Error) {
        alert(`Failed to initialize user and stake SOL: ${error.message}`);
      } else {
        alert('Failed to initialize user and stake SOL: Unknown error');
      }
    }
  };

  const fetchCreatorData = async () => {
    if (!publicKey) return;

    try {
      const program = getProgram();
      const [creatorPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), publicKey.toBuffer()],
        program.programId
      );

      try {
        const account = await program.account.creatorVault.fetch(creatorPDA);
        setCreatorData({
          ...account,
          name: account.name // Assuming the name field exists in the account data
        });
        setCreatorPDA(creatorPDA.toBase58());
      } catch (error) {
        console.log('Creator PDA not initialized');
        setCreatorData(null);
        setCreatorPDA(null);
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
      setCreatorData(null);
      setCreatorPDA(null);
    }
  };

  const fetchUserData = async () => {
    if (!publicKey) return;

    try {
      const program = getProgram();
      const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");

      const [creatorVaultPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );

      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      const [userPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('user_vault'), publicKey.toBuffer(), Buffer.from(creatorName)],
        program.programId
      );

      const userAccount = await program.account.userVault.fetch(userPDA);
      setUserData({
        ...userAccount,
        creatorName: creatorName,
      });
      setUserPDA(userPDA.toBase58());
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      setUserPDA(null);
    }
  };

  const handleDeposit = async () => {
    if (!publicKey || !userPDA) {
      console.log('No public key or user PDA available');
      return;
    }
    try {
      const program = getProgram();
      const amount = new BN(parseFloat(depositAmount) * LAMPORTS_PER_SOL);
      const creatorPublicKey = publicKey; // Assuming the creator is the same as the user for this example

      const [userVaultPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('user_vault'), publicKey.toBuffer(), creatorPublicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods.deposit(amount).accounts({
        user: publicKey,
        creator: creatorPublicKey,
        userVault: userVaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      console.log('Deposit successful');
      console.log('Transaction signature:', tx);
      alert(`Deposit successful!\nTransaction signature: ${tx}`);
    } catch (error) {
      console.error('Error depositing:', error);
      if (error instanceof Error) {
        alert(`Failed to deposit: ${error.message}`);
      } else {
        alert('Failed to deposit: Unknown error');
      }
    }
  };

  const delegateStakeAccount = async () => {
    if (!publicKey || !userData || !stakeAccountPubkey) {
      console.log('Missing public key, user data, or stake account public key');
      return;
    }

    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const program = getProgram();
      const creatorPublicKey = new PublicKey(userData.creator);
      const stakeAccountPubkeyObj = new PublicKey(stakeAccountPubkey);

      // Derive the PDAs
      const [creatorVaultPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );

      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      const [userVaultPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('user_vault'), publicKey.toBuffer(), Buffer.from(creatorName)],
        program.programId
      );

      // Call the delegate_stake instruction
      await program.methods
        .delegateStake(creatorName)
        .accounts({
          user: publicKey,
          stakeAccount: stakeAccountPubkeyObj,
          validatorVote: new PublicKey('FPLsTTUKE4uvbjmB9XcRHtEcMg5HY9siyEm447vFSu8m'),
          userVault: userVaultPDA,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
          stakeConfig: new PublicKey('StakeConfig11111111111111111111111111111111'),
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Stake account delegated successfully.');
      alert('Stake account delegated successfully.');

      // Fetch and display the stake account data
      const stakeAccountInfo = await connection.getParsedAccountInfo(stakeAccountPubkeyObj);
      if (stakeAccountInfo.value) {
        console.log('Stake Account Data:', stakeAccountInfo.value.data);
        setStakeAccountData(stakeAccountInfo.value.data);
      } else {
        console.log('Failed to fetch stake account data.');
      }
    } catch (error) {
      console.error('Error delegating stake account:', error);
      alert(`Failed to delegate stake account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deactivateStakeAccount = async () => {
    if (!publicKey || !userData || !stakeAccountPubkey) {
      console.log('Missing public key, user data, or stake account public key');
      return;
    }

    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const program = getProgram();
      const creatorPublicKey = new PublicKey(userData.creator);
      const stakeAccountPubkeyObj = new PublicKey(stakeAccountPubkey);

      // Derive the PDAs
      const [creatorVaultPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );

      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      const [userVaultPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('user_vault'), publicKey.toBuffer(), Buffer.from(creatorName)],
        program.programId
      );

      // Call the deactivate_stake instruction
      await program.methods
        .deactivateStake(creatorName)
        .accounts({
          user: publicKey,
          stakeAccount: stakeAccountPubkeyObj,
          userVault: userVaultPDA,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
          stakeConfig: new PublicKey('StakeConfig11111111111111111111111111111111'),
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Stake account deactivated successfully.');
      alert('Stake account deactivated successfully.');

      // Fetch and display the stake account data
      const stakeAccountInfo = await connection.getParsedAccountInfo(stakeAccountPubkeyObj);
      if (stakeAccountInfo.value) {
        console.log('Stake Account Data:', stakeAccountInfo.value.data);
        setStakeAccountData(stakeAccountInfo.value.data);
      } else {
        console.log('Failed to fetch stake account data.');
      }
    } catch (error) {
      console.error('Error deactivating stake account:', error);
      alert(`Failed to deactivate stake account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const splitStakeAccount = async () => {
    if (!publicKey || !userData || !stakeAccountPubkey) {
      console.log('Missing public key, user data, or stake account public key');
      return;
    }

    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const program = getProgram();

      // Original stake account
      const originalStakeAccountPubkey = new PublicKey(stakeAccountPubkey);

      // New stake account to hold the rewards
      const rewardsStakeAccount = Keypair.generate();

      // Fetch the stake account info to get the total balance
      const stakeAccountInfo = await connection.getAccountInfo(originalStakeAccountPubkey);
      if (!stakeAccountInfo) {
        throw new Error('Original stake account not found');
      }

      // Assume initialStakeAmount is the amount originally staked (you need to store this when staking)
      const initialStakeLamports = userData.staked_amount;

      // Calculate the rewards amount
      const totalLamports = stakeAccountInfo.lamports;
      const rewardsLamports = totalLamports - initialStakeLamports;

      if (rewardsLamports <= 0) {
        console.log('No rewards to split');
        return;
      }

      
      const creatorPublicKey = new PublicKey(userData.creator);
      const stakeAccountPubkeyObj = new PublicKey(stakeAccountPubkey);

      // Derive the PDAs
      const [creatorVaultPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );

      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      const [userVaultPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('user_vault'), publicKey.toBuffer(), Buffer.from(creatorName)],
        program.programId
      );

          // Get the rent-exempt reserve for a stake account
    const rentExemptReserve = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);

      // Create the split instruction
      const splitInstruction = StakeProgram.split({
          stakePubkey: originalStakeAccountPubkey,
          authorizedPubkey: userVaultPDA, // The authorized withdrawer is the user vault PDA
          splitStakePubkey: rewardsStakeAccount.publicKey,
          lamports: rewardsLamports,
          
      },rentExemptReserve);

      const transaction = new Transaction().add(
        StakeProgram.createAccount({
          fromPubkey: publicKey,
          stakePubkey: rewardsStakeAccount.publicKey,
          authorized: new Authorized(userVaultPDA, userVaultPDA),
          lockup: new Lockup(0, 0, userVaultPDA),
          lamports: await connection.getMinimumBalanceForRentExemption(StakeProgram.space),
         // The authorized staker is the user vault PDA
         // space: StakeProgram.space,
         // programId: StakeProgram.programId,
        }),
        splitInstruction,
      );

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;

      // Partially sign by the rewards stake account
      transaction.partialSign(rewardsStakeAccount);

      // Sign and send the transaction
      const signedTx = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Stake account split successfully');
      alert(`Stake account split successfully!\nNew Rewards Stake Account: ${rewardsStakeAccount.publicKey.toBase58()}`);

      // Store the rewards stake account public key for later use
      setRewardsStakeAccountPubkey(rewardsStakeAccount.publicKey.toBase58());

    } catch (error) {
      console.error('Error splitting stake account:', error);
      alert(`Failed to split stake account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deactivateRewardsStakeAccount = async () => {
    if (!publicKey || !rewardsStakeAccountPubkey) {
      console.log('No public key or rewards stake account available');
      return;
    }

    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const program = getProgram();

      const rewardsStakePubkey = new PublicKey(rewardsStakeAccountPubkey);

      const creatorPublicKey = new PublicKey(userData.creator);

      // Derive the PDAs
      const [creatorVaultPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );

      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      const [userVaultPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('user_vault'), publicKey.toBuffer(), Buffer.from(creatorName)],
        program.programId
      );

      // Deactivate the stake account
      const deactivateInstruction = StakeProgram.deactivate({
        stakePubkey: rewardsStakePubkey,
        authorizedPubkey: userVaultPDA, // The authorized staker is the user vault PDA
      });

      const transaction = new Transaction().add(deactivateInstruction);

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;

      // Sign and send the transaction
      const signedTx = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Rewards stake account deactivation initiated');
      alert(`Rewards stake account deactivation initiated!\nTransaction signature: ${signature}`);

      // The deactivation process takes one epoch (~2 days on Devnet)
      // You'll need to check periodically if it's deactivated

    } catch (error) {
      console.error('Error deactivating rewards stake account:', error);
      alert(`Failed to deactivate rewards stake account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // const checkStakeAccountDeactivation = async () => {
  //   if (!publicKey || !rewardsStakeAccountPubkey) {
  //     console.log('No public key or rewards stake account available');
  //     return;
  //   }
  //   try {
  //     const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  //     const rewardsStakePubkey = new PublicKey(rewardsStakeAccountPubkey);

  //     const stakeAccountInfo = await connection.getParsedAccountInfo(rewardsStakePubkey);

  //     if (
  //       stakeAccountInfo.value &&
  //       stakeAccountInfo.value.data &&
  //       (stakeAccountInfo.value.data as any).parsed.info.stake.delegation.deactivationEpoch !== '18446744073709551615'
  //     ) {
  //       console.log('Rewards stake account is deactivated');
  //       // Proceed to withdraw and transfer
  //       await withdrawUnstakedSOL();
  //       await transferSOLToCreatorVault();
  //       // Stop the cron job
  //       stakeDeactivationCron.stop();
  //     } else {
  //       console.log('Rewards stake account is still active');
  //     }

  //   } catch (error) {
  //     console.error('Error checking stake account deactivation:', error);
  //   }
  // };

  // Schedule the cron job to run every hour
 // const stakeDeactivationCron = cron.schedule('0 * * * *', checkStakeAccountDeactivation);

  const withdrawUnstakedSOL = async () => {
    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const program = getProgram();

      // Predefined creator public key
      const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");

      // Fetch the creator vault to get the name
      const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );

      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      if (!publicKey) {
        console.log('Public key is not available');
        return;
      }
      
      // Now use the correct seeds to find the user vault PDA
      const [userPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user_vault'),
          publicKey.toBuffer(),
          Buffer.from(creatorName)
        ],
        program.programId
      );

      
      // Call the withdrawandcloseuservault method
      const tx = await program.methods.withdrawandcloseuservault().accounts({
        user: publicKey,
        creator: creatorPublicKey,
        creatorVault: creatorVaultPDA,
        userVault: userPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      console.log('User vault withdrawn and closed successfully');
      console.log('Transaction signature:', tx);
      alert(`User vault withdrawn and closed successfully!\nTransaction signature: ${tx}`);
      
      // Refresh user data after withdrawal
      await fetchUserData();
    } catch (error) {
      console.error('Error withdrawing and closing user vault:', error);
      if (error instanceof Error) {
        alert(`Failed to withdraw and close user vault: ${error.message}`);
      } else {
        alert('Failed to withdraw and close user vault: Unknown error');
      }
    }
  };

  const transferSOLToCreatorVault = async () => {
    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const program = getProgram();

      // Predefined creator public key
      const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");

      // Fetch the creator vault to get the name
      const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );

      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      if (!publicKey) {
        console.log('Public key is not available');
        return;
      }
      
      // Now use the correct seeds to find the user vault PDA
      const [userPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user_vault'),
          publicKey.toBuffer(),
          Buffer.from(creatorName)
        ],
        program.programId
      );

      // Call the transfertocreatorvault method
      const tx = await program.methods.transfertocreatorvault().accounts({
        user: publicKey,
        creator: creatorPublicKey,
        creatorVault: creatorVaultPDA,
        userVault: userPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      console.log('SOL transferred to creator vault successfully');
      console.log('Transaction signature:', tx);
      alert(`SOL transferred to creator vault successfully!\nTransaction signature: ${tx}`);
      
      // Refresh user data after withdrawal
      await fetchUserData();
    } catch (error) {
      console.error('Error transferring SOL to creator vault:', error);
      if (error instanceof Error) {
        alert(`Failed to transfer SOL to creator vault: ${error.message}`);
      } else {
        alert('Failed to transfer SOL to creator vault: Unknown error');
      }
    }
  };

  const handleCreatorWithdraw = async () => {
    if (!publicKey) {
      console.log('No public key available');
      return;
    }
    try {
      const program = getProgram();
      const [creatorPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('creator_pda'), publicKey.toBuffer()],
        program.programId
      );

      const tx = await program.methods.withdrawandclosecreatorvault().accounts({
        creator: publicKey,
        creatorPda: creatorPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      console.log('Creator vault withdrawn and closed successfully');
      console.log('Transaction signature:', tx);
      alert(`Creator vault withdrawn and closed successfully!\nTransaction signature: ${tx}`);
      
      // Refresh creator data after withdrawal
      await fetchCreatorData();
    } catch (error) {
      console.error('Error withdrawing and closing creator vault:', error);
      if (error instanceof Error) {
        alert(`Failed to withdraw and close creator vault: ${error.message}`);
      } else {
        alert('Failed to withdraw and close creator vault: Unknown error');
      }
    }
  };

  const handleUserWithdraw = async () => {
    if (!publicKey || !userData) {
      console.log('No public key or user data available');
      return;
    }
    try {
      const program = getProgram();
      const creatorPubkey = userData.creator; // This is already a PublicKey object

      // Fetch the creator vault to get the name
      const [creatorVaultPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPubkey.toBuffer()],
        program.programId
      );
      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      // Derive the user vault PDA using the correct seeds
      const [userVaultPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('user_vault'), publicKey.toBuffer(), Buffer.from(creatorName)],
        program.programId
      );

      console.log('User public key:', publicKey.toBase58());
      console.log('Creator public key:', creatorPubkey.toBase58());
      console.log('User Vault PDA:', userVaultPDA.toBase58());

      const tx = await program.methods.withdrawandcloseuservault().accounts({
        user: publicKey,
        creator: creatorPubkey,
        creatorVault: creatorVaultPDA,
        userVault: userVaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      console.log('User vault withdrawn and closed successfully');
      console.log('Transaction signature:', tx);
      alert(`User vault withdrawn and closed successfully!\nTransaction signature: ${tx}`);
      
      // Refresh user data after withdrawal
      await fetchUserData();
    } catch (error) {
      console.error('Error withdrawing and closing user vault:', error);
      if (error instanceof Error) {
        alert(`Failed to withdraw and close user vault: ${error.message}`);
      } else {
        alert('Failed to withdraw and close user vault: Unknown error');
      }
    }
  };

  return (
    <AppHero title="Dashboard" subtitle="Welcome to your dashboard">
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="p-6 bg-white rounded-md shadow-md w-96">
          <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Creator PDA:</label>
            <input
              type="text"
              value={creatorPDA || ''}
              onChange={(e) => setCreatorPDA(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Creator Data:</label>
            <input
              type="text"
              value={creatorData ? JSON.stringify(creatorData) : ''}
              onChange={(e) => setCreatorData(JSON.parse(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">User PDA:</label>
            <input
              type="text"
              value={userPDA || ''}
              onChange={(e) => setUserPDA(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">User Data:</label>
            <input
              type="text"
              value={userData ? JSON.stringify(userData) : ''}
              onChange={(e) => setUserData(JSON.parse(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Deposit Amount:</label>
            <input
              type="text"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Stake Account Pubkey:</label>
            <input
              type="text"
              value={stakeAccountPubkey || ''}
              onChange={(e) => setStakeAccountPubkey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Validator Pubkey:</label>
            <input
              type="text"
              value={validatorPubkey || ''}
              onChange={(e) => setValidatorPubkey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Creator Pubkey:</label>
            <input
              type="text"
              value={creatorPubkey}
              onChange={(e) => setCreatorPubkey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Amount to Stake:</label>
            <input
              type="text"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Updated User Vault Data:</label>
            <input
              type="text"
              value={updatedUserVaultData ? JSON.stringify(updatedUserVaultData) : ''}
              onChange={(e) => setUpdatedUserVaultData(JSON.parse(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Stake Account Data:</label>
            <input
              type="text"
              value={stakeAccountData ? JSON.stringify(stakeAccountData) : ''}
              onChange={(e) => setStakeAccountData(JSON.parse(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Rewards Stake Account Pubkey:</label>
            <input
              type="text"
              value={rewardsStakeAccountPubkey || ''}
              onChange={(e) => setRewardsStakeAccountPubkey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={initializeCreator}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Initialize Creator
            </button>
            <button
              onClick={initUserAndStakeSOL}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Initialize User and Stake SOL
            </button>
            <button
              onClick={fetchCreatorData}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Fetch Creator Data
            </button>
            <button
              onClick={fetchUserData}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Fetch User Data
            </button>
            <button
              onClick={handleDeposit}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Deposit
            </button>
            <button
              onClick={delegateStakeAccount}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Delegate Stake Account
            </button>
            <button
              onClick={deactivateStakeAccount}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Deactivate Stake Account
            </button>
            <button
              onClick={splitStakeAccount}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Split Stake Account
            </button>
            <button
              onClick={deactivateRewardsStakeAccount}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Deactivate Rewards Stake Account
            </button>
            <button
              onClick={withdrawUnstakedSOL}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Withdraw Unstaked SOL
            </button>
            <button
              onClick={transferSOLToCreatorVault}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Transfer SOL to Creator Vault
            </button>
            <button
              onClick={handleCreatorWithdraw}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Creator Withdraw
            </button>
            <button
              onClick={handleUserWithdraw}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              User Withdraw
            </button>
          </div>
        </div>
      </div>
    </AppHero>
  );
}
