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

  useEffect(() => {
    if (publicKey) {
      fetchCreatorData();
    } else {
      setCreatorData(null);
      setCreatorPDA(null);
    }
  }, [publicKey]);

  console.log('Rendering component');
  return (
    <div>
      <AppHero title="Initialize Creator" subtitle="Create your creator account on Solana devnet." />
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
              {/* Add more fields as needed based on your CreatorVault structure */}
            </div>
          )}
          {creatorPDA && (
            <div className="text-sm mt-2">
              Creator PDA: {creatorPDA}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
