use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup, StakeState, StakeStateV2};
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::solana_program::{stake, system_instruction, sysvar};
use crate::{CreatorVault, UserVault, CustomError};

#[derive(Accounts)]
pub struct WithdrawStake<'info> {
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

impl<'info> WithdrawStake<'info> {
    pub fn withdraw_stake(&mut self) -> Result<()> {
        let user_vault = &mut self.user_vault;
        let clock = &self.clock;
        let current_timestamp = clock.unix_timestamp;

        require!(
            user_vault.has_staked_for_one_month(current_timestamp),
            CustomError::StakingPeriodNotCompleted
        );

        // Deactivate stake account
        let stake_account = &self.stake_account;
        let deactivate_ix = stake_instruction::deactivate_stake(
            stake_account.key,
            &self.user_vault.key(),
        );
        anchor_lang::solana_program::program::invoke_signed(
            &deactivate_ix,
            &[
                stake_account.to_account_info(),
                self.clock.to_account_info(),
                self.user_vault.to_account_info(),
            ],
            &[&[
                b"user_vault",
                self.user.key().as_ref(),
                self.creator_vault.name.as_ref(),
                &[self.user_vault.bump],
            ]],
        )?;

        // Withdraw initial stake to user
        let stake_state = StakeStateV2::try_from_slice(&stake_account.data.borrow())?;
        let (stake_lamports, stake_rewards) = match stake_state {
            StakeStateV2::Stake(_, stake) => (stake.delegation.stake, stake.delegation.stake - user_vault.initial_stake),
            _ => return Err(ProgramError::InvalidAccountData.into()),
        };

        let withdraw_ix = stake_instruction::withdraw(
            stake_account.key,
            &self.user_vault.key(),
            self.user.key,
            stake_lamports,
            None,
        );
        anchor_lang::solana_program::program::invoke_signed(
            &withdraw_ix,
            &[
                stake_account.to_account_info(),
                self.user.to_account_info(),
                self.clock.to_account_info(),
                self.user_vault.to_account_info(),
            ],
            &[&[
                b"user_vault",
                self.user.key().as_ref(),
                self.creator_vault.name.as_ref(),
                &[self.user_vault.bump],
            ]],
        )?;

        // Transfer rewards to creator's vault
        if stake_rewards > 0 {
            let transfer_ix = system_instruction::transfer(
                self.user.key,
                self.creator_vault.key,
                stake_rewards,
            );
            anchor_lang::solana_program::program::invoke(
                &transfer_ix,
                &[
                    self.user.to_account_info(),
                    self.creator_vault.to_account_info(),
                    self.system_program.to_account_info(),
                ],
            )?;
        }

        // Close user vault account if necessary
        if user_vault.staked_amount == 0 {
            let user_vault_lamports = self.user_vault.to_account_info().lamports();
            **self.user.to_account_info().try_borrow_mut_lamports()? += user_vault_lamports;
            **self.user_vault.to_account_info().try_borrow_mut_lamports()? = 0;
            *self.user_vault.to_account_info().try_borrow_mut_data()? = &mut [];
        }

        Ok(())
    }
}