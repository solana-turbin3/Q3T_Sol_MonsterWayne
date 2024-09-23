use anchor_lang::prelude::*;
use anchor_lang::solana_program::stake::state::{Authorized, Lockup, StakeStateV2};
use anchor_lang::solana_program::stake::instruction as stake_instruction;
use anchor_lang::solana_program::pubkey::Pubkey;
use anchor_lang::solana_program::{stake, system_instruction};
use anchor_lang::solana_program::program::invoke_signed;

use crate::{CreatorVault, UserVault};

#[derive(Accounts)]
pub struct StakeSolWow<'info> {
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

impl<'info> StakeSolWow<'info> {
    pub fn stakesolwow(&mut self, amount: u64) -> Result<()> {
        let user_vault_bump = self.user_vault.bump;

        let seeds = &[
            b"user_vault",
            self.user.key.as_ref(),
            self.creator_vault.name.as_ref(),
            &[user_vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];
        // let seeds = &[
        //     b"user_vault",
        //     self.user.key.as_ref(),
        //     self.creator.key.as_ref(),
        //     &[user_vault_bump],
        // ];
        // let signer_seeds = &[&seeds[..]];
    
        // Create the stake account
        let rent = Rent::get()?;
        let lamports = rent.minimum_balance(std::mem::size_of::<StakeStateV2>()) + amount;
    
        invoke_signed(
            &system_instruction::create_account(
                self.user.key,
                self.stake_account.key,
                lamports,
                std::mem::size_of::<StakeStateV2>() as u64,
                &self.stake_program.key,
            ),
            &[
                self.user.to_account_info(),
                self.stake_account.to_account_info(),
                self.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;
    
        // Initialize the stake account
        invoke_signed(
            &stake_instruction::initialize(
                self.stake_account.key,
                &Authorized {
                    staker: self.user_vault.key(),
                    withdrawer: self.user_vault.key(),
                },
                &Lockup::default(),
            ),
            &[
                self.stake_account.to_account_info(),
                self.rent.to_account_info(),
            ],
            signer_seeds,
        )?;
    
        // Delegate stake
        invoke_signed(
            &stake_instruction::delegate_stake(
                self.user_vault.to_account_info().key,
                self.stake_account.to_account_info().key,
                self.validator_vote.key,
            ),
            &[
                self.stake_account.to_account_info(),
                self.validator_vote.to_account_info(),
                self.clock.to_account_info(),
                self.stake_history.to_account_info(),
                self.stake_config.to_account_info(),
                self.user_vault.to_account_info(),
            ],
            signer_seeds,
        )?;
    
        Ok(())
    }
}