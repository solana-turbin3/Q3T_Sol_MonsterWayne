// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import HeroIDL from '../target/idl/hero.json';
import type { Hero } from '../target/types/hero';

// Re-export the generated IDL and type
export { Hero, HeroIDL };

// The programId is imported from the program IDL.
export const HERO_PROGRAM_ID = new PublicKey(HeroIDL.address);

// This is a helper function to get the Hero Anchor program.
export function getHeroProgram(provider: AnchorProvider) {
  return new Program(HeroIDL as Hero, provider);
}

// This is a helper function to get the program ID for the Hero program depending on the cluster.
export function getHeroProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return HERO_PROGRAM_ID;
  }
}
