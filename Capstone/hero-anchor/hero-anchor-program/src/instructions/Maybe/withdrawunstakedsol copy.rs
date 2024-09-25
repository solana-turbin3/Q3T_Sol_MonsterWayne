use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    stake::{self, state::StakeStateV2},
    program::invoke_signed,
};
use crate::{UserVault, CreatorVault};
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct WithdrawUnstakedSol<'info> {
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

impl<'info> WithdrawUnstakedSol<'info> {
    pub fn withdraw_unstaked_sol(&mut self) -> Result<()> {
        let stake_account_info = &self.stake_account.to_account_info();
        let stake_authority_info = &self.stake_authority.to_account_info();
        let user_account_info = &self.user.to_account_info();

        // Check if the stake account is deactivated
        let stake_state = StakeStateV2::deserialize(&mut &stake_account_info.data.borrow()[..])
            .map_err(|_| ErrorCode::InvalidStakeState)?;

        match stake_state {
            StakeStateV2::Uninitialized => {
                return Err(ErrorCode::StakeAccountNotDeactivated.into());
            }
            StakeStateV2::Initialized(_) => {
                return Err(ErrorCode::StakeAccountNotDeactivated.into());
            }
            StakeStateV2::Stake(_, stake, _) => {
                if stake.delegation.deactivation_epoch == std::u64::MAX {
                    return Err(ErrorCode::StakeAccountNotDeactivated.into());
                }
            }
            _ => {}
        }

        // Withdraw the lamports to the user
        let withdraw_amount = stake_account_info.lamports();

        let withdraw_ix = stake::instruction::withdraw(
            &stake_account_info.key,
            &stake_authority_info.key,
            &user_account_info.key,
            withdraw_amount,
            None,
        );

        invoke_signed(
            &withdraw_ix,
            &[
                stake_account_info.clone(),
                user_account_info.clone(),
                stake_authority_info.clone(),
                self.system_program.to_account_info(),
            ],
            &[&[
                b"user_vault",
                self.user.key.as_ref(),
                self.creator_vault.name.as_ref(),
                &[self.user_vault.bump],
            ]],
        )?;

        // Reset user vault data
        self.user_vault.staked_amount = 0;
        self.user_vault.stake_account = Pubkey::default();
        self.user_vault.unstake_request_epoch = 0;

        Ok(())
    }
}