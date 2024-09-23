use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup};
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::solana_program::{stake, system_instruction, sysvar};
use crate::{CreatorVault, UserVault};


#[derive(Accounts)]
pub struct SplitStakeAccount<'info> {
    pub user: Signer<'info>,
    pub creator: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"user_vault", user.key().as_ref(), creator_vault.name.as_ref()],
        bump = user_vault.bump
    )]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        mut,
        seeds = [b"creator_vault", creator.key().as_ref()],
        bump = creator_vault.bump
    )]
    pub creator_vault: Account<'info, CreatorVault>,

     /// CHECK: The stake account created and initialized on the client side
     #[account(mut)]
     pub stake_account: UncheckedAccount<'info>,
 
    /// CHECK: The stake account created and initialized on the client side
    #[account(mut)]
    pub new_stake_account: UncheckedAccount<'info>,

    #[account(address = stake::program::ID)]
    pub stake_program: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}