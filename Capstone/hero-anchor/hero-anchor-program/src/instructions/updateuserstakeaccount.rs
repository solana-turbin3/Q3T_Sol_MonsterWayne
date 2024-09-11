use anchor_lang::prelude::*;

use crate::UserVault;

#[derive(Accounts)]
pub struct UpdateUserStakeAccount<'info> {

    #[account(mut)]
    pub user : Signer<'info>,
    pub creator: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"user_vault", user.key().as_ref(),creator.key().as_ref()],
        bump = user_vault.bump
    )]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> UpdateUserStakeAccount<'info> {
    pub fn update_stake_account(&mut self, stake_account: Pubkey, amount: u64) -> Result<()> {
        self.user_vault.stake_account = stake_account;
        self.user_vault.last_epoch_time = Clock::get()?.unix_timestamp as i64;
        self.user_vault.reward_amount = 0;
        self.user_vault.staked_amount = amount;

        Ok(())
    }
}