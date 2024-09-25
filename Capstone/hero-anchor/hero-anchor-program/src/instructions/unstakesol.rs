use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    stake::{self, state::StakeStateV2},
    system_instruction,
    program::invoke_signed,
};
use crate::{UserVault, CreatorVault};
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct UnstakeSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: The creator's system account
    pub creator: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"user_vault", user.key.as_ref(), creator_vault.name.as_ref()],
        bump = user_vault.bump,
        has_one = user,
    )]
    pub user_vault: Account<'info, UserVault>,

    #[account(
        mut,
        seeds = [b"creator_vault", creator.key.as_ref()],
        bump = creator_vault.bump,
    )]
    pub creator_vault: Account<'info, CreatorVault>,

    /// CHECK: The user's stake account
    #[account(mut)]
    pub stake_account: UncheckedAccount<'info>,

    /// CHECK: The authority of the stake account (user vault PDA)
    #[account(
        seeds = [b"user_vault", user.key.as_ref(), creator_vault.name.as_ref()],
        bump = user_vault.bump,
    )]
    pub stake_authority: UncheckedAccount<'info>,

    /// System Program
    pub system_program: Program<'info, System>,

    /// CHECK: This is the Stake Program ID
    #[account(address = stake::program::ID)]
    pub stake_program: AccountInfo<'info>,
}

impl<'info> UnstakeSol<'info> {
    pub fn unstakesol(&mut self) -> Result<()> {
        let stake_account_info = &self.stake_account.to_account_info();
        let stake_authority_info = &self.stake_authority.to_account_info();
        let clock = Clock::get()?;

        // Deactivate the stake account
        let deactivate_ix = stake::instruction::deactivate_stake(
            &stake_account_info.key,
            &stake_authority_info.key,
        );

        invoke_signed(
            &deactivate_ix,
            &[
                stake_account_info.clone(),
                stake_authority_info.clone(),
                self.stake_program.to_account_info(),
            ],
            &[&[
                b"user_vault",
                self.user.key.as_ref(),
                self.creator_vault.name.as_ref(),
                &[self.user_vault.bump],
            ]],
        )?;

        // Update the stake status in user vault
        self.user_vault.stake_at = clock.unix_timestamp;
        Ok(())
    }
}