use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup};
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::solana_program::{stake, system_instruction, sysvar};
use crate::{CreatorVault, UserVault};




#[derive(Accounts)]
pub struct DistributeRewards<'info> {
    #[account(mut)]
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

    /// CHECK: Safe because we validate below
    #[account(mut)]
    pub stake_account: UncheckedAccount<'info>,

    #[account(address = stake::program::ID)]
    pub stake_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

impl<'info> DistributeRewards<'info> {
    pub fn distribute_rewards(&mut self) -> Result<()> {
        let user_vault = &mut self.user_vault;
    let clock = &self.clock;
    let current_timestamp = clock.unix_timestamp;

    require!(
        user_vault.has_staked_for_one_month(current_timestamp),
        CustomError::StakingPeriodNotCompleted
    );

    // Calculate rewards
    let rewards = get_stake_rewards(&self.stake_account.to_account_info(), user_vault)?;

    require!(rewards > 0, CustomError::NoRewardsToDistribute);

    // Transfer rewards to creator's vault
    // Implement the logic to withdraw rewards from the stake account and transfer to creator's vault

    // Update user_vault
    user_vault.accumulated_rewards = 0;
    user_vault.staked_at = current_timestamp; // Reset the stake time

        Ok(())
    }
}