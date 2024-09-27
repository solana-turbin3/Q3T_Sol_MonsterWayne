'use client';

import { useState, useEffect } from 'react';
import { AppHero } from '../ui/ui-layout';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, StakeProgram, SystemProgram, LAMPORTS_PER_SOL, Authorized, Transaction, sendAndConfirmTransaction, Lockup, Connection, clusterApiUrl, SYSVAR_CLOCK_PUBKEY, SYSVAR_STAKE_HISTORY_PUBKEY } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { IDL , hero } from '../solana/idl/hero_anchor_program';
import { Idl } from '@project-serum/anchor';
import { Address, AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import { findAllStakeAccountsByAuth } from '@soceanfi/solana-stake-sdk';
import { Provider } from 'jotai';

//import cron from 'node-cron';

const PROGRAM_ID = new PublicKey('vURApwxeh6Rm7wa6vFkBihAoGbQ251By2bLbwoxX8Cc');

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
  //const [stakeLamports, setStakeLamports] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [updatedUserVaultData, setUpdatedUserVaultData] = useState<any>(null);
  const [stakeAccountData, setStakeAccountData] = useState<any>(null);
  const [rewardsStakeAccountPubkey, setRewardsStakeAccountPubkey] = useState<string | null>(null);
  const [userVaultData, setUserVaultData] = useState<any>(null);
  const [stakeAccountPubkeys, setStakeAccountPubkeys] = useState<string[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<PublicKey | null>(null);
  const [availableValidators, setAvailableValidators] = useState<PublicKey[]>([]);
  const [creatorName, setCreatorName] = useState('');
  const [adminPDA, setAdminPDA] = useState<string>('');
  const [adminData, setAdminData] = useState<{ admin: string; balance: string } | null>(null);
  const [adminVaultBalance, setAdminVaultBalance] = useState<number | null>(null);
  const [adminVaultPubkey, setAdminVaultPubkey] = useState('');

  const getProgram = () => {
    console.log('Getting program');
    const provider = new AnchorProvider(
      connection,
      window.solana,
      { preflightCommitment: 'processed' }
    );
    console.log('Provider created:', provider);
    
    console.log('Creating program with IDL:', IDL);
    console.log('Program ID:', PROGRAM_ID.toBase58());

    
    try {
      console.log('IDL:', IDL);
      console.log('PROGRAM_ID:', PROGRAM_ID.toBase58());
      console.log('Provider:', provider);

      const program : Program<hero> = new Program(IDL, provider);
      
     // const program  : = new Program( IDL, provider);
      console.log('Program methods:', Object.keys(program.methods));
      return program;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  };

  

  const initializeAdmin = async () => {
    if (!publicKey) {
      console.log('No wallet connected');
      return;
    }
    try {
      const program = getProgram();
      const [adminVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_vault"), publicKey.toBuffer()],
        program.programId
      );
    
      console.log("Initializing Admin Vault...");
      
      const tx = await program.methods.initadmin()
        .accounts({
          admin: publicKey,
          admin_vault: adminVaultPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([])
        .rpc();

      console.log("Admin Vault initialized successfully. Transaction signature:", tx);
      console.log("Admin Vault PDA:", adminVaultPDA.toString());
      
      setAdminPDA(adminVaultPDA.toBase58());
      
      // Display success message to the user
      alert(`Admin Vault initialized successfully!\nTransaction signature: ${tx}`);
      
      fetchAdminData();
    } catch (error) {
      console.error("Error initializing Admin Vault:", error);
      if (error instanceof Error) {
        alert(`Error initializing Admin Vault: ${error.message}`);
      } else {
        alert("An unknown error occurred while initializing Admin Vault");
      }
      throw error;
    }
  };

  const initializeCreator = async () => {
    if (!publicKey || !selectedValidator || !creatorName) {
      alert('Please connect your wallet, select a validator, and enter a creator name.');
      return;
    }
    try {
      const program = getProgram();
      const [creatorPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), publicKey.toBuffer()],
        program.programId
      );

      // Log the arguments for debugging
      console.log("Creator Name:", creatorName);
      console.log("Selected Validator:", selectedValidator);

      // Make sure selectedValidator is a PublicKey object
      const validatorPubkey = new PublicKey(selectedValidator);

      //const validatorPubkey = new PublicKey('5MrQ888HbPthezJu4kWg9bFfZg2FMLtQWzixQgNNX48B');

      await program.methods
        .initcreator(creatorName, validatorPubkey)
        .accounts({
          creator: publicKey,
          creatorVault: creatorPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setCreatorPDA(creatorPDA.toBase58());
      alert('Creator initialized successfully!');
      await fetchCreatorData();
    } catch (error) {
      console.error('Error initializing creator:', error);
      alert(`Failed to initialize creator: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      // Fetch the creator vault to get the name and selected validator
      const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );
      
      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;
      const selectedValidator = creatorVaultAccount.validator;
      
      // Derive the user vault PDA
      const [userPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user_vault'),
          publicKey.toBuffer(),
          Buffer.from(creatorName)
        ],
        program.programId
      );

      const [adminVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("admin_vault"), publicKey.toBuffer()],
        program.programId
      );

      // Generate a unique seed for the stake account
      const seed = `stake-${creatorName}-${Date.now()}`;

      // Create the stake account with seed
      const stakeAccount = await PublicKey.createWithSeed(
        publicKey,
        seed,
        StakeProgram.programId
      );

      console.log('User PDA Vault:', userPDA.toBase58());
      console.log('Stake Account Pubkey:', stakeAccount.toBase58());

      // Calculate the rent-exempt amount for the stake account
      const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);

      // Convert the stake amount to lamports
      const totalLamports = parseFloat(stakeAmount) * LAMPORTS_PER_SOL;
      if (totalLamports <= rentExemptAmount) {
        alert('The amount must be greater than the rent-exempt amount required for the stake account.');
        return;
      }

      // Define the fee percentage
      const feePercentage = 1; // 1%

      // Calculate the fee amount
      const feeAmount = (totalLamports * feePercentage) / 100;

      // Amount to stake after deducting the fee
      const stakeLamports = totalLamports - feeAmount - rentExemptAmount;

      // Check if userPDA already exists
      let userAccountExists = false;
      try {
        const userVaultAccount = await program.account.userVault.fetch(userPDA);
        userAccountExists = true;
        console.log('User Vault Account already exists:', userVaultAccount);
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('Account does not exist')) {
          userAccountExists = false;
          console.log('User Vault Account does not exist, will initialize.');
        } else {
          console.error('Error fetching User Vault Account:', error);
          throw error;
        }
      }

      // Prepare instructions
      const instructions = [];

      // If userPDA doesn't exist, add the inituser instruction
      if (!userAccountExists) {
        const initUserIx = await program.methods.inituser(creatorPublicKey)
          .accounts({
            user: publicKey,
            creator: creatorPublicKey,
            creatorVault: creatorVaultPDA,
            userVault: userPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction();
        instructions.push(initUserIx);
        console.log('initUserIx:', initUserIx);
      }

      

      // Instruction: Transfer fee to AdminVault
      const transferFeeIx = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: adminVaultPDA, // You need to define adminVaultPublicKey
        lamports: feeAmount,
      });
      instructions.push(transferFeeIx);

      console.log('Admin Vault PDA:', adminVaultPDA.toBase58());

      // Instruction: Create stake account with the stake amount after fee
      const createStakeAccountIx = StakeProgram.createAccountWithSeed({
        fromPubkey: publicKey,
        stakePubkey: stakeAccount,
        basePubkey: publicKey,
        seed: seed,
        authorized: new Authorized(userPDA, userPDA),
        lockup: new Lockup(0, 0, userPDA),
        lamports: stakeLamports + rentExemptAmount,
      });
      //instructions.push(createStakeAccountIx);
      console.log('createStakeAccountIx:', createStakeAccountIx);

      // Fetch the CreatorVault account data
      //const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);

      // Use the validator public key from the CreatorVault account
      const validatorPubkey = creatorVaultAccount.validator;

      // Instruction: stake SOL (passing the total amount including the fee)
      const stakeSolIx = await program.methods
        .stakesol(new BN(totalLamports))
        .accounts({
          user: publicKey,
          //admin: publicKey,
          creator: creatorPublicKey,
          userVault: userPDA,
          creatorVault: creatorVaultPDA,
         // adminVault: adminVaultPDA,
          validatorVote: validatorPubkey,
          stakeAccount: stakeAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
          stakeProgram: StakeProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
          stakeConfig: new PublicKey('StakeConfig11111111111111111111111111111111'),
        })
        .instruction();

      // Add the rest of the instructions to the array
      instructions.push(createStakeAccountIx, stakeSolIx);

      // Create the transaction and add all instructions
      const transaction = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: publicKey,
      }).add(...instructions);

      // Let the wallet (e.g., Phantom) sign the transaction
      const signedTransaction = await window.solana.signTransaction(transaction);

      // Send and confirm the transaction
      const txid = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(txid, 'confirmed');

      // Console log the transaction signature
      console.log('Transaction Signature:', txid);

      alert(`User initialized and ${stakeLamports / LAMPORTS_PER_SOL} SOL staked successfully!\nTransaction signature: ${txid}`);

      // Fetch user data after initialization
      setUserPDA(userPDA.toBase58());
      await fetchUserData();
    } catch (error) {
      console.error('Error initializing user and staking SOL:', error);
      if (error instanceof Error) {
        alert(`Failed to initialize user and stake SOL: ${error.message}`);
      } else {
        alert('Failed to initialize user and stake SOL: Unknown error');
      }
    }
  };


// File: hero/web/components/dashboard/dashboard-feature.tsx

const calculateAndSplitRewards = async () => {
  if (!publicKey) {
    console.log('No wallet connected');
    return;
  }
  try {
    const program = getProgram();

    // Fetch the creator vault to get the name
    const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");
    const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
      program.programId
    );
    
    const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
    const creatorName = creatorVaultAccount.name;
    
    // Derive the user vault PDA (which also serves as the stake authority)
    const [userVaultPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_vault'),
        publicKey.toBuffer(),
        Buffer.from(creatorName)
      ],
      program.programId
    );

    // Fetch the user vault account to get the stake account
    const userVaultAccount = await program.account.userVault.fetch(userVaultPDA);
    const stakeAccountPubkey = new PublicKey(userVaultAccount.stakeAccount);

    // Fetch the stake account's balance
    const stakeAccountInfo = await connection.getAccountInfo(stakeAccountPubkey);
    if (!stakeAccountInfo) {
      console.log('Stake account not found');
      return;
    }

    const stakeLamports = stakeAccountInfo.lamports;

    // Fetch rent-exempt minimum balance
    const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(
      StakeProgram.space
    );

    // Calculate total staked amount excluding rent
    const totalStakedAmount = stakeLamports - rentExemptBalance;

    // Calculate rewards
    const rewards = totalStakedAmount - (userVaultAccount.stakedAmount.toNumber());

    if (rewards <= 0) {
      alert('No rewards available to withdraw at this time.');
      return;
    }

    // Proceed with calculate and split rewards
    const rewardStakeAccount = anchor.web3.Keypair.generate();

    const tx = await program.methods
      .calculateAndSplitRewards()
      .accounts({
        stakeAccount: stakeAccountPubkey,
        rewardStakeAccount: rewardStakeAccount.publicKey,
        userVault: userVaultPDA,
        stakeAuthority: {
          staker: userVaultPDA,
          withdrawer: userVaultPDA
        },
        systemProgram: anchor.web3.SystemProgram.programId,
        stakeProgram: anchor.web3.StakeProgram.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
      })
      .signers([rewardStakeAccount])
      .rpc();

    console.log('Rewards split and stake account deactivated', tx);

    // Update state if necessary
    await fetchUserData();
  } catch (error) {
    console.error('Error calculating and splitting rewards:', error);
    alert(`Failed to calculate and split rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


const withdrawRewards = async () => {
  if (!publicKey) {
    alert('Please connect your wallet.');
    return;
  }
  try {
    const program = getProgram();
    const connection = program.provider.connection;

    // Fetch the creator vault to get the name
    const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");
    const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
      program.programId
    );
    
    const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
    const creatorName = creatorVaultAccount.name;
    
    // Derive the user vault PDA
    const [userVaultPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('user_vault'),
        publicKey.toBuffer(),
        Buffer.from(creatorName)
      ],
      program.programId
    );

    // Fetch the user vault account to get the reward stake account
    const userVaultAccount = await program.account.userVault.fetch(userVaultPDA);
    const rewardStakeAccountPubkey = userVaultAccount.reward_stake_account;

    // Check if the reward stake account is set and not the default public key
    if (!rewardStakeAccountPubkey || rewardStakeAccountPubkey.equals(PublicKey.default)) {
      alert("No rewards available to withdraw. The reward stake account is not set.");
      return;
    }

    // Fetch the reward stake account info to check if it exists and has balance
    const rewardStakeAccountInfo = await connection.getAccountInfo(rewardStakeAccountPubkey);
    if (!rewardStakeAccountInfo) {
      alert("The reward stake account does not exist.");
      return;
    }

    if (rewardStakeAccountInfo.lamports === 0) {
      alert("The reward stake account is empty. No rewards to withdraw.");
      return;
    }

    const tx = await program.methods
      .withdrawrewards()
      .accounts({
        user: publicKey,
        creator: creatorPublicKey,
        userVault: userVaultPDA,
        creatorVault: creatorVaultPDA,
        rewardStakeAccount: rewardStakeAccountPubkey,
        stakeAuthority: userVaultPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log('Rewards withdrawn successfully');
    alert('Rewards withdrawn successfully. Transaction signature: ' + tx);

    // Optionally, update local state or UI
    await fetchUserData();
  } catch (error) {
    console.error("Error in withdrawRewards:", error);
    if (error instanceof Error) {
      alert(`Failed to withdraw rewards: ${error.message}`);
    } else {
      alert("Failed to withdraw rewards: Unknown error");
    }
  }
};

const fetchAdminData = async () => {
  if (!publicKey) {
    console.log('No wallet connected');
    return;
  }
  try {
    const program = getProgram();

    const [adminVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("admin_vault"), publicKey.toBuffer()],
      program.programId
    );

    // Fetch the balance using getBalance method
    const balance = await connection.getBalance(adminVaultPDA);
    const solBalance = balance / LAMPORTS_PER_SOL;

    setAdminData({
      admin: publicKey.toString(),
      balance: solBalance.toFixed(9), // Display up to 9 decimal places
    });
    setAdminPDA(adminVaultPDA.toBase58());
    setAdminVaultBalance(solBalance);
    setAdminVaultPubkey(adminVaultPDA.toBase58());
  } catch (error) {
    console.error("Error fetching Admin Vault data:", error);
  }
};

useEffect(() => {
  if (publicKey) {
    fetchAdminData();
  }
}, [publicKey]);

// return (
//   <div>
//     {/* ... other components ... */}
//     <div>
//       <h3>Admin Vault Data</h3>
//       <p>Admin PDA: {adminPDA}</p>
//       <p>Admin Vault Public Key: {adminVaultPubkey}</p>
//       <p>Admin: {adminData?.admin}</p>
//       <p>Balance: {adminVaultBalance !== null ? `${adminVaultBalance.toFixed(9)} SOL` : 'Loading...'}</p>
//     </div>
//   </div>
// );


  const fetchCreatorData = async () => {
    if (!publicKey) return;

    try {
      const program = getProgram();
      const [creatorPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), publicKey.toBuffer()],
        program.programId
      );
      const account = await program.account.creatorVault.fetch(creatorPDA);

      setCreatorPDA(creatorPDA.toBase58());
      setCreatorData({
        creator: account.creator.toString(),
        name: account.name,
        validator: account.validator.toString(),
        totalSubcribers: account.totalSubcribers.toString(),
        balance: account.balance.toString(),
        bump: account.bump
      });

      console.log('Creator Vault Data:', {
        creator: account.creator.toString(),
        name: account.name,
        totalSubcribers: account.totalSubcribers.toString(),
        balance: account.balance.toString(),
        bump: account.bump
      });
    } catch (error) {
      console.error('Error fetching creator data:', error);
    }
  };

  const fetchUserData = async () => {
    if (!publicKey) return;

    try {
      const program = getProgram();

      // Fetch the creator vault to get the name
      const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");
      const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );
      
      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      if (typeof creatorName !== 'string') {
        console.error('Creator name is not properly defined');
        return;
      }

      const [userVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_vault'), publicKey.toBuffer(), Buffer.from(creatorName)],
        program.programId
      );
      console.log('Creator name:', creatorName);

      const userVaultAccount = await program.account.userVault.fetch(userVaultPDA);
      
      setUserVaultData({
        user: userVaultAccount.user.toString(),
        creator: userVaultAccount.creator.toString(),
        balance: userVaultAccount.balance.toString(),
        stakedAmount: userVaultAccount.stakedAmount.toString(),
        stakeAccount: userVaultAccount.stakeAccount.toString(),
        stakeAccountCount: userVaultAccount.stakeAccountCount.toString(),
        stakeAt: new Date(userVaultAccount.stakeAt * 1000).toLocaleString(),
        accumulatedRewards: userVaultAccount.accumulatedRewards.toString(),
        bump: userVaultAccount.bump
      });

      console.log('User vault data fetched:', userVaultAccount);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserVaultData(null);
    }
  };

  const fetchStakeAccountData = async (userAccount: any) => {
    if (!userAccount || !userAccount.stakeAccount) {
      console.log('No stake account found in user data.');
      return;
    }

    try {
      const stakeAccountPubkey = new PublicKey(userAccount.stakeAccount);
      const stakeAccountInfo = await connection.getParsedAccountInfo(stakeAccountPubkey);

      if (stakeAccountInfo.value) {
        console.log('Stake Account Data:', stakeAccountInfo.value.data);
        setStakeAccountData(stakeAccountInfo.value.data);
      } else {
        console.log('Failed to fetch stake account data.');
        setStakeAccountData(null);
      }
    } catch (error) {
      console.error('Error fetching stake account data:', error);
      setStakeAccountData(null);
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

  const fetchUserStakeAccounts = async () => {
    if (!publicKey) return;

    try {
      const program = getProgram();

       // Predefined creator public key (ensure this is correct)
       const creatorPubKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");

       // Fetch the creator vault to get the name
       const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
         [Buffer.from('creator_vault'), creatorPubKey.toBuffer()],
         program.programId
       );
       
       const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
       const creatorName = creatorVaultAccount.name;

      // Derive the userVaultPDA
      const [userVaultPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from('user_vault'), publicKey.toBuffer(), Buffer.from(creatorName),
          // We'll get the creator name from the user vault data
        ],
        program.programId
      );

      // Fetch the user vault data
      const userVaultAccount = await program.account.userVault.fetch(userVaultPDA);
      const creatorPublicKey = userVaultAccount.creator;

      // Fetch all stake accounts where the userVault is the staker and withdraw authority
      const filters = [
        {
          memcmp: {
            offset: 12, // Offset for authorized staker
            bytes: userVaultPDA.toBase58(),
          },
        },
        {
          memcmp: {
            offset: 44, // Offset for authorized withdrawer
            bytes: userVaultPDA.toBase58(),
          },
        },
      ];

      const stakeAccounts = await connection.getProgramAccounts(
        StakeProgram.programId,
        {
          filters: filters,
        }
      );

      // Map and display the stake account public keys
      const stakeAccountPubkeys = stakeAccounts.map(account => account.pubkey.toBase58());

      console.log('User Vault Stake Accounts:', stakeAccountPubkeys);

      // You can set this in your state to display in your UI
      setStakeAccountPubkeys(stakeAccountPubkeys);

    } catch (error) {
      console.error('Error fetching stake accounts:', error);
    }
  };

  const unstakeSol = async () => {
    if (!publicKey) {
      console.log('No wallet connected');
      return;
    }
    try {
      const program = getProgram();
      const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");

      const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );
      
      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      const [userPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user_vault'),
          publicKey.toBuffer(),
          Buffer.from(creatorName)
        ],
        program.programId
      );

      const userVaultAccount = await program.account.userVault.fetch(userPDA);
      const stakeAccountPubkey = userVaultAccount.stakeAccount;

      console.log("Unstaking SOL...");
      
      try {
        await program.methods.unstakesol()
          .accounts({
            user: publicKey,
            creator: creatorPublicKey,
            userVault: userPDA,
            creatorVault: creatorVaultPDA,
            stakeAccount: stakeAccountPubkey,
            stakeAuthority: userPDA,
            systemProgram: SystemProgram.programId,
            stakeProgram: StakeProgram.programId,
            clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            stakeHistory: anchor.web3.SYSVAR_STAKE_HISTORY_PUBKEY,
          })
          .rpc();

        console.log("SOL unstaked successfully");
        alert('SOL unstaked successfully. You can now withdraw your unstaked SOL.');
        await fetchUserData();
      } catch (error) {
        console.error("Error unstaking SOL:", error);
        if (error instanceof Error && error.message.includes("StakeAccountActivating")) {
          alert("Cannot unstake at this time. The stake account is still activating.");
        } else {
          alert(`Failed to unstake SOL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error in unstakeSol:', error);
      alert(`Error in unstakeSol: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const withdrawUnstakedSol = async () => {
    if (!publicKey) {
      alert('Please connect your wallet.');
      return;
    }
    try {
      const program = getProgram();
      const connection = program.provider.connection;

      // Fetch the creator vault to get the name
      const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");
      const [creatorVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );
      
      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;
      
      // Derive the user vault PDA
      const [userVaultPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('user_vault'),
          publicKey.toBuffer(),
          Buffer.from(creatorName)
        ],
        program.programId
      );

      // Fetch the user vault account to get the stake account
      const userVaultAccount = await program.account.userVault.fetch(userVaultPDA);
      const stakeAccountPubkey = new PublicKey(userVaultAccount.stakeAccount);

      try {
        console.log("User public key:", publicKey.toBase58());
        console.log("Stake account public key:", stakeAccountPubkey.toBase58());
        
        // Call the withdrawUnstakedSol instruction
        await program.methods
          .withdrawunstakedsol()
          .accounts({
            user: publicKey,
            creator: creatorPublicKey,
            userVault: userVaultPDA,
            creatorVault: creatorVaultPDA,
            stakeAccount: stakeAccountPubkey,
            stakeAuthority: userVaultPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
            stakeProgram: anchor.web3.StakeProgram.programId,
          })
          .rpc();

        console.log('Withdrawal successful');
        alert('Withdrawal successful. Your SOL has been returned to your wallet.');

        // Optionally, update local state or UI
        await fetchUserData();
      } catch (error) {
        console.error("Error in withdrawUnstakedSol:", error);
        if (error instanceof Error) {
          alert(`Failed to withdraw unstaked SOL: ${error.message}`);
        } else {
          alert("Failed to withdraw unstaked SOL: Unknown error");
        }
      }
    } catch (error) {
      console.error('Error withdrawing unstaked SOL:', error);
      alert(`Failed to withdraw unstaked SOL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fetchAvailableValidators = async () => {
    // This is a simplified example. In a real-world scenario, you'd need to implement
    // logic to fetch actual validators from the Solana network.
    const validators = [
      new PublicKey('5MrQ888HbPthezJu4kWg9bFfZg2FMLtQWzixQgNNX48B'),
      new PublicKey('vgcDar2pryHvMgPkKaZfh8pQy4BJxv7SpwUG7zinWjG'),
      new PublicKey('7AETLyAGJWjp6AWzZqZcP362yv5LQ3nLEdwnXNjdNwwF'),
    ];
    setAvailableValidators(validators);
  };

  useEffect(() => {
    if (publicKey && creatorPDA) {
      fetchCreatorData();
    }
  }, [publicKey, creatorPDA]);

  useEffect(() => {
    if (publicKey) {
      fetchCreatorData();
      fetchUserData();
    }
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchUserStakeAccounts();
    }
  }, [publicKey]);

  useEffect(() => {
    fetchAvailableValidators();
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!publicKey) {
        console.log('No wallet connected');
        return;
      }
      try {
        const program = getProgram();

        const [adminVaultPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("admin_vault"), publicKey.toBuffer()],
          program.programId
        );

        // Fetch the balance using getBalance method
        const balance = await connection.getBalance(adminVaultPDA);
        const solBalance = balance / LAMPORTS_PER_SOL;

        setAdminData({
          admin: publicKey.toString(),
          balance: solBalance.toFixed(9), // Display up to 9 decimal places
        });
        setAdminPDA(adminVaultPDA.toBase58());
        setAdminVaultBalance(solBalance);
        setAdminVaultPubkey(adminVaultPDA.toBase58());
      } catch (error) {
        console.error("Error fetching Admin Vault data:", error);
      }
    };

    fetchAdminData();
  }, [publicKey]);

  return (
    <AppHero title="Hero2GO" subtitle="Share your stories/research, get rewarded and become a Hero">
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="p-6 bg-white rounded-md shadow-md w-96">
          <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
          <div className="flex flex-col space-y-4">
          
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Admin Vault Data</h2>
                <div className="bg-gray-100 p-3 rounded-md">
                  {/*<p><strong>Admin:</strong> {adminVaultPubkey}</p>*/}
                  <p><strong>Balance:</strong> {adminVaultBalance !== null ? adminVaultBalance.toFixed(9) : 'Loading...'} SOL</p>
                </div>
              </div>
            
          <button 
        onClick={initializeAdmin}
        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
        Initialize Admin
        </button>
          <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Enter Hero/Creator Name"
              className="w-full px-3 py-2 mb-4 border rounded-md"
            />
          <select
              onChange={(e) => setSelectedValidator(new PublicKey(e.target.value))}
              value={selectedValidator?.toBase58() || ''}
            >
              <option value="HEL1USMZKAL2odpNBj2oCjffnFGaYwmbGmyewGv1e2TU">Helius (Default Validator)</option>
              {availableValidators.map((validator) => (
                <option key={validator.toBase58()} value={validator.toBase58()}>
                  {validator.toBase58()}
                </option>
              ))}
            </select>
            <button
              onClick={initializeCreator}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Initialize Hero/Creator
            </button>
            
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Amount of SOL"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {creatorData && (
              <button
                onClick={initUserAndStakeSOL}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Subscribe to {creatorData.name || 'Hero/Creator'}
              </button>
              )}
            </div>
            {creatorData && (
            <button
              onClick={calculateAndSplitRewards}
             className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Calculate and Split Rewards to be transferred to {creatorData.name || 'Hero/Creator'}
            </button>
            )}
{creatorData && (
            <button
              onClick={withdrawRewards}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
  Transfer Rewards to {creatorData.name || 'Hero/Creator'}
</button>
)}

{creatorData && (
            <button
              onClick={unstakeSol}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Unsubscribe from {creatorData.name || 'Hero/Creator'}
            </button>
)}

            <button
              onClick={withdrawUnstakedSol}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Withdraw your  Unstaked SOL
            </button>


{creatorData && (
              <div>
                <h2>Creator Vault Data</h2>
                <p>Creator: {creatorData.creator}</p>
                <p>Name: {creatorData.name}</p>
                <p>Validator: {creatorData.validator}</p>
                <p>Total Subscribers: {creatorData.totalSubcribers}</p>
                <p>Balance: {creatorData.balance} lamports</p>
                <p>Bump: {creatorData.bump}</p>
              </div>
            )}

            {/* Display User Vault PDA State Fields */}
            {userVaultData && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">User Vault PDA State</h2>
                <div className="bg-gray-100 p-3 rounded-md">
                  <p><strong>User:</strong> {userVaultData.user}</p>
                  <p><strong>Creator:</strong> {userVaultData.creator}</p>
                  <p><strong>Balance:</strong> {userVaultData.balance} lamports</p>
                  <p><strong>Staked Amount:</strong> {userVaultData.stakedAmount} lamports</p>
                  <p><strong>Stake Account:</strong> {userVaultData.stakeAccount}</p>
                  <p><strong>Stake Account Count:</strong> {userVaultData.stakeAccountCount}</p>
                  <p><strong>Stake At:</strong> {userVaultData.stakeAt}</p>
                  <p><strong>Accumulated Rewards:</strong> {userVaultData.accumulatedRewards} lamports</p>
                  <p><strong>Bump:</strong> {userVaultData.bump}</p>
                </div>
              </div>
            )}

            {stakeAccountPubkeys.length > 0 && (
              <div>
                <h2>User Vault Stake Accounts</h2>
                <ul>
                  {stakeAccountPubkeys.map((pubkey, index) => (
                    <li key={index}>{pubkey}</li>
                  ))}
                </ul>
              </div>
            )}

            
          </div>
        </div>
      </div>
    </AppHero>
  );
}
