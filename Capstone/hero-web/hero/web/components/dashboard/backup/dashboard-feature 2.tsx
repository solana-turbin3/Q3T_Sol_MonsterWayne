'use client';

import { useState, useEffect } from 'react';
import { AppHero } from '../ui/ui-layout';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { idl } from '../solana/idl/hero_anchor_program';
import { Idl } from '@project-serum/anchor';
import { Address, AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";

const PROGRAM_ID = new PublicKey('J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR');

export default function DashboardFeature() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [creatorPDA, setCreatorPDA] = useState<string | null>(null);
  const [creatorData, setCreatorData] = useState<any>(null);
  const [userPDA, setUserPDA] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

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
      console.log('Program created:', program);
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

      console.log('Calling initcreator method');
      const tx = await program.methods.initcreator().accounts({
        creator: publicKey,
        creatorVault: creatorPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();
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
    console.log('Initializing user');
    if (!publicKey) {
      console.log('No public key available');
      return;
    }
    try {
      const program = getProgram();
      console.log('Program obtained:', program);
      
      // You need to provide a creator public key here. For this example, we'll use the user's own public key.
      // In a real scenario, you might want to let the user input a creator's public key.
      const creatorPublicKey = publicKey;

      console.log('Finding program address for user vault');
      const [userPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('user_vault'), publicKey.toBuffer(), creatorPublicKey.toBuffer()],
        program.programId
      );
      console.log('User PDA found:', userPDA.toBase58());

      console.log('Calling inituser method');
      const tx = await program.methods.inituser(
        new BN(0), // initial amount, set to 0 for this example
        creatorPublicKey
      ).accounts({
        user: publicKey,
        creator: creatorPublicKey,
        userVault: userPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

      console.log('inituser method called successfully');
      console.log('Transaction signature:', tx);
      console.log('User PDA public key:', userPDA.toBase58());

      setUserPDA(userPDA.toBase58());
      console.log('User PDA set in state');
      alert(`User initialized successfully!\nTransaction signature: ${tx}\nUser PDA: ${userPDA.toBase58()}`);
    } catch (error) {
      console.error('Error initializing user:', error);
      if (error instanceof Error) {
        alert(`Failed to initialize user: ${error.message}`);
      } else {
        alert('Failed to initialize user: Unknown error');
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
        setCreatorData(account);
        setCreatorPDA(creatorPDA.toBase58());
      } catch (error) {
        // If the account doesn't exist, set creatorData to null
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
      const creatorPublicKey = publicKey; // Same as in initializeUser, you might want to change this

      const [userPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('user_vault'), publicKey.toBuffer(), creatorPublicKey.toBuffer()],
        program.programId
      );

      try {
        const account = await program.account.userVault.fetch(userPDA);
        setUserData(account);
        setUserPDA(userPDA.toBase58());
      } catch (error) {
        console.log('User PDA not initialized');
        setUserData(null);
        setUserPDA(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      setUserPDA(null);
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
            <button
              onClick={initializeCreator}
              className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Initialize Creator Account
            </button>
          ) : (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Creator Data</h3>
              <p>Creator: {creatorData.creator.toString()}</p>
              <p>Balance: {creatorData.balance.toString()} lamports</p>
            </div>
          )}
          {creatorPDA && (
            <div className="text-sm mt-2">
              Creator PDA: {creatorPDA}
            </div>
          )}
          
          {!userData ? (
            <button
              onClick={initializeUser}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Initialize User Account
            </button>
          ) : (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">User Data</h3>
              <p>PDA Owner: {userData.pda_owner.toString()}</p>
              <p>Creator: {userData.creator.toString()}</p>
              <p>Balance: {userData.balance.toString()} lamports</p>
              <p>Staked Amount: {userData.staked_amount.toString()} lamports</p>
              <p>Stake Account: {userData.stake_account.toString()}</p>
            </div>
          )}
          {userPDA && (
            <div className="text-sm mt-2">
              User PDA: {userPDA}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
