use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::solana_program::stake;

use crate::{CreatorVault, UserVault};

#[derive(Accounts)]
pub struct WithdrawUnstakedSol<'info> {
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

    #[account(mut)]
    /// CHECK: This is the stake account to withdraw from
    pub stake_account: UncheckedAccount<'info>,

    // #[account(mut)]
    // /// CHECK: This is the destination account for withdrawn SOL
    // pub destination_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: This is the Stake Program ID
    #[account(address = stake::program::ID)]
    pub stake_program: AccountInfo<'info>,
    pub clock: Sysvar<'info, Clock>,
}

impl<'info> WithdrawUnstakedSol<'info> {
    pub fn withdraw_unstaked_sol(&mut self) -> Result<()> {
        // 1. Create the withdraw instruction
        let ix = stake_instruction::withdraw(
            self.stake_account.key,
            self.user_vault.to_account_info().key,
            self.user_vault.to_account_info().key,
            u64::MAX, // Withdraw all SOL
            None, // No custodian
        );

        // 2. Execute the instruction
        let binding = self.user.key();
        let stake_account_signer_seeds: &[&[&[u8]]] = &[&[
            b"user_vault",
            binding.as_ref(),
            self.creator_vault.name.as_ref(),
            &[self.user_vault.bump],
        ]];

        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            &[
                self.stake_account.to_account_info(),
                self.user_vault.to_account_info(),
                self.clock.to_account_info(),
                self.stake_program.to_account_info(),
                self.user_vault.to_account_info(),
            ],
            stake_account_signer_seeds,
        )?;

        // 3. Update user data
        self.user_vault.staked_amount = 0;
        self.user_vault.stake_account = Pubkey::default(); // Clear the stake account

        Ok(())
    }
}
