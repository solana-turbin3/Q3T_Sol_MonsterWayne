import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { Hero } from '../target/types/hero';

describe('hero', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Hero as Program<Hero>;

  const heroKeypair = Keypair.generate();

  it('Initialize Hero', async () => {
    await program.methods
      .initialize()
      .accounts({
        hero: heroKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([heroKeypair])
      .rpc();

    const currentCount = await program.account.hero.fetch(
      heroKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment Hero', async () => {
    await program.methods
      .increment()
      .accounts({ hero: heroKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.hero.fetch(
      heroKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment Hero Again', async () => {
    await program.methods
      .increment()
      .accounts({ hero: heroKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.hero.fetch(
      heroKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement Hero', async () => {
    await program.methods
      .decrement()
      .accounts({ hero: heroKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.hero.fetch(
      heroKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set hero value', async () => {
    await program.methods
      .set(42)
      .accounts({ hero: heroKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.hero.fetch(
      heroKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the hero account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        hero: heroKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.hero.fetchNullable(
      heroKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
