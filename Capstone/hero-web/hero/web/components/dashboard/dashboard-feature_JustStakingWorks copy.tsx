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

export default function DashboardFeature() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [validators, setValidators] = useState<any[]>([]);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [selectedValidator, setSelectedValidator] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);

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
        </div>
      </div>
    </div>
  );
}
