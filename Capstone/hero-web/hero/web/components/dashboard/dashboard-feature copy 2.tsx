'use client';

import { useState, useEffect } from 'react';
import { AppHero } from '../ui/ui-layout';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, StakeProgram, LAMPORTS_PER_SOL, Authorized, Transaction, sendAndConfirmTransaction, Lockup, Connection } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { idl } from '../solana/idl/hero_anchor_program';
import { Idl } from '@project-serum/anchor';
import { Address, AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
//import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('EfVdsbEq2Eq56cDDtAqRcaepjNCfAKJGVpMDvcwPmKTK');

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
  const [initAmount, setInitAmount] = useState<string>('');
  const [userSeed, setUserSeed] = useState<string>('');

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
      const [creatorPDA] = await PublicKey.findProgramAddress(
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

  const initializeUser = async () => {
    if (!publicKey || !initAmount) {
      console.log('Missing required information for user initialization');
      return;
    }
    try {
      const program = getProgram();
      console.log('Program obtained:', program);
      
      // Fetch the latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      
      // Predefined creator public key
      const creatorPublicKey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");

      const amount = new BN(parseFloat(initAmount) * LAMPORTS_PER_SOL);

      // First, fetch the creator vault to get the name
      const [creatorVaultPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('creator_vault'), creatorPublicKey.toBuffer()],
        program.programId
      );

      const creatorVaultAccount = await program.account.creatorVault.fetch(creatorVaultPDA);
      const creatorName = creatorVaultAccount.name;

      // Now use the correct seeds to find the user vault PDA
      const [userPDA] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from('user_vault'),
          publicKey.toBuffer(),
          Buffer.from(creatorName)
        ],
        program.programId
      );

      console.log('Creating transaction with inituser and deposit instructions');
      const tx = new Transaction().add(
        await program.methods.inituser(creatorPublicKey)
          .accounts({
            user: publicKey,
            creator: creatorPublicKey,
            creatorVault: creatorVaultPDA,
            userVault: userPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction(),
        await program.methods.deposit(amount)
          .accounts({
            user: publicKey,
            creator: creatorPublicKey,
            creatorVault: creatorVaultPDA,
            userVault: userPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .instruction()
      );

      // Set the recently fetched blockhash
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      // Sign and send the transaction
      const signedTx = await window.solana.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        preflightCommitment: 'confirmed'
      });

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      console.log('User initialized and deposit made successfully');
      console.log('Transaction signature:', signature);
      console.log('User PDA public key:', userPDA.toBase58());

      setUserPDA(userPDA.toBase58());
      console.log('User PDA set in state');
      alert(`User initialized and deposit made successfully!\nTransaction signature: ${signature}\nUser PDA: ${userPDA.toBase58()}`);
      
      await fetchUserData();
    } catch (error) {
      console.error('Error initializing user and making deposit:', error);
      if (error instanceof Error) {
        alert(`Failed to initialize user and make deposit: ${error.message}`);
      } else {
        alert('Failed to initialize user and make deposit: Unknown error');
      }
    }
  };

  const fetchCreatorData = async () => {
    if (!publicKey) return;

    try {
      const program = getProgram();
      const [creatorPDA] = await PublicKey.findProgramAddress(
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
      setUserData(userAccount);
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

      const [userVaultPDA] = await PublicKey.findProgramAddress(
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

  const createStakeAndDelegate = async () => {
    if (!publicKey || !userData) {
      console.log('No public key or user data available');
      return;
    }
    try {
      const program = getProgram();
      console.log('Program obtained:', program);

      const [userPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('user_vault'), publicKey.toBuffer(), new PublicKey(userData.creator).toBuffer()],
        program.programId
      );

      const stakeAccount = Keypair.generate();
      const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
      const amountToStake = new BN(LAMPORTS_PER_SOL / 2); // 0.5 SOL for example
      const totalAmount = minimumRent + amountToStake.toNumber();

      // Create stake account
      const createStakeAccountIx = StakeProgram.createAccount({
        fromPubkey: publicKey,
        stakePubkey: stakeAccount.publicKey,
        authorized: new Authorized(userPDA, userPDA),
        lockup: new Lockup(0, 0, publicKey),
        lamports: totalAmount
      });

      // Delegate stake
      const validatorVoteAccount = new PublicKey('5MrQ888HbPthezJu4kWg9bFfZg2FMLtQWzixQgNNX48B'); // Example validator
      const delegateIx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: userPDA,
        votePubkey: validatorVoteAccount,
      });

      // Update user vault PDA with stake account
      const updateUserVaultIx = await program.methods.updateUserVaultStakeAccount(stakeAccount.publicKey)
        .accounts({
          user: publicKey,
          userVault: userPDA,
        })
        .instruction();

      // Create and send transaction
      const tx = new Transaction().add(createStakeAccountIx, delegateIx, updateUserVaultIx);
      const signature = await sendAndConfirmTransaction(connection, tx, [stakeAccount]);

      console.log('Stake account created, delegated, and user vault updated successfully');
      console.log('Transaction signature:', signature);
      setStakeAccountPubkey(stakeAccount.publicKey.toBase58());
      setValidatorPubkey(validatorVoteAccount.toBase58());
      setCreatorPubkey(userData.creator.toString());
      alert(`Stake account created, delegated, and user vault updated successfully!\nTransaction signature: ${signature}\nStake Account: ${stakeAccount.publicKey.toBase58()}`);
    } catch (error) {
      console.error('Error creating stake account, delegating, and updating user vault:', error);
      if (error instanceof Error) {
        alert(`Failed to create stake account, delegate, and update user vault: ${error.message}`);
      } else {
        alert('Failed to create stake account, delegate, and update user vault: Unknown error');
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
      const [creatorPDA] = await PublicKey.findProgramAddress(
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
     // const creatorPubkey = new PublicKey("tVZyEqNfxXvFz5TZaRvggfxAnqjHksZdCp9BRQnXs35");
      const [userVaultPDA] = await PublicKey.findProgramAddressSync(
        [Buffer.from('user_vault'), publicKey.toBuffer(), creatorPubkey.toBuffer()],
        program.programId
      );

      console.log('User public key:', publicKey.toBase58());
      console.log('Creator public key:', creatorPubkey.toBase58());
      console.log('User Vault PDA:', userVaultPDA.toBase58());

      const tx = await program.methods.withdrawandcloseuservault().accounts({
        user: publicKey,
        creator: creatorPubkey,
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

  useEffect(() => {
    if (publicKey) {
      fetchCreatorData();
      fetchUserData();
    } else {
      setCreatorData(null);
      setCreatorPDA(null);
      setUserData(null);
      setUserPDA(null);
    }
  }, [publicKey]);

  console.log('Rendering component');
  return (
    <div>
      <AppHero title="Initialize Accounts" subtitle="Create your creator or user account on Solana devnet." />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {!creatorData ? (
            <div>
              <button
                onClick={initializeCreator}
                className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
              >
                Initialize Creator Account
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Creator Data</h3>
              <p>creator: {creatorData.creator.toString()}</p>
              <p>Balance: {creatorData.balance.toString()} lamports</p>
              <p>name: {creatorData.name}</p>
              <button
                onClick={handleCreatorWithdraw}
                className="w-full mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Withdraw Creator Funds
              </button>
            </div>
          )}
          {creatorPDA && (
            <div className="text-sm mt-2">
              Creator PDA: {creatorPDA}
            </div>
          )}
          
          {!userData ? (
            <div>
              <div style={{
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>
                <input
                  type="number"
                  value={initAmount}
                  onChange={(e) => setInitAmount(e.target.value)}
                  placeholder="Enter amount in SOL"
                  required
                  style={{
                    width: '100%',
                    padding: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    marginBottom: '5px'
                  }}
                />
              </div>
              <button
                onClick={initializeUser}
                disabled={!initAmount}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                Initialize User Account
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">User Vault Data</h3>
              <p>PDA Owner: {userData.pdaOwner.toString()}</p>
              <p>Creator: {userData.creator.toString()}</p>
              <p>Balance: {userData.balance.toString()} lamports</p>
              <p>Staked Amount: {userData.stakedAmount.toString()} lamports</p>
              <p>Stake Account: {userData.stakeAccount.toString()}</p>
              <p>Reward Amount: {userData.rewardAmount.toString()} lamports</p>
              <p>Last Epoch Time: {new Date(userData.lastEpochTime.toNumber() * 1000).toLocaleString()}</p>
              <p>Bump: {userData.bump}</p>
              
              {/* Deposit and Withdraw buttons */}
              <div className="mt-4">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount to deposit (SOL)"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleDeposit}
                  className="w-full mt-2 p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Deposit SOL
                </button>
              </div>
              
              <button
                onClick={handleUserWithdraw}
                className="w-full mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Withdraw User Funds
              </button>
            </div>
          )}
          {userPDA && (
            <div className="text-sm mt-2">
              User Vault PDA: {userPDA}
            </div>
          )}
          {userData && (
            <div className="mt-4">
              <button
                onClick={createStakeAndDelegate}
                className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Create Stake Account and Delegate
              </button>
              {stakeAccountPubkey && (
                <div className="mt-2 text-sm">
                  Stake Account: {stakeAccountPubkey}
                </div>
              )}
              {validatorPubkey && (
                <div className="mt-2 text-sm">
                  Validator: {validatorPubkey}
                </div>
              )}
              {creatorPubkey && (
                <div className="mt-2 text-sm">
                  Creator: {creatorPubkey}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
