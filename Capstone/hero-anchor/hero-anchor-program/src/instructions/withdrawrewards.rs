// File: hero-anchor-program/programs/hero-anchor-program/src/instructions/withdraw_rewards.rs

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::{
    stake::{self, state::StakeStateV2},
    system_program,
};
use crate::{CreatorVault, UserVault};
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct WithdrawRewards<'info> {
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

    /// CHECK: Deactivated reward stake account
    #[account(mut)]
    pub reward_stake_account: UncheckedAccount<'info>,

    /// CHECK: The authority of the stake account (user vault PDA)
    #[account(
        seeds = [b"user_vault", user.key().as_ref(), creator_vault.name.as_ref()],
        bump = user_vault.bump
    )]
    pub stake_authority: UncheckedAccount<'info>,

    /// System Program
    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawRewards<'info> {
    pub fn withdrawrewards(&mut self) -> Result<()> {
        let reward_stake_account_info = &self.reward_stake_account;
        let creator_vault_info = &mut self.creator_vault.to_account_info();
        let user_vault = &mut self.user_vault;
        let stake_authority = &self.stake_authority;

        // Check if the stake account is deactivated
        let stake_state = StakeStateV2::deserialize(&mut &reward_stake_account_info.data.borrow()[..])
            .map_err(|_| ErrorCode::InvalidStakeState)?;

        match stake_state {
            StakeStateV2::Uninitialized => {
                return Err(ErrorCode::StakeAccountNotDeactivated.into());
            }
            StakeStateV2::Initialized(_) => {
                return Err(ErrorCode::StakeAccountNotDeactivated.into());
            }
            StakeStateV2::Stake(meta, stake, _) => {
                if stake.delegation.deactivation_epoch == std::u64::MAX {
                    return Err(ErrorCode::StakeAccountNotDeactivated.into());
                }
            }
            _ => {}
        }

        // Withdraw the lamports to the creator vault
        let withdraw_lamports = reward_stake_account_info.lamports();

        let withdraw_ix = stake::instruction::withdraw(
            reward_stake_account_info.key,
            stake_authority.key,
            creator_vault_info.key,
            withdraw_lamports,
            None,
        );

        invoke_signed(
            &withdraw_ix,
            &[
                reward_stake_account_info.to_account_info(),
                creator_vault_info.clone(),
                stake_authority.to_account_info(),
                self.system_program.to_account_info(),
            ],
            &[&[
                b"user_vault",
                self.user.key.as_ref(),
                self.creator_vault.name.as_ref(),
                &[user_vault.bump],
            ]],
        )?;

        // Set the reward_stake_account to default
        user_vault.reward_stake_account = Pubkey::default();
        user_vault.accumulated_rewards = 0;

        // Update the creator vault's balance
        self.creator_vault.balance = self
            .creator_vault
            .balance
            .checked_add(withdraw_lamports)
            .ok_or(ErrorCode::CalculationError)?;

        Ok(())
    }
}