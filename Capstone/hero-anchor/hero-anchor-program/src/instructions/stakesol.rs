use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup, StakeStateV2};
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::solana_program::pubkey::Pubkey;
use anchor_lang::solana_program::stake;

use crate::{CreatorVault, UserVault};

#[derive(Accounts)]
pub struct StakeSol<'info> {
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

    /// CHECK: This is the validator's vote account
    pub validator_vote: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: This is the new stake account
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
    pub fn stake_sol(&mut self, amount: u64) -> Result<()> {
        // 1. Create and delegate the stake account
        let rent = Rent::get()?;
        let stake_account_size = std::mem::size_of::<StakeStateV2>();
        let rent_exempt_reserve = rent.minimum_balance(stake_account_size);
        let total_required_lamports = rent_exempt_reserve + amount;

        let instructions = stake_instruction::create_account_and_delegate_stake(
            self.user_vault.to_account_info().key,
            self.stake_account.to_account_info().key,
            self.validator_vote.key,
            &Authorized {
                staker: *self.user_vault.to_account_info().key,
                withdrawer: *self.user_vault.to_account_info().key,
            },
            &Lockup::default(),
            total_required_lamports,
        );

        // 2. Execute the instructions
        let binding = self.user.key();
        let stake_account_signer_seeds: &[&[&[u8]]] = &[&[
            b"user_vault",
            binding.as_ref(),
            self.creator_vault.name.as_ref(),
            &[self.user_vault.bump],
        ]];

        for instruction in instructions {
            anchor_lang::solana_program::program::invoke_signed(
                &instruction,
                &[
                    self.user_vault.to_account_info(),
                    self.stake_account.to_account_info(),
                    self.validator_vote.to_account_info(),
                    self.system_program.to_account_info(),
                    self.clock.to_account_info(),
                    self.rent.to_account_info(),
                    self.stake_history.to_account_info(),
                    self.stake_config.to_account_info(),
                ],
                stake_account_signer_seeds,
            )?;
        }

        // 3. Update user data
        self.user_vault.staked_amount = self.user_vault.staked_amount.checked_add(amount).unwrap();
        self.user_vault.stake_account = *self.stake_account.key;

        Ok(())
    }
}