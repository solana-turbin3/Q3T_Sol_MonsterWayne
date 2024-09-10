use anchor_lang::prelude::*;
use crate::state::UserVault;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct InitUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub creator: SystemAccount<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + UserVault::INIT_SPACE,
        seeds = [b"user_vault", user.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    pub user_vault: Account<'info, UserVault>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitUser<'info> {
    pub fn init_user_vault(&mut self, creator: Pubkey, bumps: &InitUserBumps, seed: u64) -> Result<()> {

        self.user_vault.set_inner(UserVault {
            pda_owner: self.user.key(),
            creator: creator.key(),
            balance: 0,
            staked_amount: 0,
            stake_account: Pubkey::default(),
            reward_amount: 0,
            last_epoch_time: 0,
            seed: seed,
            bump: bumps.user_vault
        });

        Ok(())
    }


}

