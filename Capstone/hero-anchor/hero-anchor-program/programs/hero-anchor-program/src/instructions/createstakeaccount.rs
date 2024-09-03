use anchor_lang::prelude::*;
use solana_program::stake::state::Stake;

use crate::UserVault;

#[derive(Accounts)]
pub struct CreateStakeAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub creator: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"user-account", user.key().as_ref(),creator.key().as_ref()],
        bump = user_vault.bump
    )]
    pub user_vault: Account<'info, UserVault>,
    #[account(mut)]
    pub stake_account: Signer<'info>,
    pub vote_account: AccountInfo<'info>,
    pub stake_program: Program<'info, Stake>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub stake_history: Sysvar<'info, StakeHistory>,
    pub stake_config: AccountInfo<'info>,
}