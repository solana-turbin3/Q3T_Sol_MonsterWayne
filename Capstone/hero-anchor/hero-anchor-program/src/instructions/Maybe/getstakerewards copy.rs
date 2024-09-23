use anchor_lang::prelude::*;
use solana_program::{
    stake::state::{StakeStateV2, Stake},
    program_pack::Pack,
};

use crate::{CreatorVault, UserVault};

#[derive(Accounts)]
pub struct GetStakeRewards<'info> {
    /// CHECK: Manually deserializing
    #[account()]
    pub user: SystemAccount<'info>,
    pub stake_account: UncheckedAccount<'info>,

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

    pub clock: Sysvar<'info, Clock>,
}

impl <'info> GetStakeRewards <'info> {
pub fn getstakerewards(&mut self) -> Result<u64> {
    let stake_account_info = &self.stake_account.to_account_info();
    let user_vault = &mut self.user_vault;

    // Deserialize the stake account data
    let stake_account_data = stake_account_info.try_borrow_data()?;
    let stake_state = StakeStateV2::deserialize(&mut &**stake_account_data)?;

    if let StakeStateV2::Stake(meta, stake, _) = stake_state {
        let current_stake = stake.delegation.stake;

        // Calculate rewards as the difference between the current stake and initial staked amount
        let rewards = current_stake
            .checked_sub(user_vault.staked_amount)
            .unwrap_or(0);

        // Update the accumulated rewards in user_vault
        user_vault.accumulated_rewards = user_vault
            .accumulated_rewards
            .checked_add(rewards)
            .unwrap();

        // Reset staked_amount to current_stake for next calculation
        user_vault.staked_amount = current_stake;

        Ok(rewards)
    } else {
       Err(error!(CustomError::InvalidStakeState))
       
        }
    }
}