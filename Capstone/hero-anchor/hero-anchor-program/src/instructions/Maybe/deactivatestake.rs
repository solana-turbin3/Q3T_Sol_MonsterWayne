use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::{
    stake::{self, instruction as stake_instruction},
    system_program,
};

use crate::{CreatorVault, UserVault};

#[derive(Accounts)]
pub struct DeactivateStake<'info> {
    pub creator: SystemAccount<'info>,
    /// CHECK: This is safe because we check ownership below
    #[account(mut)]
    pub stake_account: UncheckedAccount<'info>,
    /// CHECK: Validator vote account
    pub validator_vote: UncheckedAccount<'info>,

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
    pub stake_history: Sysvar<'info, StakeHistory>,
    /// CHECK: This account is not written to or read from by this program
    pub stake_config: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    #[account(mut)]
    pub user: Signer<'info>,
}

impl<'info> DeactivateStake<'info> {

    pub fn deactivatestake(&mut self) -> Result<()> {
        let stake_account = self.stake_account.to_account_info();
        let user_vault = self.user_vault.to_account_info();

        // Create the deactivate_stake instruction
        let deactivate_ix = stake_instruction::deactivate_stake(
            &stake_account.key(),
            &user_vault.key(),
        );

        // Invoke the deactivate_stake instruction signed by the user_vault PDA
        invoke_signed(
            &deactivate_ix,
            &[
                stake_account.clone(),
                self.clock.to_account_info(),
                user_vault.clone(),
            ],
            &[&[
               b"user_vault",
                self.user.key.as_ref(),
                self.creator_vault.name.as_ref(),
                &[self.user_vault.bump],
                
            ]],
        )?;

        Ok(())
    }
}