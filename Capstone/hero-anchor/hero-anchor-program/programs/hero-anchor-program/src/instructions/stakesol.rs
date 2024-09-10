use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup, StakeState};
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::system_program;
use solana_program::system_instruction;

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
    pub stake_program: Program<'info, stake::program::Stake>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
    pub stake_history: Sysvar<'info, StakeHistory>,
    /// CHECK: This is the stake config account
    pub stake_config: UncheckedAccount<'info>,
}

impl<'info> StakeSol<'info> {
    pub fn stake_sol(&mut self, amount: u64) -> Result<()> {
        // 1. Create the stake account
        let rent = Rent::get()?;
        let stake_account_size = std::mem::size_of::<StakeState>();
        let rent_exempt_reserve = rent.minimum_balance(stake_account_size);
        let total_required_lamports = rent_exempt_reserve + amount;

        let create_account_ix = system_instruction::create_account(
            self.user_vault.to_account_info().key,
            self.stake_account.to_account_info().key,
            total_required_lamports,
            stake_account_size as u64,
            &self.stake_program.key(),
        );

        // 2. Initialize the stake account
        let init_stake_ix = stake_instruction::initialize(
            self.stake_account.to_account_info().key,
            &Authorized {
                staker: self.user_vault.key(),
                withdrawer: self.user_vault.key(),
            },
            &Lockup::default(),
        );

        // 3. Delegate the stake
        let delegate_stake_ix = stake_instruction::delegate_stake(
            self.stake_account.to_account_info().key,
            &self.user_vault.key(),
            self.validator_vote.key,
        );

        // 4. Execute the instructions
        let stake_account_signer_seeds: &[&[&[u8]]] = &[&[
            b"user_vault",
            self.user.key().as_ref(),
            self.creator_vault.name.as_ref(),
            &[self.user_vault.bump],
        ]];

        anchor_lang::solana_program::program::invoke_signed(
            &create_account_ix,
            &[
                self.user_vault.to_account_info(),
                self.stake_account.to_account_info(),
                self.system_program.to_account_info(),
            ],
            stake_account_signer_seeds,
        )?;

        anchor_lang::solana_program::program::invoke(
            &init_stake_ix,
            &[
                self.stake_account.to_account_info(),
                self.rent.to_account_info(),
            ],
        )?;

        anchor_lang::solana_program::program::invoke_signed(
            &delegate_stake_ix,
            &[
                self.stake_account.to_account_info(),
                self.validator_vote.to_account_info(),
                self.clock.to_account_info(),
                self.stake_history.to_account_info(),
                self.stake_config.to_account_info(),
                self.user_vault.to_account_info(),
            ],
            stake_account_signer_seeds,
        )?;

        // 5. Update user data
        self.user_vault.staked_amount = self.user_vault.staked_amount.checked_add(amount).unwrap();
        self.user_vault.stake_account = *self.stake_account.key;

        Ok(())
    }
}