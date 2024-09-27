use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup};
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::solana_program::{stake, system_instruction, sysvar};
use crate::{AdminVault, CreatorVault, UserVault};

#[derive(Accounts)]
pub struct StakeSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub creator: SystemAccount<'info>,
    pub admin: SystemAccount<'info>,
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

    /// Admin Vault Account
    #[account(
        mut,
        seeds = [b"admin_vault", admin.key().as_ref()],
        bump = admin_vault.bump
    )]
    pub admin_vault: Account<'info, AdminVault>,

    /// CHECK: This is the validator's vote account
    pub validator_vote: UncheckedAccount<'info>,

    /// CHECK: The stake account created and initialized by the client
    #[account(mut)]
    pub stake_account: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    /// CHECK: This is the Stake Program ID
    #[account(address = stake::program::ID)]
    pub stake_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub stake_history: Sysvar<'info, StakeHistory>,
    /// CHECK: This is the stake config account
    pub stake_config: UncheckedAccount<'info>,
}

impl<'info> StakeSol<'info> {
    pub fn stakesol(&mut self, amount: u64) -> Result<()> {
        // Define the fee percentage (e.g., 1%)
        let fee_percentage = 1u64; // 1%
        let fee_amount = amount.checked_mul(fee_percentage).unwrap().checked_div(100).unwrap();

        // Calculate the amount to stake after deducting the fee
        let amount_after_fee = amount.checked_sub(fee_amount).unwrap();

        // Transfer the fee from the user's account to the Admin Vault
        let transfer_fee_ix = anchor_lang::solana_program::system_instruction::transfer(
            &self.user.key(),
            &self.admin_vault.key(),
            fee_amount,
        );

        // Invoke the transfer instruction
        anchor_lang::solana_program::program::invoke(
            &transfer_fee_ix,
            &[
                self.user.to_account_info(),
                self.admin_vault.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )?;

        // Delegate the stake
        // Build the delegate stake instruction
        let delegate_ix = stake_instruction::delegate_stake(
            &self.stake_account.key(),
            &self.user_vault.key(), // Authorized staker is user_vault
            &self.validator_vote.key(),
        );

        // Accounts required for the delegation
        let account_infos = &[
            self.stake_account.to_account_info(),
            self.validator_vote.to_account_info(),
            self.clock.to_account_info(),
            self.stake_history.to_account_info(),
            self.stake_config.to_account_info(),
            self.user_vault.to_account_info(), // Authorized staker
        ];

        // Invoke the delegate stake instruction
        anchor_lang::solana_program::program::invoke_signed(
            &delegate_ix,
            account_infos,
            &[&[
                b"user_vault",
                self.user.key.as_ref(),
                self.creator_vault.name.as_ref(),
                &[self.user_vault.bump],
            ]],
        )?;

        // Update user data with the amount after fee deduction
        self.user_vault.staked_amount = self
            .user_vault
            .staked_amount
            .checked_add(amount_after_fee)
            .unwrap();

        self.user_vault.stake_account = *self.stake_account.key;
        self.user_vault.stake_account_count += 1;

        Ok(())
    }
}