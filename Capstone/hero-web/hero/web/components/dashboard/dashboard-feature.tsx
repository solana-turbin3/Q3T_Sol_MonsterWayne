'use client';

import { useState, useEffect } from 'react';
import { AppHero } from '../ui/ui-layout';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  Authorized,
  Lockup,
  Transaction,
  Keypair,
} from '@solana/web3.js';
//import { useConnection, useWallet } from '@solana/wallet-adapter-react';
//import { PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from './solana_staking_manager.json'; // You'll need to generate this IDL file
import { Wallet } from '@project-serum/anchor';

// Import the useWallet hook if not already imported
import { useWallet } from '@solana/wallet-adapter-react';

// Create a custom wallet adapter
const wallet = useWallet();



// Use the custom wallet adapter
const provider = new AnchorProvider(connection, wallet.publicKey(), {});
const program = new Program(idl, new PublicKey("J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR"), provider);

export default function DashboardFeature() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [validators, setValidators] = useState<any[]>([]);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [selectedValidator, setSelectedValidator] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);
  const [nextEpochTime, setNextEpochTime] = useState<string | null>(null);

  const wallet = useWallet();
 // const { connection } = useConnection();
  const provider = new AnchorProvider(connection, wallet, {});
  const program = new Program(idl, new PublicKey("J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR"), provider);

  const [userPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user-account"), wallet.publicKey.toBuffer()],
    program.programId
  );

  const initializeUserAccount = async () => {
    try {
      await program.methods.initializeUserAccount()
        .accounts({
          user: wallet.publicKey,
          userAccount: userPDA,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      console.log("User account initialized");
    } catch (error) {
      console.error("Error initializing user account:", error);
    }
  };

  const deposit = async (amount: number) => {
    try {
      await program.methods.deposit(new BN(amount))
        .accounts({
          user: wallet.publicKey,
          userAccount: userPDA,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      console.log("Deposited", amount, "SOL");
    } catch (error) {
      console.error("Error depositing:", error);
    }
  };

  const createStakeAccount = async (amount: number, voteAccountPubkey: PublicKey) => {
    const stakeAccount = web3.Keypair.generate();
    try {
      await program.methods.createStakeAccount(new BN(amount))
        .accounts({
          userAccount: userPDA,
          stakeAccount: stakeAccount.publicKey,
          voteAccount: voteAccountPubkey,
          stakeProgram: web3.StakeProgram.programId,
          systemProgram: web3.SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
          stakeHistory: web3.SYSVAR_STAKE_HISTORY_PUBKEY,
          stakeConfig: web3.STAKE_CONFIG_ID,
        })
        .signers([stakeAccount])
        .rpc();
      console.log("Stake account created and delegated");
    } catch (error) {
      console.error("Error creating stake account:", error);
    }
  };

  useEffect(() => {
    const conn = new Connection('https://devnet.helius-rpc.com/?api-key=eeb4db83-4082-41ae-8d74-5719729caa80', 'confirmed');
    
    const fetchValidators = async () => {
      const { current } = await conn.getVoteAccounts();
      setValidators(current);
    };

    const fetchBalance = async () => {
      if (publicKey) {
        const balance = await conn.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      }
    };

    fetchValidators();
    fetchBalance();

    const fetchNextEpochTime = async () => {
      const connection = new Connection('https://devnet.helius-rpc.com/?api-key=eeb4db83-4082-41ae-8d74-5719729caa80', 'confirmed');
      const epochInfo = await connection.getEpochInfo();
      const slotsRemaining = epochInfo.slotsInEpoch - epochInfo.slotIndex;
      const secondsRemaining = slotsRemaining * 0.4; // Assuming 400ms per slot
      const nextEpochDate = new Date(Date.now() + secondsRemaining * 1000);
      setNextEpochTime(nextEpochDate.toLocaleString());
    };

    fetchNextEpochTime();
    const interval = setInterval(fetchNextEpochTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [publicKey]);

  console.log(publicKey);
  console.log(selectedValidator);


  const handleStake = async () => {
    if (!publicKey || !selectedValidator) return;

    const stakeAccountKeyPair = Keypair.generate();
    const createAccountTransaction = StakeProgram.createAccount({
      fromPubkey: publicKey,
      authorized: new Authorized(publicKey, publicKey),
      lamports: stakeAmount * LAMPORTS_PER_SOL,
      lockup: new Lockup(0, 0, publicKey),
      stakePubkey: stakeAccountKeyPair.publicKey,
    });

    const delegateStake = StakeProgram.delegate({
      stakePubkey: stakeAccountKeyPair.publicKey,
      authorizedPubkey: publicKey,
      votePubkey: new PublicKey(selectedValidator),
    });

    const transaction = new Transaction().add(createAccountTransaction).add(delegateStake);

    try {
      const signature = await sendTransaction(transaction, connection, {
        signers: [stakeAccountKeyPair],
      });
      await connection.confirmTransaction(signature, 'confirmed');
      alert(`Staked ${stakeAmount} SOL successfully!`);
    } catch (error) {
      console.error('Staking error:', error);
      if (error instanceof Error) {
        alert(`Failed to stake: ${error.message}`);
      } else {
        alert('Failed to stake: An unknown error occurred');
      }
    }
  };

  return (
    <div>
      <AppHero title="Stake SOL" subtitle="Stake your SOL on Solana devnet." />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8">
        {balance !== null && (
          <div className="mb-4">
            Current SOL Balance: {balance.toFixed(4)} SOL
          </div>
        )}
        {nextEpochTime && (
          <div className="mb-4">
            Next Epoch Starts: {nextEpochTime}. This is when you should start accumulating rewards.
          </div>
        )}
        <div className="space-y-4">
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Number(e.target.value))}
            placeholder="Amount of SOL to stake"
            className="w-full p-2 border rounded"
          />
          <select
            value={selectedValidator}
            onChange={(e) => setSelectedValidator(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a validator</option>
            {validators.map((validator) => (
              <option key={validator.votePubkey} value={validator.votePubkey}>
                {validator.nodePubkey}
              </option>
            ))}
          </select>
          <button
            onClick={handleStake}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Stake SOL
          </button>
          <button onClick={initializeUserAccount}>Initialize User Account</button>
          <button onClick={() => deposit(1 * LAMPORTS_PER_SOL)}>Deposit 1 SOL</button>
          <button onClick={() => createStakeAccount(1 * LAMPORTS_PER_SOL, selectedValidator)}>Stake 1 SOL</button>
        </div>
      </div>
    </div>
  );
}
