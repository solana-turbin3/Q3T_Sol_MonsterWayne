'use client';

import { useState } from 'react';
import { AppHero } from '../ui/ui-layout';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { idl } from '../solana/idl/hero_anchor_program';
import { Idl } from '@project-serum/anchor';
import { Address, AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";

const PROGRAM_ID = new PublicKey('J3JVzqh9AVv1qcsquuUYmJggKEkKgifVxG48qiScC6jR');

//const provider = new AnchorProvider(connection, donor, { commitment: "confirmed"});
//const program = new Program<BonkPaws>(IDL, PROGRAM_ID as Address, provider);

export default function DashboardFeature() {
  console.log('Rendering DashboardFeature component');
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [creatorPDA, setCreatorPDA] = useState<string | null>(null);

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
      await program.methods.initcreator().accounts({
        creator: publicKey,
        creatorVault: creatorPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();
      console.log('initcreator method called successfully');

      setCreatorPDA(creatorPDA.toBase58());
      console.log('Creator PDA set in state');
      alert('Creator initialized successfully!');
    } catch (error) {
      console.error('Error initializing creator:', error);
      if (error instanceof Error) {
        alert(`Failed to initialize creator: ${error.message}`);
      } else {
        alert('Failed to initialize creator: Unknown error');
      }
    }
  };

  console.log('Rendering component');
  return (
    <div>
      <AppHero title="Initialize Creator" subtitle="Create your creator account on Solana devnet." />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <button
            onClick={() => {
              console.log('Initialize Creator button clicked');
              initializeCreator();
            }}
            className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Initialize Creator Account
          </button>
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
