use anchor_lang::prelude::*;
use crate::state::UserVault;

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub creator: SystemAccount<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + UserVault::INIT_SPACE,
        seeds = [b"user_vault", user.key().as_ref(), creator.key().as_ref()],
        bump
    )]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitUser<'info> {
    pub fn init_user_vault(&mut self, amount: u64, creator: Pubkey, bumps: &InitUserBumps) -> Result<()> {

        self.user_vault.set_inner(UserVault {
            pda_owner: self.user.key(),
            creator: creator.key(),
            balance: amount,
            staked_amount: amount,
            stake_account: Pubkey::default(),
            reward_amount: 0,
            last_epoch_time: 0,
            bump: bumps.user_vault
        });

        Ok(())
    }


}

