#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("FPSYQ2oeAkiuoNAuQdwnwbqgMK5FkJr7kPt3yjgLHsB1");

#[program]
pub mod hero {
    use super::*;

  pub fn close(_ctx: Context<CloseHero>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.hero.count = ctx.accounts.hero.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.hero.count = ctx.accounts.hero.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeHero>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.hero.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeHero<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Hero::INIT_SPACE,
  payer = payer
  )]
  pub hero: Account<'info, Hero>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseHero<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub hero: Account<'info, Hero>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub hero: Account<'info, Hero>,
}

#[account]
#[derive(InitSpace)]
pub struct Hero {
  count: u8,
}
