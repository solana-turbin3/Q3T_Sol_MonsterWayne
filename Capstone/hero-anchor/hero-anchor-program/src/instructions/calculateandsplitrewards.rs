// File: hero-anchor-program/programs/hero-anchor-program/src/instructions/calculate_and_split_rewards.rs

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::stake::state::StakeStateV2;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::solana_program::{
    instruction::Instruction,
    stake::{self, instruction as stake_instruction, state::StakeState},
    system_program,
    sysvar::{clock::Clock, stake_history::StakeHistory},
};
use crate::{CreatorVault, UserVault};
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct CalculateAndSplitRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub creator: SystemAccount<'info>,


    /// CHECK: This is the stake account owned by the program (user vault PDA)
    #[account(mut)]
    pub stake_account: UncheckedAccount<'info>,

    /// CHECK: New stake account to hold the split stake (rewards)
    #[account(mut)]
    pub reward_stake_account: UncheckedAccount<'info>,

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

    /// CHECK: The authority of the stake account (user vault PDA)
    #[account(
        seeds = [b"user_vault", user.key().as_ref(), creator_vault.name.as_ref()],
        bump = user_vault.bump
    )]
    pub stake_authority: UncheckedAccount<'info>,

    /// System and Stake Programs
    pub system_program: Program<'info, System>,
    /// CHECK: Stake program ID
    pub stake_program: UncheckedAccount<'info>,

    /// Sysvars
    pub clock: Sysvar<'info, Clock>,
    
    pub stake_history: Sysvar<'info, StakeHistory>,
}

impl<'info> CalculateAndSplitRewards<'info> {
    pub fn calculateandsplitrewards(&mut self) -> Result<()> {
        let stake_account_info = &self.stake_account;
        let reward_stake_account_info = &self.reward_stake_account;
        let user_vault = &mut self.user_vault;
        let stake_authority = &self.stake_authority;

        // Deserialize the stake account to get the stake amount
        let stake_lamports = stake_account_info.lamports();

        let rent = Rent::get()?;
        let stake_state_size = std::mem::size_of::<StakeStateV2>();
        let min_balance = rent.minimum_balance(stake_state_size);

        // Calculate the total staked amount excluding rent exempt
        let total_staked_amount = stake_lamports - min_balance;

        // Calculate rewards as difference between current stake and initial staked amount
        let rewards = total_staked_amount.checked_sub(user_vault.staked_amount).ok_or(ErrorCode::NoRewardsAvailable)?;

        if rewards == 0 {
            return Err(ErrorCode::NoRewardsAvailable.into());
        }

        // Create and initialize the reward stake account
        let create_reward_stake_account_ix = system_instruction::create_account(
            &user_vault.user,
            reward_stake_account_info.key,
            min_balance,
            stake_state_size as u64,
            &stake::program::id(),
        );

        // Invoke the instruction to create the account
        invoke_signed(
            &create_reward_stake_account_ix,
            &[
                self.stake_authority.to_account_info(),
                reward_stake_account_info.to_account_info(),
                self.system_program.to_account_info(),
            ],
            &[&[
                b"user_vault",
                self.user.key().as_ref(),
                self.creator_vault.name.as_ref(),
                &[user_vault.bump],
            ]],
        )?;

        // Split the stake account to separate the rewards
        let split_ix = stake_instruction::split(
            stake_account_info.key,
            stake_authority.key,
            rewards + min_balance,
            reward_stake_account_info.key,
        )
        .into_iter()
        .next()
        .ok_or(ErrorCode::InstructionError)?; // Handle possible empty vector

        // Invoke the split instruction
        invoke_signed(
            &split_ix,
            &[
                stake_account_info.to_account_info(),
                reward_stake_account_info.to_account_info(),
                stake_authority.to_account_info(),
                self.system_program.to_account_info(),
            ],
            &[&[
                b"user_vault",
                self.user.key().as_ref(),
                self.creator_vault.name.as_ref(),
                &[user_vault.bump],
            ]],
        )?;

        // Deactivate the reward stake account
        let deactivate_ix = stake_instruction::deactivate_stake(
            reward_stake_account_info.key,
            stake_authority.key,
        );

        // Invoke the deactivate instruction
        invoke_signed(
            &deactivate_ix,
            &[
                reward_stake_account_info.to_account_info(),
                stake_authority.to_account_info(),
                self.clock.to_account_info(),
                self.stake_history.to_account_info(),
            ],
            &[&[
                b"user_vault",
                self.user.key.as_ref(),
                self.creator_vault.name.as_ref(),
                &[user_vault.bump],
            ]],
        )?;

        // Update user vault's rewards stake account
        user_vault.reward_stake_account = *reward_stake_account_info.key;

        // Record accumulated rewards
        user_vault.accumulated_rewards = user_vault.accumulated_rewards.checked_add(rewards).ok_or(ErrorCode::CalculationError)?;

        Ok(())
    }
}


